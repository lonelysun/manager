(function () {
    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','ngDialog', 'config', 'dataService','toaster','displayModel','MyCache'];

    var SearchResultController = function ($scope, $location, $routeParams,
                                           $timeout, ngDialog,config, dataService,toaster,displayModel,MyCache) {
        var vm = this;
        vm.keyword = '';
        vm.type = '';
        vm.busy=false;
        vm.isLoad=false;
        vm.role = '';
        vm.showDone = false;
        vm.donetracklist = [];
        vm.tracklist=[];
        vm.salers = [];
        vm.companys = [];
        vm.missionsUnfinished = [];
        vm.missionsFinished = [];
        vm.partners = [];
        vm.showFinishedmissions=false;
        var missionLengh=0;
        vm.missions_unfinished_numbers = 0;
        mission_state = '';
        vm.number = '';

        function init() {
            vm.role = MyCache.get('role');
            vm.type = MyCache.get('searchType');
            vm.keyword  =MyCache.get('keyword');
            displayModel.showHeader='1';
            displayModel.displayBack='1';
            displayModel.displaySave='0';
            displayModel.displaySearch='0';
            displayModel.displayCancel='0';
            displayModel.displayCreate='0';
            displayModel.displaySubmit='0';
            displayModel.displayConfirm='0';
            displayModel.headerBack=vm.back;
            displayModel.title = '搜索结果';
            if(MyCache.get('hr_id_for_manager')){
                hr_id_for_manager = MyCache.get('hr_id_for_manager')
            }else{
                hr_id_for_manager = 0;
            }
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
                if(data.length< 10 ){
                    vm.DoneTrack = true;
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



        //Get mission
        vm.getMissions = function(mission_state){

            if(vm.busy)return;
            vm.busy=true;
            if(mission_state=='notOk')
                missionLengh = vm.missionsUnfinished.length;
            else{
                missionLengh = vm.missionsFinished.length;
            }
            dataService.getMissions(missionLengh,vm.keyword,mission_state,hr_id_for_manager)
            .then(function (data) {
                if(mission_state=='notOk'){
                    if(data['missions_list'].length <5){
                        vm.showButton=true;
                    }
                    for (var i = 0; i < data['missions_list'].length; i++) {
                        vm.missionsUnfinished.push(data['missions_list'][i]);
                    }
                }else{
                    for (var i = 0; i < data['missions_list'].length; i++) {
                        vm.missionsFinished.push(data['missions_list'][i]);
                    }
                }
                vm.missions_unfinished_numbers = data['missions_unfinished_numbers']
                vm.isLoad=true;
                $timeout(function () {
                    vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };


        //Get partners
        vm.getPartners = function(){

            if(vm.busy)return;
            vm.busy=true;

            dataService.getPartners(vm.partners.length,vm.keyword,hr_id_for_manager)
            .then(function (data) {
                for (var i = 0; i < data['partners_list'].length; i++) {
                    vm.partners.push(data['partners_list'][i]);
                }

                    vm.isLoad=true;

                $timeout(function () {
                    vm.busy=false;

                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };


        //Get companys
        vm.getCompanys = function(){
            if(vm.busy)return;
            vm.busy=true;

            dataService.getCompanys(vm.companys.length,vm.keyword,hr_id_for_manager)
            .then(function (data) {
                for (var i = 0; i < data['companys_list'].length; i++) {
                    vm.companys.push(data['companys_list'][i]);
                }


                    vm.isLoad=true;
                $timeout(function () {
                    vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

        };

        vm.back = function(){
            displayModel.showHeader = '0';
            if(MyCache.get('goToSearch')=='1'){
                $location.path('/saler');
            }else{
                window.location.href = 'bornhr://back';
            }
        }

        init();
    };

    SearchResultController.$inject = injectParams;
    angular.module('managerApp').controller('SearchResultController', SearchResultController);

}());