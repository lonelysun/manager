(function () {

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
        displayModel.showHeader = '0';
        displayModel.displaySave = '0';
        displayModel.displaySearch = '0';
        displayModel.displayBack = '0';
        displayModel.displayCreate = '0';
        displayModel.displaySubmit = '0';
        displayModel.displayConfirm = '0';
        displayModel.placeholder = '0';

        vm.headerBack = function(){
            displayModel.headerBack();
//            $location.path(displayModel.backpath);
        }

        vm.headerEdit = function(){
            displayModel.flag = 'edit';
            displayModel.displaySave = '1';
            displayModel.displayBack = '0';
            displayModel.displayTop = '';
        }

        vm.headerCancel = function(){
            displayModel.flag = '';
            displayModel.displaySave = '0';
            displayModel.displaySearch = '0';
            displayModel.displayBack = '1';
            displayModel.displayTop = 'edit';
        }

        vm.getPlaceholder = function(){
            if(displayModel.displaySearch=='0'&&displayModel.displayCreate=='0'&&displayModel.displaySubmit=='0'&&displayModel.displayConfirm=='0'&&displayModel.displaySave=='0'){
                displayModel.placeholder = '1';
            }else{
                displayModel.placeholder = '0';
            }
            return displayModel.placeholder;
        }

        vm.getDisplayModel = function(){
            return  displayModel.displayModel;
        }

        vm.getSaveModel = function(){
            return displayModel.displaySave;
        }

        vm.getCanelModel = function(){
            return displayModel.displayCanel;
        }

        vm.getSearchModel = function(){
            return displayModel.displaySearch;
        }

        vm.getBackModel = function(){
            return displayModel.displayBack;
        }

        vm.getConfirmModel = function(){
            return displayModel.displayConfirm;
        }

        vm.getSubmitModel = function(){
            return displayModel.displaySubmit;
        }

        vm.getCreateModel = function(){
            return displayModel.displayCreate;
        }

        vm.isCollapsed = false;
        vm.highlight = function (path) {
            return $location.path().substr(0, path.length) === path;
        };

        vm.showHeader = function(){
            vm.title = displayModel.title;
            return displayModel.showHeader;
        };

        vm.save = function(){
            displayModel.born_save();
        }
        vm.create = function(){
            displayModel.born_create();
        }
        vm.confirm = function(){
            displayModel.born_confirm();
        }
        vm.submit = function(){
            displayModel.born_submit();
        }
    };

    NavbarController.$inject = injectParams;

    angular.module('managerApp').controller('NavbarController', NavbarController);

}());
