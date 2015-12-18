(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','$route', 'config', 'dataService','toaster','displayModel','MyCache'];

    var SelectSalerController = function ($scope, $location, $routeParams,
                                           $timeout, $route,config, dataService,toaster,displayModel,MyCache) {

    	var vm = this;
    	vm.salers = [];
        vm.salerid ={};
        vm.role_option = MyCache.get('role_option');

        vm.busy=false;
        vm.isLoad=false;


        function init() {
            displayModel.showHeader='1';
            displayModel.displayBottom='0';
            displayModel.displayBack='1';
            displayModel.displaySave='0';
            displayModel.displaySearch='0';
            displayModel.displayCancel='0';
            displayModel.displayCreate='0';
            displayModel.displaySubmit='0';
            displayModel.displayConfirm='1';
            displayModel.born_confirm = vm.born_confirm;
            displayModel.headerBack = vm.back;
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

        vm.born_confirm = function(){
            console.info(vm.salerid);
            if(vm.salerid==''){
            	toaster.pop('warning', "", "未选择销售人员！");
                return true;
            }
            var duixiang = angular.fromJson(vm.salerid);
            MyCache.put('salerid',duixiang);
            $timeout(function(){
                $location.path('/createMission/'+vm.role_option);
            },500)
        }

        vm.back = function(){
            $location.path('/createMission/8');
        }


        init();
    };

    SelectSalerController.$inject = injectParams;
    angular.module('managerApp').controller('SelectSalerController', SelectSalerController);

}());