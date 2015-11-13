(function () {

    var injectParams = ['$scope', '$location', 'config','displayModel'];
    var NavbarController = function ($scope, $location, config,displayModel) {
        var vm = this;

        vm.headerSave = null;
        vm.headerSearch = null;
        vm.headerBack = null;
        vm.headerCancel = null;



        vm.headerEdit = function(){
            displayModel.flag = 'edit';
            displayModel.displayEdit = '0';
            displayModel.displaySave = '1';
            displayModel.displayBack = '0';
            displayModel.displayTop = '';
        }

        vm.headerCancel = function(){
            displayModel.flag = '';
            displayModel.displayEdit = '1';
            displayModel.displaySave = '0';
            displayModel.displaySearch = '0';
            displayModel.displayBack = '1';
            displayModel.displayTop = 'edit';
        }
        vm.getDisplayModel = function(){
            return  displayModel.displayModel;
        }

        vm.getEditModel = function(){
            return displayModel.displayEdit;
        }

        vm.getSaveModel = function(){
            vm.title = displayModel.title;
            return displayModel.displaySave;
        }

        vm.getSearchModel = function(){
            return displayModel.displaySearch;
        }

        vm.getBackModel = function(){
            vm.title = displayModel.title;
            return displayModel.displayBack;
        }

        vm.isCollapsed = false;
        vm.highlight = function (path) {
            return $location.path().substr(0, path.length) === path;
        };

    };


    NavbarController.$inject = injectParams;

    angular.module('managerApp').controller('NavbarController', NavbarController);

}());
