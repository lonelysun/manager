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
                    //console.info('in unfinished')
                }else{
                    for (var i = 0; i < data['missions_list'].length; i++) {


                        vm.missionsFinished.push(data['missions_list'][i]);

                    }

                    //console.info('in finished')
                }

                //console.info('getMissions');
                //console.info(vm.missionsUnfinished);
                //console.info(vm.missionsFinished);


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
            //var missionObj = missionsUnfinished;
            console.info('------missionsUnfinished---------');
            console.info(missionsUnfinished);

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
                console.info('----data----');
                console.info(data);
                console.info(missionsUnfinished);

                var mission_id = missionsUnfinished.mission_id;
                var action = data;

                var changeData = {'mission_id':mission_id,'action':action};

                missionsUnfinished.mission_state  = action;

                if(action == 'finished'){
                    //$location.path('/saler');
                    $route.reload();
                }

                dataService.changeMissionState(changeData)
                .then(function (data) {
                        //toaster.pop('success', "", "修改成功!");
                        //debugger;
                        //$route.reload();
                        //$location.path('/saler');


                }, function (error) {
                    toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

                //$location.path('/saler');


            });

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