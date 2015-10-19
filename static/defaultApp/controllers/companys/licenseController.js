(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'modalService','dataService','toaster','displayModel'];

    var licenseController = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService, dataService,toaster,displayModel) {
        var vm = this,
    	companyId = ($routeParams.companyId) ? parseInt($routeParams.companyId) : 0;
        vm.licenses = [];
        vm.busy=false;
        vm.isLoad=false;

        //滚动翻页
        vm.getLicenses= function () {

            if(vm.busy)return;
            vm.busy=true;

            dataService.getLicensesPages(companyId,vm.licenses.length)
            .then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    vm.licenses.push(data[i]);
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


        //取消预约单
        vm.updateLicense = function ($index) {

            var detail=vm.licenses[$index];

        	var modalOptions = {
                closeButtonText: '取消',
                actionButtonText: '确认',
                headerText: '系统提示',
                bodyText: '您确认要审核该设备吗?'
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                if (result === 'ok') {
                	dataService.updateLicense(detail.id)
                    .then(function (data) {
                        toaster.pop('success', "审核该设备处理成功！");
                        vm.licenses[$index].state='confirm';
                        vm.licenses[$index].state_display='已激活';
                    }, function (error) {
                    	toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
                    });
                }
            });
        };


        //初始化
        function init() {
            displayModel.displayModel='none';
        }

        init();
    };

    licenseController.$inject = injectParams;
    angular.module('managerApp').controller('LicenseController', licenseController);
    
}());