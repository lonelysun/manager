(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var SettingController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel) {
        var vm = this;
        vm.settings={};

        function init() {
            displayModel.displayModel='block';
            getSetting();
        }

        //修改个人信息
        vm.regiest = function(){
            if(vm.settings.email==''){
                toaster.pop('warning', "系统提示", "请填写邮箱！");
                return;
            }
            if(vm.settings.name=='' ){
                toaster.pop('warning', "系统提示", "请填写姓名！");
                return;
            }
            if(vm.settings.password&&vm.settings.password.length<6){
            	toaster.pop('warning', "系统提示", "请输入六位以上密码！");
                return;
            }
            dataService.regiest(vm.settings)
            .then(function (data) {
         	   toaster.pop('success', "", "个人信息保存成功!");
            }, function (error) {
             toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };

        //获取设置内的用户信息
        function getSetting() {
            dataService.getSetting()
            .then(function (data) {
                vm.settings = data;
                $timeout(function () {
                }, 1000);
            }, function (error) {
                toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        init();
    };

    SettingController.$inject = injectParams;
    angular.module('managerApp').controller('SettingController', SettingController);
    
}());