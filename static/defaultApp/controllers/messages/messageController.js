(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var messageController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel) {
        var vm = this,
            messageId = ($routeParams.messageId) ? parseInt($routeParams.messageId) : 0;

        vm.messages = [];
        vm.busy=false;
        vm.isLoad=false;

        //滚动翻页
        vm.getServices= function () {

            if(vm.busy)return;
            vm.busy=true;

            dataService.getMessagesPages(vm.messages.length)
            .then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    vm.messages.push(data[i]);
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

        function init() {

            displayModel.displayModel='block';
        }

        init();
    };

    messageController.$inject = injectParams;
    angular.module('managerApp').controller('MessageController', messageController);
    
}());