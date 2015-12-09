(function () {

    var injectParams = ['$scope', '$location', '$routeParams','$route','$rootScope',
                        '$timeout', 'ngDialog','config','modalService', 'dataService','toaster','displayModel','MyCache'];

    var salerController = function ($scope, $location, $routeParams,$route,$rootScope,
                                           $timeout, ngDialog,config,modalService, dataService,toaster,displayModel,MyCache) {
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
        //add by liuhao
        vm.role = '';
        //add end



        var hr_id_for_manager = ($routeParams.salerId) ? parseInt($routeParams.salerId) : 0;

        //MyCache.put('hr_id_for_manager',hr_id_for_manager);
        //经理在点击点击销售人员后,之后返回时,要记得清除缓存


        //搜索功能
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



        vm.clickMore = function(){
            vm.showFinishedmissions= !(vm.showFinishedmissions);

        };


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


        //Get partners
        vm.getPartners = function(){

            if(vm.busy)return;
            vm.busy=true;

            dataService.getPartners(vm.partners.length,vm.keyword,hr_id_for_manager)
            .then(function (data) {
                for (var i = 0; i < data['partners_list'].length; i++) {
                    vm.partners.push(data['partners_list'][i]);
                }




                //    console.info('getPartners');
                //console.info(vm.partners);


                    vm.isLoad=true;

                $timeout(function () {
                    vm.busy=false;

                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });



        };


        vm.goBack = function(){
            //清缓存
            MyCache.remove('hr_id_for_manager');

            $location.path('/menus');


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

        vm.getInitData = function(){

            dataService.getInitData(hr_id_for_manager)
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

        //新建
        vm.createMissionOrPatner = function () {

            //MyCache.put('createNewPartner','1');
            //MyCache.put('createNewPartner_firstLoad','1');


        	$scope.modalOptions = {
                closeButtonText: '取消',
                firstActionText:'新任务',
                firstUrl:'#/createMission/7',
                secondActionText:'新商户',
                secondUrl:'#/saler/partner/edit/0',
            };

            ngDialog.open({
                template:'/born_manager/static/defaultApp/partials/modalBottomThree.html',
                className: 'ngdialog',
                scope:$scope
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

            //console.info('----missionsUnfinished------')
            //console.info(missionsUnfinished)

            switch (missionState)
            {
                case 'notstart':
                    showFirstText = true;
                    showSecondText = false;
                    showThirdText = false;
                    console.info('in notstart')
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

                    MyCache.put('finishMission_come_from','page_saler');
                    MyCache.put('firstComeIntoFinishMission','1');
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

        vm.jumpWithCache = function(Id){
            MyCache.put('finishedMission_come_from','page_saler');
            $location.path('/saler/finishedMission/'+Id)
        };






        //初始化
        function init() {


            //if(MyCache.get('hr_id_for_manager') != 0 ){
            //    var
            //    $location.path('')
            //}

            if(MyCache.get('hr_id_for_manager')){
                hr_id_for_manager = MyCache.get('hr_id_for_manager')

            }else{
                MyCache.put('hr_id_for_manager',hr_id_for_manager)
            }




            displayModel.displayModel='none';
            vm.getInitData();
            if(MyCache.get('saler_display')){
                vm.display = MyCache.get('saler_display')
            }
            else{
                vm.display = 'missions';
            }

            if (MyCache.get('showClickMore')=='1'){
                vm.showFinishedmissions = true;
                MyCache.remove('showClickMore')
            }
            else{
                vm.showFinishedmissions = false;
            }

            MyCache.remove('saler_display');

            displayModel.showHeader='0';

            //add by liuhao
            vm.role = MyCache.get('role_option');
            //end



        }

        init();
    };

    salerController.$inject = injectParams;
    angular.module('managerApp').controller('SalerController', salerController);

}());