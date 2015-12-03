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
        }


        init();
    };

    CreateSuccessController.$inject = injectParams;
    angular.module('managerApp').controller('CreateSuccessController', CreateSuccessController);

}());