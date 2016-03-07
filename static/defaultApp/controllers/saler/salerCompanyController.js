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
        var missionLength=0;
        vm.missions_finished_numbers = 0;
        mission_state = '';
        vm.missions = [];
        vm.showFinishedmissions=false;
        vm.company = {};
        vm.companyMission = [];
        vm.comeFrom = '';
        vm.companyMissionFinished = [];
        vm.companyMissionUnFinished = [];

        //由url解析
        var companyId = ($routeParams.companyId) ? parseInt($routeParams.companyId) : 0;



        var user_id_for_manager;

        if(MyCache.get('user_id_for_manager')){
            user_id_for_manager = parseInt(MyCache.get('user_id_for_manager'))
        }else{
            user_id_for_manager = 0
        }

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
        vm.getCompanyMission = function(mission_state){
            if(vm.busy)return;
            vm.busy=true;

            if(mission_state == 'notOk'){
                missionLength = vm.companyMissionUnFinished.length
            } else if(mission_state == 'ok'){
                missionLength = vm.companyMissionFinished.length
            }
            console.info('--->2');
            console.info(mission_state);

            console.info('--->5');
            console.info(missionLength,vm.keyword,companyId,vm.comeFrom,mission_state,user_id_for_manager);
            dataService.getCompanyMission(missionLength,vm.keyword,companyId,vm.comeFrom,mission_state,user_id_for_manager)
            .then(function (data) {
                    if(mission_state == 'notOk') {

                        if(data['missions_list'].length <5){
                            vm.showButton=true;
                            console.info('--->3');
                            console.info(vm.showButton);
                        }

                        for (var i = 0; i < data['missions_list'].length; i++) {
                            vm.companyMissionUnFinished.push(data['missions_list'][i]);

                        }
                        console.info('--->4');
                        console.info(data['missions_list']);
                        console.info(vm.companyMissionUnFinished);
                    }else if(mission_state == 'ok') {
                            for (var i = 0; i < data['missions_list'].length; i++) {
                                vm.companyMissionFinished.push(data['missions_list'][i]);
                            }
                        }


                vm.missions_finished_numbers = data['missions_finished_numbers']

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
            if(vm.comeFrom == 'saler'){
                MyCache.put('finishedMission_come_from','page_company_mission');
            }else if(vm.comeFrom == 'support'){
                MyCache.put('finishedMission_come_from','page_support_company_mission');
            }

            MyCache.put('finishedMission_come_from_companyId',Id);

            $location.path('/saler/finishedMission/'+Id)
        };

        //返回
        vm.back = function(){

            if (vm.comeFrom == 'saler'){
                MyCache.put('saler_display','companys');
            }else if (vm.comeFrom == 'support'){
                MyCache.put('support_display','companys');
            }

            MyCache.remove('comeFrom');


            window.location.href = 'bornhr://back';
        };

        //改变任务状态
        vm.changeMissionState = function(missionsUnfinished){
            //console.info('---->>>>');

            if(vm.role != '9'){
                return;
            }
            //console.info('---->>>><<<<<');

            var titleText,titleState;
            var showFirstText = false;
            var showSecondText = false;
            var showThirdText = false;

            titleText = missionsUnfinished.mission_name;
            titleState = missionsUnfinished.mission_state_name;
            var missionState = missionsUnfinished.mission_state;

            switch (missionState)
            {
                case 'notstart':
                    showFirstText = true;
                    showSecondText = false;
                    showThirdText = false;
                    break;
                case 'pause':
                    showFirstText = true;
                    showSecondText = false;
                    showThirdText = true;
                    break;
                case 'start':
                    showFirstText = false;
                    showSecondText = true;
                    showThirdText = true;
                    break;
                case 'finished':
                    showFirstText = false;
                    showSecondText = false;
                    showThirdText = false;
                    break;
            }

            $scope.modalOptions = {
                titleText:titleText,
                titleState:titleState,
                closeButtonText: '取消',

                firstActionText:'开始',
                showFirstText:showFirstText,

                secondActionText:'暂停',
                showSecondText:showSecondText,

                thirdActionText:'完成',
                showThirdText:showThirdText
            };

            ngDialog.openConfirm({
                template:'/born_manager/static/defaultApp/partials/modalBottomFive.html',
                className: 'ngdialog',
                scope:$scope
            }).then(function(data){

                var mission_id = missionsUnfinished.mission_id;
                var action = data;

                var changeData = {'mission_id':mission_id,'action':action};

                missionsUnfinished.mission_state  = action;

                if(action == 'finished'){

                    MyCache.put('finishMission_come_from','page_support_company_mission');
                    MyCache.put('firstComeIntoFinishMission','1');
                    MyCache.put('finishMission_come_from_companyId',companyId)
                    MyCache.put('passedMissionTitle',titleText);


                    $location.path('/saler/finishMission/'+mission_id)
                }
                else {

                    dataService.changeMissionState(changeData)
                        .then(function (data) {
                        }, function (error) {
                            toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
                        });
                }

            });

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
            displayModel.displayBottom='0';

            vm.getCompanyDetail();
            if(MyCache.get('saler_partnerOrCompany_display')){
                vm.display = MyCache.get('saler_partnerOrCompany_display');
                MyCache.remove('saler_partnerOrCompany_display')
            }else{
                vm.display = 'info';
            }


            if (MyCache.get('comeFrom') == 'saler'){
                vm.comeFrom = 'saler';
                //MyCache.remove('comeFrom');
            }else if (MyCache.get('comeFrom') == 'support'){
                vm.comeFrom = 'support';
                //MyCache.remove('comeFrom');
            }


            if (MyCache.get('showClickMore')=='1'){
                vm.showFinishedmissions = true;
                MyCache.remove('showClickMore');
                //console.info('======>>>1')
            }
            else{
                vm.showFinishedmissions = false;
                //console.info('======>>>2')
            }

            vm.role = MyCache.get('role_option');
        }

        init();
        //console.info('---->1');
        //console.info(vm.comeFrom);
        //console.info(vm.showButton);
    };

    salerCompanyController.$inject = injectParams;
    angular.module('managerApp').controller('SalerCompanyController', salerCompanyController);

}());