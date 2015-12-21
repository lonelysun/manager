(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'modalService','dataService','toaster','displayModel','MyCache'];

    var licenseController = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService, dataService,toaster,displayModel,MyCache) {
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

        vm.toLicenseDetail = function(company_id){
            MyCache.put('license_type',vm.show);
            $location.path('/licenses/deatil/'+vm.date+'/'+company_id);
        }

        function getLicenses(direction) {

            if(vm.busy)return;
            vm.busy=true;

            dataService.getLicensesPages(companyId,vm.licenses.display,0,
                    vm.licenses.current_date, vm.licenses.current_week, vm.licenses.current_year, vm.licenses.current_month,
                    direction)
            .then(function (data) {
            	vm.licenses = data;
                MyCache.put('licenses_date',vm.licenses);
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
                }, 500);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };




        //初始化
        function init() {
            displayModel.showHeader='1';
            displayModel.displayBack='0';
            displayModel.displaySave='0';
            displayModel.displaySearch='0';
            displayModel.displayCancel='0';
            displayModel.displayCreate='0';
            displayModel.displaySubmit='0';
            displayModel.displayConfirm='0';
            displayModel.displayBottom = '1';
//            displayModel.born_search = vm.born_searsh;
            if(MyCache.get('license_type')){
                vm.show = MyCache.get('license_type');
            }else{
                vm.show='1';
            }
            displayModel.title = '设备管理';
            if(MyCache.get('licenses_date')){
                vm.licenses = MyCache.get('licenses_date');
            }
            getLicenses(0);
        }

        init();
    };

    licenseController.$inject = injectParams;
    angular.module('managerApp').controller('LicenseController', licenseController);
    
}());