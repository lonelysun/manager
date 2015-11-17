(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var SalecontroleController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel) {
        var vm = this;
        vm.area = {};
        vm.busy=false;
        vm.isLoad=false;
        
        
        function init() {
            displayModel.displayModel='none';
            getArea();
        }

        //获取用户掌管分区信息
        function getArea() {
        	
        	if(vm.busy)return;
            vm.busy=true;
            dataService.getArea()
            .then(function (data) {
            	vm.area = data;
            	vm.isLoad=true;
                $timeout(function () {
                	vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        init();
    };

    SalecontroleController.$inject = injectParams;
    angular.module('managerApp').controller('SalecontroleController', SalecontroleController);
    
}());