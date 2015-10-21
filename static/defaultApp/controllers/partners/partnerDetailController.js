(function () {

    var injectParams = ['$scope', '$location', '$routeParams','$route',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel',];

    var partnerDetailController = function ($scope, $location, $routeParams,$route,
                                           $timeout, config,modalService, dataService,toaster,displayModel) {
        var vm = this,
        partnerId = ($routeParams.partnerId) ? parseInt($routeParams.partnerId) : 0;

        vm.partner = {};
        vm.counts = {};
        vm.busy=false;
        vm.isLoad=false;
        vm.keyword='';

        vm.states = [];
        vm.areas = [];
        vm.subdivides = [];
        vm.businesses = [];





        //获取客户明细
        function getPartnerDetail() {
            dataService.getPartnerDetail(partnerId)
            .then(function (data) {
            vm.partner = data;


                    //初始化省市县
                    if (vm.partner['state_id']){
                        vm.getArea();
                        if(vm.partner['area_id']){
                            vm.getSubdivide();
                            if(vm.partner['subdivide_id']){
                                vm.getBusiness();
                            }
                        }
                    }


            if(partnerId != 0){
                vm.notNewPartner = true;

            }


            $timeout(function () {
                }, 1000);
            }, function (error) {
                toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }



        //保存partner
        vm.submitPartner = function(string){

            if(vm.partner.name==""){
                toaster.pop('warning', "系统提示", "请填写名称！");
                return;
            }

            if(vm.partner.categorys_id=="" || vm.partner.categorys_id==null){
                toaster.pop('warning', "系统提示", "请选择经营类型！");
                return;
            }


            //新建商户时，省市区商圈都必填
            if(partnerId == 0) {
                if (vm.partner.state_id == '' || vm.partner.state_id == null) {
                    toaster.pop('warning', "系统提示", "请选择省！");
                    return;
                }
                if (vm.partner.area_id == '' || vm.partner.area_id == null) {
                    toaster.pop('warning', "系统提示", "请选择市！");
                    return;
                }
                if (vm.partner.subdivide_id == '' || vm.partner.subdivide_id == null) {
                    toaster.pop('warning', "系统提示", "请选择区！");
                    return;
                }
                if (vm.partner.business_id == '' || vm.partner.business_id == null) {
                    toaster.pop('warning', "系统提示", "请选择商圈！");
                    return;
                }
            }


            //修改：拜访类型设为必填
            if(!((vm.partner.track_result_ids == ''|| vm.partner.track_result_ids == null)&&(vm.partner.track_ways ==''|| vm.partner.track_ways ==null)&& (vm.partner.track_notes==''|| vm.partner.track_notes==null ))
                && (vm.partner.track_ways ==''|| vm.partner.track_ways ==null)   ){
                toaster.pop('warning', "系统提示", "请选择拜访类型！");

                return;
            }

            //修改：拜访结果设为必填
            if(!((vm.partner.track_result_ids == ''|| vm.partner.track_result_ids == null)&&(vm.partner.track_ways ==''|| vm.partner.track_ways ==null)&& (vm.partner.track_notes==''||vm.partner.track_notes==null ))
                && (vm.partner.track_result_ids ==''|| vm.partner.track_result_ids ==null)   ){
                toaster.pop('warning', "系统提示", "请选择拜访结果！");
                return;
            }




            //去掉不需要的post数据
            delete vm.partner.business_id_options;
            delete vm.partner.categorys_id_options;
            delete vm.partner.partner_employee_id_options;
            delete vm.partner.partner_size_id_options;
            delete vm.partner.partner_environment_id_options;
            delete vm.partner.partner_room_id_options;
            delete vm.partner.business_id_options;
            delete vm.partner.track_ways_options;
            delete vm.partner.result_ids_options;
            delete vm.partner.contact_data_list;
            delete vm.partner.track_data_list;
            delete vm.partner.state;




            dataService.submitPartner(partnerId,vm.partner)
            .then(function (data) {

                    //点击添加联系人触发的提交
                    if (string == 'newcontact') {

                        var partner_id = data['partner_id'];
                        $location.path('/partners/' + partner_id + '/newContact');



                    }
                    //点击提交按钮触发的提交
                    else {
                        toaster.pop('success', "", "保存成功!");
                        //跳转到该partnerId详细页面下


                        if (partnerId == 0) {
                            //get Id from server
                            var partner_id = data['partner_id'];
                            $location.path('/partners/' + partner_id);
                        }
                        else
                            $route.reload();
                    }

            }, function (error) {
               toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };






        //从服务器获得省
        vm.getState = function(){
            dataService.getState()
            .then(function (data)
            {

                vm.states = data;

                $timeout(function () {
                }, 1000);
            },
            function (error) {
                toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

        };

        //从服务器获得市
        vm.getArea = function(){

            if(vm.partner.state_id==null){
                vm.partner.area_id=null;
                vm.partner.subdivide_id=null;
                vm.partner.business_id=null;
                return;
            }

            dataService.getArea(vm.partner.state_id)
            .then(function (data)
            {

                vm.areas = data;


                $timeout(function () {
                }, 1000);
            },
            function (error) {
                toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

        };

        //从服务器获得区
        vm.getSubdivide = function(){

            if(vm.partner.area_id==null){
                vm.partner.subdivide_id=null;
                vm.partner.business_id=null;
                return;
            }

            dataService.getSubdivide(vm.partner.area_id)
            .then(function (data)
            {

                vm.subdivides = data;

                $timeout(function () {
                }, 1000);
            },
            function (error) {
                toaster.pop('error', "处理失败", "很遗憾处理失败，由于dsdsdsd网络原因无法连接到服务器！");
            });

        };


        //从服务器获商区
        vm.getBusiness = function(){

            if(vm.partner.subdivide_id==null){
                vm.partner.business_id=null;
                return;
            }

            dataService.getBusiness(vm.partner.subdivide_id)
            .then(function (data)
            {

                vm.businesses = data;

                $timeout(function () {
                }, 1000);
            },
            function (error) {
                toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

        };




        //初始化
        function init() {
            displayModel.displayModel='none';

            getPartnerDetail();
            vm.getState();
        }

        init();
    };

    partnerDetailController.$inject = injectParams;
    angular.module('managerApp').controller('PartnerDetailController', partnerDetailController);

}());