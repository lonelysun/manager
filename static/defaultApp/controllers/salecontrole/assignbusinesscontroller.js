(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','$route' ,'config', 'dataService','toaster','displayModel'];

    var AssignbusinessController = function ($scope, $location, $routeParams,
                                           $timeout,$route ,config, dataService,toaster,displayModel) {
        
    	var vm = this;
    	salerid = ($routeParams.salerid) ? parseInt($routeParams.salerid) : 0;
    	vm.area = {};
        vm.busy=false;
        vm.isLoad=false;
        vm.salerid = salerid;
        vm.selected = [];
        vm.selectedTags = [];
        vm.assign = function(){
        	if(vm.selected.length==0){
            	toaster.pop('warning', "系统提示", "未选择商圈");
                return;
            }
        	var da = {"assign" : JSON.stringify(vm.selected)};
            dataService.assign(da,salerid,vm.selected)
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
            getArea();
        }

        //获取用户掌管分区信息
        function getArea() {
        	
        	if(vm.busy)return;
            vm.busy=true;
            dataService.getassignarea()
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

    AssignbusinessController.$inject = injectParams;
    angular.module('managerApp').controller('AssignbusinessController', AssignbusinessController);
    
}());