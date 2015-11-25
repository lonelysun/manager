(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','$route', 'config', 'dataService','toaster','displayModel','MyCache'];

    var CreateMissionController = function ($scope, $location, $routeParams,
                                           $timeout,$route ,config, dataService,toaster,displayModel,MyCache) {

    	var vm = this;
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
    	    img:'',
    	};


        vm.createTrack = function(){

        	if(vm.track.salerid==''){
                toaster.pop('warning', "", "未选择销售人员！");
                return true;
        	}
        	if(vm.track.name==''){
                toaster.pop('warning', "", "未填写任务名！");
                return true;
        	}
        	if(vm.track.partnerid==''){
                toaster.pop('warning', "", "未选择商户！");
                return true;
        	}
        	if(vm.track.personid==''){
                toaster.pop('warning', "", "未选择联系人！");
                return true;
        	}

            dataService.createMission()
            .then(function (data) {
         	   $location.path('/createSuccess');
            }, function (error) {
             toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        function init() {
            displayModel.showHeader='1';
            displayModel.displayBack='1';
            displayModel.displaySave='1';
            displayModel.displaySearch='0';
            displayModel.displayCanel='0';
            displayModel.title = '创建任务';
            displayModel.backpath = '/menu';
            console.info(MyCache.get('salerid'));
            if(MyCache.get('salerid')){
                vm.track.salerid = MyCache.get('salerid').id;
                vm.track.salername = MyCache.get('salerid').saler_name;
                vm.track.img = MyCache.get('salerid').saler_img;
            }
            if(MyCache.get('track')){
                vm.track = MyCache.get('track');
            }
            if(vm.track.salerid!=''){
                vm.getPerson();
            }

        }

        vm.selectsaler = function(){
            MyCache.put('track',vm.track);
//            console.info(vm.track.time.toLocaleDateString());
            $location.path('/selectSaler');
        }

//        vm.getPartner = function(){
//            dataService.getPartnerInfo(vm.track.partnerid)
//            .then(function (data) {
//                console.info(data);
//                $timeout(function () {
//                }, 1000);
//            }, function (error) {
//            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
//            });
//        }
//        vm.getSaler = function(){
//            dataService.getSetting(vm.track.salerid)
//            .then(function (data) {
//                console.info(data);
//                $timeout(function () {
//                }, 1000);
//            }, function (error) {
//            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
//            });
//        }
        vm.getPerson = function(){
            dataService.getPartnerInfo(vm.track.partnerid)
            .then(function (data) {
                console.info(data);
                vm.track.personname = data.name;
                vm.track.personid = data.id;
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