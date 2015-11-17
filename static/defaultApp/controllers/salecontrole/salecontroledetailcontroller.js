(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var SalecontroledetailController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel) {
        var vm = this;
    	cityid = ($routeParams.cityid) ? parseInt($routeParams.cityid) : 0;
        vm.areadetail = {};
        vm.busy=false;
        vm.isLoad=false;
        
        function init() {
            displayModel.displayModel='none';
            getAreadetail();
        }

        //获取用户掌管分区内信息
        function getAreadetail() {
        	
        	if(vm.busy)return;
            vm.busy=true;
            dataService.getAreadetail(cityid)
            .then(function (data) {
            	vm.areadetail = data;
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

    SalecontroledetailController.$inject = injectParams;
    angular.module('managerApp').controller('SalecontroledetailController', SalecontroledetailController);
    
}());