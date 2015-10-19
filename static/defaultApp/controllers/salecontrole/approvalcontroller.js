(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var ApprovalController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel) {
        var vm = this;
        track_id = ($routeParams.trackid) ? parseInt($routeParams.trackid) : 0;
        vm.track = {};

        function init() {
            displayModel.displayModel='block';
            gettrack();
        }
        
        vm.approval = function(){
        	if(vm.track.remark==""){
        		vm.track.remark="无";
            }
            dataService.approval(vm.track)
            .then(function (data) {
         	   toaster.pop('info', "", "批注成功！");
         	$location.path('/salepanel');
            }, function (error) {
             toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });        	
        }

        
        function gettrack() {
            dataService.gettrack(track_id)
            .then(function (data) {
            	vm.track = data;
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