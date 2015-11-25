(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel','MyCache'];

    var optionsController = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService, dataService,toaster,displayModel,MyCache) {
        var vm = this;
        vm.companys = [];
        vm.missionsUnfinished = [];
        vm.missionsFinished = [];
        vm.partners = [];
        vm.partner = {};
        vm.busy=false;
        vm.isLoad=false;
        vm.keyword='';
        vm.initData={};
        vm.showButton=false;
        vm.showFinishedmissions=false;
        vm.display = null;
        var missionLengh=0;
        vm.missions_unfinished_numbers = 0;
        mission_state = '';
        vm.missions = [];
        vm.options ={};
        var enviroment = null;
        vm.optionId =null;
        vm.selectOption = {};



        //由url解析
        var option = $routeParams.option;
        console.info('which option ?');
        console.info(option);

        //service 分开还是合并起来?
        //统计下哪些用到option



        vm.getOptions = function(){

            enviroment = MyCache.get('enviroment');


            console.info('what enviroment ?');
            console.info(enviroment);

            dataService.getOptions(option, enviroment)
                .then(function (data) {
                    vm.options = data;

                    vm.isLoad=true;
                    $timeout(function () {
                        vm.busy=false;
                    }, 1000);
                }, function (error) {
                    toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };

        vm.autoSave = function(){

            console.info(vm.selectOption);
            var obj = angular.fromJson(vm.selectOption);

            console.info('get here---333>--');
            console.info(obj);



            MyCache.put('optionType',option);
            MyCache.put('optionObj',obj);



            var partnerId = MyCache.get('partnerId');

            switch (option){
                case 'categories':
                    $location.path('/saler/partner/edit/'+partnerId);
                    break;
                case 'states':
                    MyCache.put('enviroment',obj.id);
                    $location.path('/saler/options/areas');
                    break;
                case 'areas':
                    MyCache.put('enviroment',obj.id);
                    $location.path('/saler/options/subdivides');
                    break;
                case 'subdivides':
                    MyCache.put('enviroment',obj.id);
                    $location.path('/saler/options/businesses');
                    break;
                case 'businesses':
                    MyCache.remove('enviroment');
                    $location.path('/saler/options/edit/'+partnerId);
                    break;
                case 'source1':
                    MyCache.put('enviroment',obj.id);
                    $location.path('/saler/options/sources2');
                    break;
                case 'source2':

                    enviroment = MyCache.get('enviroment');
                    if(enviroment == 'sale'){
                        MyCache.remove('enviroment');
                        $location.path('/saler/options/edit/'+partnerId);
                    }else {
                        MyCache.put('enviroment', obj.id);
                        $location.path('/saler/options/sources3');
                    }
                    break;
                case 'source3':
                    MyCache.remove('enviroment');
                    $location.path('/saler/options/edit/'+partnerId);
                    break;
                case 'sizes':
                    $location.path('/saler/partner/edit/'+partnerId);
                    break;
                case 'environments':
                    $location.path('/saler/partner/edit/'+partnerId);
                    break;
                case 'employees':
                    $location.path('/saler/partner/edit/'+partnerId);
                    break;
                case 'rooms':
                    $location.path('/saler/partner/edit/'+partnerId);
                    break;





            }


        };

        vm.showImage = function(option){
          var obj = angular.fromJson(vm.selectOption);

            console.info('showImage')
            console.info(option)
            console.info(vm.selectOption)
            console.info(obj)

            if(option.id == obj.id){
                return '1';
            }
            else{
                return '0';
            }
        };








        vm.setDisplay = function(display){
            vm.display = display;
        };







        vm.setDisplay = function(display){
            vm.display = display;
        };





        //初始化
        function init() {
            displayModel.displayModel='none';
            vm.getOptions();
            vm.display = 'info';
            displayModel.showHeader = '1';
            displayModel.displayModel='none';
            displayModel.displayEdit = '0';
            displayModel.displaySave = '0';
            displayModel.displaySearch = '0';
            displayModel.displayBack = '1';

            displayModel.backpath='/saler/partner';






        }

        init();
    };

    optionsController.$inject = injectParams;
    angular.module('managerApp').controller('OptionsController', optionsController);

}());