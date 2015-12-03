
(function () {
    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','ngDialog', 'config', 'dataService','toaster','displayModel','MyCache'];

    var ReportController = function ($scope, $location, $routeParams,
                                           $timeout, ngDialog,config, dataService,toaster,displayModel,MyCache) {
    var vm = this;


      $scope.labels = ["1", "2", "3", "4", "5", "6", "7"];
      $scope.series = ['Series A'];
      $scope.data = [
        [0, 0, 12, 23, 34, 45, 56],
      ];

      $scope.onClick = function (points, evt) {
        console.log(points, evt);
      };


        function init() {

        }


        init();
    };

    ReportController.$inject = injectParams;
    angular.module('managerApp').controller('ReportController', ReportController);

}());