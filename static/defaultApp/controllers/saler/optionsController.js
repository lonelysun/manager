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



            //environment = MyCache.get('environment');


            //console.info('what environment ?');
            //console.info(environment);
            //console.info('---autosave--');
            //console.info(vm.needAutoSave);
            //console.info('--长度--');
            //console.info(vm.options.length);
            dataService.getOptionsService(vm.options.length, option, environment)
                .then(function (data) {



                    console.info(data);

                    for(var i = 0;i<data.length;i++){
                        console.info(i)
                        vm.options.push(data[i]);
                    }


                    console.info('---vm.options---');
                    console.info(vm.options);

                    //vm.options = data;

                    vm.isLoad=true;

                    $timeout(function () {

                        vm.busy=false;

                    }, 1000);




                }, function (error) {
                    toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });


        };

        vm.autoSave = function(selectOption){

             console.info('---in autoSave');
            var obj = angular.fromJson(selectOption);


            //console.info(obj);



            MyCache.put('optionType',option);
            MyCache.put('optionObj',obj);



            var partnerId = MyCache.get('partnerId');

            switch (option){
                //case 'categories':
                //    $location.path('/saler/partner/edit/'+partnerId);
                //    break;
                case 'states':
                    MyCache.put('environment',obj.id);
                    $location.path('/saler/options/areas');
                    break;
                case 'areas':
                    MyCache.put('environment',obj.id);
                    $location.path('/saler/options/subdivides');
                    break;
                case 'subdivides':
                    MyCache.put('environment',obj.id);
                    $location.path('/saler/options/businesses');
                    break;
                //case 'businesses':
                //    MyCache.put('environment',obj.id);
                //    //这个 cache environment_selectPartner == '1' 来源于创建任务时选择商户
                //    var environment_selectPartner = MyCache.get('environment_selectPartner');
                //    if (environment_selectPartner == '1'){
                //
                //
                //        $location.path('/saler/options/partners');
                //    }else{
                //
                //        $location.path('/saler/partner/edit/'+partnerId);
                //    }
                //
                //    break;
                case 'businesses':
                    MyCache.put('environment',obj.id);
                    //这个 cache environment_selectPartner == '1' 来源于创建任务时选择商户
                    //var environment_selectPartner = MyCache.get('environment_selectPartner');
                    //if (environment_selectPartner == '1'){


                    $location.path('/saler/options/partners');
                    //}else{
                    //
                    //    $location.path('/saler/partner/edit/'+partnerId);
                    //}

                    break;
                case 'sources1':
                    MyCache.put('environment',obj.id);
                    $location.path('/saler/options/sources2');
                    break;
                case 'sources2':

                    environment = MyCache.get('environment');
                    if(environment == 'sale'){
                        //MyCache.remove('environment');
                        $location.path('/saler/partner/edit/'+partnerId);
                    }else {
                        MyCache.put('environment', obj.id);
                        MyCache.put('environment_name', obj.name);
                        $location.path('/saler/options/sources3');
                    }
                    break;
                case 'sources3':
                    //MyCache.remove('environment');
                    $location.path('/saler/options/edit/'+partnerId);
                    break;
                //case 'sizes':
                //    $location.path('/saler/partner/edit/'+partnerId);
                //    break;
                //case 'environments':
                //    $location.path('/saler/partner/edit/'+partnerId);
                //    break;
                //case 'employees':
                //    $location.path('/saler/partner/edit/'+partnerId);
                //    break;
                //case 'rooms':
                //    $location.path('/saler/partner/edit/'+partnerId);
                //    break;






            }


        };


        vm.save = function(){
            console.info('---in Save');
            var obj = angular.fromJson(vm.selectOption);
            console.info(obj);

            MyCache.put('optionType',option);
            MyCache.put('optionObj',obj);



            var partnerId = MyCache.get('partnerId');

            switch (option){
                case 'categories':
                    $location.path('/saler/partner/edit/'+partnerId);
                    break;
                //case 'states':
                //    MyCache.put('environment',obj.id);
                //    $location.path('/saler/options/areas');
                //    break;
                //case 'areas':
                //    MyCache.put('environment',obj.id);
                //    $location.path('/saler/options/subdivides');
                //    break;
                //case 'subdivides':
                //    MyCache.put('environment',obj.id);
                //    $location.path('/saler/options/businesses');
                //    break;
                case 'businesses':
                    //MyCache.remove('environment');
                    $location.path('/saler/partner/edit/'+partnerId);
                    break;
                //case 'sources1':
                //    MyCache.put('environment',obj.id);
                //    $location.path('/saler/options/sources2');
                //    break;
                case 'sources2':

                    environment = MyCache.get('environment');
                    if(environment == 'sale'){
                        //MyCache.remove('environment');
                        $location.path('/saler/partner/edit/'+partnerId);
                    }else {
                        MyCache.put('environment', obj.id);
                        $location.path('/saler/partner/sources3');
                    }
                    break;
                case 'sources3':
                    //MyCache.remove('environment');
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

        vm.showImage = function(option){
            console.info('---in showImage');
          var obj = angular.fromJson(vm.selectOption);

            //console.info(option)
            //console.info(vm.selectOption)
            //console.info(obj)

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
            //vm.getOptions();
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