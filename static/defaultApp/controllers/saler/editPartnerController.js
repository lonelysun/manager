(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'ngDialog','config','modalService', 'dataService','toaster','displayModel','MyCache'];

    var editPartnerController = function ($scope, $location, $routeParams,
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
        console.info(partnerId);






        //Get specific partner
        vm.getPartnerInfo = function(){
            MyCache.put('notFirstGoToNewPartner','1');
            vm.partner = MyCache.get('partner');


            //console.info(MyCache.get('partner'));

            var optionObj = MyCache.get('optionObj');
            var optionType = MyCache.get('optionType');

            environment = MyCache.get('environment');
            console.info('in getPartnerInfo');
            console.info(environment);




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
                    console.info('in getPartnerInfo')
                    console.info(environment_name)
                    vm.partner.source = '市场部'+' '+environment_name+' '+optionObj.name;
                    vm.partner.source1_id = 'mark';
                    vm.partner.source3_id = optionObj.id;
                    break;
                case 'sizes':
                    console.info('get here222--->');
                    vm.partner.size = optionObj.name;
                    console.info(optionObj);
                    console.info(vm.partner.size);
                    vm.partner.size_id = optionObj.id;
                    break;
                case 'environments':
                    vm.partner.environment = optionObj.name;
                    vm.partner.environment_id = optionObj.name;
                    break;
                case 'employees':
                    vm.partner.employee = optionObj.name;
                    vm.partner.employee_id = optionObj.name;
                    break;
                case 'rooms':
                    vm.partner.room = optionObj.name;
                    vm.partner.room_id = optionObj.name;
                    break;

            }





        };

        //修改通过导航调用---------刘浩
        Window.born_save = function(){
            vm.partner.contacts_json = angular.toJson(vm.partner.contacts);

            console.info('------postPartnerInfo------');
            console.info(vm.partner.contacts);

            dataService.postPartnerInfo(partnerId,vm.partner)
            .then(function (data) {
                    if(partnerId == 0){
                        var locationId = data['id'];
                    }
                    else {
                        var locationId = partnerId
                    }
                    MyCache.remove('partner');//保存成功清楚缓存-------------刘浩
                    $location.path('/saler/partner/'+locationId);

            }, function (error) {
               toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

            //MyCache.remove('partner')

        };

        //添加取消，通过导航调用--------------刘浩
        Window.born_cancel = function(){
            MyCache.remove('partner');
            $location.path('/saler/partner/'+locationId);
        }



        vm.jump = function(option){
            MyCache.put('partner', vm.partner);
            MyCache.put('partnerId', partnerId);


            console.info(option);
            $location.path('/saler/options/'+option);
        };




        //处理联系人
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
                //console.info('------now what is contactOptions-----');
                //console.info(data);
                //
                //console.info($scope.contactOptions);

                contactObj.name = $scope.contactOptions.name;
                contactObj.mobile = $scope.contactOptions.mobile;
                contactObj.phone = $scope.contactOptions.phone;
                contactObj.qq = $scope.contactOptions.qq;
                contactObj.wechat = $scope.contactOptions.wechat;
                contactObj.function = $scope.contactOptions.function;

                //console.info(contactObj);
                //console.info(vm.partner.contacts);




                //vm.partner.contact
            });
        };


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
                //console.info('------now what is contactOptions-----');
                //console.info(contactOptions);
                //console.info(data);
                var newVontact = {}
                newVontact.name = $scope.contactOptions.name;
                newVontact.mobile = $scope.contactOptions.mobile;
                newVontact.phone = $scope.contactOptions.phone;
                newVontact.qq = $scope.contactOptions.qq;
                newVontact.wechat = $scope.contactOptions.wechat;
                newVontact.function = $scope.contactOptions.function;
                vm.partner.contacts.push(newVontact)


            });
        };




        vm.setDisplay = function(display){
            vm.display = display;
        };


        $scope.getFile= function ($index) {
            var file = $scope.myFile;
            var yfile = $scope.yFile;
            var sfile = $scope.sFile;
            if (sfile){
                var reader1 = new FileReader();
                reader1.readAsDataURL(sfile);
                reader1.onload = (function(){
                    vm.partner.busLicense_img = reader1.result;
                    $timeout(function () {
                    }, 500);
                });
            }
            if (file){
                var reader2 = new FileReader();
                reader2.readAsDataURL(file);
                reader2.onload = (function(){
                    vm.partner.cardPos_img = reader2.result;
                    $timeout(function () {
                    }, 1000);
                });
            }
            if(yfile){
                var reader3 = new FileReader();
                reader3.readAsDataURL(yfile);
                reader3.onload = (function(){
                    vm.partner.cardNeg_img = reader3.result;
                    $timeout(function () {
                    }, 1000);
                });
            }

        };





        //初始化
        function init() {
            displayModel.displayModel='none';


            //改写新写法?当返回或者保存时清除partner缓存
            //只有当创建新商户时,没有从partner读取缓存

            if(MyCache.get('createNewPartner') == '1'){
                MyCache.remove('partner');
                vm.partner = {};
                MyCache.remove('createNewPartner');
            }
            else{
                vm.getPartnerInfo();
            }



            //vm.display = 'info';
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

    editPartnerController.$inject = injectParams;
    angular.module('managerApp').controller('EditPartnerController', editPartnerController);

}());