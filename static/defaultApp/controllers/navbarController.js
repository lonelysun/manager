(function () {

    var injectParams = ['$scope', '$location', 'config','displayModel'];
    var NavbarController = function ($scope, $location, config,displayModel) {
        var vm = this;
        
        vm.getDisplayModel = function(){
        	return  displayModel.displayModel;
        }
        vm.isCollapsed = false;
        vm.highlight = function (path) {
            return $location.path().substr(0, path.length) === path;
        };
    };

    NavbarController.$inject = injectParams;

    angular.module('managerApp').controller('NavbarController', NavbarController);

}());
