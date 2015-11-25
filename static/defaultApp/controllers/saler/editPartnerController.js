(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel','MyCache'];

    var editPartnerController = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService, dataService,toaster,displayModel,MyCache) {
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
            vm.partner = MyCache.get('partner');
            console.info(MyCache.get('partner'));

            var optionObj = MyCache.get('optionObj');
            var optionType = MyCache.get('optionType');

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
                    vm.partner.source = '市场部'+' '+optionObj.name;
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


        vm.postPartnerInfo = function(){
            vm.partner.contacts_json = angular.toJson(vm.partner.contacts);

            dataService.submitPartner(partnerId,vm.partner)
            .then(function (data) {


                    ////点击添加联系人触发的提交
                    //if (string == 'newcontact') {
                    //
                    //    var partner_id = data['partner_id'];
                    //
                    //    $location.path('/partners/' + partner_id + '/newContact');
                    //
                    //}
                    ////点击提交按钮触发的提交
                    //else {
                    //    toaster.pop('success', "", "保存成功!");
                    //    //跳转到该partnerId详细页面下
                    //
                    //
                    //    if (partnerId == 0) {
                    //        //get Id from server
                    //        var partner_id = data['partner_id'];
                    //        $location.path('/partners/' + partner_id);
                    //    }
                    //    else
                            $route.reload();
                    //}

            }, function (error) {
               toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

        };




        vm.jump = function(option){
            MyCache.put('partner', vm.partner);
            MyCache.put('partnerId', partnerId);


            console.info(option)
            $location.path('/saler/options/'+option);
        };











        vm.setDisplay = function(display){
            vm.display = display;
        };





        //初始化
        function init() {
            displayModel.displayModel='none';
            vm.getPartnerInfo();
            vm.display = 'info';
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