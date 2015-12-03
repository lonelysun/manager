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

                    vm.isLoad=true;
                    $timeout(function () {
                        vm.busy=false;
                    }, 1000);
                }, function (error) {
                    toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

        };

        vm.back = function(){
            if(MyCache.get('finishedMission_come_from')){
                if(MyCache.get('finishedMission_come_from') == 'page_saler'){
                    $location.path('/saler')
                    MyCache.remove('finishedMission_come_from')
                }else if(MyCache.get('finishedMission_come_from') == 'page_partner_mission'){

                    var Id = MyCache.get('finishedMission_come_from_partnerId');

                    MyCache.put('saler_partner_display','mission')
                    $location.path('/saler/partner/'+Id);
                    MyCache.remove('finishedMission_come_from')
                    MyCache.remove('finishedMission_come_from_partnerId')
                }else if (MyCache.get('finishedMission_come_from') == 'page_company_mission'){

                    var Id = MyCache.get('finishedMission_come_from_companyId');
                    MyCache.put('saler_partner_display','mission')
                    $location.path('/saler/partner/'+Id);
                    MyCache.remove('finishedMission_come_from')
                    MyCache.remove('finishedMission_come_from_companyId')
                }



            }else {
                $location.path('/saler')
            }


            $location.path('/saler');
        }




        //初始化
        function init() {


            vm.getFinishedMission();

            displayModel.displayModel='none';
            displayModel.displayConfirm = '0';
            displayModel.displaySubmit = '0';
            displayModel.displayCreate = '0';
            displayModel.displaySearch = '0';

            displayModel.displaySave='1';
            displayModel.displayCancel='1';

            //vm.display = 'info';

            displayModel.showHeader = '1';
            displayModel.displayBack = '1';
            displayModel.headerBack = vm.back;

        }

        init();
    };

    showFinishedMissionController.$inject = injectParams;
    angular.module('managerApp').controller('ShowFinishedMissionController', showFinishedMissionController);

}());
