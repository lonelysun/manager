(function () {

    var injectParams = ['$scope', '$location', '$routeParams','$route',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel',];

    var partnerController = function ($scope, $location, $routeParams,$route,
                                           $timeout, config,modalService, dataService,toaster,displayModel) {
        var vm = this,
        partnerId = ($routeParams.partnerId) ? parseInt($routeParams.partnerId) : 0;

        vm.partners = [];
        vm.partner = {};
        vm.counts = {};
        vm.busy=false;
        vm.isLoad=false;
        vm.keyword='';
        vm.focus = true;

        url = $location.path();

        //滚动翻页
        vm.getPartners= function () {

            if(vm.busy)return;


            vm.busy=true;

            //根据url筛选查看的是所有负责的还是待拜访、或已拜访或成功使用的
            if (url.indexOf("tovisit") >= 0){
            vm.stateFilter = 'tovisit';
            }
            else if (url.indexOf("visiting") >= 0){
            vm.stateFilter = 'visiting';
            }
            else if (url.indexOf("installed") >= 0){
            vm.stateFilter = 'installed';
            }
            else if (url.indexOf("default") >= 0){
            vm.stateFilter = 'visiting';
            }
            else if (url.indexOf("all") >= 0){
            vm.stateFilter = '';
            }


            dataService.getPartners(vm.partners.length,vm.keyword,vm.stateFilter)
            .then(function (data) {
                    vm.counts = data;
                for (var i = 0; i < data['partner_list'].length; i++) {
                    vm.partners.push(data['partner_list'][i]);

                }

                    //如果该商户不属于自己，则不能点击
                    //根据服务器端传过来的‘my_customer’判断如果不是'yes'则将href属性设置为空.背景色改成浅灰
                    for (var j= 0; j<vm.partners.length;j++){

                        if(vm.partners[j]['my_customer'] == 'yes'){
                            vm.partners[j]['href'] = '#/partners/'+ vm.partners[j]['id'] ;
                            vm.partners[j]['bgcolor'] = '';
                        }
                        else{
                            vm.partners[j]['href'] = '';
                            vm.partners[j]['bgcolor'] = '#f7f7f7';
                        }

                    }

                vm.isLoad=true;
                $timeout(function () {
                    vm.busy=false;
                }, 1000);
            }, function (error) {
                toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };



        //关键词搜索
        vm.getPartnersKeyword= function () {

            if(vm.busy)return;
            vm.busy=true;

            //根据url筛选查看的是所有负责的还是待拜访、或已拜访或成功使用的
            if (url.indexOf("tovisit") >= 0){
            vm.stateFilter = 'tovisit';
            }
            else if (url.indexOf("visiting") >= 0){
            vm.stateFilter = 'visiting';
            }
            else if (url.indexOf("installed") >= 0){
            vm.stateFilter = 'installed';
            }
            else if (url.indexOf("default") >= 0){
            vm.stateFilter = 'visiting';
            }
            else if (url.indexOf("all") >= 0){
            vm.stateFilter = '';
            }

            dataService.getPartners(0,vm.keyword,vm.stateFilter)
            .then(function (data) {
                vm.counts = data;
                vm.partners=data['partner_list'];
                vm.isLoad=true;
                $timeout(function () {
                    vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };

        //初始化
        function init() {
            displayModel.displayModel='none';

        }

        init();
    };

    partnerController.$inject = injectParams;
    angular.module('managerApp').controller('PartnerController', partnerController);
    
}());