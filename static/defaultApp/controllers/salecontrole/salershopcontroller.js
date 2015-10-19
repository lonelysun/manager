(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var SalershopController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel) {
        
    	var vm = this;
    	salerid = ($routeParams.salerid) ? parseInt($routeParams.salerid) : 0;
    	businessid = ($routeParams.businessid) ? parseInt($routeParams.businessid) : 0;
    	vm.shops = [];
        vm.busy=false;
        vm.isLoad=false;
        vm.keyword = '';
        
        
        function init() {
            displayModel.displayModel='none';
        }
        vm.getsalerShop = function(){
        	
        	if(vm.busy)return;
            vm.busy=true;
            dataService.getsalershop(vm.shops.length,salerid,businessid,vm.keyword)
            .then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    vm.shops.push(data[i]);
                }
                vm.isLoad=true;
                vm.isLoad=true;
                $timeout(function () {
                	vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }
        vm.getsalerShopkey = function(){
        	
        	if(vm.busy)return;
        	vm.busy=true;
        	dataService.getsalershop(0,salerid,businessid,vm.keyword)
        	.then(function (data) {
        		vm.shops=data;
        		vm.isLoad=true;
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

    SalershopController.$inject = injectParams;
    angular.module('managerApp').controller('SalershopController', SalershopController);
    
}());