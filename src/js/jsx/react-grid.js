/**
 * NgReactGridComponent - React Component
 **/
var NgReactGridComponent = (function() {
    var windowInnerWidth = window.innerWidth, windowInnerHeight = window.innerHeight;

    var setCellWidthPixels = function(cell) {

        var width = String(cell.width).replace("px", "");
        var isPercent = width.indexOf("%") !== -1;

        if(isPercent) {

            var widthInPixels = Math.floor((parseInt(width) * windowInnerWidth) / 100);
            cell.width = widthInPixels;

        }

    };

    var setCellWidth = function(grid, cell, cellStyle, isLast, bodyCell) {

        if(!cell.width) {
            cell.width = "10%";
        }

        if(grid.horizontalScroll) {
            setCellWidthPixels(cell);
        }

        cellStyle.width = cell.width;
    };

    var NgReactGridHeader = (function() {
        var hasColumnFilter = function(grid) {
            return grid.columnDefs.some(function(cell) {
                return cell.columnFilter;
            });
        };

        var NgGridColumnFilterCell = React.createClass({displayName: 'NgGridColumnFilterCell',
            handleSearchInputChange: function() {
              this.props.onSearchInput(this.refs[this.props.cell.field].getDOMNode().value,
                                       this.props.cell.field);
            },
            render: function() {
                return (
                    React.createElement("th", {title: this.props.cell.field + " Search"}, 
                        React.createElement("input", {type: "text", 
                            placeholder: "Filter " + this.props.cell.displayName, 
                            ref: this.props.cell.field, 
                            onKeyUp: this.handleSearchInputChange})
                    )
                )
            }
        });

        // For input in header. Expandable to additional types.
        var NgGridHeaderCellInput = React.createClass({displayName: 'NgGridHeaderCellInput',
            getInitialState: function() {
                return {
                    checked: false
                };
            },
            setNgReactGridCheckboxHeaderStateFromEvent: function(e) {
                this.setState({
                    checked: e.detail.checked
                });
            },
            componentDidMount: function() {
                window.addEventListener("setNgReactGridCheckboxHeaderStateFromEvent", this.setNgReactGridCheckboxHeaderStateFromEvent);
            },
            componentWillUnmount: function() {
                window.removeEventListener("setNgReactGridCheckboxHeaderStateFromEvent", this.setNgReactGridCheckboxHeaderStateFromEvent);
            },
            handleCheckboxClick: function(e) {
                e.stopPropagation();
                var newCheckedValue = (this.state.checked) ? false : true;
                this.props.cell.handleHeaderClick(newCheckedValue, this.props.grid.react.getFilteredAndSortedData());
                this.setState({
                    checked: newCheckedValue
                });
            },
            render: function() {
                var headerStyle = this.props.cell.options ?
                        (this.props.cell.options.headerStyle || {}) : {};
                if (this.props.cell.inputType !== undefined) {
                    switch (this.props.cell.inputType) {
                        case "checkbox":
                            return (
                                React.createElement("div", {title: this.props.cell.title, className: "ngGridHeaderCellCheckboxInput", style: headerStyle}, 
                                    React.createElement("input", {type: this.props.cell.inputType, onChange: this.handleCheckboxClick, checked: this.state.checked})
                                )
                            );
                            break;
                        default:
                            return (React.createElement("div", null));
                    }
                } else {
                    return (React.createElement("div", null));
                }
            }
        });

        var NgGridHeaderCell = React.createClass({displayName: 'NgGridHeaderCell',
            getInitialState: function() {
                return {
                    width: 0
                };
            },
            cellStyle: {},
            handleClick: function() {
                if (this.props.cell.sort !== false) {
                    this.props.grid.react.setSortField(this.props.cell.field);
                }
            },
            componentWillReceiveProps: function() {
                setCellWidth(this.props.grid, this.props.cell, this.cellStyle, this.props.last);
                this.setState({
                    width: this.cellStyle.width
                });
            },
            componentWillMount: function() {
                setCellWidth(this.props.grid, this.props.cell, this.cellStyle, this.props.last);
                this.setState({
                    width: this.cellStyle.width
                });
            },
            resize: function(delta) {
                // resize functionality coming soon
            },
            componentDidMount: function() {
                // resize functionality coming soon
            },
            render: function() {
                this.cellStyle.cursor = (this.props.cell.sort !== false) ? "pointer" : "default";
                var cellStyle = this.cellStyle;

                var sortStyle = {
                    cursor: "pointer",
                    width: "8%",
                    "float": "left",
                    textAlign: "right",
                    display: (this.props.cell.sort === false) ? "none": "inline-block",
                    overflow: "visible"
                };

                var arrowStyle = {
                    marginTop: 2
                };

                var sortClassName = "icon-arrows";

                if(this.props.grid.sortInfo.field === this.props.cell.field) {
                    if(this.props.grid.sortInfo.dir === "asc") {
                        sortClassName += " icon-asc";
                    } else {
                        sortClassName += " icon-desc";
                    }

                    arrowStyle.marginTop = 5;
                } else {
                    sortClassName += " icon-both";
                }

                var resizeStyle = {
                    height: "21px",
                    marginTop: "-4px",
                    width: "1px",
                    background: "#999999",
                    borderRight: "1px solid #FFF",
                    "float": "right"
                };

                var resizeWrapperStyle = {
                    width: "2%",
                    cursor: "col-resize",
                    display: "none"
                };

                return (
                    React.createElement("th", {title: this.props.cell.displayName, onClick: this.handleClick, style: cellStyle}, 
                        React.createElement("div", {className: "ngGridHeaderCellText"}, 
                            this.props.cell.displayName
                        ), 
                        React.createElement(NgGridHeaderCellInput, {cell: this.props.cell, grid: this.props.grid}), 
                        React.createElement("div", {style: sortStyle}, React.createElement("i", {className: sortClassName, style: arrowStyle})), 
                        React.createElement("div", {style: resizeWrapperStyle, className: "ngGridHeaderResizeControl"}, 
                            React.createElement("div", {className: "ngGridHeaderCellResize", style: resizeStyle})
                        )
                    )
                )
            }
        });

        var NgReactGridShowPerPage = React.createClass({displayName: 'NgReactGridShowPerPage',
            handleChange: function() {
                this.props.grid.react.setPageSize(this.refs.showPerPage.getDOMNode().value);
            },
            render: function() {

                var options = this.props.grid.pageSizes.map(function(pageSize, key) {
                    return (React.createElement("option", {value: pageSize, key: key}, pageSize))
                }.bind(this));

                if (this.props.grid.showGridShowPerPage) {
                  return (
                      React.createElement("div", {className: "ngReactGridShowPerPage"}, 
                          "Show ", React.createElement("select", {onChange: this.handleChange, ref: "showPerPage", value: this.props.grid.pageSize}, options), " entries"
                      )
                  )
                } else {
                  return (React.createElement("div", null))
                }
            }
        });

        var NgReactGridSearch = React.createClass({displayName: 'NgReactGridSearch',
            handleSearch: function() {
                this.props.grid.react.setSearch(this.refs.searchField.getDOMNode().value);
            },
            render: function() {
                if (this.props.grid.showGridSearch) {
                  return (
                      React.createElement("div", {className: "ngReactGridSearch"}, 
                          React.createElement("input", {type: "text", placeholder: "Search...", ref: "searchField", onKeyUp: this.handleSearch})
                      )
                  )
                } else {
                  return (React.createElement("div", null))
                }
            }
        });

        var NgReactGridColumnFilter = React.createClass({displayName: 'NgReactGridColumnFilter',
            handleSearch: function(search, column) {
                this.props.grid.react.setSearch(search, column);
            },
            render: function() {
                if (hasColumnFilter(this.props.grid) && this.props.grid.localMode) {
                    var cells = this.props.grid.columnDefs.map(function(cell, key) {
                        if (cell.columnFilter) {
                            return (React.createElement(NgGridColumnFilterCell, {key: key, cell: cell, onSearchInput: this.handleSearch}))
                        } else {
                            return (React.createElement("th", {key: key}))
                        }
                    }.bind(this));

                  return (
                      React.createElement("tr", {className: "ngReactGridColumnFilter"}, 
                          cells
                      )
                  )
                } else {
                    return (React.createElement("tr", null))
                }
            }
        });

        var NgReactGridHeader = React.createClass({displayName: 'NgReactGridHeader',
            render: function() {

                var columnsLength = this.props.grid.columnDefs.length;
                var cells = this.props.grid.columnDefs.map(function(cell, key) {
                    var last = (columnsLength - 1) === key;
                    return (React.createElement(NgGridHeaderCell, {key: key, cell: cell, index: key, grid: this.props.grid, last: last}))
                }.bind(this));

                var tableStyle = {
                    width: "calc(100% - " + this.props.grid.scrollbarWidth + "px)"
                };

                var ngReactGridHeader = {
                    paddingRight: (this.props.grid.horizontalScroll) ? this.props.grid.scrollbarWidth : 0,
                    height: hasColumnFilter(this.props.grid) ? "auto" : "27px"
                };

                return (
                    React.createElement("div", null, 
                        React.createElement("div", {className: "ngReactGridHeaderToolbarWrapper"}, 
                            React.createElement(NgReactGridShowPerPage, {grid: this.props.grid, setGridState: this.props.setGridState}), 
                            React.createElement(NgReactGridSearch, {grid: this.props.grid})
                        ), 
                        React.createElement("div", {className: "ngReactGridHeaderWrapper"}, 
                            React.createElement("div", {className: "ngReactGridHeader", style: ngReactGridHeader}, 
                                React.createElement("div", {className: "ngReactGridHeaderInner"}, 
                                    React.createElement("table", {style: tableStyle}, 
                                        React.createElement("thead", null, 
                                            React.createElement("tr", null, 
                                                cells
                                            ), 
                                            React.createElement(NgReactGridColumnFilter, {grid: this.props.grid})
                                        )
                                    )
                                )
                            )
                        )
                    )
                );
            }
        });

        return NgReactGridHeader;
    })();

    var NgReactGridBody = (function() {

        var NgReactGridBodyRowCell = React.createClass({displayName: 'NgReactGridBodyRowCell',
            cell: function(cellText, cellStyle) {
                cellTextType = typeof cellText;

                if(cellTextType === 'string') {
                    return (React.createElement("td", {style: cellStyle}, cellText))
                } else if(cellTextType === 'object') {

                    cellText = this.props.grid.react.wrapFunctionsInAngular(cellText);

                    return (
                        React.createElement("td", {style: cellStyle}, 
                            cellText
                        )
                    );
                } else {
                    return this.defaultCell;
                }
            },
            render: function() {
                var cellText = this.props.grid.react.getObjectPropertyByString(this.props.row, this.props.cell.field);
                var cellStyle = {};
                setCellWidth(this.props.grid, this.props.cell, cellStyle, this.props.last, true);

                if(this.props.grid.singleLineCell) {
                    cellStyle.overflow = "hidden";
                    cellStyle.textOverflow = "ellipsis";
                    cellStyle.whiteSpace = "nowrap";
                }
                
                if (cellText === null || typeof cellText == 'undefined') {
                    cellText = '';
                }

                this.defaultCell = (
                        React.createElement("td", {style: cellStyle, title: String(cellText)}, 
                            React.createElement("div", null, String(cellText))
                        )
                    );

                if(this.props.grid.editing && this.props.cell.edit) {
                    cellText = this.props.cell.edit(this.props.row);
                    return this.cell(cellText, cellStyle);
                } else if(this.props.cell.render) {
                    cellText = this.props.cell.render(this.props.row);
                    return this.cell(cellText, cellStyle);
                } else {
                    return this.defaultCell;
                }


            }
        });

        var NgReactGridBodyRow = React.createClass({displayName: 'NgReactGridBodyRow',
            handleClick: function(e) {
                // Prevents triggering 'rowClick' event when toggling checkboxes
                if (e.target.type !== 'checkbox') {
                  this.props.grid.react.rowClick(this.props.row);
                }
            },
            shouldComponentUpdate: function(nextProps, nextState) {
                if(this.props.row.entity != nextProps.row.entity) {
                    console.log('rendering ' + this.props.row.itemIndex)
                }
                //console.log('rendered ' + this.props.row.itemIndex + ': ' + (this.props.row.entity && (this.props.row.rendered == false)));
               return (this.props.row != nextProps.row)
            },
            render: function() {

                var columnsLength = this.props.grid.columnDefs.length;
                var cells = this.props.grid.columnDefs.map(function(cell, key) {
                    var last = (columnsLength - 1) === key;
                    return React.createElement(NgReactGridBodyRowCell, {key: key, cell: cell, row: this.props.row, grid: this.props.grid, last: last})
                }.bind(this));

//                console.log('rendered ' + this.props.row.itemIndex);

                if (!this.props.row.entity)
                    return React.createElement("div", null)

                return (
                    React.createElement("tr", {onClick: this.handleClick}, 
                        cells
                    )
                )
            }
        });


        var NgReactGridBody = React.createClass({displayName: 'NgReactGridBody',
            getInitialState: function() {
                return {
                    fullRender: false,
                    needsUpdate: false
                }
            },
            calculateIfNeedsUpdate: function() {
                if(this.props.grid.data.length > 100) {
                    this.setState({
                        needsUpdate: true
                    });
                }
            },
            performFullRender: function() {
                if(this.state.needsUpdate) {
                    setTimeout(function() {
                        this.setState({
                            fullRender: true,
                            needsUpdate: false
                        });
                    }.bind(this), 0);
                }
            },
            componentWillMount: function() {
                this.calculateIfNeedsUpdate();
            },
            componentWillReceiveProps: function() {
                this.calculateIfNeedsUpdate();
            },
            componentDidMount: function() {
                var domNode = this.getDOMNode();
                var domContainer = domNode.parentNode;
                var header = domContainer.querySelector(".ngReactGridHeaderInner");
                var viewPort = domContainer.querySelector(".ngReactGridViewPort");
                var ensureData = this.props.grid.react.wrapFunctionsInAngular(this.props.grid.ensureData);

                domNode.firstChild.addEventListener('scroll', function(e) {
                    var rowHeight = 20; // TODO
                    var startRow = viewPort.scrollTop / rowHeight;
                    var endRow = ( viewPort.scrollTop + viewPort.clientHeight ) / rowHeight;

                    ensureData(startRow, endRow);

                    header.scrollLeft = viewPort.scrollLeft;
                });

                this.performFullRender();
            },
            componentDidUpdate: function() {
                this.performFullRender();
            },
            render: function() {

                var mapRows = function(row, index) {
                    return React.createElement(NgReactGridBodyRow, {key: index, row: row, columns: this.props.columnDefs, grid: this.props.grid})
                }.bind(this);

                // TODO correllate with viewport & active range
                var reduceRows = function(result, row, index, rows) {
                    if (row.entity) {
                     //   console.log('key1 ' + index);

                        result.push(React.createElement(NgReactGridBodyRow, {key: index, row: row, columns: this.props.columnDefs, grid: this.props.grid}));
                    }
                    else if ((index == rows.length -1) || rows[index + 1].entity) {
                        
                        var emptyRows = 0;
                        
                        for (var i = index; i >= 0; i --) {
                            if (rows[i].entity)
                                break;
                            else
                                emptyRows ++;
                        }
                        
                        // var divStyle = {
                        //     height: emptyHeight
                        // };

                        var chunkSize = 120;
                        var remainder = emptyRows % chunkSize;

                        if (remainder > 0) {
                            var divStyle = {
                                height: remainder * 20 // TODO use average height of populated items
                            };

                            var startIndex = index - emptyRows + remainder;
                         //   console.log('key2 ' + startIndex);
                            result.push(React.createElement("div", {key: startIndex, style: divStyle}));
                        }

                        for(var j = 0; j < Math.floor(emptyRows / chunkSize); j ++) {
                            var key = (index - emptyRows + remainder + ((j+1) * chunkSize));

                            var divStyle = {
                                height: chunkSize * 20 // TODO use average height of populated items
                            };

                           // console.log('key3 ' + key);
                            result.push(React.createElement("div", {key: key, style: divStyle}));                            
                        }
                        //result.push(<div key={index} style={divStyle}></div>);                        
                    }
                    return result;
                }.bind(this);

                var rows;

                if(this.props.grid.react.loading) {

                    var loadingStyle = {
                        textAlign: "center"
                    };

                    rows = (
                        React.createElement("tr", null, 
                            React.createElement("td", {colSpan: this.props.grid.columnDefs.length, style: loadingStyle}, 
                                "Loading..."
                            )
                        )
                    )
                } else {
                    if(!this.state.fullRender) {
                        console.log('partial render')
                        rows = this.props.grid.data.slice(0, 100).map(mapRows);
                    } else {
                        console.log('full render')
                        //rows = this.props.grid.data.map(mapRows);
                        rows = this.props.grid.data.reduce(reduceRows, []);
                    }

                    if(this.props.grid.react.showingRecords === 0) {
                        var noDataStyle = {
                            textAlign: "center"
                        };

                        rows = (
                            React.createElement("tr", null, 
                                React.createElement("td", {colSpan: this.props.grid.columnDefs.length, style: noDataStyle}, 
                                    "No records found"
                                )
                            )
                        )
                    }
                }


                var ngReactGridViewPortStyle = {
                    maxHeight: this.props.grid.height,
                    minHeight: this.props.grid.height
                };

                var tableStyle = {};

                if(!this.props.grid.horizontalScroll) {
                    ngReactGridViewPortStyle.overflowX = "hidden";
                } else {
                    tableStyle.width = "calc(100% - " + this.props.grid.scrollbarWidth + "px)";
                }

                return (
                    React.createElement("div", {className: "ngReactGridBody"}, 
                        React.createElement("div", {className: "ngReactGridViewPort", onscroll: this.handleScroll, style: ngReactGridViewPortStyle}, 
                            React.createElement("div", {className: "ngReactGridInnerViewPort"}, 
                                React.createElement("table", {style: tableStyle}, 
                                    React.createElement("tbody", null, 
                                        rows
                                    )
                                )
                            )
                        )
                    )
                );
            }
        });

        return NgReactGridBody;
    })();

    var NgReactGridFooter = (function() {

        var NgReactGridStatus = React.createClass({displayName: 'NgReactGridStatus',
            render: function() {

                return (
                    React.createElement("div", {className: "ngReactGridStatus"}, 
                        React.createElement("div", null, "Page ", React.createElement("strong", null, this.props.grid.currentPage), " of ", React.createElement("strong", null, this.props.grid.totalPages), " - Showing ", React.createElement("strong", null, this.props.grid.react.showingRecords), " of ", React.createElement("strong", null, this.props.grid.totalCount), " records")
                    )
                )
            }
        });

        var NgReactGridPagination = React.createClass({displayName: 'NgReactGridPagination',
            goToPage: function(page) {
                this.props.grid.react.goToPage(page);
            },
            goToLastPage: function() {
                this.goToPage(this.props.grid.totalPages);
            },
            goToFirstPage: function() {
                this.goToPage(1);
            },
            goToNextPage: function() {
                var nextPage = (this.props.grid.currentPage + 1);
                var diff = this.props.grid.totalPages - nextPage;

                if(diff >= 0) {
                    this.goToPage(nextPage);
                }
            },
            goToPrevPage: function() {
                var prevPage = (this.props.grid.currentPage - 1);
                if(prevPage > 0) {
                    this.goToPage(prevPage);
                }
            },
            render: function() {

                var pagerNum = 2;
                var totalPages = this.props.grid.totalPages;
                var currentPage = this.props.grid.currentPage;
                var indexStart = (currentPage - pagerNum) <= 0 ? 1 : (currentPage - pagerNum);
                var indexFinish = (currentPage + pagerNum) >= totalPages ? totalPages : (currentPage + pagerNum);
                var pages = [];

                for(var i = indexStart; i <= indexFinish; i++) {
                    pages.push(i);
                }

                pages = pages.map(function(page, key) {
                    var pageClass = (page === this.props.grid.currentPage) ? "active" : "";
                    return React.createElement("li", {key: key, className: pageClass, dataPage: page}, React.createElement("a", {href: "javascript:", onClick: this.goToPage.bind(null, page)}, page));
                }.bind(this));

                return (
                    React.createElement("div", {className: "ngReactGridPagination"}, 
                        React.createElement("ul", null, 
                            React.createElement("li", null, React.createElement("a", {href: "javascript:", onClick: this.goToPrevPage}, "Prev")), 
                            React.createElement("li", null, React.createElement("a", {href: "javascript:", onClick: this.goToFirstPage}, "First")), 
                            pages, 
                            React.createElement("li", null, React.createElement("a", {href: "javascript:", onClick: this.goToLastPage}, "Last")), 
                            React.createElement("li", null, React.createElement("a", {href: "javascript:", onClick: this.goToNextPage}, "Next"))
                        )
                    )
                )
            }
        });

        var NgReactGridFooter = React.createClass({displayName: 'NgReactGridFooter',
            render: function() {
                if (this.props.grid.totalCount == 0) {
                    return null;
                }
                return (
                    React.createElement("div", {className: "ngReactGridFooter"}, 
                        React.createElement(NgReactGridStatus, {grid: this.props.grid}), 
                        React.createElement(NgReactGridPagination, {grid: this.props.grid})
                    )
                )
            }
        });

        return NgReactGridFooter;
    })();

    var NgReactGrid = React.createClass({displayName: 'NgReactGrid',
        render: function() {
            return (
                React.createElement("div", {className: "ngReactGrid"}, 
                    React.createElement(NgReactGridHeader, {grid: this.props.grid}), 
                    React.createElement(NgReactGridBody, {grid: this.props.grid}), 
                    React.createElement(NgReactGridFooter, {grid: this.props.grid})
                )
            )
        }
    });

    return NgReactGrid;
})();

module.exports = NgReactGridComponent;