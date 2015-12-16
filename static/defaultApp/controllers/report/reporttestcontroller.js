
(function () {
    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','ngDialog', 'config', 'dataService','toaster','displayModel','MyCache'];

    var ReportController = function ($scope, $location, $routeParams,
                                           $timeout, ngDialog,config, dataService,toaster,displayModel,MyCache) {
    var vm = this;


      $scope.labels = ["1", "2", "3", "4", "5", "6", "7"];
      $scope.series = ['Series A'];
      $scope.data = [
        [0, 100, 12, 23, 34, 45, 56],
      ];
      $scope.options = [{scaleShowVerticalLines: false},{scaleShowGridLines : false}];
      $scope.labels1 = ["9", "8", "7", "6", "5", "4", "3"];
      $scope.series1 = ['Series B'];
      $scope.data1 = [
        [56, 56, 12, 23, 34, 6, 56],
      ];
      $scope.colours = [{fillColor: "rgba(172, 43, 43, 0.42)", strokeColor: "#ff4848", pointColor: "#fff", pointStrokeColor: "#ff4848", pointHighlightFill: "#fff", pointHighlightStroke: "#ff4848" }]

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