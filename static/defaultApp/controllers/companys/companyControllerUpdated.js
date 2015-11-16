(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel'];

    var companyControllerUpdated = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService, dataService,toaster,displayModel) {
        var vm = this,
    	companyId = ($routeParams.companyId) ? parseInt($routeParams.companyId) : 0;

        vm.companys = [];
        vm.company = {};
        vm.busy=false;
        vm.isLoad=false;
        vm.keyword='';
        var headTitle = ''


        //获取公司明细
        function getCompanyDetail() {
            dataService.getCompanyDetailUpdated(companyId)
            .then(function (data) {
            	vm.company = data;
                    displayModel.title = vm.company.name;

                    console.info('get here');
                    console.info(vm.company);
                $timeout(function () {
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        //初始化
        function init() {
            displayModel.displayModel='none';
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

    companyControllerUpdated.$inject = injectParams;
    angular.module('managerApp').controller('CompanyControllerUpdated', companyControllerUpdated);

}());