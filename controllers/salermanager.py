# -*- coding: utf-8 -*-
##############################################################################
#  COMPANY: BORN
#  AUTHOR: LIUHAO
#  EMAIL: arborous@gmail.com
#  VERSION : 1.0   NEW  2015/10/22
#  UPDATE : NONE
#  Copyright (C) 2011-2014 www.wevip.com All Rights Reserved
##############################################################################

from openerp import SUPERUSER_ID
from openerp import http
from openerp.http import request
from openerp.tools.translate import _
import openerp
import time,datetime
import logging
import json
from mako import exceptions
from mako.lookup import TemplateLookup
import base64
import os
import werkzeug.utils


_logger = logging.getLogger(__name__)

#MAKO
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

#服务APP
SER_THEME="defaultApp/views"
ser_path = os.path.join(BASE_DIR, "static", SER_THEME)
ser_tmp_path = os.path.join(ser_path, "tmp")
ser_lookup = TemplateLookup(directories=[ser_path],output_encoding='utf-8',module_directory=ser_tmp_path)

#动态切换数据库
def ensure_db(db='MAST',redirect='/except'):
    if not db:
        db = request.params.get('db')
 
    if db and db not in http.db_filter([db]):
        db = None
     
    if not db and request.session.db and http.db_filter([request.session.db]):
        db = request.session.db
         
    if not db:
        werkzeug.exceptions.abort(werkzeug.utils.redirect(redirect, 303))
    request.session.db = db


#获取模版信息
def serve_template(templatename, **kwargs):
    try:
        template = ser_lookup.get_template(templatename)
        return template.render(**kwargs)
    except:
        return exceptions.html_error_template().render()


class born_salermanager(http.Controller):
    
    @http.route('/except_manager', type='http', auth="none",)
    def Exception(self, **post):
        return serve_template('except.html')
    
    @http.route('/manager', type='http', auth="none")
    def manager_index(self,  **post):

        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        users_obj = request.registry.get('res.users')
        user=users_obj.browse(request.cr, SUPERUSER_ID, uid)
        
        return serve_template('index.html',user=user)

#获取销售人员列表
    @http.route('/manager/salers',type="http",auth="none")
    def salers(self,**post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        hr_obj = request.registry.get('hr.employee')
        hr_id= hr_obj.search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        saleteam_obj = request.registry.get('commission.team')
        domain=[('manager_id','=',hr_id)]
        tid = saleteam_obj.search(request.cr, SUPERUSER_ID, domain, context=request.context)
        team = saleteam_obj.browse(request.cr, SUPERUSER_ID, tid, context=request.context)
        partner_obj = request.registry.get('res.partner')
        data=[]
        for employee in team.employee_ids:
            partner_ids = partner_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',employee.id)], context=request.context)
            val = {
                   'name' : employee.name,
                   'tel' : employee.mobile_phone or employee.work_phone or '',
                   'id' : employee.id,
                   'number' : len(partner_ids),
            }
            data.append(val)
        return json.dumps(data,sort_keys=True)

#按商圈分配任务    
    @http.route('/manager/assign/<int:employee_id>',type="http",auth="none")
    def assignbybusiness(self,employee_id,**post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        business_ids = json.loads(post.get('assign'))
        partner_obj = request.registry.get('res.partner')
        partner_ids = partner_obj.search(request.cr, SUPERUSER_ID,[('business_id','in',business_ids)], context=request.context)
        partner_obj.write(request.cr,SUPERUSER_ID,partner_ids,{'employee_id':employee_id})
        return json.dumps(True,sort_keys=True)

#获取按商圈分配任务页面数据
    @http.route('/manager/assignarea',type="http",auth="none")
    def assignarea(self,**post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        hr_obj = request.registry.get('hr.employee')
        hr_id= hr_obj.search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        manager_id=hr_id
        saleteam_obj = request.registry.get('commission.team')
        domain=[('manager_id','=',manager_id)]
        tid = saleteam_obj.search(request.cr, SUPERUSER_ID, domain, context=request.context)
        team = saleteam_obj.browse(request.cr, SUPERUSER_ID, tid, context=request.context)
        business_obj = request.registry.get('born.business')
        subdivide_obj = request.registry.get('res.country.state.area.subdivide')
        partner_obj = request.registry.get('res.partner')
        data=[]
        
        #简化-获取符合格式的数据
        subdivide_ids = request.session.subdivide_ids
        business_ids = request.session.businessids
        for city in team.city_ids:
            sub_list = []
            city_number = 0
            ssubdivides_ids = subdivide_obj.search(request.cr, SUPERUSER_ID,[('country_id','=',city.id)], context=request.context)
            ssubdivides_ids = list(set(subdivide_ids) & set(ssubdivides_ids))
            subdivides = subdivide_obj.browse(request.cr, SUPERUSER_ID, ssubdivides_ids, context=request.context)
            for subdivide in subdivides:
                bus_list = []
                sbusiness_ids = business_obj.search(request.cr, SUPERUSER_ID,[('area_id','=',subdivide.id)], context=request.context)
                sbusiness_ids = list(set(business_ids) & set(sbusiness_ids))
                subdivide_number = 0
                businesses = business_obj.browse(request.cr, SUPERUSER_ID, sbusiness_ids, context=request.context)
                for business in businesses:
                    bus_partners = partner_obj.search(request.cr, SUPERUSER_ID,[('business_id','=',business.id),('employee_id','=',False)], context=request.context)
                    bus_val = {
                               'businessid' : business.id,
                               'business' : business.name,
                               'number' : len(bus_partners),
                    }
                    subdivide_number = subdivide_number+len(bus_partners)
                    bus_list.append(bus_val)
                sub_val = {
                    'regionid' : subdivide.id,
                    'region' : subdivide.name,
                    'business_list' : bus_list,
                    'number' : subdivide_number,
                }
                sub_list.append(sub_val)
                city_number = city_number+subdivide_number
            city_val = {
                        'cityid' : city.id,
                        'city':city.name,
                        'region_list':sub_list,
                        'number':city_number,
            }
            data.append(city_val)
            
        return json.dumps(data,sort_keys=True)
    
#获取按商户分配任务页面数据   
    @http.route('/manager/assignarea/<int:business_id>',type="http",auth="none")
    def assignpartner(self,business_id,**post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        indexPage = post.get('index',0)
        keyword = post.get('keyword','')
        if keyword == '':
            domain = [('business_id','=',business_id),('employee_id','=',False)]
        else:
            domain = [('business_id','=',business_id),('employee_id','=',False),'|',('name','like',keyword),('street','like',keyword)]
        partner_obj = request.registry.get('res.partner')
        partner_ids = partner_obj.search(request.cr, SUPERUSER_ID,domain,int(indexPage),10, context=request.context)
        partners = partner_obj.browse(request.cr, SUPERUSER_ID,partner_ids, context=request.context)
        data = []
        for partner in partners:
            val = {
                   'id' : partner.id,
                   'name' : partner.name,
                   'street' : partner.street or '无',
                   'person' : partner.child_ids.name or '无',
                   'tel' : partner.phone or partner.mobile or '无',
            }
            data.append(val)
        return json.dumps(data,sort_keys=True)
       
#按商户分配任务       
    @http.route('/manager/assignshop/<int:employee_id>',type="http",auth="none")
    def assignbyshop(self,employee_id,**post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        partner_ids = json.loads(post.get('shop'))
        partner_obj = request.registry.get('res.partner')
        partner_obj.write(request.cr,SUPERUSER_ID,partner_ids,{'employee_id':employee_id})
        
        return json.dumps(True,sort_keys=True)

#获取销售管理首页数据        
    @http.route('/manager/salepanel',type="http",auth="none")
    def salepanel(self,**post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        hr_obj = request.registry.get('hr.employee')
        hr_id= hr_obj.search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        manager_id=hr_id
        saleteam_obj = request.registry.get('commission.team')
        domain=[('manager_id','=',manager_id)]
        tid = saleteam_obj.search(request.cr, SUPERUSER_ID, domain, context=request.context)
        team = saleteam_obj.browse(request.cr, SUPERUSER_ID, tid, context=request.context)
        business_obj = request.registry.get('born.business')
        region_obj = request.registry.get('res.country.state.area.subdivide')
        partner_obj = request.registry.get('res.partner')
        
        #获取团队负责的所有商圈id，行政区id
        c_ids = set([city.id for city in team.city_ids])
        s_ids = set([subdivide.id for subdivide in team.subdivide_ids])
        country_ids = set([subdivide.country_id.id for subdivide in team.subdivide_ids])
        b_ids = set([business.id for business in team.business_ids])
        area_ids = set([business.area_id.id for business in team.business_ids])
        all_cityids = [val for val in c_ids.difference(country_ids)]
        exits_ids = region_obj.search(request.cr, SUPERUSER_ID,[('country_id','in',all_cityids)], context=request.context)
        s_ids = s_ids | set(exits_ids)
        all_business = [val for val in s_ids.difference(area_ids)]
        exits_business = business_obj.search(request.cr, SUPERUSER_ID,[('area_id','in',all_business)], context=request.context)
        b_ids = b_ids | set(exits_business)
        businesses_ids = [id for id in b_ids]
        subdivide_ids = [id for id in all_business]

        request.session.businessids = businesses_ids
        request.session.subdivide_ids = subdivide_ids
        shops = partner_obj.search(request.cr, SUPERUSER_ID,[('business_id','=',businesses_ids)], context=request.context)
        shop_success = partner_obj.search(request.cr, SUPERUSER_ID,[('business_id','=',businesses_ids),('state','=','installed')], context=request.context)
        shop_wait = partner_obj.search(request.cr, SUPERUSER_ID,[('business_id','=',businesses_ids),('state','=','tovisit',)], context=request.context)
        shop_visiting = partner_obj.search(request.cr, SUPERUSER_ID,[('business_id','=',businesses_ids),('state','=','visiting')], context=request.context)
        shop_nosaler = partner_obj.search(request.cr, SUPERUSER_ID,[('business_id','=',businesses_ids),('employee_id','=',False)], context=request.context)
        shop_saler = partner_obj.search(request.cr, SUPERUSER_ID,[('business_id','=',businesses_ids),('employee_id','!=',False)], context=request.context)
        
        track_obj = request.registry.get('born.partner.track')
        track_ids = track_obj.search(request.cr, SUPERUSER_ID,[('track_id','in',shops),('remark','=',False)], context=request.context)
        tracks = track_obj.browse(request.cr, SUPERUSER_ID, track_ids, context=request.context)
        data = []
        for track in tracks:
            if track.ways == 'call':
                ways_display=u'电话'
            elif track.ways == 'visit':
                ways_display=u'上门拜访'
            elif track.ways == 'message':
                ways_display=u'信息'
            elif track.ways == 'video':
                ways_display=u'视频'
            elif track.ways == 'other':
                ways_display=u'其他'
            else:
                ways_display=u'无'
            track_result = ''
            for track_results in track.result_ids:
                track_result = track_result+' '+track_results.name
            track_val = {
                         'trackid' : track.id,
                         'time' : track.track_time or '',
                         'saler' : track.employee_id.name or '',
                         'name' : track.track_id.name,
                         'ways' : ways_display or '',
                         'result' : track_result,
                         'notes' : track.notes or '',
                         'address' : track.track_id.street or ''
            }
            data.append(track_val)
        val = {
               'team_number' : len(team.employee_ids),
               'shop_number' : len(shops),
               'shop_success' : len(shop_success),
               'shop_wait' : len(shop_wait),
               'tracks' : data,
               'track_number' : len(tracks),
               'shop_nosaler' : len(shop_nosaler),
               'shop_saler' : len(shop_saler),
               'shop_visiting' : len(shop_visiting),
        }
        return json.dumps(val,sort_keys=True)

#获取单条拜访记录详情        
    @http.route('/manager/track/<int:track_id>',type="http",auth="none")
    def track(self,track_id,**post):        
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        track_obj = request.registry.get('born.partner.track')
        track = track_obj.browse(request.cr, SUPERUSER_ID, track_id, context=request.context)
        track_result = ''
        for track_results in track.result_ids:
            track_result = track_result+' '+track_results.name
        track_val = {
                         'trackid' : track.id,
                         'time' : track.track_time or '',
                         'saler' : track.employee_id.name,
                         'name' : track.track_id.name or '',
                         'result' : track_result or '',
                         'notes' : track.notes or '',
                         'address' : track.track_id.street,
                         'remark' : track.remark or ''
            }
        
        return json.dumps(track_val,sort_keys=True)

#销售经理批注        
    @http.route('/manager/approval',type="http",auth="none")
    def approval(self,**post):         
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        id = int(post.get('trackid'))
        track_obj = request.registry.get('born.partner.track')
        track_obj.write(request.cr,SUPERUSER_ID,id,{'remark':post.get('remark')})
        return json.dumps(True,sort_keys=True)

#获取商户列表（团队负责商户，已安装，待拜访，未分配，已分配）        
    @http.route('/manager/teamshop',type="http",auth="none")
    def teamshop(self,**post):   
        
        indexPage = post.get('index',0)
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
            
        partner_obj = request.registry.get('res.partner')
        businesses_ids = request.session.businessids
        if(post.get('states')=="all"):
            states = ['tovisit','visiting','installed']
        elif(post.get('states')=="installed"):
            states = ['installed']
        elif(post.get('states')=="wait"):
            states = ['tovisit']
        elif(post.get('states')=="visiting"):
            states = ['visiting']
        else:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        
        keyword = post.get('keyword','')
        type = post.get('type','')
        if keyword == '':
            if type == '':
                domain = [('business_id','in',businesses_ids),('state','in',states)]
            elif type == 'nosaler':
                domain = [('business_id','in',businesses_ids),('state','in',states),('employee_id','=',False)]
            else:
                domain = [('business_id','in',businesses_ids),('state','in',states),('employee_id','!=',False)]
        else:
            if type == '':
                domain = [('business_id','in',businesses_ids),('state','in',states),'|',('name','like',keyword),('street','like',keyword)]
            elif type == 'nosaler':
                domain = [('business_id','in',businesses_ids),('state','in',states),('employee_id','=',False),'|',('name','like',keyword),('street','like',keyword)]
            else:
                domain = [('business_id','in',businesses_ids),('state','in',states),('employee_id','!=',False),'|',('name','like',keyword),('street','like',keyword)]
            
        shop_ids = partner_obj.search(request.cr, SUPERUSER_ID,domain,int(indexPage),10, context=request.context)             
        shops = partner_obj.browse(request.cr, SUPERUSER_ID, shop_ids, context=request.context)
        data = []
        track_obj = request.registry.get('born.partner.track')
        for shop in shops:
            if shop.state == 'tovisit':
                state_display=u'待拜访'
            elif shop.state == 'visiting':
                state_display=u'拜访中'
            elif shop.state == 'lost':
                state_display=u'已丢失'
            elif shop.state == 'installed':
                state_display=u'已安装'
            else:
                state_display=u'无'     
            track_ids = track_obj.search(request.cr, SUPERUSER_ID,[('track_id','=',shop.id)], context=request.context)       
            val = {
                   'name' : shop.name,
                   'tel' : shop.phone or shop.mobile or '',
                   'address' : shop.street or '',
                   'state' : state_display,
                   'id' : shop.id,
                   'number' : len(track_ids) or 0
            }
            data.append(val)
        return json.dumps(data,sort_keys=True)
        
#获取分配任务内的销售人员信息
    @http.route('/manager/salerdetail/<int:saler_id>', type='http', auth="none",)
    def salerdetail(self,saler_id, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        employee_obj = request.registry.get('hr.employee')
        employee = employee_obj.browse(request.cr, SUPERUSER_ID, saler_id, context=request.context)   
        partner_obj = request.registry.get('res.partner') 
        business_obj = request.registry.get('born.business')
        
        sql = u""" select business_id from res_partner 
        where business_id is not null and employee_id=%s group by business_id 
        """% saler_id
        request.cr.execute(sql)
        business_ids=request.cr.fetchall()
        
        business_data = []
        business_list = []
        for business_id in business_ids:
            business = business_obj.browse(request.cr, SUPERUSER_ID, business_id[0], context=request.context)
            business_list.append(business.area_id.id)
            partner_ids = partner_obj.search(request.cr,SUPERUSER_ID,[('employee_id','=',saler_id),('business_id','=',business_id[0])], context=request.context)
            val = {
                   'name' : business.name,
                   'region_id' : business.area_id.id,
                   'id' : business.id,
                   'number' : len(partner_ids),
                   'region_name' : business.area_id.name,
            }
            business_data.append(val)
        t = list(set(business_list))
        region_data = []
        all_number = 0
        for area_id in t:
            number = 0
            business_newdata = []
            for val in business_data:
                if(val["region_id"]==area_id):
                    business_newdata.append(val)
                    name = val["region_name"] 
                    number+=val["number"]
            region_val = {
                   'name' : name,
                   'number' : number,
                   'business_list' : business_newdata,
            } 
            all_number+=number
            
            region_data.append(region_val)   
        data = {
                'name' : employee.name,
                'tel' : employee.work_phone or employee.mobile_phone or '',
                'region_list' : region_data,
                'number' : all_number,
                'id' : saler_id
        }
        
        return json.dumps(data,sort_keys=True)
         
#获取销售人员的负责商户信息
    @http.route('/manager/salershop/<int:saler_id>/<int:business_id>', type='http', auth="none",)
    def salershop(self,saler_id,business_id, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        indexPage = post.get('index',0)
        partner_obj = request.registry.get('res.partner') 
        keyword = post.get('keyword','')
        if keyword == '':
            domain = [('employee_id','=',saler_id),('business_id','=',business_id)]
        else:    
            domain = [('employee_id','=',saler_id),('business_id','=',business_id),'|',('name','like',keyword),('street','like',keyword)]
        partner_ids = partner_obj.search(request.cr, SUPERUSER_ID,domain,int(indexPage),10, context=request.context)
        partners = partner_obj.browse(request.cr, SUPERUSER_ID, partner_ids, context=request.context)
        track_obj = request.registry.get('born.partner.track')
        data=[]
        for shop in partners:
            track_ids = track_obj.search(request.cr, SUPERUSER_ID,[('track_id','=',shop.id)], context=request.context)       
            if shop.state == 'tovisit':
                state_display=u'待拜访'
            elif shop.state == 'visiting':
                state_display=u'拜访跟进中'
            elif shop.state == 'lost':
                state_display=u'已丢失'
            elif shop.state == 'installed':
                state_display=u'已安装'
            else:
                state_display=u'无'    
            val = {
                   'name' : shop.name,
                   'tel' : shop.phone or shop.mobile or '',
                   'address' : shop.street or '',
                   'state' : state_display,
                   'id' : shop.id,
                   'number' : len(track_ids),
            }
            data.append(val)
        return json.dumps(data,sort_keys=True)
    
#获取商户详细信息
    @http.route('/manager/shopdetail/<int:shop_id>', type='http', auth="none",)
    def shopdetail(self,shop_id, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        partner_obj = request.registry.get('res.partner')
        partner = partner_obj.browse(request.cr, SUPERUSER_ID, shop_id, context=request.context)
        partner_childids = partner_obj.search(request.cr, SUPERUSER_ID, [('parent_id','=',shop_id)], context=request.context)
        partner_childs = partner_obj.browse(request.cr, SUPERUSER_ID, partner_childids, context=request.context)
        child_data = []
        for child in partner_childs:
            c_val = {
                     'name' : child.name,
                     'tel' : child.phone or child.mobile or''
            }
            child_data.append(c_val)
        track_obj = request.registry.get('born.partner.track')
        track_ids = track_obj.search(request.cr, SUPERUSER_ID,[('track_id','=',shop_id)], context=request.context)
        tracks = track_obj.browse(request.cr, SUPERUSER_ID, track_ids, context=request.context)
        data = []
        number = 0
        for track in tracks:
            if track.ways == 'call':
                ways_display=u'电话'
            elif track.ways == 'visit':
                ways_display=u'上门拜访'
            elif track.ways == 'message':
                ways_display=u'信息'
            elif track.ways == 'video':
                ways_display=u'视频'
            elif track.ways == 'other':
                ways_display=u'其他'
            else:
                ways_display=u'无'
            track_result = ''
            for track_results in track.result_ids:
                track_result = track_result+' '+track_results.name
            track_val = {
                         'trackid' : track.id,
                         'time' : track.track_time,
                         'saler' : track.employee_id.name,
                         'name' : track.track_id.name,
                         'ways' : ways_display,
                         'result' : track_result,
                         'notes' : track.notes,
                         'address' : track.track_id.street,
                         'remark' : track.remark or ''
            }
            number+=1
            data.append(track_val)

        if partner.state == 'tovisit':
            state_display=u'待拜访'
        elif partner.state == 'visiting':
            state_display=u'拜访中'
        elif partner.state == 'lost':
            state_display=u'已丢失'
        elif partner.state == 'installed':
            state_display=u'已安装'
        else:
            state_display=''  
        val = {
               'id' : partner.id,
               'name' : partner.name,
               'state' : state_display,
               'employee' : partner.employee_id.name or '',
               'type' : partner.categorys_id.name or '',
               'address' : partner.street or '',
               'comment' : partner.comment or '',
               'child_list' : child_data,
               'track_list' : data,
               'number' : number,
               'environment' : partner.partner_environment_id.name or '',
               'size' : partner.partner_size_id.name or '',
               'employee_number' : partner.partner_employee_id.name or '',
               'room' : partner.partner_room_id.name or '',
               'business' : partner.business_id.name or '',
        }
        return json.dumps(val,sort_keys=True)

#更改商户负责人
    @http.route('/manager/changesaler/<int:shopid>/<int:salerid>', type='http', auth="none",)
    def changesaler(self,shopid,salerid ,**post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        partner_obj = request.registry.get('res.partner')
        partner_obj.write(request.cr,SUPERUSER_ID,shopid,{'employee_id':salerid})
        return json.dumps(True,sort_keys=True)
  
#移交销售人员的全部负责商户
    @http.route('/manager/allchangesaler/<int:ysalerid>/<int:salerid>', type='http', auth="none",)
    def allchangesaler(self,ysalerid,salerid ,**post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        partner_obj = request.registry.get('res.partner')
        partner_ids = partner_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',ysalerid)], context=request.context)
        partner_obj.write(request.cr,SUPERUSER_ID,partner_ids,{'employee_id':salerid})
        return json.dumps(True,sort_keys=True)
  
#取消销售人员的全部负责商户
    @http.route('/manager/cancel/<int:salerid>', type='http', auth="none",)
    def cancel(self,salerid ,**post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        partner_obj = request.registry.get('res.partner')
        partner_ids = partner_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',salerid)], context=request.context)
        partner_obj.write(request.cr,SUPERUSER_ID,partner_ids,{'employee_id':''})
        return json.dumps(True,sort_keys=True)

#拜访中商户及跟踪记录列表
    @http.route('/manager/accounts', type='http', auth="none",)
    def track_list(self ,**post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        business_ids = request.session.businessids
        partner_obj = request.registry.get('res.partner')
  
        display_type = post.get('display','day')
        current_date = post.get('current_date',False)
        current_week = post.get('current_week',False)
        current_year = post.get('current_year',False)
        current_month = post.get('current_month',False)
        direction = post.get('direction',0)
  
        date_from = post.get('date_from',current_date)
        date_to = post.get('date_to',current_date)
        keyword = post.get('keyword','')
  
        #计算当前的时间
        if not current_date or current_date=='':
            today = datetime.date.today()
            current_date=today.strftime("%Y-%m-%d")
            current_month=today.strftime("%Y-%m")
            current_year=today.strftime("%Y")
            current_week='%s %s' % (current_year,int(today.strftime("%W"))+1)
  
        display_current=current_date
        filter_week_year=current_week.split(' ')[0]
        filter_week=current_week.split(' ')[1]
  
        if direction=='1':
            if display_type =='day':
                today=datetime.datetime.strptime(current_date,'%Y-%m-%d')
                current_date= today + datetime.timedelta(days=1)
                current_date=current_date.strftime("%Y-%m-%d")
            elif display_type == 'month':
                today=datetime.datetime.strptime(current_month+'-01','%Y-%m-01')
                current_month=today.replace(month=(today.month + 1 - 1) % 12 + 1, year=today.year if today.month < 12 else today.year + 1)
                current_month=current_month.strftime("%Y-%m")
            elif display_type=='year':
                current_year=int(current_year)+1
            elif display_type=='week':
                filter_week=int(filter_week)+1
                new_date = datetime.date(int(filter_week_year)+1,01,01)
                new_date = new_date + datetime.timedelta(days=-1)
                max_filter_week = new_date.strftime("%W")
                if int(filter_week) > int(max_filter_week):
                    filter_week=1
                    filter_week_year=int(filter_week_year)+1
                current_week='%s %s' % (filter_week_year,filter_week)

        elif direction=='-1':
            if display_type=='day':
                today=datetime.datetime.strptime(current_date,'%Y-%m-%d')
                current_date= today + datetime.timedelta(days=-1)
                current_date=current_date.strftime("%Y-%m-%d")
            elif display_type=='month':
                today=datetime.datetime.strptime(current_month+'-01','%Y-%m-01')
                current_month= today + datetime.timedelta(days=-1)
                current_month=current_month.strftime("%Y-%m")
            elif display_type=='year':
                current_year=int(current_year)-1
            elif display_type=='week':
                filter_week=int(filter_week)-1
                #前一年的最后一周
                if filter_week <= 0:
                    new_date = datetime.date(int(filter_week_year),01,01)
                    new_date = new_date + datetime.timedelta(days=-1)
                    filter_week = new_date.strftime("%W")
                    filter_week_year = int(filter_week_year)-1
                current_week='%s %s' % (filter_week_year,filter_week)
  
        partner_ids = partner_obj.search(request.cr, SUPERUSER_ID,[('business_id','in',business_ids),('state','=','visiting')], context=request.context) 
        partners = partner_obj.browse(request.cr, SUPERUSER_ID, partner_ids)
        where = ""
        if display_type=='day':
            display_current=current_date
            where +="  and TO_CHAR(bpt.track_time,'YYYY-MM-DD') = '%s' " % (current_date)
        elif display_type=='month':
            display_current=current_month
            where += "  and TO_CHAR(bpt.track_time,'YYYY-MM') = '%s' " % (current_month)
        elif display_type=='year':
            display_current=current_year
            where += "  and TO_CHAR(bpt.track_time,'YYYY') = '%s' " % (current_year)
        elif display_type=='week':
            display_current= current_week
            where += "  and TO_CHAR(bpt.track_time,'YYYY') = '%s' and extract('week' from bpt.track_time)::varchar = '%s' " % (filter_week_year,filter_week)
        elif display_type =='date':
            if date_from != '' and date_from!='NaN-NaN-NaN':
                where += "and TO_CHAR(bpt.track_time,'YYYY-MM-DD') >= '%s'  " % (date_from)
            if date_to != '' and date_to!='NaN-NaN-NaN':
                where += " and TO_CHAR(bpt.track_time,'YYYY-MM-DD') <= '%s' " % (date_to)
        
        data = []
        for partner in partners:
            sql = """
                select bpt.id  ,bpt.notes,
                bpt.ways,
                bpt.remark,
                bpt.track_time as time,
                bpt.track_id,
                bpt.write_date,
                b.street as address,
                c.name_related as saler , string_agg( btr.name ,',' )  as results  from born_partner_track bpt join res_track_result_rel rtr on bpt.id = rtr.t_id
                join born_track_result btr on rtr.rid = btr.id 
                join hr_employee c on bpt.employee_id = c.id 
                join res_partner b on bpt.track_id = b.id 
                where bpt.track_id = '%s' %s GROUP BY bpt.id ,b.street,c.name_related
            """ %(partner.id,where)
            request.cr.execute(sql)
            operates = request.cr.dictfetchall()
            if operates:
                partner_val = {
                       'name' : partner.name,
                       'track_list' : operates,
                       'number' : len(operates),
                }
                data.append(partner_val)
        val = {
            'display':display_type,
            'accounts':data,
            'current_date':current_date,
            'current_month':current_month,
            'current_year':current_year,
            'current_week':current_week,
            'display_current':display_current,
            'date_to':date_to,
            'date_from':date_from,
            'keyword':keyword,
        }
        return json.dumps(val,sort_keys=True)
         














