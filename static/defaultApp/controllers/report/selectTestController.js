
(function () {
    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','ngDialog', 'config', 'dataService','toaster','displayModel','MyCache'];

    var selectTestController = function ($scope, $location, $routeParams,
                                           $timeout, ngDialog,config, dataService,toaster,displayModel,MyCache) {

        var vm = this;

        //vm.data = {
        //    'mark':[{id:1,name:'合作',detail:[{id:1,name:'王牌'},{id:2,name:'美丽田园'}]},
        //            {id:2,name:'做活动',detail:[{id:3,name:'传单'},{id:4,name:'地铁广告'}]}],
        //    'sale':[{id:1,name:'扫街'},{id:2,name:'扫楼'}]
        //};

        vm.data = {};

        vm.checked = {'mark_source_detail':[], 'sale_source':[]};




        //获取选项数据
        vm.getSourceOptions = function () {
            dataService.getSourceOptions.then(function (data) {
                vm.data = data
            })
        }

        //判断市场部是否选中
        vm.isSelected_mark0 = function() {
            return (vm.checked['mark_source_detail'].length != 0)
        };

        //判断销售部是否选中
        vm.isSelected_sale0 = function(){
            return (vm.checked['sale_source'].length != 0)
        };




        //点击市场部发生的动作
        vm.updateSelection_mark0 = function ($event) {
            if(vm.isSelected_mark0()){
                vm.checked['mark_source_detail'] = [];
            }
            else{

                for (var i = 0; i<vm.data['mark'].length;i++){

                    for(var j = 0; j<vm.data['mark'][i]['detail'].length;j++){
                        vm.checked['mark_source_detail'].push(vm.data['mark'][i]['detail'][j]['id'])
                    }
                }

            }

        };

        //点击销售部发生的动作
        vm.updateSelection_sale0 = function($event){
            if (vm.isSelected_sale0()){
                vm.checked['sale_source'] = [];
            }else{
                 for (var i = 0; i<vm.data['sale'].length; i++){
                     vm.checked['sale_source'].push(vm.data['sale'][i]['id'])
                 }
            }

        };



        //判断市场部下一级菜单是否选中
        vm.isSelected_mark1 = function(mark_source){
            for(var i = 0; i<mark_source['detail'].length; i++){
                if ((vm.checked['mark_source_detail'].indexOf(mark_source['detail'][i]['id'])) > -1){
                    return true;
                }
            }
            return false;
        };


        //判断销售部下一级菜单是否选中
        vm.isSelected_sale1 = function (sale_source) {

            return vm.checked['sale_source'].indexOf(sale_source.id) > -1
        };




        //点击市场部下一级菜单触发的选项
        vm.updateSelection_mark1 = function($event, mark_source){
            if (vm.isSelected_mark1(mark_source)) {
                //debugger;
                for (var i = 0; i< mark_source['detail'].length; i++){
                    if (vm.checked['mark_source_detail'].indexOf(mark_source['detail'][i]['id'])>-1){
                        var idx = vm.checked['mark_source_detail'].indexOf(mark_source['detail'][i]['id'])
                        vm.checked['mark_source_detail'].splice(idx,1)

                    }
                }


            }else{
                //debugger;
                for (var i = 0; i< mark_source['detail'].length; i++){
                    console.info('--->')
                    console.info(mark_source['detail'][i]['id'])

                    vm.checked['mark_source_detail'].push(mark_source['detail'][i]['id'])
                }

            }
        };


        //点击销售部下一级菜单触发的选项
        vm.updateSelection_sale1 = function($event, sale_source){
            if(vm.isSelected_sale1(sale_source)){
                var idx = vm.checked['sale_source'].indexOf(sale_source.id);
                vm.checked['sale_source'].splice(idx,1)

            }else{
                vm.checked['sale_source'].push(sale_source.id)

            }
        };

        //判断市场部下二级是否选中
        vm.isSelected_mark2 = function (mark_source_detail) {
            return vm.checked['mark_source_detail'].indexOf(mark_source_detail.id) > -1
        };

        //点击市场部下二级菜单触发的选项
        vm.updateSelection_mark2 = function($event,mark_source_detail){
            if(vm.isSelected_mark2(mark_source_detail)){
                var idx = vm.checked['mark_source_detail'].indexOf(mark_source_detail.id);
                vm.checked['mark_source_detail'].splice(idx,1)
            }else{
                vm.checked['mark_source_detail'].push(mark_source_detail.id)
            }
        }






    };

    selectTestController.$inject = injectParams;
    angular.module('managerApp').controller('SelectTestController', selectTestController);

}());