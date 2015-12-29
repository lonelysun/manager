(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel'];

    var companysController = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService, dataService,toaster,displayModel) {
        var vm = this;
    	//companyId = ($routeParams.companyId) ? parseInt($routeParams.companyId) : 0;

        //vm.companys = [];
        //vm.company = {};
        vm.busy=false;
        vm.isLoad=false;
        vm.keyword='';
        vm.notUpdatedCompanys = [];
        vm.updatedCompanys = [];

        var companysState =null;

        vm.nav = {
                display:'day',
                current_date:'',
                current_week:'',
                current_year:'',
                current_month:'',
                display_current:''
        };


        vm.setPage= function (direction) {
            vm.updatedCompanys = [];
        	vm.getUpdatedCompanys(direction)
        };

        vm.setDisplay = function(display){
            vm.nav.display=display;
            vm.updatedCompanys = [];
            vm.getUpdatedCompanys(0)

        };

        vm.click = function(state){
            if(state=='done'){
                //vm.companys = [];
                vm.state = 1;

            }
            else if(state=='draft'){
                //vm.companys = [];
                vm.state = 2;
            }

        };


        //滚动翻页
        vm.getUpdatedCompanys = function (direction) {

            if(vm.busy)return;
            vm.busy=true;

            //if(vm.state == 1){
            //    companysState = 'done'
            //}else if(vm.state == 2){
            //    companysState = 'draft'
            //}

            dataService.getUpdatedCompanysManagement(vm.updatedCompanys.length,vm.keyword,direction,
                vm.nav.display, vm.nav.current_date,vm.nav.current_week,vm.nav.current_year,vm.nav.current_month)
            .then(function (data) {
                vm.updated_company_count = data['updated_company_count'];
                    vm.not_updated_company_count = data['not_updated_company_count'];
                //vm.updatedCompanys = data['updatedCompanys'];
                //vm.not_updated_company_count = data['not_updated_company_count'];
                //vm.companys = data['companys_data'];

                for (var i = 0; i < data['updatedCompanys'].length; i++) {
                    vm.updatedCompanys.push(data['updatedCompanys'][i]);
                }

                vm.nav['display'] = data['display'];
                vm.nav['current_date'] = data['current_date'];
                vm.nav['current_week'] = data['current_week'];
                vm.nav['current_year'] = data['current_year'];
                vm.nav['current_month'] = data['current_month'];
                vm.nav['display_current'] = data['display_current'];

                vm.isLoad=true;
                $timeout(function () {
                    vm.busy=false;
                }, 500);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };

        vm.getNotUpdatedCompanys = function(){
            if(vm.busy)return;
            vm.busy=true;

            dataService.getNotUpdatedCompanysManagement(vm.notUpdatedCompanys.length,vm.keyword)
            .then(function (data) {
                vm.not_updated_company_count = data['not_updated_company_count'];
                //vm.notUpdatedCompanys = data['notUpdatedCompanys']

                for (var i = 0; i < data['notUpdatedCompanys'].length; i++) {
                    vm.notUpdatedCompanys.push(data['notUpdatedCompanys'][i]);
                }
                vm.isLoad=true;
                $timeout(function () {
                    vm.busy=false;
                }, 500);
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
                }, 500);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };




        //初始化
        function init() {

            displayModel.displayModel='none';
            displayModel.showHeader='1';
            displayModel.displayBottom='1';

            displayModel.displayEdit = '0';
            displayModel.displaySave = '0';
            displayModel.displaySearch = '0';
            displayModel.displayBack = '0';
            vm.state= 1;
            displayModel.backpath='/menu';
            displayModel.title = '公司管理';

        }



        init();
    };

    companysController.$inject = injectParams;
    angular.module('managerApp').controller('CompanysController', companysController);

}());