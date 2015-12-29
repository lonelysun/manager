(function () {

    var injectParams = ['$scope', '$location', '$routeParams','ngDialog',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel'];

    var companyControllerNotUpdated = function ($scope, $location, $routeParams,ngDialog,
                                           $timeout, config,modalService, dataService,toaster,displayModel) {
        var vm = this,
    	companyId = ($routeParams.companyId) ? parseInt($routeParams.companyId) : 0;

        vm.companys = [];
        vm.company = {};
        vm.busy=false;
        vm.isLoad=false;
        vm.keyword='';

        //获取公司明细
        vm.getInitData = function () {

            dataService.getCompanyDetailNotUpdated(companyId)
            .then(function (data) {
            	vm.company = data;
                    displayModel.title = vm.company.name;

                $timeout(function () {
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

        };




        vm.updateCompany = function () {
        	$scope.modalOptions = {
                titleText:'确认审核并开通帐套?',
                titleState:'',
                closeButtonText: '取消',

                firstActionText:'确认',
                showFirstText:true,

                secondActionText:'',
                showSecondText:false,

                thirdActionText:'',
                showThirdText:false

            };

            ngDialog.openConfirm({
                template:'/born_manager/static/defaultApp/partials/modalBottomFive.html',
                className: 'ngdialog',
                scope:$scope
            }).then(function(data){
                if (data == 'start'){

                    dataService.updateCompany(vm.company.id)
                    .then(function (data) {
                        toaster.pop('success', "审核并开通帐套处理成功！");
                        vm.company.state='done';
                        vm.company.state_display='运行中';

                            window.location.href = 'bornhr://back';
                    }, function (error) {
                    	toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
                    });


                }
            })
        };



        vm.back = function(){
            window.location.href = 'bornhr://back';
        };

        //初始化
        function init() {
            vm.getInitData();
            displayModel.showHeader='1';
            displayModel.displayEdit = '0';
            displayModel.displaySave = '0';
            displayModel.displaySearch = '0';
            displayModel.displayBack = '1';
            displayModel.displayBottom = '0';

            displayModel.headerBack = vm.back;

        }




        init();
    };

    companyControllerNotUpdated.$inject = injectParams;
    angular.module('managerApp').controller('CompanyControllerNotUpdated', companyControllerNotUpdated);

}());