(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel','MyCache'];

    var menuController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel,MyCache) {
        var vm = this;
        vm.panel = {};
        vm.second = false;
        
        function init() {
            displayModel.showHeader = '0';
            getPanel();
        }

        //页面初始化获取用户显示权限
        function getPanel() {
            dataService.getMenu()
            .then(function (data) {
                MyCache.put('role_option',data.option)
                if(data.option=='7'){//销售
                    $location.path('/saler');
                }else if(data.option=='8'){//销售经理
                    $location.path('/salepanel');
                }else if(data.option=='9'){//技术
                    $location.path('/?');
                    displayModel.displayBottom = '1';
                }else if(data.option=='10'){//技术经理
                    $location.path('/salepanel');
                    displayModel.displayBottom = '1';
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