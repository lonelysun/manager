(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'ngDialog','config','modalService', 'dataService','toaster','displayModel','MyCache'];

    var finishMissionController = function ($scope, $location, $routeParams,
                                           $timeout, ngDialog,config,modalService, dataService,toaster,displayModel,MyCache) {
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
        vm.finishMission = {};


         //由url解析
        var missionId = ($routeParams.missionId) ? parseInt($routeParams.missionId) : 0;


        //选择拜访结果
        vm.selectResults = function(){
            MyCache.put('finishMission',vm.finishMission);

            $location.path('/saler/selectResults/'+ missionId);
        };

        vm.cancel = function(){
            if(MyCache.get('finishMission_come_from')){
                if(MyCache.get('finishMission_come_from') == 'page_saler'){
                    $location.path('/saler');
                    MyCache.remove('finishMission_come_from');
                    MyCache.remove('finishMission');
                    MyCache.remove('selectResults');
                    MyCache.remove('selectedTags');
                }else if(MyCache.get('finishMission_come_from') == 'page_partner_mission'){

                    var Id = MyCache.get('finishMission_come_from_partnerId');

                    MyCache.put('saler_partner_display','mission');
                    $location.path('/saler/partner/'+Id);
                    MyCache.remove('finishMission_come_from');
                    MyCache.remove('finishMission_come_from_partnerId');
                    MyCache.remove('finishMission');
                    MyCache.remove('selectResults');
                    MyCache.remove('selectedTags');
                }
                else if(MyCache.get('finishMission_come_from') == 'page_support'){
                    $location.path('/support');
                    MyCache.remove('finishMission_come_from');
                    MyCache.remove('finishMission');
                    MyCache.remove('selectResults');
                    MyCache.remove('selectedTags');
                }else if(MyCache.get('finishMission_come_from') == 'page_support_company_mission'){
                    var Id = MyCache.get('finishMission_come_from_companyId');

                    MyCache.put('support_company_display','mission');
                    $location.path('/saler/company/'+Id);
                    MyCache.remove('finishMission_come_from');
                    MyCache.remove('finishMission_come_from_companyId');
                    MyCache.remove('finishMission');
                    MyCache.remove('selectResults');
                    MyCache.remove('selectedTags');
                }

            }else {
                $location.path('/saler')
            }
        };


        //点击提交
        vm.save = function(){
            vm.finishMission.result_ids= angular.toJson(vm.finishMission.result_ids);

            vm.finishMission['id'] = missionId;


            dataService.postFinishMission(vm.finishMission)
            .then(function (data) {
                $location.path('/saler/postSuccess');
                MyCache.remove('finishMission');
                MyCache.remove('selectResults');
                MyCache.remove('selectedTags');

            }, function (error) {
               toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

        };

        //获得图片
        $scope.getFile= function ($index) {
            var file = $scope.myFile;
            if (file){
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (function(){
                    vm.finishMission.mission_img = reader.result;
                    $timeout(function () {
                    }, 1000);
                });
            }
         };

        //点击上传图片
        vm.missionClick = function(){
            angular.element("#File").click();
        };


        //初始化
        function init() {

            displayModel.showHeader='1';
            displayModel.displayCancel='1';
            displayModel.displayBack = '0';
            displayModel.title = '任务汇报';
            displayModel.displaySubmit = '1';
            displayModel.displayConfirm = '0';
            displayModel.displaySave='0';
            displayModel.displayCreate = '0';
            displayModel.displaySearch = '0';
            displayModel.displayBottom = '0';

            displayModel.headerBack = vm.cancel;
            displayModel.born_submit = vm.save;

            if(MyCache.get('firstComeIntoFinishMission')=='1'){
                vm.finishMission.result_title = MyCache.get('passedMissionTitle');

                MyCache.remove('firstComeIntoFinishMission');
                MyCache.remove('passedMissionTitle');
            }

            if(MyCache.get('finishMission')){
                vm.finishMission = MyCache.get('finishMission');
            }

            if(MyCache.get('selectResults')){
                var selectResults = MyCache.get('selectResults');
                var selectedTags = MyCache.get('selectedTags');


                //this value need to push to server
                vm.finishMission.result_ids = selectResults;

                //this value use to show on the page
                vm.finishMission.results = [];
                for (var i = 0;i< selectedTags.length;i++){
                    vm.finishMission.results.push({'name':selectedTags[i]})
                }
            }
        }

        init();
    };

    finishMissionController.$inject = injectParams;
    angular.module('managerApp').controller('FinishMissionController', finishMissionController);

}());
