(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var MessageTimeController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel) {
        var vm = this;

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

        vm.back = function(){
            window.location.href = 'bornhr://back';
        }

        function init() {
            displayModel.showHeader='1';
            displayModel.displayBottom = '0';
            displayModel.displayBack='1';
            displayModel.displaySave='0';
            displayModel.displaySearch='0';
            displayModel.displayCancel='0';
            displayModel.displayCreate='0';
            displayModel.displaySubmit='0';
            displayModel.displayConfirm='0';
            displayModel.headerBack=vm.back;
            displayModel.title = '消息';
        }

        init();
    };

    MessageTimeController.$inject = injectParams;
    angular.module('managerApp').controller('MessageTimeController', MessageTimeController);

}());