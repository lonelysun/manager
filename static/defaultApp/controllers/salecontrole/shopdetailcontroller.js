(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var ShopdetailController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel) {
        
    	var vm = this;
    	shopid = ($routeParams.shopid) ? parseInt($routeParams.shopid) : 0;
    	vm.shop = {};
        vm.busy=false;
        vm.isLoad=false;
            
        
        function init() {
            displayModel.displayModel='none';
            getshopdetail();
        }

       
        function getshopdetail() {
        	
        	if(vm.busy)return;
            vm.busy=true;
            dataService.getshopdetail(shopid)
            .then(function (data) {
            	vm.shop = data;
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

    ShopdetailController.$inject = injectParams;
    angular.module('managerApp').controller('ShopdetailController', ShopdetailController);
    
}());