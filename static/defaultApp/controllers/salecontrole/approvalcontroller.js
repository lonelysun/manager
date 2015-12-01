(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel','MyCache'];

    var ApprovalController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel,MyCache) {
        var vm = this;
        track_id = ($routeParams.trackid) ? parseInt($routeParams.trackid) : 0;
        vm.track = {};

        function init() {
            displayModel.showHeader='1';
            displayModel.displayBack='1';
            displayModel.displaySave='0';
            displayModel.displaySearch='0';
            displayModel.displayCanel='0';
            displayModel.displayCreate='0';
            displayModel.displaySubmit='0';
            displayModel.displayConfirm='0';
            displayModel.headerBack = vm.back;
            displayModel.title = '任务汇报';
            gettrack();
        }

        vm.back = function(){
            displayModel.showHeader = '0';
            $location.path('/menus');
        }

        vm.approval = function(){
        	if(vm.track.remark==""){
        		vm.track.remark="无";
            }
            dataService.approval(vm.track)
            .then(function (data) {
                var url = '/approvalSuccess/'+track_id
         	   $location.path(url);
            }, function (error) {
             toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });        	
        }

        
        function gettrack() {
            dataService.gettrack(track_id)
            .then(function (data) {
            	vm.track = data;
            	MyCache.put('track_ids',vm.track.ids_list);
                $timeout(function () {
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        init();
    };

    ApprovalController.$inject = injectParams;
    angular.module('managerApp').controller('ApprovalController', ApprovalController);
    
}());
