(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','$route', 'config', 'dataService','toaster','displayModel'];

    var CreateSuccessController = function ($scope, $location, $routeParams,
                                           $timeout,$route ,config, dataService,toaster,displayModel) {

    	var vm = this;

        function init() {
            displayModel.showHeader='0';
            displayModel.displayBack='0';
            displayModel.displaySave='0';
            displayModel.displaySearch='0';
            displayModel.displayCanel='0';
        }

        init();
    };

    CreateSuccessController.$inject = injectParams;
    angular.module('managerApp').controller('CreateSuccessController', CreateSuccessController);

}());