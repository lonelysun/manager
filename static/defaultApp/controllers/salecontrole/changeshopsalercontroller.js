(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','$route', 'config', 'dataService','toaster','displayModel'];

    var ChangeshopsalerController = function ($scope, $location, $routeParams,
                                           $timeout,$route ,config, dataService,toaster,displayModel) {
        
    	var vm = this;
    	shopid = ($routeParams.shopid) ? parseInt($routeParams.shopid) : 0;
    	vm.salers = [];
    	vm.salerid = '';
    	
        vm.busy=false;
        vm.isLoad=false;
        
        vm.assign = function(){
        	
        	if(vm.salerid==''){
                toaster.pop('warning', "", "未选中销售人员！");
                return true;
        	}
        	
            dataService.changesaler(shopid,vm.salerid)
            .then(function (data) {
         	   toaster.pop('info', "", "分配成功!");
         	$route.reload();
            }, function (error) {
             toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }
        
        function init() {
            displayModel.displayModel='none';
            
        }

        vm.getShop = function(){
        	
        	if(vm.busy)return;
            vm.busy=true;
            dataService.getSalers()
            .then(function (data) {
                vm.salers=data;
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

    ChangeshopsalerController.$inject = injectParams;
    angular.module('managerApp').controller('ChangeshopsalerController', ChangeshopsalerController);
    
}());