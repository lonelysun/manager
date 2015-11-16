(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel'];

    var companyControllerNotUpdated = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService, dataService,toaster,displayModel) {
        var vm = this,
    	companyId = ($routeParams.companyId) ? parseInt($routeParams.companyId) : 0;

        vm.companys = [];
        vm.company = {};
        vm.busy=false;
        vm.isLoad=false;
        vm.keyword='';

        //vm.showheaderEdit = true;
        //vm.showheaderSave = true;
        //vm.showheaderSearch = true;
        //vm.showheaderBack = true;
        //vm.showheaderCancel = true;

        //获取公司明细
        function getCompanyDetail() {
            dataService.getCompanyDetailNotUpdated(companyId)
            .then(function (data) {
            	vm.company = data;
                    displayModel.title = vm.company.name;

                $timeout(function () {
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        vm.updateCompany = function () {

        	var modalOptions = {
                closeButtonText: '取消',
                actionButtonText: '确认',
                headerText: '系统提示',
                bodyText: '您确认要审核并开通帐套吗?'
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                if (result === 'ok') {
                	dataService.updateCompany(vm.company.id)
                    .then(function (data) {
                        toaster.pop('success', "审核并开通帐套处理成功！");
                        vm.company.state='done';
                        vm.company.state_display='运行中';
                    }, function (error) {
                    	toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
                    });
                }
            });
        };

        //初始化
        function init() {
            getCompanyDetail();
            displayModel.displayModel='none';
            displayModel.displayModel='none';
            displayModel.displayEdit = '0';
            displayModel.displaySave = '0';
            displayModel.displaySearch = '0';
            displayModel.displayBack = '1';
            displayModel.backpath='/companys';

        }




        init();
    };

    companyControllerNotUpdated.$inject = injectParams;
    angular.module('managerApp').controller('CompanyControllerNotUpdated', companyControllerNotUpdated);

}());