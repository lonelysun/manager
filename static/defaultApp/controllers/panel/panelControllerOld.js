(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var panelController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel) {
        var vm = this;
        vm.panel = {};

        function init() {
            displayModel.displayModel='block';
            getPanel();
        }

        //获取一个预约的详细信息
        function getPanel() {
            dataService.getPanel()
            .then(function (data) {
            	vm.panel = data;
                $timeout(function () {
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        init();
    };

    panelController.$inject = injectParams;
    angular.module('managerApp').controller('PanelController', panelController);
    
}());