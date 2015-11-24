(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','$route', 'config', 'dataService','toaster','displayModel','MyCache'];

    var SelectSalerController = function ($scope, $location, $routeParams,
                                           $timeout, $route,config, dataService,toaster,displayModel,MyCache) {

    	var vm = this;
    	vm.salers = [];
        vm.salerid = {
            id:'',
        };

        vm.busy=false;
        vm.isLoad=false;

//        vm.selected = [];
//        vm.selectedTags = [];
//        vm.assign = function(){
//        	if(vm.selected.length==0){
//            	toaster.pop('warning', "系统提示", "未选择商户");
//                return;
//            }
//        	var da = {"shop" : JSON.stringify(vm.selected)};
//            dataService.assignshop(da,salerid)
//            .then(function (data) {
//         	   toaster.pop('info', "", "分配成功!");
//         	 $route.reload();
//            }, function (error) {
//             toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
//            });
//        }
//
//
//        var updateSelected = function(action,id,name){
//            if(action == 'add' && vm.selected.indexOf(id) == -1){
//                vm.selected.push(id);
//                vm.selectedTags.push(name);
//            }
//            if(action == 'remove' && vm.selected.indexOf(id)!=-1){
//                var idx = vm.selected.indexOf(id);
//                vm.selected.splice(idx,1);
//                vm.selectedTags.splice(idx,1);
//            }
//        }
//
//        vm.updateSelection = function($event, id){
//            var checkbox = $event.target;
//            var action = (checkbox.checked?'add':'remove');
//            updateSelected(action,id,checkbox.name);
//        }
//
//        vm.isSelected = function(id){
//            return vm.selected.indexOf(id)>=0;
//        }


        function init() {
            displayModel.showHeader='1';
            displayModel.displayBack='1';
            displayModel.displaySave='1';
            displayModel.displaySearch='0';
            displayModel.displayCanel='0';
            displayModel.title = '选择销售';

        }

        //获取销售人员列表
        vm.getTeamList = function(){

        	if(vm.busy)return;
            vm.busy=true;
            dataService.getTeamList(vm.salers.length)
            .then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    vm.salers.push(data[i]);
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

        vm.showimg = function(saler){
            var duixiang = angular.fromJson(vm.salerid);
            if(saler.id==duixiang.id){
                return '0';
            }else{
                return '1';
            }
        }
        vm.save = function(){
            if(vm.salerid==''){
            	toaster.pop('warning', "", "未选择销售人员！");
                return true;
            }
            var duixiang = angular.fromJson(vm.salerid);
            MyCache.put('salerid',duixiang);
            $timeout(function(){
                $location.path('/createMission');
            },500)
        }


        init();
    };

    SelectSalerController.$inject = injectParams;
    angular.module('managerApp').controller('SelectSalerController', SelectSalerController);

}());