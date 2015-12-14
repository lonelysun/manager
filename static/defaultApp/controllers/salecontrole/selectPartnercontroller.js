(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','$route', 'config', 'dataService','toaster','displayModel','ngDialog','MyCache'];

    var SelectPartnerController = function ($scope, $location, $routeParams,
                                           $timeout, $route,config, dataService,toaster,displayModel,ngDialog,MyCache) {

    	var vm = this;
    	vm.partners = [];
        vm.partnerid ={};
        vm.role_option = MyCache.get('role_option');
        vm.keyword = '';

        vm.busy=false;
        vm.isLoad=false;


        function init() {
            displayModel.showHeader='1';
            displayModel.displayBack='1';
            displayModel.displaySave='0';
            displayModel.displaySearch='1';
            displayModel.displayCancel='0';
            displayModel.displayCreate='0';
            displayModel.displaySubmit='0';
            displayModel.displayConfirm='0';
            displayModel.born_search = vm.born_searsh;
            displayModel.headerBack = vm.back;
            displayModel.title = '选择商户';

        }

        //获取销售人员列表
        vm.getPartnerList = function(){

        	if(vm.busy)return;
            vm.busy=true;
            dataService.getteamshop(vm.partners.length,vm.keyword)
            .then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    vm.partners.push(data[i]);
                }
                vm.isLoad=true;
                $timeout(function () {
                	vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }
        vm.getKeywordPartner = function(){

        	if(vm.busy)return;
        	vm.busy=true;
            dataService.getteamshop(0,vm.keyword)
            .then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    vm.partners.push(data[i]);
                }
        		vm.isLoad=true;
                $timeout(function () {
                	vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        vm.showimg = function(partner){

            var duixiang = angular.fromJson(vm.partnerid);
            if(partner.id==duixiang.id){
                return '0';
            }else{
                return '1';
            }
        }

        vm.born_searsh = function(){

            $scope.modalOptions = {
                keyword:''
            }
            ngDialog.openConfirm({
                template:'/born_manager/static/defaultApp/partials/modalSearch.html',
                className: 'ngdialog',
                scope:$scope,
                closeByDocument :true
            }).then(function(data){
                vm.keyword =  $scope.modalOptions.keyword;
                vm.partners = [];
                vm.getKeywordPartner();

            });
        }

        vm.back = function(){
            if(typeof(vm.partnerid)=='string'){
                var duixiang = angular.fromJson(vm.partnerid);
                MyCache.put('optionType','partners');
                MyCache.put('optionObj',duixiang);
            }
                $timeout(function(){
                    $location.path('/createMission/'+vm.role_option);
                },500)
        }

        init();
    };

    SelectPartnerController.$inject = injectParams;
    angular.module('managerApp').controller('SelectPartnerController', SelectPartnerController);

}());