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
            displayModel.displayEdit = '0';
            displayModel.displaySave = '0';
            displayModel.displaySearch = '0';
            displayModel.displayBack = '0';
            displayModel.title = '首页';
            getPanel();
        }

        //页面初始化获取用户显示权限
        function getPanel() {
            dataService.getMenu()
            .then(function (data) {

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