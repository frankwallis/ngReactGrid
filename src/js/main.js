'use strict';

window.React = require("react");

var ngReactGridDirective = require('./directives/ng-react-grid-directive');
var ngReactGridCheckboxFactory = require('./factories/ng-react-grid-checkbox-factory');
var ngReactGridTextFieldFactory = require("./factories/ng-react-grid-text-field-factory");
var ngReactGridCheckboxFieldFactory = require("./factories/ng-react-grid-checkbox-field-factory");
var ngReactGridSelectFieldFactory = require("./factories/ng-react-grid-select-field-factory");

angular.module('ngReactGrid', [])
    .factory("ngReactGridCheckbox", ['$rootScope', ngReactGridCheckboxFactory])
    .factory("ngReactGridTextField", ['$rootScope', ngReactGridTextFieldFactory])
    .factory("ngReactGridCheckboxField", [ngReactGridCheckboxFieldFactory])
    .factory("ngReactGridSelectField", ['$rootScope', ngReactGridSelectFieldFactory])
    .directive("ngReactGrid", ['$rootScope', ngReactGridDirective]);
