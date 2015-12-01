(function () {
    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','ngDialog', 'config', 'dataService','toaster','displayModel','MyCache'];

    var SalepanelController = function ($scope, $location, $routeParams,
                                           $timeout, ngDialog,config, dataService,toaster,displayModel,MyCache) {
        var vm = this;
        vm.panel = {};
        vm.display = 'missions';
        vm.busy=false;
        vm.isLoad=false;
        vm.tracklist = [];
        vm.donetracklist = [];
        vm.salers = [];
        vm.showDone = false;
        vm.DoneTrack = false;
        var state = '';


        //创建新任务
        vm.createMission = function () {


        	$scope.modalOptions = {
                closeButtonText: '取消',
                firstActionText:'新任务',
                firstUrl:'#/createMission',
                secondActionText:'新商户',
                secondUrl:'#/',
            };

            ngDialog.open({
                template:'/born_manager/static/defaultApp/partials/modalBottomThree.html',
                className: 'ngdialog',
                scope:$scope
            });
        };






    };

    SalepanelController.$inject = injectParams;
    angular.module('managerApp').controller('SalepanelController', SalepanelController);

}());