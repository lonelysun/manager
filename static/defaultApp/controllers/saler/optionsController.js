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
        vm.options =[];
        var environment = null;
        vm.optionId =null;
        vm.selectOption = {};
        vm.needAutoSave = false;
        vm.role_option = MyCache.get('role_option');
        var hr_id_for_manager;

        if(MyCache.get('hr_id_for_manager')){
            hr_id_for_manager = parseInt(MyCache.get('hr_id_for_manager'));
        }
        else{
            hr_id_for_manager = 0;
        }


        //由url解析
        var option = $routeParams.option;
        console.info('which option ?');
        console.info(option);

        environment = MyCache.get('environment');
        console.info('what environment ?');
        console.info(environment);


        if (option=='states' ||option=='areas' || option=='subdivides'||option=='sources1'){
                vm.needAutoSave = true;
        }
            else if(option=='sources2' && environment=='mark'){
                vm.needAutoSave = true;
        }
            else if (option == 'businesses'){
            var environment_selectPartner = MyCache.get('environment_selectPartner');
            if (environment_selectPartner == '1'){
                vm.needAutoSave = true;
            }
        }
        vm.getOptions = function(){

            if(vm.busy)return;
            vm.busy=true;


            dataService.getOptionsService(vm.options.length, option, environment,hr_id_for_manager)
                .then(function (data) {
                    for(var i = 0;i<data.length;i++){
                        vm.options.push(data[i]);
                    }

                    vm.isLoad=true;
                    $timeout(function () {
                        vm.busy=false;
                    }, 1000);

                }, function (error) {
                    toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });


        };

        vm.autoSave = function(selectOption){
            var obj = angular.fromJson(selectOption);
            MyCache.put('optionType',option);
            MyCache.put('optionObj',obj);

            var partnerId = MyCache.get('partnerId');

            switch (option){
                case 'states':
                    MyCache.put('environment',obj.id);
                    MyCache.put('environment_stateId',obj.id);
                    $location.path('/saler/options/areas');
                    break;
                case 'areas':
                    MyCache.put('environment',obj.id);
                    MyCache.put('environment_areaId',obj.id);
                    $location.path('/saler/options/subdivides');
                    break;
                case 'subdivides':
                    MyCache.put('environment',obj.id);
                    MyCache.put('environment_subdivideId',obj.id);
                    $location.path('/saler/options/businesses');
                    break;
                case 'businesses':
                    MyCache.put('environment',obj.id);
                    MyCache.put('environment_businessId',obj.id);
                    $location.path('/saler/options/partners');

                    break;
                case 'sources1':
                    MyCache.put('environment',obj.id);
                    MyCache.put('environment_sources1Id',obj.id);
                    $location.path('/saler/options/sources2');
                    break;
                case 'sources2':

                    environment = MyCache.get('environment');

                    MyCache.put('environment', obj.id);
                    MyCache.put('environment_oldId',environment);
                    MyCache.put('environment_name', obj.name);
                    $location.path('/saler/options/sources3');
                    break;
            }

        };



        vm.save = function(){
            var obj = angular.fromJson(vm.selectOption);

            MyCache.put('optionType',option);
            MyCache.put('optionObj',obj);

            var partnerId = MyCache.get('partnerId');

            switch (option){
                case 'categories':
                    $location.path('/saler/partner/edit/'+partnerId);
                    break;
                case 'businesses':
                    $location.path('/saler/partner/edit/'+partnerId);
                    break;
                case 'sources2':
                    environment = MyCache.get('environment');
                    $location.path('/saler/partner/edit/'+partnerId);
                    break;
                case 'sources3':
                    $location.path('/saler/partner/edit/'+partnerId);
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
                case 'partners':
                    $location.path('/createMission/'+vm.role_option);
                    break;
                case 'contacts':
                    $location.path('/createMission/'+vm.role_option);
                    break;
            }


        };

        vm.back = function(){
            var partnerId = MyCache.get('partnerId');
            var id1;

            switch (option){
                case 'states':
                    if(MyCache.get('environment_selectPartner')== '1'){
                        $location.path('/createMission/'+ vm.role_option)
                    }else{
                        $location.path('/saler/partner/edit/'+partnerId)
                    }
                    break;
                case 'areas':
                    $location.path('/saler/options/states');
                    break;
                case 'subdivides':
                    id1= MyCache.get('environment_stateId');
                    MyCache.put('environment',id1);
                    $location.path('/saler/options/areas');
                    break;
                case 'businesses':
                    id1 = MyCache.get('environment_areaId');
                    MyCache.put('environment',id1);
                    $location.path('/saler/options/subdivides');
                    break;
                case 'partners':
                    if(MyCache.get('environment') == 'fromSalerSelectParner'){
                        $location.path('/createMission/7');

                    }else{
                        id1 = MyCache.get('environment_subdivideId');
                        MyCache.put('environment',id1);
                        $location.path('/saler/options/businesses');
                    }

                    break;
                case 'sources1':
                    $location.path('/saler/partner/edit/'+partnerId);
                    break;
                case 'sources2':
                    $location.path('/saler/options/sources1');
                    break;
                case 'source3':
                    MyCache.put('environment','mark');
                    $location.path('/saler/options/sources2')
                    break;

                case 'contacts':
                    $location.path('/createMission/'+vm.role_option);
                    break;
                case 'categories':
                    $location.path('/saler/partner/edit/'+partnerId);
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
            //console.info('---in showImage');
          var obj = angular.fromJson(vm.selectOption);


            if(option.id == obj.id){
                return '1';
            }
            else{
                return '0';
            }
        };

        //vm.setDisplay = function(display){
        //    vm.display = display;
        //};

        //初始化
        function init() {

            displayModel.showHeader='1';
            displayModel.displayCancel='0';
            displayModel.displayBack = '1';
            displayModel.title = '选择';
            displayModel.displaySubmit = '0';
            displayModel.displayConfirm = '0';
            displayModel.displayCreate = '0';
            displayModel.displaySearch = '0';

            displayModel.headerBack = vm.back;

            //vm.getOptions();
            vm.display = 'info';
            displayModel.showHeader = '1';

            if (vm.needAutoSave){

                displayModel.displaySave = '0';
            }
            else{
                displayModel.displaySave = '1';
                displayModel.born_save = vm.save;

            }


        }

        init();

    };

    optionsController.$inject = injectParams;
    angular.module('managerApp').controller('OptionsController', optionsController);

}());