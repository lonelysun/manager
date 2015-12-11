(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','$route', 'config', 'dataService','toaster','displayModel','MyCache'];

    var CreateMissionController = function ($scope, $location, $routeParams,
                                           $timeout,$route ,config, dataService,toaster,displayModel,MyCache) {

    	var vm = this;
    	vm.option = ($routeParams.option) ? parseInt($routeParams.option) : 0;
    	vm.track = {
    	    name:'',
    	    salerid:'',
    	    salername:'',
    	    partnerid:'',
    	    partnername:'',
    	    street:'',
    	    personid:'',
    	    personname:'',
    	    tel:'',
    	    time:'',
    	    timevalue:'',
    	    img:'',
    	    option:vm.option,
    	};

        vm.showoption = function(){
            if(vm.option==7||vm.option==8){
                return 0
            }else{
                return 1
            }
        }

        vm.born_create = function(){
            if(vm.option==8||vm.option==10){
                if(vm.track.salerid==''){
                    toaster.pop('warning', "", "未选择负责人员！");
                    return true;
                }
        	}
        	if(vm.track.name==''){
                toaster.pop('warning', "", "未填写任务名！");
                return true;
        	}
        	if(vm.track.partnerid==''){
                toaster.pop('warning', "", "未选择商户！");
                return true;
        	}
        	if(vm.track.time=''){
                toaster.pop('warning', "", "未选择时间！");
                return true;
        	}


           var yyyy = vm.track.time.getFullYear().toString();
           var mm = (vm.track.time.getMonth()+1).toString(); // getMonth() is zero-based
           var dd  = vm.track.time.getDate().toString();
           var time_date = yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) +'-'+ (dd[1]?dd:"0"+dd[0]); // padding
        	vm.track.timevalue = time_date;
            dataService.createMission(vm.track)
            .then(function (data) {
                MyCache.remove('track');
                MyCache.remove('salerid');
                MyCache.remove('optionObj');
                MyCache.remove('optionType');
         	   $location.path('/createSuccess');
            }, function (error) {
             toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        vm.back =function(){
                MyCache.remove('track');
                MyCache.remove('salerid');
                MyCache.remove('optionObj');
                MyCache.remove('optionType');
                displayModel.showHeader = '0';
//                window.location.href = 'bornhr://back';
                $location.path('/menus');

        }

        function init() {
            displayModel.showHeader='1';
            displayModel.displayBack='0';
            displayModel.displaySave='0';
            displayModel.displaySearch='0';
            displayModel.displayCancel='1';
            displayModel.displayCreate='1';
            displayModel.displaySubmit='0';
            displayModel.displayConfirm='0';
            displayModel.headerBack=vm.back;
            displayModel.born_create=vm.born_create;
            displayModel.title = '创建任务';

            if(MyCache.get('track')){
                vm.track = MyCache.get('track');
            }
            if(MyCache.get('salerid')){
                vm.track.salerid = MyCache.get('salerid').id;
                vm.track.salername = MyCache.get('salerid').saler_name;
                vm.track.img = MyCache.get('salerid').saler_img;
            }

            var optionObj = MyCache.get('optionObj');
            var optionType = MyCache.get('optionType');

            if(optionType == 'contacts'){
                vm.track.personid = MyCache.get('optionObj').id;
                vm.track.personname = MyCache.get('optionObj').name;
                vm.track.tel = MyCache.get('optionObj').mobile;
            }else if (optionType == 'partners') {
                vm.track.partnerid = MyCache.get('optionObj').id;
                vm.track.partnername = MyCache.get('optionObj').name;
                vm.track.street = MyCache.get('optionObj').street;
                vm.getPerson();
            }
        }

        vm.selectsaler = function(){
            MyCache.put('track',vm.track);
            $location.path('/selectSaler');
        };

       //Add by nisen
       // 销售经理的选择商户
        vm.selectpartner = function(){
            if(vm.option=='8'){
                MyCache.put('track',vm.track);
                MyCache.put('environment_selectPartner','1');
                $location.path('/saler/options/states');
            }else if(vm.option=='7'){
                MyCache.put('track',vm.track);
                MyCache.put('environment','fromSalerSelectParner');
                $location.path('/saler/options/partners');
            }
        };

        //销售人员的选择商户
//        vm.salerSelectParner = function(){
//            MyCache.put('track',vm.track);
//            MyCache.put('environment','fromSalerSelectParner');
//            $location.path('/saler/options/partners');
//        };

        vm.selectperson = function(){
            MyCache.put('track',vm.track);
            MyCache.put('environment',vm.track.partnerid);

            $location.path('/saler/options/contacts');

        };

       // End add

        vm.getPerson = function(){
            dataService.getPartnerInfo(vm.track.partnerid)
            .then(function (data) {
                if(data.contacts[0]){
                    vm.track.personname = data.contacts[0].name;
                    vm.track.personid = data.contacts[0].id;
                    vm.track.tel = data.contacts[0].mobile;
                }else{
                    vm.track.personname = '';
                    vm.track.personid = '';
                    vm.track.tel = '';
                }

                $timeout(function () {
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }
        init();
    };

    CreateMissionController.$inject = injectParams;
    angular.module('managerApp').controller('CreateMissionController', CreateMissionController);

}());