(function () {

    var injectParams = ['$scope', '$location', '$routeParams','ngDialog',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel','MyCache'];

    var salerPartnerController = function ($scope, $location, $routeParams,ngDialog,
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


        //由url解析
        var partnerId = ($routeParams.partnerId) ? parseInt($routeParams.partnerId) : 0;





        vm.clickMore = function(){
            vm.showFinishedmissions=true;
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



        //Get mission for specific partner
        vm.getPartnerMission = function(mission_state){

            if(vm.busy)return;
            vm.busy=true;

            if(mission_state=='unfinished')
                missionLengh = vm.missionsUnfinished.length;
            else{
                missionLengh = vm.missionsFinished.length;
            }

            dataService.getPartnerMission(missionLengh,vm.keyword,partnerId,mission_state)
            .then(function (data) {
                if(mission_state=='unfinished'){

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


        vm.changeMissionState = function(missionsUnfinished){

            var titleText,titleState,closeButtonText,
                firstActionText,firstUrl,
                secondActionText,secondUrl,
                thirdActionText,thirdUrl;
            var showFirstText = false;
            var showSecondText = false;
            var showThirdText = false;

            titleText = missionsUnfinished.mission_name;
            titleState = missionsUnfinished.mission_state_name;
            var missionState = missionsUnfinished.mission_state;

            firstActionText = '开始';
            secondActionText = '暂停';
            thirdActionText = '完成' ;

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
                    MyCache.put('finishMission_come_from','page_partner_mission');
                    MyCache.put('finishMission_come_from_partnerId',partnerId);


                    $location.path('/saler/finishMission/'+mission_id)
                } else {
                    dataService.changeMissionState(changeData)
                        .then(function (data) {
                        }, function (error) {
                            toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
                    });
               }

            });

        };

        vm.back = function(){
            MyCache.remove('partner');
            MyCache.put('saler_display','partners');
            $location.path('/saler')
        };
        vm.jumpWithCache = function(Id){
            MyCache.put('finishedMission_come_from','page_partner_mission');
            MyCache.put('finishedMission_come_from_partnerId',partnerId);

            $location.path('/saler/finishedMission/'+Id)
        };



        //初始化
        function init() {
            displayModel.displayModel='none';
            displayModel.showHeader='1';
            displayModel.displayConfirm = '0';
            displayModel.displaySubmit = '0';
            displayModel.displayCreate = '0';
            displayModel.displayBack = '1';
            displayModel.displaySearch = '0';
            displayModel.displaySave='0';
            displayModel.displayCancel='0';
            displayModel.headerBack = vm.back;


            vm.role = MyCache.get('role_option');



            vm.getPartnerInfo();
            if(MyCache.get('saler_partner_display')){
                vm.display = MyCache.get('saler_partner_display');
                MyCache.remove('saler_partner_display')

            }else{
                vm.display = 'info';
            }






        }

        init();
    };

    salerPartnerController.$inject = injectParams;
    angular.module('managerApp').controller('SalerPartnerController', salerPartnerController);

}());