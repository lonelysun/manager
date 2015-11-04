(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','$route', 'config', 'dataService','toaster','displayModel'];

    var NosalershopController = function ($scope, $location, $routeParams,
                                           $timeout, $route,config, dataService,toaster,displayModel) {
        
    	var vm = this;
    	businessid = ($routeParams.businessid) ? parseInt($routeParams.businessid) : 0;
    	salerid = ($routeParams.salerid) ? parseInt($routeParams.salerid) : 0;
    	vm.shops = [];
    	vm.keyword = '';
    	
        vm.busy=false;
        vm.isLoad=false;
        
        vm.selected = [];
        vm.selectedTags = [];
        vm.assign = function(){
        	if(vm.selected.length==0){
            	toaster.pop('warning', "系统提示", "未选择商户");
                return;
            }
        	var da = {"shop" : JSON.stringify(vm.selected)};
            dataService.assignshop(da,salerid)
            .then(function (data) {
         	   toaster.pop('info', "", "分配成功!");
         	 $route.reload();
            }, function (error) {
             toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }
        
        
        var updateSelected = function(action,id,name){
            if(action == 'add' && vm.selected.indexOf(id) == -1){
                vm.selected.push(id);
                vm.selectedTags.push(name);
            }
            if(action == 'remove' && vm.selected.indexOf(id)!=-1){
                var idx = vm.selected.indexOf(id);
                vm.selected.splice(idx,1);
                vm.selectedTags.splice(idx,1);
            }
        }

        vm.updateSelection = function($event, id){
            var checkbox = $event.target;
            var action = (checkbox.checked?'add':'remove');
            updateSelected(action,id,checkbox.name);
        }

        vm.isSelected = function(id){
            return vm.selected.indexOf(id)>=0;
        }
        
        
        function init() {
            displayModel.displayModel='none';
            
        }

        vm.getShop = function(){
        	
        	if(vm.busy)return;
            vm.busy=true;
            dataService.getnosalershop(businessid,vm.shops.length,vm.keyword)
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
        vm.getShopKeyword = function(){
        	
        	if(vm.busy)return;
        	vm.busy=true;
        	dataService.getassignshop(businessid,0,vm.keyword)
        	.then(function (data) {
        		vm.shops = data
        		vm.isLoad=true;
        		vm.isLoad=true;
        		$timeout(function () {
        			vm.busy=false;
        		}, 1000);
        	}, function (error) {
        		toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
        	});
        }

        vm.getType = function (){
            dataService.gettype()
            .then(function (data)
            {
                vm.states = data;
                $timeout(function () {
                }, 1000);
            },
            function (error) {
                toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

        };



        init();
    };

    NosalershopController.$inject = injectParams;
    angular.module('managerApp').controller('NosalershopController', NosalershopController);
    
}());