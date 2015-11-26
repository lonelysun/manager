(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','$route' ,'config', 'dataService','toaster','displayModel'];

    var RankingController = function ($scope, $location, $routeParams,
                                           $timeout,$route ,config, dataService,toaster,displayModel) {

    	var vm = this;
        vm.ranking = {};
        vm.max = '';

        function init() {
            getRanking();
        }

        //获取排行榜数据
        function getRanking() {

            dataService.getRanking()
            .then(function (data) {
            	vm.ranking = data;
            	vm.max = vm.ranking.salers[0].number;
                $timeout(function () {
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        init();
    };

    RankingController.$inject = injectParams;
    angular.module('managerApp').controller('RankingController', RankingController);

}());