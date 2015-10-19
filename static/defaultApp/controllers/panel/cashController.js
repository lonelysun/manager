(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var cashController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel) {
        var vm = this,
    	type = ($routeParams.type) ? $routeParams.type : 'cash';
        vm.cashs = [];
        vm.busy=false;
        vm.isLoad=false;

        //滚动翻页
        vm.getCashs= function () {

            if(vm.busy)return;
            vm.busy=true;

            dataService.getCashPages(vm.cashs.length,type)
            .then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    vm.cashs.push(data[i]);
                }
                vm.isLoad=true;
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
            displayModel.displayModel='none';
        }

        init();
    };

    cashController.$inject = injectParams;
    angular.module('managerApp').controller('CashController', cashController);
    
}());