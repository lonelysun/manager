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


        //Get specific partner
        vm.getPartnerInfo = function(){
            //MyCache.put('notFirstGoToNewPartner','1');
            vm.partner = MyCache.get('partner');

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
                    console.info('get here222--->');
                    vm.partner.size = optionObj.name;
                    console.info(optionObj);
                    console.info(vm.partner.size);
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

        //修改通过导航调用---------刘浩
        vm.save = function(){
            //console.info('---->1');
            //console.info(vm.partner);

            if(vm.partner.name==''){

                toaster.pop('warning', "", "请填写商户名称！");
                return true;
            }


            vm.partner.contacts_json = angular.toJson(vm.partner.contacts);

            dataService.postPartnerInfo(partnerId,vm.partner)
            .then(function (data) {
                    if(partnerId == 0){
                        var locationId = data['id'];
                    }
                    else {
                        var locationId = partnerId
                    }
                    MyCache.remove('partner');//保存成功清楚缓存-------------刘浩
                    MyCache.remove('optionType');
                    MyCache.remove('optionObj');
                    //?这个cache好像在其它地方没用到
                    //MyCache.remove('notFirstGoToNewPartner');
                    //MyCache.remove('createNewPartner')
                    //window.location.href = 'bornhr://back';
                    MyCache.put('comeFromeNewPartner','1')
                    $location.path('/saler/partner/'+locationId);

            }, function (error) {
               toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

        };

        vm.cancel = function(){


            //if(MyCache.get('createNewPartner') == '1'){
            //    $location.path('/saler/');
            //    MyCache.remove('partner');
            //    MyCache.remove('createNewPartner');
            //
            //}
            //else{
            //    $location.path('/saler/partner/'+partnerId);
            //    MyCache.remove('partner');
            //    MyCache.remove('createNewPartner');
            //}

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

        ////Test for new Back
        //vm.cancel = function(){
        //    MyCache.remove('partner');
        //    window.location.href = 'bornhr://back';
        //};



        vm.jump = function(option){
            MyCache.put('partner', vm.partner);
            MyCache.put('partnerId', partnerId);


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
                contactObj.name = $scope.contactOptions.name;
                contactObj.mobile = $scope.contactOptions.mobile;
                contactObj.phone = $scope.contactOptions.phone;
                contactObj.qq = $scope.contactOptions.qq;
                contactObj.wechat = $scope.contactOptions.wechat;
                contactObj.function = $scope.contactOptions.function;

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


            //改写新写法?当返回或者保存时清除partner缓存
            //只有当创建新商户时,没有从partner读取缓存

            //if(MyCache.get('createNewPartner') == '1'){
            //
            //    if(MyCache.get('createNewPartner_firstLoad')=='1'){
            //        vm.partner = {};
            //        vm.partner['contacts'] = [];
            //        displayModel.title = '新建商户';
            //        MyCache.remove( 'createNewPartner_firstLoad');
            //    }else{
            //        vm.getPartnerInfo();
            //        displayModel.title = vm.partner.name;
            //    }
            //
            //
            //}
            //else{
            //    vm.getPartnerInfo();
            //    displayModel.title = vm.partner.name;
            //}


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

        init();
    };

    editPartnerController.$inject = injectParams;
    angular.module('managerApp').controller('EditPartnerController', editPartnerController);

}());