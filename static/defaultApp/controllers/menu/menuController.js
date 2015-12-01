(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel','MyCache'];

    var menuController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel,MyCache) {
        var vm = this;
        vm.panel = {};
        vm.second = false;
        
        function init() {
            displayModel.displayEdit = '0';
            displayModel.displaySave = '0';
            displayModel.displaySearch = '0';
            displayModel.displayBack = '0';
            getPanel();
        }

        //页面初始化获取用户显示权限
        function getPanel() {
            dataService.getMenu()
            .then(function (data) {
                MyCache.put('role_option',data.option)
                if(data.option=='7'){
                    $location.path('/saler');
                }else if(data.option=='8'){
                    $location.path('/salepanel');
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