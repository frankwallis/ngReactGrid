var _ = require('../vendors/miniUnderscore');
var NgReactGridReactManager = require("./NgReactGridReactManager");
var NO_GET_DATA_CALLBACK_ERROR = "localMode is false, please implement the getData function on the grid object";

var NgReactGrid = function (scope, element, attrs, $rootScope) {
    this.columnDefs = scope.grid.columnDefs || [];
    this.data = [];
    this.height = 500;
    this.localMode = true;
    this.editing = false;
    this.totalCount = 0;
    this.totalPages = 0;
    this.currentPage = 1;
    this.pageSize = 25;
    this.pageSizes = [25, 50, 100, 500];
    this.sortInfo = {field: "", dir: ""};
    this.search = "";
    this.horizontalScroll = false;
    this.scrollbarWidth = this.getScrollbarWidth();
    this.scope = scope;
    this.element = element;
    this.attrs = attrs;
    this.rootScope = $rootScope;

    /**
     * Initialize the NgReactGridReact class
     */
    this.react = new NgReactGridReactManager(this);

    /**
     * Initialize events
     */
    this.setupUpdateEvents();

    /**
     * Initialize scope watchers
     */
    this.initWatchers();

    /**
     * Init the grid
     */
    this.init();
};

NgReactGrid.prototype.init = function () {

    /**
     * Check if getData is set, override with our own and keep a private copy
     */
    if (typeof this.scope.grid.localMode && this.scope.grid.localMode === false) {
        if (this.scope.grid.getData) {
            this._getData = this.scope.grid.getData;
            delete this.scope.grid.getData;
        } else {
            throw new Error(NO_GET_DATA_CALLBACK_ERROR);
        }
    }

    /**
     * If we are in server mode, perform the first call to load the data
     */
    if(this.isServerMode()) {
        this.getData();
    }

};

/**
 * Get data wrapper, at the moment it doesn't do much but expect some hooks and functionality being added in the future
 */
NgReactGrid.prototype.getData = function () {
    this.react.loading = true;
    this._getData(this);
};

/**
 * This is called once during initialization to figure out the width of the scrollbars
 * @returns {number}
 */
NgReactGrid.prototype.getScrollbarWidth = function () {
    var outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

    document.body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;

    /*
     * Force scroll bars
     */
    outer.style.overflow = "scroll";

    /*
     * Add innerDiv
     */
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);

    var widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
};

/**
 * Returns whether there is an active search on the grid
 * @returns {string|boolean}
 */
NgReactGrid.prototype.isSearching = function () {
    return this.search && this.search.length > 0;
};

/**
 * Returns whether the grid is in local mode
 * @returns {boolean|*}
 */
NgReactGrid.prototype.isLocalMode = function () {
    return this.localMode;
};

/**
 * Returns whether the grid is in server mode
 * @returns {boolean}
 */
NgReactGrid.prototype.isServerMode = function () {
    return !this.localMode;
};

/**
 * Manages the different events that can update the grid
 */
NgReactGrid.prototype.setupUpdateEvents = function () {
    this.events = {
        PAGESIZE: "PAGESIZE",
        SORTING: "SORTING",
        SEARCH: "SEARCH",
        PAGINATION: "PAGINATION",
        DATA: "DATA",
        TOTALCOUNT: "TOTALCOUNT"
    };
};

/**
 * Initializes the scope watchers needed for the grid
 */
NgReactGrid.prototype.initWatchers = function () {
    this.scope.$watch("grid.data", function (newValue, oldValue) {
        if (newValue) {
            this.update(this.events.DATA, {
                data: newValue
            });
        }
    }.bind(this));

    this.scope.$watch("grid.totalCount", function (newValue, oldValue) {
        if (newValue) {
            this.update(this.events.TOTALCOUNT, {totalCount: newValue});
        }
    }.bind(this));
};

/**
 * Updates the grid model, re-renders the react component
 * @param updateEvent
 * @param updates
 */
NgReactGrid.prototype.update = function (updateEvent, updates) {

    switch(updateEvent) {
        case this.events.DATA:
            this.updateData(updates);
            break;

        case this.events.PAGESIZE:
            this.updatePageSize(updates);
            break;

        case this.events.PAGINATION:
            this.updatePagination(updates);
            break;

        case this.events.SEARCH:
            this.updateSearch(updates);
            break;

        case this.events.SORTING:
            this.updateSorting(updates);
            break;
    }

    this.render();

};

NgReactGrid.prototype.updateData = function(updates, updateContainsData) {

    this.react.startIndex = (this.currentPage - 1) * this.pageSize;
    this.react.endIndex = (this.pageSize * this.currentPage);

    if(this.isLocalMode()) {
        if(updateContainsData) {

            this.data = updates.data.slice(this.react.startIndex, this.react.endIndex);
            this.totalCount = updates.data.length;

        } else {
            this.react.originalData = updates.data.slice(0);
            this.totalCount = this.react.originalData.length;
            this.data = this.react.originalData.slice(this.react.startIndex, this.react.endIndex);
        }

    }

    this.react.showingRecords = this.data.length;

    this.totalPages = Math.ceil(this.totalCount / this.pageSize);
};

NgReactGrid.prototype.updatePageSize = function(updates) {
    this.pageSize = updates.pageSize;
    this.currentPage = updates.currentPage;
    this.updateData({
        data: (this.isSearching()) ? this.react.filteredData : this.react.originalData
    }, true);
};

NgReactGrid.prototype.updatePagination = function(updates) {
    this.currentPage = updates.currentPage;
    this.updateData({
        data: (this.isSearching()) ? this.react.filteredData : this.react.originalData
    }, true);
};

NgReactGrid.prototype.updateSearch = function(updates) {
    this.search = updates.search;
    this.currentPage = 1;
    this.updateData({
        data: updates.data
    }, true);
};

NgReactGrid.prototype.updateSorting = function(updates) {
    this.sortInfo = updates.sortInfo;

    if(updates.data) {
        this.currentPage = 1;
        this.updateData({
            data: updates.data
        }, true);
    }
};

/**
 * Calls React to render the grid component on the given element
 */
NgReactGrid.prototype.render = function() {
    React.renderComponent(ngReactGridComponent({grid: this}), this.element[0]);
};

module.exports = NgReactGrid;