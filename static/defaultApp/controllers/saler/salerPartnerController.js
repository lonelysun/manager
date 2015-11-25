(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel','MyCache'];

    var salerPartnerController = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService, dataService,toaster,displayModel,MyCache) {
        var vm = this;
        vm.companys = [];
        vm.missionsUnfinished = [];
        vm.missionsFinished = [];
        vm.partners = [];
        vm.partner = {};
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
        vm.missions = [];


        //由url解析
        var partnerId = ($routeParams.partnerId) ? parseInt($routeParams.partnerId) : 0;




        //Get mission
        vm.getPartnerMission = function(){
            if(vm.busy)return;
            vm.busy=true;


            dataService.getPartnerMission(vm.missions.length,vm.keyword,partnerId)
            .then(function (data) {

                    for (var i = 0; i < data['missions_list'].length; i++) {


                        vm.missions.push(data['missions_list'][i]);

                    }


                vm.isLoad=true;
                $timeout(function () {
                    vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };


        //Get specific partner
        vm.getPartnerInfo = function(){
            if(vm.busy)return;
            vm.busy=true;

            dataService.getPartnerInfo(partnerId)
            .then(function (data) {
                    vm.partner = data;
                    vm.isLoad=true;

                    MyCache.put('partner',vm.partner);

                    displayModel.title = vm.partner.name;
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
            vm.getPartnerInfo();
            vm.display = 'info';
            displayModel.showHeader = '1';
            displayModel.displayModel='none';
            displayModel.displayEdit = '0';
            displayModel.displaySave = '0';
            displayModel.displaySearch = '0';
            displayModel.displayBack = '1';

            displayModel.backpath='/saler/partner';






        }

        init();
    };

    salerPartnerController.$inject = injectParams;
    angular.module('managerApp').controller('SalerPartnerController', salerPartnerController);

}());