(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'modalService','dataService','toaster','displayModel'];

    var licenseDetailController = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService, dataService,toaster,displayModel) {
        var vm = this,
    	date = $routeParams.date;
    	companyId = ($routeParams.companyId) ? parseInt($routeParams.companyId) : 0;
        vm.busy=false;
        vm.isLoad=false;
        vm.keyword='';
        vm.licenses = [];

        vm.getLicenses = function () {

            if(vm.busy)return;
            vm.busy=true;

            dataService.getLicenses(date,companyId,vm.licenses.length,vm.keyword)
            .then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    vm.licenses.push(data[i]);
                }
                displayModel.title = vm.licenses[0].company_name;
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

            var detail=vm.licenses.account[$index];

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
                        vm.licenses.account[$index].state='confirm';
                        vm.licenses.account[$index].state_display='已激活';
                    }, function (error) {
                    	toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
                    });
                }
            });
        };


        //初始化
        function init() {
            displayModel.displayModel='none';
            displayModel.displayEdit = '0';
            displayModel.displaySave = '0';
            displayModel.displaySearch = '0';
            displayModel.displayBack = '1';
            vm.show='1';
            displayModel.backpath='/menu';
        }

        init();
    };

    licenseDetailController.$inject = injectParams;
    angular.module('managerApp').controller('LicenseDetailController', licenseDetailController);

}());