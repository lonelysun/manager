(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','$route', 'config', 'dataService','toaster','displayModel','MyCache'];

    var resultsOptionController = function ($scope, $location, $routeParams,
                                           $timeout, $route,config, dataService,toaster,displayModel,MyCache) {

    	var vm = this;
    	var missionId = ($routeParams.missionId) ? parseInt($routeParams.missionId) : 0;



        vm.shops = [];
    	vm.keyword = '';

        vm.busy=false;
        vm.isLoad=false;

        vm.selected = [];
        vm.selectedTags = [];
        vm.results = []



        vm.postFinishedMission = function(){
        	if(vm.selected.length==0){
            	toaster.pop('warning', "系统提示", "未选择结果");
                return;
            }
        	//var da = {"results" : JSON.stringify(vm.selected)};


            MyCache.put('selectResults',vm.selected);
            MyCache.put('selectedTags',vm.selectedTags);
            console.info('vm.selected')
            console.info(vm.selected)
            console.info('selectedTags')
            console.info(vm.selectedTags)

            //need get missionId first

            $location.path('/saler/finishMission/'+ missionId);

        };


        var updateSelected = function(action,id,name){
            if(action == 'add' && vm.selected.indexOf(id) == -1){
                vm.selected.push(id);
                vm.selectedTags.push(name);
            }
            if(action == 'remove' && vm.selected.indexOf(id)!=-1){
                var idx = vm.selected.indexOf(id);
                vm.selected.splice(idx,1);
                vm.selectedTags.splice(idx,1);
            }
        };

        vm.updateSelection = function($event, id){
            var checkbox = $event.target;
            var action = (checkbox.checked?'add':'remove');
            updateSelected(action,id,checkbox.name);
        };

        vm.isSelected = function(id){
            return vm.selected.indexOf(id)>=0;
        };



        vm.getResults = function(){
            if(vm.busy)return;
            vm.busy=true;



            dataService.getResultsService(vm.results.length)
                .then(function (data) {



                    console.info(data);

                    for(var i = 0;i<data.length;i++){
                        vm.results.push(data[i]);
                    }
                    vm.isLoad=true;
                    $timeout(function () {
                        vm.busy=false;
                    }, 1000);

                }, function (error) {
                    toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });

        };



        function init() {
            displayModel.displayModel='none';


        }

        ////获取用户掌管分区信息
        //vm.getShop = function(){
        //
        //	if(vm.busy)return;
        //    vm.busy=true;
        //    dataService.getassignshop(businessid,vm.shops.length,vm.keyword)
        //    .then(function (data) {
        //        for (var i = 0; i < data.length; i++) {
        //            vm.shops.push(data[i]);
        //        }
        //        vm.isLoad=true;
        //        vm.isLoad=true;
        //        $timeout(function () {
        //        	vm.busy=false;
        //        }, 1000);
        //    }, function (error) {
        //    	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
        //    });
        //};
        //vm.getShopKeyword = function(){
        //
        //	if(vm.busy)return;
        //	vm.busy=true;
        //	dataService.getassignshop(businessid,0,vm.keyword)
        //	.then(function (data) {
        //		vm.shops = data
        //		vm.isLoad=true;
        //		vm.isLoad=true;
        //		$timeout(function () {
        //			vm.busy=false;
        //		}, 1000);
        //	}, function (error) {
        //		toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
        //	});
        //}

        init();
    };

    resultsOptionController.$inject = injectParams;
    angular.module('managerApp').controller('ResultsOptionController', resultsOptionController);

}());