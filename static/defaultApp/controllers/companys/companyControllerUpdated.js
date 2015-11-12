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


        //获取公司明细
        function getCompanyDetail() {
            dataService.getCompanyDetail(companyId)
            .then(function (data) {
            	vm.company = data;
                $timeout(function () {
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        //初始化
        function init() {
            displayModel.displayModel='none';
            if(companyId>0){
               getCompanyDetail();
            }
        }



        init();
    };

    companyControllerUpdated.$inject = injectParams;
    angular.module('managerApp').controller('CompanyControllerUpdated', companyControllerUpdated);

}());