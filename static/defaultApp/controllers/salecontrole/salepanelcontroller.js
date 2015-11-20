(function () {
    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var SalepanelController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel) {
        var vm = this;
        vm.panel = {};
        vm.display = 'missions';
        vm.busy=false;
        vm.isLoad=false;
        vm.tracklist = [];
        vm.donetracklist = [];
        vm.salers = [];
        vm.showDone = false;
        vm.DoneTrack = false;
        var state = '';

        function init() {
            displayModel.displayModel='block';
            getSalepanel();
        }

        vm.setDisplay = function(display) {
            vm.display = display;
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
                    console.info(vm.tracklist.length);
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
            vm.DoneTrack = true;
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