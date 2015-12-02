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


        vm.selectResults = function(){
            MyCache.put('finishMission',vm.finishMission);

            $location.path('/saler/selectResults/'+ missionId);
        };






        //点击提交
        vm.save = function(){
            vm.finishMission.result_ids= angular.toJson(vm.finishMission.result_ids);

            vm.finishMission['id'] = missionId;

            console.info('vm.finishMission');
            console.info(vm.finishMission);

            dataService.postFinishMission(vm.finishMission)
            .then(function (data) {


                    $location.path('/saler/postSuccess');

            }, function (error) {
               toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

        };


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





        //初始化
        function init() {

            if(MyCache.get('finishMission')){
                vm.finishMission = MyCache.get('finishMission');
            }

            if(MyCache.get('selectResults')){
                var selectResults = MyCache.get('selectResults');
                var selectedTags = MyCache.get('selectedTags');


                //this value need to push to server
                vm.finishMission.result_ids = selectResults

                //this value use to show on the page
                vm.finishMission.results = []
                for (var i = 0;i< selectedTags.length;i++){
                    vm.finishMission.results.push({'name':selectedTags[i]})
                }
            }



            displayModel.displayModel='none';

            //vm.display = 'info';
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

    finishMissionController.$inject = injectParams;
    angular.module('managerApp').controller('FinishMissionController', finishMissionController);

}());

function missionClick(){
    return  $("#File").click();
}