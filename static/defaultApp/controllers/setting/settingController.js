(function () {

    var injectParams = ['$scope', '$location', '$routeParams','$route',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var SettingController = function ($scope, $location, $routeParams,$route,
                                           $timeout, config, dataService,toaster,displayModel) {
        var vm = this;
        vm.settings={};
        vm.reset = {};
        vm.image = '';
        vm.getEditModel = '1';
        vm.getSaveModel = '0';
        vm.getBackModel = '1';
        vm.backurl='';

        function init() {
            displayModel.displayModel='none';
            displayModel.showHeader = '0';
            displayModel.backpath='/menu';
            displayModel.flag = '';
            getSetting();
        }

        vm.logout = function(){
            window.location.href = 'bornhr://loginout';
        }


        vm.headerEdit = function(){
            displayModel.flag = 'edit';
            vm.getEditModel = '0';
            vm.getSaveModel = '1';
            vm.getBackModel = '0';
            displayModel.displayTop = '';
        }

        vm.headerCancel = function(){
            displayModel.flag = '';
            vm.getEditModel = '1';
            vm.getSaveModel = '0';
            vm.getBackModel = '1';
            displayModel.displayTop = 'edit';
        }

        vm.headerBack = function(){
            if(vm.settings.option=='7'){
                $location.path('/saler');
            }else if(vm.settings.option=='8'){
                $location.path('/salepanel');
            }
        }
        vm.edit = function(){
            return displayModel.flag;
        }

        vm.clear = function(type){
            if (type=='name'){
                vm.reset.name = '';
            }else if(type=='email'){
                vm.reset.email = '';
            }else if(type=='password'){
                vm.reset.password = '';
            }
        }

        //修改个人信息
        vm.regiest = function(){
            if(vm.reset.email==''){
                toaster.pop('warning', "系统提示", "请填写邮箱！");
                return;
            }
            if(vm.reset.name=='' ){
                toaster.pop('warning', "系统提示", "请填写姓名！");
                return;
            }
            if(vm.reset.password&&vm.reset.password.length<6){
                toaster.pop('warning', "系统提示", "请输入六位以上密码！");
                return;
            }
            dataService.regiest(vm.reset)
            .then(function (data) {
               toaster.pop('success', "", "个人信息保存成功!");
               $timeout(function () {
                    $route.reload();
               },500);
               $route.reload();
            }, function (error) {
             toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };
        $scope.getFile= function ($index) {
            var file = $scope.myFile;
            if(file){
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (function(){
                    vm.reset.image = reader.result;
                    $timeout(function () {
                    },500);
                });
            }
         };
        //获取设置内的用户信息
        function getSetting() {
            dataService.getSetting()
            .then(function (data) {
                vm.settings = data;
                if(vm.settings.role_option=='7'){
                    vm.backurl='#/saler';
                }else if(vm.settings.role_option=='8'){
                    vm.backurl='#/salepanel';
                }
                vm.reset = JSON.parse(JSON.stringify(data));
                vm.reset.image = '';
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
function changeimg(){
    return  $("#File").click();
}
