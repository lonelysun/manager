﻿(function () {

    var injectParams = ['$scope', '$location', 'config','displayModel'];
    var NavbarController = function ($scope, $location, config,displayModel) {
        var vm = this;

        ////定义顶部导航栏
        //vm.showheaderEdit = null;
        //vm.showheaderSave = null;
        //vm.showheaderSearch = null;
        //vm.showheaderBack = null;
        //vm.showheaderCancel = null;
        //vm.headerEdit = null;
        vm.headerSave = null;
        vm.headerSearch = null;
        vm.headerCancel = null;
        displayModel.showHeader = '0';

        vm.headerBack = function(){
            $location.path(displayModel.backpath);
        }

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
            return displayModel.displaySave;
        }

        vm.getSearchModel = function(){
            return displayModel.displaySearch;
        }

        vm.getBackModel = function(){
            return displayModel.displayBack;
        }

        vm.isCollapsed = false;
        vm.highlight = function (path) {
            return $location.path().substr(0, path.length) === path;
        };

        vm.showHeader = function(){
            vm.title = displayModel.title;
            return displayModel.showHeader;
        };
    };

    NavbarController.$inject = injectParams;

    angular.module('managerApp').controller('NavbarController', NavbarController);

}());
