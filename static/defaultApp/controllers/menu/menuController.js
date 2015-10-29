(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var menuController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel) {
        var vm = this;
        vm.panel = {};
        vm.second = false;
        
        function init() {
            displayModel.displayModel='block';
            getPanel();
        }

        //页面初始化获取用户显示权限
        function getPanel() {
            dataService.getMenu()
            .then(function (data) {
            	vm.panel = data;
            	console.info(vm.panel);
            	if (vm.panel.issaler|vm.panel.ismanager)
            		vm.second = true;
            	if(!vm.panel.isall){
                	toaster.pop('error', "没有权限", "没有任何显示权限，请联系管理员");
            	}
                $timeout(function () {
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        init();
    };

    menuController.$inject = injectParams;
    angular.module('managerApp').controller('MenuController', menuController);
    
}());