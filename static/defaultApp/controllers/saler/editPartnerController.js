(function () {

    var injectParams = ['$scope', '$location', '$routeParams','$rootScope',
                        '$timeout', 'ngDialog','config','modalService', 'dataService','toaster','displayModel','MyCache'];

    var editPartnerController = function ($scope, $location, $routeParams,$rootScope,
                                           $timeout, ngDialog,config,modalService, dataService,toaster,displayModel,MyCache) {
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


         //由url解析
        var partnerId = ($routeParams.partnerId) ? parseInt($routeParams.partnerId) : 0;


        //获取特定商户信息
        vm.getPartnerInfo = function(){
            //从缓存获取商户信息
            vm.partner = MyCache.get('partner');


            //从缓存获取改动,更新改动
            var optionObj = MyCache.get('optionObj');
            var optionType = MyCache.get('optionType');
            environment = MyCache.get('environment');

            switch (optionType){
                case 'categories':
                    vm.partner.category = optionObj.name;
                    vm.partner.category_id = optionObj.id;
                    break;
                case 'businesses':
                    vm.partner.bussiness = optionObj.name;
                    vm.partner.bussiness_id = optionObj.id;
                    break;
                case 'sources2':
                    vm.partner.source = '销售部'+' '+optionObj.name;
                    vm.partner.source1_id = 'sale';
                    vm.partner.source2_id = optionObj.id;
                    break;
                case 'sources3':
                    environment_name = MyCache.get('environment_name');
                    vm.partner.source = '市场部'+' '+environment_name+' '+optionObj.name;
                    vm.partner.source1_id = 'mark';
                    vm.partner.source3_id = optionObj.id;
                    break;
                case 'sizes':
                    vm.partner.size = optionObj.name;
                    vm.partner.size_id = optionObj.id;
                    break;
                case 'environments':
                    vm.partner.environment = optionObj.name;
                    vm.partner.environment_id = optionObj.id;
                    break;
                case 'employees':
                    vm.partner.employee = optionObj.name;
                    vm.partner.employee_id = optionObj.id;
                    break;
                case 'rooms':
                    vm.partner.room = optionObj.name;
                    vm.partner.room_id = optionObj.id;
                    break;
            }

        };

        //保存
        vm.save = function(){

            if(vm.partner.name==''){
                toaster.pop('warning', "", "请填写商户名称！");
                return true;
            }

            //联系人数据转化
            vm.partner.contacts_json = angular.toJson(vm.partner.contacts);

            dataService.postPartnerInfo(partnerId,vm.partner)
            .then(function (data) {
                    var locationId;

                    if(partnerId == 0){
                        locationId = data['id'];

                        //如果是新建商户保存,加入缓存标识
                        MyCache.put('comeFromeNewPartner','1');
                    }
                    else {
                        locationId = partnerId
                    }

                    MyCache.remove('partner');
                    MyCache.remove('optionType');
                    MyCache.remove('optionObj');

                    $location.path('/saler/partner/'+locationId);

            }, function (error) {
               toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

        };

        //取消按钮
        vm.cancel = function(){
            if (partnerId == 0){
                $location.path('/menu/');
                MyCache.remove('partner');
                MyCache.remove('optionType');
                MyCache.remove('optionObj');
            }else{
                $location.path('/saler/partner/'+partnerId);
                MyCache.remove('partner');
                MyCache.remove('optionType');
                MyCache.remove('optionObj');
            }



        };


        //跳页面选择
        vm.jump = function(option){
            MyCache.put('partner', vm.partner);
            MyCache.put('partnerId', partnerId);

            $location.path('/saler/options/'+option);
        };




        //编辑联系人
        vm.editContact = function (contactObj) {

        	$scope.contactOptions = {
                name:contactObj.name,
                mobile:contactObj.mobile,
                phone:contactObj.phone,
                qq:contactObj.qq,
                wechat:contactObj.wechat,
                function:contactObj.function
            };


            ngDialog.openConfirm({
                template:'/born_manager/static/defaultApp/partials/contacts.html',
                className: 'ngdialog',
                scope:$scope
            }).then(function(data) {
                contactObj.name = $scope.contactOptions.name;
                contactObj.mobile = $scope.contactOptions.mobile;
                contactObj.phone = $scope.contactOptions.phone;
                contactObj.qq = $scope.contactOptions.qq;
                contactObj.wechat = $scope.contactOptions.wechat;
                contactObj.function = $scope.contactOptions.function;

            });
        };

        //新建联系人
        vm.createContact = function (){
            $scope.contactOptions = {
                name:'',
                mobile:'',
                phone:'',
                qq:'',
                wechat:'',
                function:''
            };

            ngDialog.openConfirm({
                template:'/born_manager/static/defaultApp/partials/contacts.html',
                className: 'ngdialog',
                scope:$scope
            }).then(function(data)  {
                var newVontact = {};
                newVontact.name = $scope.contactOptions.name;
                newVontact.mobile = $scope.contactOptions.mobile;
                newVontact.phone = $scope.contactOptions.phone;
                newVontact.qq = $scope.contactOptions.qq;
                newVontact.wechat = $scope.contactOptions.wechat;
                newVontact.function = $scope.contactOptions.function;
                vm.partner.contacts.push(newVontact)
            });
        };



        //初始化
        function init() {
            displayModel.displayModel='none';
            displayModel.displayConfirm = '0';
            displayModel.displaySubmit = '0';
            displayModel.displayCreate = '0';
            displayModel.displayBack = '0';
            displayModel.displaySearch = '0';

            displayModel.showHeader='1';
            displayModel.displaySave='1';
            displayModel.displayCancel='1';
            displayModel.headerBack = vm.cancel;
            displayModel.born_save = vm.save;


            //新的判断新建页面和修改页面的方法
            if(partnerId == 0){

                if(MyCache.get('partner')){
                    vm.getPartnerInfo();
                    displayModel.title = '新建商户';

                }else{
                    vm.partner = {};
                    vm.partner['contacts'] = [];
                    displayModel.title = '新建商户';
                }

            }else{
                vm.getPartnerInfo();
                displayModel.title = vm.partner.name;
            }
        }

        vm.getFocus = function(){
            displayModel.showHeader='0';
        }
        vm.getBlur = function(){
            displayModel.showHeader='1'
        }

        init();
    };

    editPartnerController.$inject = injectParams;
    angular.module('managerApp').controller('EditPartnerController', editPartnerController);

}());