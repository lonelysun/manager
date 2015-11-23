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


    #获取partner列表信息
    @http.route('/manager/saler/companys', type='http', auth="none",)
    def saler_companys(self, **post):

        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        page_index=post.get('index',0)

        keyword=post.get('keyword','')


        hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        hr_id = hr_id_list[0] or ''

        company_obj = request.registry['res.company']

        sql=u"""
            with tmp_a as (select b.company_id ,b.create_date::date as create_day,coalesce(count(*),0) cnt from born_operate_sync b
                group by b.company_id ,b.create_date::date) ,
                tmp_b as (select company_id,create_day,cnt from tmp_a
                where create_day=now()::date)
                select c.id,c.name as company_name,coalesce(count(a.create_day),0) days,coalesce(sum(a.cnt),0) cnt_operate,coalesce(sum(b.cnt),0) as cnt_today from res_company c left join tmp_a a
                 on a.company_id=c.id left join tmp_b b
                  on a.company_id=b.company_id
			    group by 1
		        order by c.id desc
		        limit 10 offset %s
                ;
        """%(page_index)

        request.cr.execute(sql)
        companys = request.cr.dictfetchall()

        companys_list = []

        _logger.info(companys);

        for each_company in companys:
            if each_company['days'] == 0:
                daily_average = 0
            else:
                daily_average = (each_company['cnt_operate'])/(each_company['days'])

            vals = {
                'company_id':each_company['id'],
                'company_name':each_company['company_name'],
                'use_days':each_company['days'],
                'total_operate_number':each_company['cnt_operate'],
                'today_operate_number':each_company['cnt_today'],
                'daily_average': daily_average
            }
            companys_list.append(vals)

        data = {
            'companys_list':companys_list
        }
        _logger.info('-----------saler_companys------------')
        _logger.info(data)

        return json.dumps(data,sort_keys=True)


    @http.route('/manager/saler/missions', type='http', auth="none",)
    def saler_missions(self, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        page_index=post.get('index',0)

        keyword=post.get('keyword','')

        require_mission_state = post.get('mission_state')


        hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        hr_id = hr_id_list[0] or ''



        mission_obj = request.registry['born.partner.track']

        # 根据前台传来的参数判断获取已完成的任务还是未完成的任务
        if require_mission_state == 'finished':
            ids = mission_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',hr_id),('state','=','finished')],int(page_index),3, context=request.context)
        else:
            ids = mission_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',hr_id),('state','!=','finished')],int(page_index),3, context=request.context)


        _logger.info('----------ids--------------------')
        _logger.info(ids)
        objs = mission_obj.browse(request.cr, SUPERUSER_ID,ids, context=request.context)
        missions_list = []

        for each_obj in objs:
            mission_id = each_obj.id
            company_id = each_obj.track_id.id
            mission_company_name = each_obj.track_id.name
            mission_contacts_phone = each_obj.contacts_phone
            mission_contacts_name = each_obj.contacts_id.name
            mission_date = (each_obj.mission_date)[5:10]
            mission_address = each_obj.contacts_address
            mission_state = each_obj.state



            vals = {
                'mission_id':mission_id,
                'company_id':company_id,
                'mission_company_name':mission_company_name,
                'mission_contacts_phone':mission_contacts_phone,
                'mission_contacts_name':mission_contacts_name,
                'mission_date':mission_date,
                'mission_address':mission_address,
                'mission_state':mission_state
            }
            missions_list.append(vals)


        ids = mission_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',hr_id),('state','=','finished')],context=request.context)
        missions_unfinished_numbers = len(ids)

        _logger.info('----------missions_unfinished_numbers--------------------')
        _logger.info(missions_unfinished_numbers)


        data = {
            'missions_list':missions_list,
            'missions_unfinished_numbers':missions_unfinished_numbers
        }
        _logger.info('----------misssion--------------------')
        _logger.info(data)
        return json.dumps(data,sort_keys=True)



    @http.route('/manager/saler/partners', type='http', auth="none",)
    def saler_partners(self, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        page_index=post.get('index',0)

        keyword=post.get('keyword','')

        hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        hr_id = hr_id_list[0] or ''


        # partner_obj = request.registry['res.partner']
        # mission_obj = request.registry['born.partner.track']
        #
        # mission_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',hr_id)],int(page_index),3, context=request.context)
        #
        # ids = partner_obj.search(request.cr, SUPERUSER_ID,[('has_installed','=',False),('state','=','finished')],int(page_index),10, context=request.context)

        sql = u"""
                SELECT
                    tb1.id,
                    tb1.name,
                    COUNT (tb2.id) AS cnt
                FROM
                    res_partner tb1
                RIGHT JOIN
                    born_partner_track tb2
                ON
                    tb1.id = tb2.track_id
                WHERE
                    true
                AND
                    tb2.employee_id = %s
                GROUP BY
                    tb1.id,tb1.name
                ORDER By
                    tb1.id DESC
                LIMIT
                    10
                OFFSET
                    %s

        """% (hr_id, page_index)


        # this is real!!!
        # sql = u"""
        #         SELECT
        #             tb1.id,
        #             tb1.name,
        #             COUNT (tb2.id)
        #         FROM
        #             res_partner tb1
        #         RIGHT JOIN
        #             born_partner_track tb2
        #         ON
        #             tb1.id = tb2.track_id
        #         WHERE
        #             tb1.has_installed = false
        #             true
        #         AND
        #             tb2.employee_id = %s
        #         GROUP BY
        #             tb1.id,tb1.name
        #         ORDER By
        #             tb1.id DESC
        #         LIMIT
        #             10
        #         OFFSET
        #             %s
        #
        # """% (hr_id, page_index)

        request.cr.execute(sql)
        partners = request.cr.dictfetchall()

        _logger.info('sql partners')
        _logger.info(partners)

        partners_list = []
        for each_partner in partners:

            vals = {
                'partner_id':each_partner['id'],
                'partner_name':each_partner['name'],
                'missions_count':each_partner['cnt'],
            }
            partners_list.append(vals)

        data = {
            'partners_list':partners_list
        }
        _logger.info('----------partner--------------------')
        _logger.info(data)

        return json.dumps(data,sort_keys=True)


    @http.route('/manager/saler/initdata', type='http', auth="none",)
    def saler_initdata(self, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        page_index=post.get('index',0)

        keyword=post.get('keyword','')

        hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        hr_id = hr_id_list[0] or ''


        mission_obj = request.registry['born.partner.track']
        ids = mission_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',hr_id),('state','!=','finished')],context=request.context)
        mission_number = len(ids)


        sql=u"""
            with tmp as (select count(tb1.id),tb1.name as cnt
            from res_partner tb1
            right join born_partner_track tb2
            on tb1.id = tb2.track_id
            where  tb2.employee_id = %s
            group by tb1.id) select count(*) from tmp
            """ % (hr_id)

        _logger.info('----------initdata------sql--------------------')
        _logger.info(sql)

        request.cr.execute(sql)
        res_count=request.cr.fetchall()

        _logger.info('----------initdata------res_count--------------------')
        _logger.info(res_count)

        partner_number= int(res_count and res_count[0][0] or 0)

        data = {
            'mission_number':mission_number,
            'partner_number':partner_number
        }

        _logger.info('----------initdata--------------------')
        _logger.info(data)
        return json.dumps(data,sort_keys=True)











