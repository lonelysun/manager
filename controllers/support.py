# -*- coding: utf-8 -*-
##############################################################################
#  COMPANY: BORN
#  AUTHOR: KIWI
#  EMAIL: arborous@gmail.com
#  VERSION : 1.0   NEW  2014/07/21
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
import hashlib
from io import BytesIO
import boto3,os

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

#服务
class born_manager_sale(http.Controller):


    def __init__(self):

        self.__bucketname = openerp.tools.config['s3_bucketname']
        self.__region = openerp.tools.config['s3_region']
        self.__aws_access_key_id = openerp.tools.config['s3_access_key_id']
        self.__aws_secret_access_key = openerp.tools.config['s3_secret_access_key']
        self.__session = boto3.Session(aws_access_key_id=self.__aws_access_key_id,
                                  aws_secret_access_key=self.__aws_secret_access_key,
                                  region_name=self.__region)
        self.__s3 = self.__session.resource('s3')


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

    @http.route('/manager/support/initdata', type='http', auth="none",)
    def support_initdata(self, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        if int(post.get('hr_id_for_manager')) != 0:
            hr_id = int(post.get('hr_id_for_manager'))
        else:
            hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
            hr_id = hr_id_list[0] or ''


        # 获取待处理任务数量
        mission_obj = request.registry['born.partner.track']
        ids = mission_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',hr_id),('state','not in',('finished','done'))],context=request.context)
        mission_number = len(ids)


        # 获取负责的公司数量
        company_obj = request.registry['res.company']
        ids = mission_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',hr_id)],context=request.context)
        company_number= len(ids)

        # 获取头像
        hr_obj = request.registry['hr.employee']
        obj = hr_obj.browse(request.cr, SUPERUSER_ID,hr_id,context=request.context)
        image = obj.user_id.image_medium

        # 获取是否有未读信息
        push_obj = request.registry.get('born.push')
        push_domain=[('type','=','internal'),('user_id','=',int(uid))]
        service_ids = push_obj.search(request.cr, SUPERUSER_ID, push_domain,0,1,order="create_date desc", context=request.context)
        push = push_obj.browse(request.cr, SUPERUSER_ID,service_ids, context=request.context)


        data = {
            'mission_number':mission_number,
            'company_number':company_number,
            'image':image,
            'push_state' : push.state,
        }

        return json.dumps(data,sort_keys=True)


    @http.route('/manager/support/missions', type='http', auth="none",)
    def support_missions(self, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        page_index=post.get('index',0)

        keyword=post.get('keyword','')


        require_mission_state = post.get('mission_state')


        if int(post.get('hr_id_for_manager')) != 0:
            hr_id = int(post.get('hr_id_for_manager'))
        else:
            hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
            hr_id = hr_id_list[0] or ''

        mission_obj = request.registry['born.partner.track']

        # 根据前台传来的参数判断获取已完成的任务还是未完成的任务
        ids = []
        if require_mission_state == 'ok':
            if keyword == '':
                ids = mission_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',hr_id),('state','in',('finished','done'))],int(page_index),5, order="write_date desc", context=request.context)
            else:
                ids = mission_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',hr_id),('state','in',('finished','done')),('name','like',keyword)],int(page_index),5, order="write_date desc",context=request.context)

        elif require_mission_state == 'notOk':
            if keyword == '':
                ids = mission_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',hr_id),('state','not in',('finished','done'))],int(page_index),5, order="write_date desc",context=request.context)
            else:
                ids = mission_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',hr_id),('state','not in',('finished','done')),('name','like',keyword)],int(page_index),5, order="write_date desc",context=request.context)

        objs = mission_obj.browse(request.cr, SUPERUSER_ID,ids, context=request.context)
        missions_list = []

        for each_obj in objs:

            mission_id = each_obj.id
            company_id = each_obj.track_id.id
            mission_name = each_obj.name or u'无'
            mission_contacts_phone = each_obj.contacts_phone or u'无'
            mission_contacts_name = each_obj.contacts_id.name or u'无'
            if each_obj.mission_date:
                mission_date = (each_obj.mission_date)[5:10]
            else:
                mission_date = u'无'
            mission_address = each_obj.contacts_address or u'无'
            mission_state = each_obj.state

            state_name_dict = {'start':u'开始','pause':u'暂停','finished':u'完成','notstart':u'未开始'}

            mission_state_name = state_name_dict.get(mission_state)

            vals = {
                'mission_id':mission_id,
                'company_id':company_id,
                'mission_name':mission_name,
                'mission_state_name':mission_state_name,
                'mission_contacts_phone':mission_contacts_phone,
                'mission_contacts_name':mission_contacts_name,
                'mission_date':mission_date,
                'mission_address':mission_address,
                'mission_state':mission_state
            }
            missions_list.append(vals)


        ids = mission_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',hr_id),('state','in',('finished','done'))],context=request.context)
        missions_finished_numbers = len(ids)


        data = {
            'missions_list':missions_list,
            'missions_finished_numbers':missions_finished_numbers
        }
        return json.dumps(data,sort_keys=True)


    #获取公司列表信息
    @http.route('/manager/support/companys', type='http', auth="none",)
    def support_companys(self, **post):

        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        page_index=post.get('index',0)

        keyword=post.get('keyword','')
        if keyword == '':
            where = " and true"
        else:
            where = " and (c.name like '%%%s%%') " %(keyword)


        if int(post.get('hr_id_for_manager')) != 0:
            hr_id = int(post.get('hr_id_for_manager'))
        else:
            hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
            hr_id = hr_id_list[0] or ''

        sql=u"""
            with tmp_a as (select b.company_id ,b.create_date::date as create_day,coalesce(count(*),0) cnt from born_operate_sync b
                group by b.company_id ,b.create_date::date) ,
                tmp_b as (select company_id,create_day,cnt from tmp_a
                where create_day=now()::date)
                select c.id,c.name as company_name,coalesce(count(a.create_day),0) days,coalesce(sum(a.cnt),0) cnt_operate,coalesce(sum(b.cnt),0) as cnt_today ,c.create_date
                from res_company c left join tmp_a a
                 on a.company_id=c.id left join tmp_b b
                  on a.company_id=b.company_id
			    where c.employee_id = %s
			    %s
			    group by 1

		        order by days asc
		        limit 10 offset %s
                ;
        """%(hr_id,where,page_index)

        request.cr.execute(sql)
        companys = request.cr.dictfetchall()

        companys_list = []

        for each_company in companys:
            # if each_company['days'] == 0:
            #     daily_average = 0
            # else:
            #     daily_average = round((each_company['cnt_operate'])/(each_company['days']),1)

            # 注册时间
            register_date_str = each_company['create_date']
            register_date_year = register_date_str[2:4]
            register_date_month = register_date_str[5:7]
            register_date_day = register_date_str[8:10]

            vals = {
                'company_id':each_company['id'],
                'company_name':each_company['company_name'],
                'use_days':each_company['days'],
                'total_operate_number':each_company['cnt_operate'],
                'today_operate_number':each_company['cnt_today'],
                # 'daily_average': daily_average
                'register_date_year':register_date_year,
                'register_date_month':register_date_month,
                'register_date_day':register_date_day
            }
            companys_list.append(vals)

        data = {
            'companys_list':companys_list
        }

        return json.dumps(data,sort_keys=True)