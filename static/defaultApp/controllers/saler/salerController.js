(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel'];

    var salerController = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService, dataService,toaster,displayModel) {
        var vm = this;
        vm.companys = [];
        vm.missionsUnfinished = [];
        vm.missionsFinished = [];
        vm.partners = [];
        vm.busy=false;
        vm.isLoad=false;
        vm.keyword='';
        vm.initData={};
        vm.showButton=false;
        vm.showFinishedmissions=false;
        vm.display = null;
        var missionLengh=0;
        vm.missions_unfinished_numbers = 0;
        mission_state = '';




        //Get mission
        vm.getMissions = function(mission_state){
            if(vm.busy)return;
            vm.busy=true;

            if(mission_state=='unfinished')
                missionLengh = vm.missionsUnfinished.length;
            else{
                missionLengh = vm.missionsFinished.length;
            }

            dataService.getMissions(missionLengh,vm.keyword,mission_state)
            .then(function (data) {
                if(mission_state=='unfinished'){

                    if(data['missions_list'].length <10){
                        vm.showButton=true;
                    }

                    for (var i = 0; i < data['missions_list'].length; i++) {


                        vm.missionsUnfinished.push(data['missions_list'][i]);



                    }
                    console.info('in unfinished')
                }else{
                    for (var i = 0; i < data['missions_list'].length; i++) {


                        vm.missionsFinished.push(data['missions_list'][i]);

                    }

                    console.info('in finished')
                }

                console.info('getMissions');
                console.info(vm.missionsUnfinished);
                console.info(vm.missionsFinished);


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

            dataService.getPartners(vm.partners.length,vm.keyword)
            .then(function (data) {
                for (var i = 0; i < data['partners_list'].length; i++) {
                    vm.partners.push(data['partners_list'][i]);
                }


                    console.info('getPartners');
                console.info(vm.partners);


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

            dataService.getCompanys(vm.companys.length,vm.keyword)
            .then(function (data) {
                for (var i = 0; i < data['companys_list'].length; i++) {
                    vm.companys.push(data['companys_list'][i]);
                }

                    console.info('getCompanys');
                console.info(vm.companys);

                    vm.isLoad=true;
                $timeout(function () {
                    vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

        };

        vm.getInitData = function(){

            dataService.getInitData()
                .then(function (data) {
                    vm.initData = data;
                    vm.isLoad=true;
                    $timeout(function () {
                        vm.busy=false;
                    }, 1000);
                }, function (error) {
                    toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

        };

        vm.setDisplay = function(display){
            vm.display = display;
        };





        //初始化
        function init() {
            displayModel.displayModel='none';
            vm.getInitData();
            vm.display = 'missions';
            vm.showHeader='0';


        }

        init();
    };

    salerController.$inject = injectParams;
    angular.module('managerApp').controller('SalerController', salerController);

}());