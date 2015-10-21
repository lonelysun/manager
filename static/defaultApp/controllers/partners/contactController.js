(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel'];

    var contactController = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService, dataService,toaster,displayModel) {
        var vm = this;
        var partnerId = ($routeParams.partnerId) ? parseInt($routeParams.partnerId) : 0;
        var contactId = ($routeParams.contactId) ? parseInt($routeParams.contactId) : 0;

        vm.contact = {};
        vm.busy=false;
        vm.isLoad=false;
        vm.keyword='';


        //保存联系人
        vm.submitContact = function(){
            if(vm.contact.name==''){
                toaster.pop('warning', "系统提示", "请填写姓名！");
                return;
            }

            dataService.submitContact(partnerId, contactId, vm.contact)
            .then(function (data) {
                    $location.path('/partners/'+ partnerId);
            }, function (error) {
             toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        //获取联系人
        vm.getContact = function(){

            dataService.getContact(partnerId,contactId)
            .then(function (data) {
                vm.contact = data;
                $timeout(function () {
                }, 1000);
            }, function (error) {
                toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }





        //初始化
        function init() {
            displayModel.displayModel='none';
           vm.getContact();
        }


        init();
    };

    contactController.$inject = injectParams;
    angular.module('managerApp').controller('ContactController', contactController);

}());