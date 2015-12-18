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


        //点击已完成的按钮,显示/隐藏 已完成的任务
        vm.clickMore = function(){
            vm.showFinishedmissions= !(vm.showFinishedmissions);
        };


        //获取特定公司信息
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

        //控制导航栏显示 任务/商户/公司
        vm.setDisplay = function(display){
            vm.display = display;
        };

        //获取特定用户任务
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

        //点击已完成任务跳转到已完成的任务详细页面
        vm.jumpWithCache = function(Id){
            MyCache.put('finishedMission_come_from','page_company_mission');
            MyCache.put('finishedMission_come_from_companyId',companyId);

            $location.path('/saler/finishedMission/'+Id)
        };

        //返回
        vm.back = function(){
            MyCache.put('saler_display','companys');
            window.location.href = 'bornhr://back';
        };



        //初始化
        function init() {
            displayModel.displayModel='none';
            displayModel.showHeader='1';
            displayModel.displayConfirm = '0';
            displayModel.displaySubmit = '0';
            displayModel.displayCreate = '0';
            displayModel.displayBack = '1';
            displayModel.headerBack = vm.back;
            displayModel.displaySearch = '0';
            displayModel.displaySave='0';
            displayModel.displayCancel='0';

            vm.getCompanyDetail();
            if(MyCache.get('saler_partnerOrCompany_display')){
                vm.display = MyCache.get('saler_partnerOrCompany_display');
                MyCache.remove('saler_partnerOrCompany_display')
            }else{
                vm.display = 'info';
            }
        }

        init();
    };

    salerCompanyController.$inject = injectParams;
    angular.module('managerApp').controller('SalerCompanyController', salerCompanyController);

}());