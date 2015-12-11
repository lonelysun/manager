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
        vm.results = [];

        vm.cancel = function(){
            $location.path('/saler/finishMission/'+ missionId);
        };


        vm.save = function(){
        	if(vm.selected.length==0){
            	toaster.pop('warning', "系统提示", "未选择结果");
                return;
            }
        	//var da = {"results" : JSON.stringify(vm.selected)};


            MyCache.put('selectResults',vm.selected);
            MyCache.put('selectedTags',vm.selectedTags);

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

        vm.hasChoosen = function(){
            displayModel.displaySave = '1';
        };


        vm.getResults = function(){
            if(vm.busy)return;
            vm.busy=true;

            dataService.getResultsService(vm.results.length)
                .then(function (data) {

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
            displayModel.showHeader='1';
            displayModel.displayCancel='1';
            displayModel.displayBack = '0';
            displayModel.title = '选择结果(多选)';
            displayModel.displaySubmit = '0';
            displayModel.displayConfirm = '0';
            displayModel.displaySave='0';
            displayModel.displayCreate = '0';
            displayModel.displaySearch = '0';


            displayModel.headerBack = vm.cancel;
            displayModel.born_save = vm.save;

        }

        init();
    };

    resultsOptionController.$inject = injectParams;
    angular.module('managerApp').controller('ResultsOptionController', resultsOptionController);

}());