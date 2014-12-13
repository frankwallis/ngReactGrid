var ngReactGrid = require("../classes/ng-react-grid");

var ngReactGridDirective = function ($rootScope) {
    return {
        restrict: "E",
        scope : {
            grid : "="
        },
        link: function (scope, element, attrs) {
            new ngReactGrid(scope, element, attrs, $rootScope);
        }
    }
};

module.exports = ngReactGridDirective;

