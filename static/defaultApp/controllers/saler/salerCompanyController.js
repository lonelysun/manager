(function () {

    var injectParams = ['$scope', '$location', '$routeParams','ngDialog',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel','MyCache'];

    var salerCompanyController = function ($scope, $location, $routeParams,ngDialog,
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
        vm.display = null;
        var missionLengh=0;
        vm.missions_unfinished_numbers = 0;
        mission_state = '';
        vm.missions = [];
        vm.showFinishedmissions=false;
        vm.company = {};
        vm.companyMission = [];


        //由url解析
        var companyId = ($routeParams.companyId) ? parseInt($routeParams.companyId) : 0;



        vm.clickMore = function(){
            vm.showFinishedmissions=true;
        };



        //Get specific company
        vm.getCompanyDetail = function(){

            dataService.getCompanyDetailUpdated(companyId)
            .then(function (data) {
                    vm.company = data;
                    displayModel.title = vm.company.name;

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


        //Get mission for specific
        vm.getCompanyMission = function(){

            if(vm.busy)return;
            vm.busy=true;



            dataService.getCompanyMission(vm.companyMission.length,vm.keyword,companyId)
            .then(function (data) {
            for (var i = 0; i < data['missions_list'].length; i++) {
                vm.companyMission.push(data['missions_list'][i]);
            }
                vm.isLoad=true;
                $timeout(function () {
                    vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };



        //初始化
        function init() {
            displayModel.displayModel='none';
            vm.getCompanyDetail();
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

    salerCompanyController.$inject = injectParams;
    angular.module('managerApp').controller('SalerCompanyController', salerCompanyController);

}());