(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel','MyCache'];

    var categoryController = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService, dataService,toaster,displayModel,MyCache) {
        var vm = this;




















        vm.setDisplay = function(display){
            vm.display = display;
        };





        //初始化
        function init() {
            displayModel.displayModel='none';
            vm.getPartnerInfo();
            vm.display = 'info';
            displayModel.showHeader = '1';
            displayModel.displayModel='none';
            displayModel.displayEdit = '0';
            displayModel.displaySave = '0';
            displayModel.displaySearch = '0';
            displayModel.displayBack = '1';

            displayModel.backpath='/saler/partner';






        }

        init();
    };

    categoryController.$inject = injectParams;
    angular.module('managerApp').controller('CategoryController', categoryController);

}());