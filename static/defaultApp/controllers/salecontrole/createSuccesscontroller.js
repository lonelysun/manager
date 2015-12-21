(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','$route', 'config', 'dataService','toaster','displayModel','MyCache'];

    var CreateSuccessController = function ($scope, $location, $routeParams,
                                           $timeout,$route ,config, dataService,toaster,displayModel,MyCache) {

    	var vm = this;
        track_id = ($routeParams.track_id) ? parseInt($routeParams.track_id) : 0;
        vm.url = '';
        vm.track_ids = [];
        function init() {
            displayModel.showHeader = '0';
            displayModel.displayBottom='0';
            if(track_id!=0){
                var temp = '';
                vm.track_ids = MyCache.get('track_ids');
                temp = vm.track_ids.indexOf(track_id);
                if(temp+1==vm.track_ids.length){
                    vm.url=''
                }else{
                    vm.url = '/approval/'+vm.track_ids[temp+1]
                }
            }
        }

        vm.next = function(){
            $location.path(vm.url);
        };

        //Add by Nisen
        vm.jump = function(){
            if(MyCache.get('finishMission_come_from')){
                if(MyCache.get('finishMission_come_from') == 'page_saler'){

                    $location.path('/saler');
                    MyCache.remove('finishMission_come_from')
                }else if (MyCache.get('finishMission_come_from') == 'page_partner_mission'){
                    MyCache.put('saler_partner_display','mission');
                    var Id = MyCache.get('finishMission_come_from_partnerId');
                    $location.path('/saler/partner/'+Id);
                    MyCache.remove('finishMission_come_from');
                    MyCache.remove('finishMission_come_from_partnerId');
                }else if(MyCache.get('finishMission_come_from')=='page_support'){
                    $location.path('/support');
                    MyCache.remove('finishMission_come_from');
                }else if(MyCache.get('finishMission_come_from')=='page_support_company_mission'){
                    MyCache.put('support_company_display','mission');
                    var Id = MyCache.get('finishMission_come_from_companyId');
                    $location.path('/saler/company/'+Id);
                    MyCache.remove('finishMission_come_from');
                    MyCache.remove('finishMission_come_from_companyId');
                }
            }else{
                $location.path('/menu')
            }
        };
        //End


        init();
    };

    CreateSuccessController.$inject = injectParams;
    angular.module('managerApp').controller('CreateSuccessController', CreateSuccessController);

}());