(function () {

    var injectParams = ['$http', '$q'];

    var productsFactory = function ($http, $q) {
        var serviceBase = '/manager/',
            factory = {};

        //获取消息
        factory.getMessagesPages = function (pageIndex) {
        	 return $http.get(serviceBase + 'messages', {
     			params : {
                    index:pageIndex
     			}
     			}).then(function(results) {
     				return results.data;
     			});
        };

        //获取工作台数据
        factory.getPanel = function () {
        	return $http.get(serviceBase + 'panel').then(function(results) {
        		return results.data;
        	});
        };
        
        //修改个人信息
        factory.regiest = function (setting) {
        	return $http.post(serviceBase + 'regiest', setting).then(function (status) {
                return status.data;
            });
        }

        //获取设置数据
        factory.getSetting = function () {
            return $http.get(serviceBase + 'user').then(function(results) {
                return results.data;
            });
        };

        //获取公司列表
        factory.getCompanys = function (pageIndex,keyword) {

            return $http.get(serviceBase + 'companys', {
     			params : {
                    index:pageIndex,
                    keyword:keyword
     			}
     			}).then(function(results) {
     				return results.data;
     			});

        };

        //获取公司详细信息
        factory.getCompanyDetail = function (id) {
        	return $http.get(serviceBase + 'company/' + id).then(function(results) {
        		return results.data;
        	});
        };

        //获取最新动态列表
        factory.getShops = function (companyId) {

            return $http.get(serviceBase + 'shops', {
     			params : {
                    company_id:companyId,
     			}
     			}).then(function(results) {
     				return results.data;
     			});
        };

        //获取终端数据
        factory.getLicensesPages = function (companyId,pageIndex) {

            return $http.get(serviceBase + 'licenses', {
     			params : {
                    company_id:companyId,
                    index:pageIndex,
     			}
     			}).then(function(results) {
     				return results.data;
     			});
        };

        //获取终端数据
        factory.getUsers = function (companyId) {

            return $http.get(serviceBase + 'users', {
     			params : {
                    company_id:companyId,
     			}
     			}).then(function(results) {
     				return results.data;
     			});
        };

        //获取消息
        factory.getCashPages = function (pageIndex,type) {
        	 return $http.get(serviceBase + 'cashs', {
     			params : {
                    index:pageIndex,
                    type:type
     			}
     			}).then(function(results) {
     				return results.data;
     			});
        };

		//更改终端状态
        factory.updateLicense = function (id) {
            return $http.get(serviceBase + 'updateLicense', {
    			params : {
	            	id:id,
    				}
    			}).then(function(results) {
    				return results.data;
    			});
        };


		factory.updateCompany = function (id) {
            return $http.get(serviceBase + 'updateCompany', {
    			params : {
	            	id:id,
    				}
    			}).then(function(results) {
    				return results.data;
    			});
        };


		  //获取Partner列表
        factory.getPartners = function (pageIndex,keyword,stateFilter) {

            return $http.get(serviceBase + 'partners', {
                params : {
                    index:pageIndex,
                    keyword:keyword,
                    statefilter:stateFilter
                }
                }).then(function(results) {
                    return results.data;
                });

        };

        //获取Partner详细信息
        factory.getPartnerDetail = function (id) {
            return $http.get(serviceBase + 'partners/' + id).then(function(results) {
                return results.data;
            });
        };

        //获取联系人
        factory.getContact = function (partnerId,contactId) {
            return $http.get(serviceBase +'partners/'+partnerId+'/'+contactId).then(function(results) {
                return results.data;
            });
        };

        //保存联系人
        factory.submitContact = function (partnerId,contactId,contact) {
            return $http.post(serviceBase +'partners/'+partnerId+'/'+contactId+'/submitContact',contact).then(function(results) {
                return results.data;
            });
        };


        //保存partner
        factory.submitPartner = function (partnerId,partner) {
            return $http.post(serviceBase +'partners/'+partnerId+'/submitPartner',partner).then(function(results) {
                return results.data;
            });
        };



        //获取省
        factory.getState = function () {
            return $http.get(serviceBase +'partners/getstate').then(function(results) {
                return results.data;
            });
        };

        //获取市
        factory.getArea = function (stateId) {
            return $http.get(serviceBase +'partners/getarea/bystateid/'+stateId).then(function(results) {
                return results.data;
            });
        };

        //获取县
        factory.getSubdivide = function (areaId) {
            return $http.get(serviceBase +'partners/getsubdivide/byareaid/'+areaId).then(function(results) {
                return results.data;
            });
        };

        //获取商圈
        factory.getBusiness = function (subdivideId) {
            return $http.get(serviceBase +'partners/getbusiness/bysubdivideid/'+subdivideId).then(function(results) {
                return results.data;
            });
        };

        //获取组内销售人员数据
        factory.getSalers = function () {
            return $http.get(serviceBase + 'salers').then(function(results) {
                return results.data;
            });
        };
        //获取可分配任务商圈数据
        factory.getassignarea = function () {
            return $http.get(serviceBase + 'assignarea').then(function(results) {
                return results.data;
            });
        };
        //获取可分配任务商户数据
        factory.getassignshop = function (id,pageIndex,keyword) {
            return $http.get(serviceBase + 'assignarea/'+id,{
            	params : {
                index:pageIndex,
                keyword:keyword
 			}
            }).then(function(results) {
                return results.data;
            });
        };
        //获取销售经理首页数据
        factory.getSalepanel = function (id) {
            return $http.get(serviceBase + 'salepanel').then(function(results) {
                return results.data;
            });
        };
        //按商圈分配任务
        factory.assign = function (assign,id) {
            return $http.post(serviceBase + 'assign/'+id, assign).then(function (status) {
                return status.data;
            });
        };
        //按商户分配任务
        factory.assignshop = function (shop,id) {
            return $http.post(serviceBase + 'assignshop/'+id, shop).then(function (status) {
                return status.data;
            });
        };
        //获取拜访记录详情
        factory.gettrack = function (id) {
            return $http.get(serviceBase + 'track/'+id).then(function (results) {
                return results.data;
            });
        };
        //销售经理批注
        factory.approval = function (data) {
            return $http.post(serviceBase + 'approval', data).then(function (status) {
                return status.data;
            });
        };
        //获取团队负责商户信息
        factory.getteamshop = function (pageIndex,states,keyword,type) {
            return $http.get(serviceBase + 'teamshop',{
            	params : {
                index:pageIndex,
                states:states,
                keyword:keyword,
                type:type
 			}
            }).then(function (results) {
                return results.data;
            });
        };
        //获取销售负责商户信息
        factory.getsalershop = function (pageIndex,id,id2,keyword) {
        	return $http.get(serviceBase + 'salershop/'+id+'/'+id2,{
            	params : {
                index:pageIndex,
                keyword:keyword
 			}        		
        	}).then(function (results) {
        		return results.data;
        	});
        };
        //获取更换销售列表信息
        factory.getchangesalers = function () {
        	return $http.get(serviceBase + 'changesalers/').then(function (results) {
        		return results.data;
        	});
        };
        //获取销售负责商户信息
        factory.getsalerdetail = function (id) {
        	return $http.get(serviceBase + 'salerdetail/'+id).then(function (results) {
        		return results.data;
        	});
        };
        //获取商户详细信息
        factory.getshopdetail = function (id) {
        	return $http.get(serviceBase + 'shopdetail/'+id).then(function (results) {
        		return results.data;
        	});
        };
        //修改商户销售担当
        factory.changesaler = function (shopid,salerid) {
        	return $http.post(serviceBase + 'changesaler/'+shopid+'/'+salerid).then(function (status) {
        		return status.data;
        	});
        };
        //全部移交
        factory.allchangesaler = function (ysalerid,salerid) {
            return $http.post(serviceBase + 'allchangesaler/'+ysalerid+'/'+salerid).then(function (status) {
                return status.data;
            });
        };
        //全部取消
        factory.cancel = function (salerid) {
            return $http.post(serviceBase + 'cancel/'+salerid).then(function (status) {
                return status.data;
            });
        };
        //拜访中列表
        factory.gettracklist = function (display,index,current_date,current_week,current_year,current_month,direction,date_from,date_to,keyword, shop_id) {
        	 return $http.get(serviceBase + 'accounts', {
     			params : {
                    display:display,
                    index:index,
                    current_date:current_date,
                    current_week:current_week,
                    current_year:current_year,
                    current_month:current_month,
                    direction:direction,
                    date_from:date_from,
                    date_to:date_to,
                    keyword:keyword,
                    shop_id:shop_id,
                }
            }).then(function(results) {
                return results.data;
            });
        };
        //获取商户详细信息
        factory.getMenu = function (id) {
        	return $http.get(serviceBase + 'menu').then(function (results) {
        		return results.data;
        	});
        };

        return factory;
    };

    productsFactory.$inject = injectParams;

    angular.module('managerApp').factory('shopService', productsFactory);

}());