(function () {
    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','ngDialog', 'config', 'dataService','toaster','displayModel','MyCache'];

    var SalepanelController = function ($scope, $location, $routeParams,
                                           $timeout, ngDialog,config, dataService,toaster,displayModel,MyCache) {
        var vm = this;
        vm.panel = {};
        vm.display = 'managermissions';
        vm.busy=false;
        vm.isLoad=false;
        vm.tracklist = [];
        vm.donetracklist = [];
        vm.salers = [];
        vm.showDone = false;
        vm.DoneTrack = false;
        var state = '';
        vm.role = '';

        function init() {
            displayModel.displayModel='block';
            displayModel.showHeader = '0';
            vm.role = MyCache.get('role_option');
            if(vm.role=='9'||vm.role=='10'){
                displayModel.displayBottom = '1';
            }
            getSalepanel();
        }

        vm.setDisplay = function(display) {
            vm.display = display;
        }

        vm.searsh = function(){

            $scope.modalOptions = {
                keyword:''
            }
            ngDialog.openConfirm({
                template:'/born_manager/static/defaultApp/partials/modalSearch.html',
                className: 'ngdialog',
                scope:$scope,
                closeByDocument :true
            }).then(function(data){
                MyCache.put('keyword', $scope.modalOptions.keyword);
                MyCache.put('searchType',vm.display);
                $location.path('/search');
            });
        }

        //获取未审批任务列表
        vm.getFinishTrack = function(){
            if(vm.busy)return;
            vm.busy=true;
            state = 'finished';
            dataService.getFinishTracklist(vm.tracklist.length,vm.keyword,state)
            .then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    vm.tracklist.push(data[i]);
                }
                if(vm.tracklist.length == vm.panel.track_number){
                    vm.showDone = true;
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

        vm.showDoneTrack = function(){
            vm.getDoneTrack();
            vm.DoneTrack = !(vm.DoneTrack);
        }

        //获取已审批任务列表
        vm.getDoneTrack = function(){
            if(vm.busy)return;
            vm.busy=true;
            state = 'done';
            dataService.getFinishTracklist(vm.donetracklist.length,vm.keyword,state)
            .then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    vm.donetracklist.push(data[i]);
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
        //团队列表
        vm.getTeamList = function(){
            if(vm.busy)return;
            vm.busy=true;
            state = 'done';
            dataService.getTeamList(vm.salers.length,vm.keyword)
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

        //创建新任务
        vm.createMission = function () {
            if(vm.role=='8'){
                $scope.modalOptions = {
                    closeButtonText: '取消',
                    firstActionText:'新任务',
                    firstUrl:'#/createMission/8',
                    secondActionText:'新商户',
                    secondUrl:'#/saler/partner/edit/0',
                };
            }else{
                $scope.modalOptions = {
                    closeButtonText: '取消',
                    firstActionText:'',
                    firstUrl:'',
                    secondActionText:'新任务',
                    secondUrl:'#/createMission/10',
                };

            }

            ngDialog.open({
                template:'/born_manager/static/defaultApp/partials/modalBottomThree.html',
                className: 'ngdialog',
                scope:$scope
            });
        };


        //获取首页的详细信息
        function getSalepanel() {
            dataService.getSalepanel()
            .then(function (data) {
            	vm.panel = data;
                $timeout(function () {
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        init();
    };

    SalepanelController.$inject = injectParams;
    angular.module('managerApp').controller('SalepanelController', SalepanelController);
    
}());