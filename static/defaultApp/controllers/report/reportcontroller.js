
(function () {
    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout','ngDialog', 'config', 'dataService','toaster','displayModel','MyCache'];

    var ReportController = function ($scope, $location, $routeParams,
                                           $timeout, ngDialog,config, dataService,toaster,displayModel,MyCache) {
        var vm = this;
        vm.revenue={
            display:'week',
            second_report_point :[],
            first_report_point:[],
            date_point:[],
            consume_total:'',
            cash_total:'',
            consume_avg:'',
            cash_avg:'',
            company_list:'',
            current_date:'',
            current_week:'',
            current_year:'',
            current_month:'',
            display_current:'',
            filter_week:'',
            filter_week_year:'',
            };
        vm.salerTeam={};

        vm.setPage1= function (direction) {
        	getRevenue(direction);
        };

        vm.setDisplay1= function (display) {
            vm.revenue.display=display;
            getRevenue(0);
        };

//        vm.setPage2= function (direction) {
////        	getCardData(direction);
//        };
//
//        vm.setDisplay2= function (display) {
////            vm.card.display=display;
////            getCardData(0);
//        };

    //line-report-data    店尚
        function getRevenue(direction) {

            if(vm.busy)return;
            vm.busy=true;

            dataService.getRevenue(vm.revenue.display,0,
                    vm.revenue.current_date, vm.revenue.current_week, vm.revenue.current_year, vm.revenue.current_month,
                    direction)
            .then(function (data) {
            	vm.revenue = data;
                $scope.labels = vm.revenue.date_point;
                $scope.data =[vm.revenue.first_report_point];
                $scope.data1 =[vm.revenue.second_report_point];
                vm.isLoad=true;
                $timeout(function () {
                    vm.busy=false;
                }, 500);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };

      $scope.options = {'scaleShowVerticalLines': false,'scaleShowHorizontalLines': false,'showScale':false,};
      $scope.colours = [{fillColor: "rgba(255, 235, 235, 1)", strokeColor: "#ff4848", pointColor: "#fff", pointStrokeColor: "#ff4848", pointHighlightFill: "#fff", pointHighlightStroke: "#ff4848" }]
      $scope.colours1 = [{fillColor: "rgba(235, 243, 252, 1)", strokeColor: "#4a90e2", pointColor: "#fff", pointStrokeColor: "#4a90e2", pointHighlightFill: "#fff", pointHighlightStroke: "#4a90e2" }]

      $scope.onClick = function (points, evt) {
        return '';
      };






    //doughnut-report-data
        function getsaleTeamReport() {

            dataService.getsaleTeamReport()
            .then(function (data) {
            	vm.salerTeam = data;
                  $scope.labels2 = ["已安装商户", "未安装商户"];
                  $scope.data2 = [vm.salerTeam.company_number, vm.salerTeam.not_company];
                  $scope.color = $scope.colors = ['#ffffff','#fea8ad'];
                  $scope.options2 = {'percentageInnerCutout':93,'segmentStrokeColor' : "rgba(0, 0, 0, 0)",};

                vm.isLoad=true;
                $timeout(function () {
                    vm.busy=false;
                }, 500);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };


        function init() {
            displayModel.showHeader='0';
            displayModel.displayBottom = '1';
            getRevenue(0);
            getsaleTeamReport();
        }

        init();
    };

    ReportController.$inject = injectParams;
    angular.module('managerApp').controller('ReportController', ReportController);

}());