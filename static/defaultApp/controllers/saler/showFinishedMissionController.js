(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'ngDialog','config','modalService', 'dataService','toaster','displayModel','MyCache'];

    var showFinishedMissionController = function ($scope, $location, $routeParams,
                                           $timeout, ngDialog,config,modalService, dataService,toaster,displayModel,MyCache) {
        var vm = this;
        vm.busy=false;
        vm.isLoad=false;
        vm.keyword='';
        vm.initData={};
        vm.display = null;
        vm.finishedMission = {};


         //由url解析
        var missionId = ($routeParams.missionId) ? parseInt($routeParams.missionId) : 0;



        vm.getFinishedMission = function(){

            dataService.getFinishedMission(missionId)
                .then(function (data) {
                    vm.finishedMission = data;
                    console.info('---vm.finishedMission---')
                    console.info(vm.finishedMission)


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


            vm.getFinishedMission()


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

    showFinishedMissionController.$inject = injectParams;
    angular.module('managerApp').controller('ShowFinishedMissionController', showFinishedMissionController);

}());

function missionClick(){
    return  $("#File").click();
}