(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var TeamshopController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel) {
        
    	var vm = this;
    	vm.shops = [];
        vm.keyword='';
    	vm.focus = true;
        vm.busy=false;
        vm.isLoad=false;
        url = $location.path();
        status = ""
        type = ""
        if(url.indexOf("successshop") >= 0){
        	status="installed";
        }else if(url.indexOf("waitshop") >= 0){
        	status="wait";
        }else if(url.indexOf("visitingshop") >= 0){
        	status="visiting";
        }else if(url.indexOf("nosalershop") >= 0){
        	status="all";
        	type="nosaler";
        }else if(url.indexOf("havesalershop") >= 0){
        	status="all";
        	type="havesaler";
        }else if(url.indexOf("teamshop") >= 0){
        	status="all";
        }
        function init() {
            displayModel.displayModel='none';
        }
        
        vm.getShop = function(){
        	
        	if(vm.busy)return;
            vm.busy=true;
            dataService.getteamshop(vm.shops.length,status,vm.keyword,type)
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
     
        vm.getKeyword= function () {
        	
        	if(vm.busy)return;
        	vm.busy=true;
        	
        	dataService.getteamshop(0,status,vm.keyword,type)
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
        };

        init();
    };
    


    TeamshopController.$inject = injectParams;
    angular.module('managerApp').controller('TeamshopController', TeamshopController);
    
}());