(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var AllsalersController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel) {
        var vm = this;
        vm.salers = {};
        vm.busy=false;
        vm.isLoad=false;
        
        function init() {
        	getSalers();
            displayModel.displayModel='none';
        }
        
        function getSalers() {
        	
        	if(vm.busy)return;
            vm.busy=true;
            dataService.getSalers()
            .then(function (data) {
            	vm.salers=data;
            	vm.isLoad=true;
                $timeout(function () {
                	vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        init();
    };

    AllsalersController.$inject = injectParams;
    angular.module('managerApp').controller('AllsalersController', AllsalersController);
    
}());