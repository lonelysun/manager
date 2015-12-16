(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'modalService','dataService','toaster','displayModel'];

    var licenseController = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService, dataService,toaster,displayModel) {
        var vm = this,
    	companyId = ($routeParams.companyId) ? parseInt($routeParams.companyId) : 0;
        vm.busy=false;
        vm.isLoad=false;


        vm.licenses={
                display:'day',
                accounts_one:[],
                accounts_two:[],
                current_date:'',
                current_week:'',
                current_year:'',
                current_month:'',
                display_current:'',
                filter_week:'',
                filter_week_year:'',
                total_amount:0,
                cnt:0,
            };
        vm.date = '';

        vm.setPage= function (direction) {
        	getLicenses(direction);
        };

        vm.setDisplay= function (display) {
            vm.licenses.display=display;
            getLicenses(0);

        };

        vm.showset = function(flag){
            vm.show = flag;

        }

        function getLicenses(direction) {

            if(vm.busy)return;
            vm.busy=true;

            dataService.getLicensesPages(companyId,vm.licenses.display,0,
                    vm.licenses.current_date, vm.licenses.current_week, vm.licenses.current_year, vm.licenses.current_month,
                    direction)
            .then(function (data) {
            	vm.licenses = data;
                vm.isLoad=true;
                if (vm.licenses.display=='day'){
                    vm.date = 'day+'+vm.licenses.current_date;
                }else if(vm.licenses.display=='week'){
                    vm.date = 'week+'+vm.licenses.filter_week_year+'+'+vm.licenses.filter_week;
                }else{
                    vm.date = 'month+'+vm.licenses.current_month;
                }
                $timeout(function () {
                    vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };




        //初始化
        function init() {
            displayModel.showHeader='1';
            displayModel.displayBack='0';
            displayModel.displaySave='0';
            displayModel.displaySearch='1';
            displayModel.displayCancel='0';
            displayModel.displayCreate='0';
            displayModel.displaySubmit='0';
            displayModel.displayConfirm='0';
            displayModel.displayBottom = '1';
//            displayModel.born_search = vm.born_searsh;
            vm.show='1';
            displayModel.title = '设备管理';
            getLicenses(0);
        }

        init();
    };

    licenseController.$inject = injectParams;
    angular.module('managerApp').controller('LicenseController', licenseController);
    
}());