(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel'];

    var salerController = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService, dataService,toaster,displayModel) {
        var vm = this,
    	companyId = ($routeParams.companyId) ? parseInt($routeParams.companyId) : 0;

        vm.companys = [];
        vm.company = {};
        vm.busy=false;
        vm.isLoad=false;
        vm.keyword='';

        //滚动翻页
        vm.getCompanys= function () {

            if(vm.busy)return;
            vm.busy=true;

            dataService.getCompanys(vm.companys.length,vm.keyword)
            .then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    vm.companys.push(data[i]);
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

        vm.getCompanysKeyword= function () {

            if(vm.busy)return;
            vm.busy=true;

            dataService.getCompanys(0,vm.keyword)
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

        //取消预约单
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


        init();
    };

    salerController.$inject = injectParams;
    angular.module('managerApp').controller('SalerController', salerController);

}());