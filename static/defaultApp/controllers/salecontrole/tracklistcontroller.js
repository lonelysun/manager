(function () {

    var injectParams = ['$scope','$rootScope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster'];

    var TracklistController = function ($scope,$rootScope, $location, $routeParams,
                                           $timeout, config, dataService,toaster) {
        var vm = this;
        params = ($routeParams.params) ? $routeParams.params : '';

        vm.account={
            display:'day',
            accounts:[],
            current_date:'',
            current_week:'',
            current_year:'',
            current_month:'',
            display_current:'',
            date_from:'',
            date_to:'',
            keyword:'',
            shop_id:'',
            shop_name:'',
            total_amount:0,
            cnt:0,
        };

        vm.setPage= function (direction) {
           getAccounts(direction);
        };

        vm.setDisplay= function (display) {
            vm.account.display=display;
            getAccounts(0);

        };

        function init() {
            getAccounts(0);
        }

        function getAccounts(direction) {
            dataService.gettracklist(vm.account.display,0,
                vm.account.current_date, vm.account.current_week, vm.account.current_year, vm.account.current_month,
                direction,vm.account.date_from,vm.account.date_to,vm.account.keyword,vm.account.shop_id)
            .then(function (data) {
                vm.account=data;
                $timeout(function () {
                }, 1000);
            }, function (error) {
                toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        init();
    };

    TracklistController.$inject = injectParams;
    angular.module('managerApp').controller('TracklistController', TracklistController);
    
}());