(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','$route', 'config','modalService', 'dataService','toaster','displayModel'];

    var SalerdetailController = function ($scope, $location, $routeParams,
                                           $timeout,$route, config,modalService, dataService,toaster,displayModel) {
        
    	var vm = this;
    	salerid = ($routeParams.salerid) ? parseInt($routeParams.salerid) : 0;
    	vm.salerdetail = {};
        vm.busy=false;
        vm.isLoad=false;
        vm.salerid = salerid;
            
        
        function init() {
            displayModel.displayModel='none';
            getsalerdetail();
        }

        
        vm.allcancel = function () {
        	
        	var modalOptions = {
                closeButtonText: '取消',
                actionButtonText: '确认',
                headerText: '系统提示',
                bodyText: "您确认要取消该销售的全部商户?",
                headerTextMin:'asdasdasda',
                type:'1',
            };
//        	var modalOptions = {
//                closeButtonText: '取消',
//                actionButtonText: '确认',
//                headerText: '系统提示',
//                bodyText: "您确认要取消该销售的全部商户?",
//            };

            modalService.showModal({}, modalOptions).then(function (result) {
                if (result === 'ok') {
                	dataService.cancel(salerid)
                    .then(function (data) {
                  	    toaster.pop('info', "", "取消成功!");
                  	  $route.reload();
                    }, function (error) {
                    	toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
                    });
                }else{
                	$route.reload();
                	return;
                }
            });
        };
        
        function getsalerdetail() {
        	
        	if(vm.busy)return;
            vm.busy=true;
            dataService.getsalerdetail(salerid)
            .then(function (data) {
            	vm.salerdetail = data;
            	vm.isLoad=true;
                $timeout(function () {
                	vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        init();
    };

    SalerdetailController.$inject = injectParams;
    angular.module('managerApp').controller('SalerdetailController', SalerdetailController);
    
}());