(function () {
  
    var app = angular.module('managerApp', ['ngRoute', 'ngSanitize','ngAnimate','ngTouch','ngDialog','wc.directives','datePicker', 'ui.bootstrap', 'infinite-scroll','breeze.angular','toaster','chart.js','angular-carousel'],
	function($httpProvider) {
	  // Use x-www-form-urlencoded Content-Type
	  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

	  /**
	   * The workhorse; converts an object to x-www-form-urlencoded serialization.
	   * @param {Object} obj
	   * @return {String}
	   */
	  var param = function(obj) {
		var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

		for(name in obj) {

		  value = obj[name];
		  if(value instanceof Array) {
			for(i=0; i<value.length; ++i) {
			  subValue = value[i];
			  fullSubName = name + '[' + i + ']';
			  innerObj = {};
			  innerObj[fullSubName] = subValue;
			  query += param(innerObj) + '&';
			}
		  }
		  else if(value instanceof Object) {
			for(subName in value) {
			  subValue = value[subName];
			  fullSubName = name + '[' + subName + ']';
			  innerObj = {};
			  innerObj[fullSubName] = subValue;
			  query += param(innerObj) + '&';
			}
		  }
		  else if(value !== undefined && value !== null)
			query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
		}

		return query.length ? query.substr(0, query.length - 1) : query;
	  };

	  // Override $http service's default transformRequest
	  $httpProvider.defaults.transformRequest = [function(data) {
		return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
	  }];
	});

	app.factory('displayModel', function() {
    	  return {
    	    displayModel: 'block'
    	  }
	});

	app.factory('MyCache',function($cacheFactory){
			return $cacheFactory('myCache');
		}
	);

	
    app.config(['$routeProvider',  function ($routeProvider) {
        var viewBase = '/born_manager/static/defaultApp/views/';
        $routeProvider
	        .when('/messages', {
	            controller: 'MessageController',
	            templateUrl: viewBase + 'messages/messages.html',
	            controllerAs: 'vm'
	        })
	        .when('/messagesTime', {
	            controller: 'MessageTimeController',
	            templateUrl: viewBase + 'messages/messageTime.html',
	            controllerAs: 'vm'
	        })
            //.when('/panel', {
	        //    controller: 'PanelController',
	        //    templateUrl: viewBase + 'panel/panel.html',
	        //    controllerAs: 'vm'
	        //})
			.when('/panel', {
	            controller: 'PanelController',
	            templateUrl: viewBase + 'panel/panel.html',
	            controllerAs: 'vm'
	        })
			.when('/companys', {
	            controller: 'CompanysController',
	            templateUrl: viewBase + 'companys/companys.html',
	            controllerAs: 'vm'
	        })
			//test
			.when('/company/notupdated/:companyId', {
	            controller: 'CompanyControllerNotUpdated',
	            templateUrl: viewBase + 'companys/companyDetailNotUpdated.html',
	            controllerAs: 'vm'
	        })

			.when('/company/updated/:companyId', {
	            controller: 'CompanyControllerUpdated',
	            templateUrl: viewBase + 'companys/companyDetailUpdated.html',
	            controllerAs: 'vm'
	        })


			.when('/saler', {
	            controller: 'SalerController',
	            templateUrl: viewBase + 'saler/saler.html',
	            controllerAs: 'vm'
	        })
			
			.when('/saler/partner/:partnerId', {
	            controller: 'SalerPartnerController',
	            templateUrl: viewBase + 'saler/salerPartner.html',
	            controllerAs: 'vm'
	        })

			.when('/saler/partner/edit/:partnerId', {
	            controller: 'EditPartnerController',
	            templateUrl: viewBase + 'saler/editPartner.html',
	            controllerAs: 'vm'
	        })

            .when('/saler/options/:option', {
	            controller: 'OptionsController',
	            templateUrl: viewBase + 'saler/options.html',
	            controllerAs: 'vm'
	        })

            //.when('/createPartner', {
	        //    controller: 'EditPartnerController',
	        //    templateUrl: viewBase + 'saler/editPartner.html',
	        //    controllerAs: 'vm'
	        //})
			.when('/saler/selectResults/:missionId', {
	            controller: 'ResultsOptionController',
	            templateUrl: viewBase + 'saler/resultsOption.html',
	            controllerAs: 'vm'
	        })

			.when('/saler/finishMission/:missionId', {
	            controller: 'FinishMissionController',
	            templateUrl: viewBase + 'saler/finishMission.html',
	            controllerAs: 'vm'
	        })
			.when('/saler/finishedMission/:missionId', {
	            controller: 'ShowFinishedMissionController',
	            templateUrl: viewBase + 'saler/showFinishedMission.html',
	            controllerAs: 'vm'
	        })
			.when('/saler/postSuccess', {
	            controller: 'CreateSuccessController',
	            templateUrl: viewBase + 'saler/postSuccess.html',
	            controllerAs: 'vm'
	        })
			.when('/saler/company/:companyId', {
	            controller: 'SalerCompanyController',
	            templateUrl: viewBase + 'saler/salerCompany.html',
	            controllerAs: 'vm'
	        })
			.when('/saler/:salerId', {
	            controller: 'SalerController',
	            templateUrl: viewBase + 'saler/saler.html',
	            controllerAs: 'vm'
	        })
			.when('/support', {
	            controller: 'SupportController',
	            templateUrl: viewBase + 'support/support.html',
	            controllerAs: 'vm'
	        })


			//end test



			.when('/companys/:companyId', {
	            controller: 'CompanyController',
	            templateUrl: viewBase + 'companys/companysDetail.html',
	            controllerAs: 'vm'
	        })
			.when('/shops/:companyId', {
	            controller: 'ShopController',
	            templateUrl: viewBase + 'companys/shops.html',
	            controllerAs: 'vm'
	        })
			.when('/licenses/:companyId', {
	            controller: 'LicenseController',
	            templateUrl: viewBase + 'companys/licenses.html',
	            controllerAs: 'vm'
	        })
			.when('/users/:companyId', {
	            controller: 'UserController',
	            templateUrl: viewBase + 'companys/users.html',
	            controllerAs: 'vm'
	        })
			.when('/cashs/:type', {
	            controller: 'CashController',
	            templateUrl: viewBase + 'panel/cashs.html',
	            controllerAs: 'vm'
	        })
	        .when('/settings', {
	            controller: 'SettingController',
	            templateUrl: viewBase + 'setting/setting.html',
	            controllerAs: 'vm'
	        })
			.when('/menus', {
	            controller: 'MenuController',
	            templateUrl: viewBase + 'menu/menus.html',
	            controllerAs: 'vm'
	        })
            .when('/partners/default', {
	            controller: 'PartnerController',
	            templateUrl: viewBase + 'partners/partnersDefault.html',
	            controllerAs: 'vm'
	        })


			.when('/partners/all', {
	            controller: 'PartnerController',
	            templateUrl: viewBase + 'partners/partners.html',
	            controllerAs: 'vm'
	        })

			.when('/partners/tovisit', {
	            controller: 'PartnerController',
	            templateUrl: viewBase + 'partners/partners.html',
	            controllerAs: 'vm'
	        })

			.when('/partners/visiting', {
	            controller: 'PartnerController',
	            templateUrl: viewBase + 'partners/partners.html',
	            controllerAs: 'vm'
	        })
			.when('/partners/installed', {
	            controller: 'PartnerController',
	            templateUrl: viewBase + 'partners/partners.html',
	            controllerAs: 'vm'
	        })


			//下面两个路由顺序不能相反
			.when('/partners/newpartner', {
	            controller: 'PartnerDetailController',
	            templateUrl: viewBase + 'partners/partnersDetail.html',
	            controllerAs: 'vm'
	        })

			.when('/partners/:partnerId', {
	            controller: 'PartnerDetailController',
	            templateUrl: viewBase + 'partners/partnersDetail.html',
	            controllerAs: 'vm'
	        })

			//下面两个路由顺序不能相反
			.when('/partners/:partnerId/newContact', {
				controller: 'ContactController',
				templateUrl: viewBase + 'partners/contact.html',
				controllerAs: 'vm'
			})
			.when('/partners/:partnerId/:contactId', {
	            controller: 'ContactController',
	            templateUrl: viewBase + 'partners/contact.html',
	            controllerAs: 'vm'
	        })
	        .when('/assignments', {
	        	controller: 'AssignmentsController',
	        	templateUrl: viewBase + 'salecontrole/assignments.html',
	        	controllerAs: 'vm'
	        })
	        .when('/assignments/:salerid', {
	        	controller: 'AssignbusinessController',
	        	templateUrl: viewBase + 'salecontrole/assignbusiness.html',
	        	controllerAs: 'vm'
	        })
	        .when('/assignments/:salerid/:businessid', {
	        	controller: 'AssignshopController',
	        	templateUrl: viewBase + 'salecontrole/assignshop.html',
	        	controllerAs: 'vm'
	        })
	        .when('/salepanel', {
	        	controller: 'SalepanelController',
	        	templateUrl: viewBase + 'salermanager/salermanager.html',
	        	controllerAs: 'vm'
	        })
//	        .when('/salepanel', {
//	        	controller: 'SalepanelController',
//	        	templateUrl: viewBase + 'salecontrole/salepanel.html',
//	        	controllerAs: 'vm'
//	        })

	        .when('/approval/:trackid', {
	        	controller: 'ApprovalController',
	        	templateUrl: viewBase + 'salermanager/approval.html',
	        	controllerAs: 'vm'
	        })
	        .when('/teamshop', {
	        	controller: 'TeamshopController',
	        	templateUrl: viewBase + 'salecontrole/teamshop.html',
	        	controllerAs: 'vm'
	        })
	        .when('/allsalers', {
	        	controller: 'AllsalersController',
	        	templateUrl: viewBase + 'salecontrole/allsalers.html',
	        	controllerAs: 'vm'
	        })
	        .when('/allsalers/:salerid', {
	        	controller: 'SalerdetailController',
	        	templateUrl: viewBase + 'salecontrole/salerdetail.html',
	        	controllerAs: 'vm'
	        })
	        .when('/successshop', {
	        	controller: 'TeamshopController',
	        	templateUrl: viewBase + 'salecontrole/successshops.html',
	        	controllerAs: 'vm'
	        })
	        .when('/waitshop', {
	        	controller: 'TeamshopController',
	        	templateUrl: viewBase + 'salecontrole/successshops.html',
	        	controllerAs: 'vm'
	        })
	        .when('/allsalers/:salerid/:businessid', {
	        	controller: 'SalershopController',
	        	templateUrl: viewBase + 'salecontrole/salershops.html',
	        	controllerAs: 'vm'
	        })
	        .when('/shopdetail/:shopid', {
	        	controller: 'ShopdetailController',
	        	templateUrl: viewBase + 'salecontrole/shopdetail.html',
	        	controllerAs: 'vm'
	        })
	        .when('/changeshopsaler/:shopid', {
	        	controller: 'ChangeshopsalerController',
	        	templateUrl: viewBase + 'salecontrole/changeshopsaler.html',
	        	controllerAs: 'vm'
	        })            
	        .when('/allchange/:salerid', {
	        	controller: 'AllchangeController',
	        	templateUrl: viewBase + 'salecontrole/changeshopsaler.html',
	        	controllerAs: 'vm'
	        })            
	        .when('/visitingshop', {
	        	controller: 'TeamshopController',
	        	templateUrl: viewBase + 'salecontrole/successshops.html',
	        	controllerAs: 'vm'
	        })
	        .when('/nosalershop', {
	        	controller: 'TeamshopController',
	        	templateUrl: viewBase + 'salecontrole/teamshop.html',
	        	controllerAs: 'vm'
	        })
	        .when('/havesalershop', {
	        	controller: 'TeamshopController',
	        	templateUrl: viewBase + 'salecontrole/teamshop.html',
	        	controllerAs: 'vm'
	        })
	        .when('/tracklist', {
	        	controller: 'TracklistController',
	        	templateUrl: viewBase + 'salecontrole/tracklist.html',
	        	controllerAs: 'vm'
	        })
			.when('/licenses/deatil/:date/:companyId', {
	            controller: 'LicenseDetailController',
	            templateUrl: viewBase + 'companys/licensesDetail.html',
	            controllerAs: 'vm'
	        })
			.when('/createMission/:option', {
	            controller: 'CreateMissionController',
	            templateUrl: viewBase + 'salermanager/createMission.html',
	            controllerAs: 'vm'
	        })
			.when('/selectSaler', {
	            controller: 'SelectSalerController',
	            templateUrl: viewBase + 'salermanager/selectSaler.html',
	            controllerAs: 'vm'
	        })
			.when('/createSuccess', {
	            controller: 'CreateSuccessController',
	            templateUrl: viewBase + 'salermanager/createSuccess.html',
	            controllerAs: 'vm'
	        })
			.when('/approvalSuccess/:track_id', {
	            controller: 'CreateSuccessController',
	            templateUrl: viewBase + 'salermanager/approvalSuccess.html',
	            controllerAs: 'vm'
	        })
			.when('/ranking', {
	            controller: 'RankingController',
	            templateUrl: viewBase + 'salermanager/ranking.html',
	            controllerAs: 'vm'
	        })
			.when('/reportline', {
	            controller: 'ReportController',
	            templateUrl: viewBase + 'report/reportLine.html',
	            controllerAs: 'vm'
	        })
			.when('/search', {
	            controller: 'SearchResultController',
	            templateUrl: viewBase + 'searchresult/searchresult.html',
	            controllerAs: 'vm'
	        })
			.when('/selectpartner', {
	            controller: 'SelectPartnerController',
	            templateUrl: viewBase + 'salermanager/selectPartner.html',
	            controllerAs: 'vm'
	        })
			.otherwise({ redirectTo: '/menus' });
    }]);
    
}());


