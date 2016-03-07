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
        vm.missions_finished_numbers = 0;
        mission_state = '';
        vm.role = '';

        var user_id_for_manager = ($routeParams.salerId) ? parseInt($routeParams.salerId) : 0;



        //首页初始化数据
        vm.getInitData = function(){

            dataService.getInitData(user_id_for_manager)
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

        //获取 未完成/已完成的任务
        vm.getMissions = function(mission_state){
            if(vm.busy)return;
            vm.busy=true;
            if(mission_state=='notOk')
                missionLengh = vm.missionsUnfinished.length;
            else{
                missionLengh = vm.missionsFinished.length;
            }

            dataService.getMissions(missionLengh,vm.keyword,mission_state,user_id_for_manager)
            .then(function (data) {
                var i;
                if(mission_state=='notOk'){

                    if(data['missions_list'].length <5){
                        vm.showButton=true;
                    }

                    for (i = 0; i < data['missions_list'].length; i++) {
                        vm.missionsUnfinished.push(data['missions_list'][i]);
                    }
                    //console.info('in unfinished')
                }else{
                    for (i = 0; i < data['missions_list'].length; i++) {
                        vm.missionsFinished.push(data['missions_list'][i]);
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



        //获取首页上的商户
        vm.getPartners = function(){
            if(vm.busy)return;
            vm.busy=true;
            dataService.getPartners(vm.partners.length,vm.keyword,user_id_for_manager)
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


        //获取首页上的公司列表
        vm.getCompanys = function(){
            if(vm.busy)return;
            vm.busy=true;

            dataService.getCompanys(vm.companys.length,vm.keyword,user_id_for_manager)
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



        //搜索功能
        vm.searsh = function(){
            $scope.modalOptions = {
                keyword:''
            };
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
        };

        //点击已完成的按钮,显示/隐藏 已完成的任务
        vm.clickMore = function(){
            vm.showFinishedmissions= !(vm.showFinishedmissions);

        };

        //供销售经理点击的返回到团队成员的按钮
        vm.goBack = function(){
            //清缓存
            MyCache.remove('user_id_for_manager');
            MyCache.put('comeFromSaler','team');

            $location.path('/menus');
        };


        //控制导航栏显示 任务/商户/公司
        vm.setDisplay = function(display){
            vm.display = display;
        };

        //新建任务或商户
        vm.createMissionOrPatner = function () {
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

        //改变任务状态
        vm.changeMissionState = function(missionsUnfinished){

            if(vm.role != '7'){
                return;
            }

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

        //点击已完成任务跳转到已完成的任务详细页面
        vm.jumpWithCache = function(Id){
            MyCache.put('finishedMission_come_from','page_saler');
            $location.path('/saler/finishedMission/'+Id)
        };

        vm.jumpToCompany = function (company_id) {
            MyCache.put('comeFrom','saler');
            $location.path('saler/company/'+company_id);
        };


        //初始化
        function init() {

            if(MyCache.get('user_id_for_manager')){
                user_id_for_manager = MyCache.get('user_id_for_manager')

            }else{
                MyCache.put('user_id_for_manager',user_id_for_manager)
            }

            displayModel.displayModel='none';

            vm.getInitData();

            if(MyCache.get('saler_display')){
                vm.display = MyCache.get('saler_display');
                MyCache.remove('saler_display');
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


            displayModel.showHeader='0';

            vm.role = MyCache.get('role_option');

        }

        init();
    };

    salerController.$inject = injectParams;
    angular.module('managerApp').controller('SalerController', salerController);

}());