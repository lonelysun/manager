(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel'];

    var companyController = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService, dataService,toaster,displayModel) {
        var vm = this,
    	companyId = ($routeParams.companyId) ? parseInt($routeParams.companyId) : 0;

        vm.companys = [];
        vm.company = {};
        vm.busy=false;
        vm.isLoad=false;
        vm.keyword='';

        var companysState =null;


        //滚动翻页
        vm.getCompanys= function (companysState) {
            //var companysState = 'done';

            if(vm.busy)return;
            vm.busy=true;

            dataService.getCompanys(vm.companys.length,vm.keyword,companysState)
            .then(function (data) {
                vm.updated_company_count = data['updated_company_count'];
                vm.not_updated_company_count = data['not_updated_company_count'];
                //vm.companys = data['companys_data'];

                for (var i = 0; i < data['companys_data'].length; i++) {
                    vm.companys.push(data['companys_data'][i]);
                }
                vm.isLoad=true;
                $timeout(function () {
                    vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };

        vm.getCompanysKeyword= function (companysState) {

            if(vm.busy)return;
            vm.busy=true;

            dataService.getCompanys(0,vm.keyword,companysState)
            .then(function (data) {
                vm.companys=data;
                vm.isLoad=true;
                $timeout(function () {
                    vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };

        vm.click = function(state){
            if(state=='done'){
                vm.companys = [];
                vm.state = 1;

            }
            else if(state=='draft'){
                vm.companys = [];
                vm.state = 2;
            }

        }


        //初始化
        function init() {
            displayModel.displayModel='none';
            displayModel.displayEdit = '0';
            displayModel.displaySave = '0';
            displayModel.displaySearch = '1';
            displayModel.displayBack = '1';
            vm.state= 1;
            displayModel.backpath='/menu';
            displayModel.title = '公司管理';
        }



        init();
    };

    companyController.$inject = injectParams;
    angular.module('managerApp').controller('CompanyController', companyController);

}());