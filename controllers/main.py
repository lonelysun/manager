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
class born_manager(http.Controller):
    
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




    #获取可显示权限
    @http.route('/manager/menu', type='http', auth="none",)
    def menu(self, **post):
        
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        hr_obj = request.registry.get('hr.employee')
        hr_id= hr_obj.search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        saleteam_obj = request.registry.get('commission.team')
        domain=[('manager_id','in',hr_id)]
        tid = saleteam_obj.search(request.cr, SUPERUSER_ID, domain, context=request.context)
        team = saleteam_obj.browse(request.cr, SUPERUSER_ID, tid, context=request.context)
        employee_ids = []
        for employee in team.employee_ids:
            employee_ids.append(employee.id)

        request.session.employee_ids = employee_ids
        users_obj = request.registry.get('res.users')
        user=users_obj.browse(request.cr, SUPERUSER_ID, uid)
       
            
        val = {
               'option':user.role_option,
        }
        # val = {
        #        'ismanager' : True,
        #        'issaler' : True,
        #        'option':1,
        #        'companys' : data,
        # }
        return json.dumps(val,sort_keys=True)
    
    #获取消息信息
    @http.route('/manager/messages', type='http', auth="none",)
    def messages(self, **post):

        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        page_index=post.get('index',0)
        data = []

        push_obj = request.registry.get('born.push')
        domain=[('type','=','boss'),('user_id','=',int(uid))]
        service_ids = push_obj.search(request.cr, SUPERUSER_ID, domain,int(page_index),10,order="id desc", context=request.context)
        for push in push_obj.browse(request.cr, SUPERUSER_ID,service_ids, context=request.context):
            val_message={
                 'title': push.title or '',
                 'content' : push.content or '',
                 'create_date' : push.create_date,
            }
            data.append(val_message)
        return json.dumps(data,sort_keys=True)

    #获取工作台信息
    @http.route('/manager/panel', type='http', auth="none")
    def panel(self,  **post):

        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        #公司总数
        sql=u""" select count(id) as cnt  from res_company tb1  where id>1 """
        request.cr.execute(sql)
        res_count=request.cr.fetchall()
        company_count= int(res_count and res_count[0][0] or 0)

        #终端审核数据
        sql=u""" select count(id) as cnt  from born_license  """
        request.cr.execute(sql)
        res_count=request.cr.fetchall()
        license_count= int(res_count and res_count[0][0] or 0)

        #现金流
        sql=u""" SELECT  sum(
            case when type in ('card','recharge','active','lost','upgrade','refund') then now_amount
            when type in ('repayment') then now_card_amount
            when type in ('buy','consume') then now_amount+now_card_amount else 0 end) as xianjin
             from born_operate_sync;  """
        request.cr.execute(sql)
        res_count = request.cr.fetchall()
        cash_total= int(res_count and res_count[0][0] or 0)

        #卡消耗
        sql=u""" SELECT  sum(abs(now_card_amount)) +sum(consume_amount) as xiaohao
             from born_operate_sync where type in ('buy','consume'); """
        request.cr.execute(sql)
        res_count = request.cr.fetchall()
        consume_total= int(res_count and res_count[0][0] or 0)

        #业务列表
        sql=u""" select type, SUM(now_amount+consume_amount) as total,count(id) as cnt  from  born_operate_sync  group by type  """
        request.cr.execute(sql)
        operates = request.cr.dictfetchall()
        operate_data=[]
        for operate in operates:

            type=operate['type']
            type_display=type
            if type=='upgrade':
                type_display='卡升级'
            elif type=='refund':
                type_display='退款'
            elif type=='retreat':
                type_display='退货'
            elif type=='consume':
                type_display='消费'
            elif type=='card':
                type_display='开卡'
            elif type=='lost':
                type_display='挂失'
            elif type=='active':
                type_display='激活'
            elif type=='exchange':
                type_display='退换'
            elif type=='merger':
                type_display='并卡'
            elif type=='buy':
                type_display='消费'
            elif type=='replacement':
                type_display='换卡'
            elif type=='repayment':
                type_display='还款'
            elif type=='recharge':
                type_display='充值'

            operate_data.append({
                'type':operate['type'],
                'total':'{0:,}'.format(operate['total']),
                'cnt':operate['cnt'],
                'type_display':type_display,
            })

        data={
            'company_count':company_count,
            'license_count':license_count,
            'cash_total':'{0:,}'.format(cash_total),
            'consume_total':'{0:,}'.format(consume_total),
            'operate_data':operate_data,
        }

        return json.dumps(data,sort_keys=True)

    #获取公司列表信息
    @http.route('/manager/companys', type='http', auth="none",)
    def companys(self, **post):

        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        page_index=post.get('index',0)

        keyword=post.get('keyword','')
        companysState = post.get('companysState','')


        if keyword == '':
            where = "and true"
        else:
            where = " and (tb1.name like '%%%s%%'  or tb1.contact_name like '%%%s%%' or tb1.phone like '%%%s%%' ) " % (keyword,keyword,keyword)
        data = {}

        sql=u""" select count(id) as cnt  from res_company where state='done' """
        request.cr.execute(sql)
        res_count=request.cr.fetchall()
        updated_company_count= int(res_count and res_count[0][0] or 0)

        sql=u""" select count(id) as cnt  from res_company where state='draft' """
        request.cr.execute(sql)
        res_count=request.cr.fetchall()
        not_updated_company_count= int(res_count and res_count[0][0] or 0)



        companys_data = []

        if companysState == 'done':
            # where2 = "and  tb1.state='done'"
            where2 = "and  true"
            sql=u"""SELECT
                    tb1. ID,
                    tb1. NAME,
                    date_part('days', now() - tb1.approve_date) use_dates
                FROM
                    res_company tb1
                WHERE
                    tb1. ID > 1   %s %s
                ORDER BY tb1.id DESC
                LIMIT 10 OFFSET %s """ % (where,where2,page_index)
            request.cr.execute(sql)
            companys = request.cr.dictfetchall()
            for company in companys:
                val = {
                    'id': company['id'],
                    'name': company['name'],
                    'use_dates':company['use_dates'],
                }
                companys_data.append(val)

            data = {
                'companys_data' : companys_data,
                'updated_company_count': updated_company_count,
                'not_updated_company_count': not_updated_company_count
            }
            return json.dumps(data,sort_keys=True)

        elif companysState == 'draft':
            where2 = "and  tb1.state='draft'"
            # where2 = "and  true"
            sql=u"""SELECT
                    tb1. ID,
                    tb1. NAME
                FROM
                    res_company tb1
                WHERE
                    tb1. ID > 1   %s %s
                ORDER BY tb1.id DESC
                LIMIT 10 OFFSET %s """ % (where,where2,page_index)


            request.cr.execute(sql)
            companys = request.cr.dictfetchall()
            for company in companys:
                val = {
                    'id': company['id'],
                    'name': company['name'],
                }
                companys_data.append(val)
            data = {
                'companys_data' : companys_data,
                'updated_company_count': updated_company_count,
                'not_updated_company_count': not_updated_company_count
            }
            return json.dumps(data,sort_keys=True)

    #获取公司的详细信息
    @http.route('/manager/company/<int:company_id>', type='http', auth="none",)
    def company(self, company_id, **post):

        data={}
        company_obj = request.registry.get('res.company')
        for company in company_obj.browse(request.cr, SUPERUSER_ID,company_id, context=request.context):

            sql=u""" select count(id) as cnt  from born_license where company_id=%s  """ % (company_id)
            request.cr.execute(sql)
            res_count=request.cr.fetchall()
            license_count= int(res_count and res_count[0][0] or 0)

            sql=u""" select count(id) as cnt  from res_users where company_id=%s  """ % (company_id)
            request.cr.execute(sql)
            res_count=request.cr.fetchall()
            users_count= int(res_count and res_count[0][0] or 0)

            sql=u""" select count(id) as cnt  from born_shop where company_id=%s  """ % (company_id)
            request.cr.execute(sql)
            res_count=request.cr.fetchall()
            shop_count= int(res_count and res_count[0][0] or 0)

            sql=u""" select count(id) as cnt  from born_member_sync where company_id=%s  """ % (company_id)
            request.cr.execute(sql)
            res_count=request.cr.fetchall()
            member_count= int(res_count and res_count[0][0] or 0)

            sql=u""" select count(id) as cnt  from born_card_sync where company_id=%s  """ % (company_id)
            request.cr.execute(sql)
            res_count=request.cr.fetchall()
            card_count= int(res_count and res_count[0][0] or 0)

            #现金
            sql=u""" SELECT  sum(
              case when type in ('card','recharge','active','lost','upgrade','refund') then now_amount
              when type in ('repayment') then now_card_amount
              when type in ('buy','consume') then now_amount+now_card_amount else 0 end) as xianjin
              from born_operate_sync where company_id=%s """ % (company_id)
            request.cr.execute(sql)
            res_count = request.cr.fetchall()
            cash_total= int(res_count and res_count[0][0] or 0)

            #卡消耗
            sql=u""" SELECT  sum(abs(now_card_amount)) +sum(consume_amount) as xiaohao
                 from born_operate_sync where company_id=%s and type in ('buy','consume'); """  % (company_id)
            request.cr.execute(sql)
            res_count = request.cr.fetchall()
            consume_total= int(res_count and res_count[0][0] or 0)


            sql=u""" SELECT
                tb1. ID,
                date_part('days', now() - tb1.approve_date) AS use_dates,
                COALESCE (
                    to_char(
                        MAX (tb4.create_date),
                        'yyyy-mm-dd'
                    ),
                    ''
                ) AS last_consume_date
            FROM
                res_company tb1
            LEFT JOIN born_operate_sync tb4 ON tb4.company_id = tb1. ID where tb1.id=%s
            GROUP BY
                tb1. ID,
                tb1.approve_date """ % (company_id)

            request.cr.execute(sql)
            infos = request.cr.dictfetchall()
            use_dates=0
            last_consume_date=company.create_date
            for info in infos:
                use_dates=info['use_dates']
                last_consume_date=info['last_consume_date']

            #业务列表
            total_operate_count=0
            sql=u""" select type, SUM(now_amount+consume_amount) as total,count(id) as cnt  from  born_operate_sync where company_id=%s  group by type  """ % (company_id)
            request.cr.execute(sql)
            operates = request.cr.dictfetchall()
            operate_data=[]
            for operate in operates:

                type=operate['type']
                type_display=type
                if type=='upgrade':
                    type_display='卡升级'
                elif type=='refund':
                    type_display='退款'
                elif type=='retreat':
                    type_display='退货'
                elif type=='consume':
                    type_display='消费'
                elif type=='card':
                    type_display='开卡'
                elif type=='lost':
                    type_display='挂失'
                elif type=='active':
                    type_display='激活'
                elif type=='exchange':
                    type_display='退换'
                elif type=='merger':
                    type_display='并卡'
                elif type=='buy':
                    type_display='消费'
                elif type=='replacement':
                    type_display='换卡'
                elif type=='repayment':
                    type_display='还款'
                elif type=='recharge':
                    type_display='充值'

                operate_data.append({
                    'type':operate['type'],
                    'total':'{0:,}'.format(operate['total']),
                    'cnt':operate['cnt'],
                    'type_display':type_display,
                })

                total_operate_count+=int(operate['cnt'])

            address='%s%s%s%s%s' % (company.state_id.name or '',
                                         company.area_id.name or '',
                company.subdivide_id.name or '',
                company.street or '', company.street2 or '')

            if company.state == 'draft':
                state_display=u'待审核'
            elif company.state == 'done':
                state_display=u'运行中'
            elif company.state == 'cancel':
                state_display=u'已停止'
            elif company.state == 'review':
                state_display=u'提交申请'
            elif company.state == 'sent':
                state_display=u'发送邮件'
            else:
                state_display=u''

            data={
                'id': company.id,
                'name': company.name,
                'create_date':company.create_date,
                'approve_date':company.approve_date or '',
                'state_display':state_display,
                'state': company.state,
                'address':address,
                'contact_name':company.contact_name or '',
                'phone':company.phone or '',
                'employee_name':company.employee_id and company.employee_id.name or '',
                'employee_phone':company.employee_id and company.employee_id.mobile_phone or '',
                'brand':company.brand or '',
                'industry_category': company.industry_id.name or '',
                'use_dates':use_dates,
                'last_consume_date':last_consume_date or '',
                'users_count':users_count,
                'license_count':license_count,
                'shop_count':shop_count,
                'member_count':member_count,
                'card_count':card_count,
                'operate_data':operate_data,
                'total_operate_count':total_operate_count,
                'cash_total':'{0:,}'.format(cash_total),
                'consume_total':'{0:,}'.format(consume_total),

            }

        return json.dumps(data,sort_keys=True)



    #获取已激活公司的详细信息
    @http.route('/manager/company/updated/<int:company_id>', type='http', auth="none",)
    def company_updated(self, company_id, **post):

        data={}
        company_obj = request.registry.get('res.company')
        for company in company_obj.browse(request.cr, SUPERUSER_ID,company_id, context=request.context):

            sql=u""" select count(id) as cnt  from born_license where company_id=%s  """ % (company_id)
            request.cr.execute(sql)
            res_count=request.cr.fetchall()
            license_count= int(res_count and res_count[0][0] or 0)

            sql=u""" select count(id) as cnt  from res_users where company_id=%s  """ % (company_id)
            request.cr.execute(sql)
            res_count=request.cr.fetchall()
            users_count= int(res_count and res_count[0][0] or 0)

            sql=u""" select count(id) as cnt  from born_shop where company_id=%s  """ % (company_id)
            request.cr.execute(sql)
            res_count=request.cr.fetchall()
            shop_count= int(res_count and res_count[0][0] or 0)

            sql=u""" select count(id) as cnt  from born_member_sync where company_id=%s  """ % (company_id)
            request.cr.execute(sql)
            res_count=request.cr.fetchall()
            member_count= int(res_count and res_count[0][0] or 0)

            sql=u""" select count(id) as cnt  from born_card_sync where company_id=%s  """ % (company_id)
            request.cr.execute(sql)
            res_count=request.cr.fetchall()
            card_count= int(res_count and res_count[0][0] or 0)

            sql=u""" select count(id) as cnt  from res_users where company_id=%s  """ % (company_id)
            request.cr.execute(sql)
            res_count=request.cr.fetchall()
            res_users_count= int(res_count and res_count[0][0] or 0)



            #现金
            sql=u""" SELECT  sum(
              case when type in ('card','recharge','active','lost','upgrade','refund') then now_amount
              when type in ('repayment') then now_card_amount
              when type in ('buy','consume') then now_amount+now_card_amount else 0 end) as xianjin
              from born_operate_sync where company_id=%s """ % (company_id)
            request.cr.execute(sql)
            res_count = request.cr.fetchall()
            cash_total= int(res_count and res_count[0][0] or 0)

            #卡消耗
            sql=u""" SELECT  sum(abs(now_card_amount)) +sum(consume_amount) as xiaohao
                 from born_operate_sync where company_id=%s and type in ('buy','consume'); """  % (company_id)
            request.cr.execute(sql)
            res_count = request.cr.fetchall()
            consume_total= int(res_count and res_count[0][0] or 0)


            sql=u""" SELECT
                tb1. ID,
                date_part('days', now() - tb1.approve_date) AS use_dates,
                COALESCE (
                    to_char(
                        MAX (tb4.create_date),
                        'yyyy-mm-dd'
                    ),
                    ''
                ) AS last_consume_date
            FROM
                res_company tb1
            LEFT JOIN born_operate_sync tb4 ON tb4.company_id = tb1. ID where tb1.id=%s
            GROUP BY
                tb1. ID,
                tb1.approve_date """ % (company_id)

            request.cr.execute(sql)
            infos = request.cr.dictfetchall()
            use_dates=0
            last_consume_date=company.create_date
            for info in infos:
                use_dates=info['use_dates']
                last_consume_date=info['last_consume_date']

            #业务列表
            total_operate_count=0
            sql=u""" select type, SUM(now_amount+consume_amount) as total,count(id) as cnt  from  born_operate_sync where company_id=%s  group by type  """ % (company_id)
            request.cr.execute(sql)
            operates = request.cr.dictfetchall()
            operate_data=[]
            for operate in operates:

                type=operate['type']
                type_display=type
                if type=='upgrade':
                    type_display='卡升级'
                elif type=='refund':
                    type_display='退款'
                elif type=='retreat':
                    type_display='退货'
                elif type=='consume':
                    type_display='消费'
                elif type=='card':
                    type_display='开卡'
                elif type=='lost':
                    type_display='挂失'
                elif type=='active':
                    type_display='激活'
                elif type=='exchange':
                    type_display='退换'
                elif type=='merger':
                    type_display='并卡'
                elif type=='buy':
                    type_display='消费'
                elif type=='replacement':
                    type_display='换卡'
                elif type=='repayment':
                    type_display='还款'
                elif type=='recharge':
                    type_display='充值'

                operate_data.append({
                    'type':operate['type'],
                    # 'total':'{0:,}'.format(operate['total']),
                    'total':operate['total'],
                    'cnt':operate['cnt'],
                    'type_display':type_display,
                })

                total_operate_count+=int(operate['cnt'])

            address='%s%s%s%s%s' % (company.state_id.name or '',
                                         company.area_id.name or '',
                company.subdivide_id.name or '',
                company.street or '', company.street2 or '')

            if company.state == 'draft':
                state_display=u'待审核'
            elif company.state == 'done':
                state_display=u'运行中'
            elif company.state == 'cancel':
                state_display=u'已停止'
            elif company.state == 'review':
                state_display=u'提交申请'
            elif company.state == 'sent':
                state_display=u'发送邮件'
            else:
                state_display=u''

            create_date = (company.create_date)[:10]

            data={
                'id': company.id,
                'name': company.name,
                'create_date':create_date,
                'approve_date':company.approve_date or '',
                'state_display':state_display,
                'state': company.state,
                'address':address,
                'contact_name':company.contact_name or '',
                'phone':company.phone or '',
                'employee_name':company.employee_id and company.employee_id.name or '',
                # add by nisen
                'sale_employee_name':company.sale_employee_id and company.sale_employee_id.name or '',
                'logo':company.logo or '',
                # end add
                'employee_phone':company.employee_id and company.employee_id.mobile_phone or '',
                'brand':company.brand or '',
                'industry_category': company.industry_id.name or '',
                'use_dates':use_dates or 0,
                'last_consume_date':last_consume_date or '',
                'users_count':users_count,
                'license_count':license_count,
                'shop_count':shop_count,
                'member_count':member_count,
                'card_count':card_count,
                'res_users_count':res_users_count,
                'operate_data':operate_data,
                'total_operate_count':total_operate_count,
                'cash_total':'{0:,}'.format(cash_total),
                'consume_total':'{0:,}'.format(consume_total),

            }

        return json.dumps(data,sort_keys=True)

    #获取未激活公司
    @http.route('/manager/company/notupdated/<int:company_id>', type='http', auth="none",)
    def company_notupdated(self, company_id, **post):
        company_obj = request.registry.get('res.company')
        company = company_obj.browse(request.cr, SUPERUSER_ID,company_id, context=request.context)

        address='%s%s%s%s%s' % (company.state_id.name or '',
                                         company.area_id.name or '',
                company.subdivide_id.name or '',
                company.street or '', company.street2 or '')

        data = {
            'id': company.id,
            'name': company.name,
            'address':address,
            'contact_name':company.contact_name or '',
            'phone':company.phone or '',
            'brand':company.brand or '',
            'industry_category': company.industry_id.name or '',
        }
        return json.dumps(data,sort_keys=True)




    #获取终端列表
    @http.route('/manager/licenses', type='http', auth="none",)
    def licenses(self, **post):


        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        data = []
        company_id=int(post.get('company_id',0))

        display_type = post.get('display','day')
        current_date = post.get('current_date',False)
        current_week = post.get('current_week',False)
        current_year = post.get('current_year',False)
        current_month = post.get('current_month',False)
        direction = post.get('direction',0)


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
            elif display_type=='week':
                filter_week=int(filter_week)-1
                #前一年的最后一周
                if filter_week <= 0:
                    new_date = datetime.date(int(filter_week_year),01,01)
                    new_date = new_date + datetime.timedelta(days=-1)
                    filter_week = new_date.strftime("%W")
                    filter_week_year = int(filter_week_year)-1
                current_week='%s %s' % (filter_week_year,filter_week)

        where = ""
        if company_id<=0:
            pass
        else:
            where +="and bl.company_id='%s' "
        if display_type=='day':
            display_current=current_date
            where +="  and TO_CHAR(bl.check_date,'YYYY-MM-DD') = '%s' " % (current_date)
        elif display_type=='month':
            display_current=current_month
            where += "  and TO_CHAR(bl.check_date,'YYYY-MM') = '%s' " % (current_month)
        elif display_type=='week':
            display_current= current_week
            where += "  and TO_CHAR(bl.check_date,'YYYY') = '%s' and extract('week' from bl.check_date)::varchar = '%s' " % (filter_week_year,filter_week)


        sql_one = u"""
            select bl.company_id ,  count(bl.id) ,rc.name from born_license bl
            join res_company rc on bl.company_id = rc.id
                 where  bl.state in ('confirm','active') %s group by bl.company_id,rc.name HAVING count(bl.id) >0
            """ %(where)
        request.cr.execute(sql_one)
        operates_one = request.cr.dictfetchall()

        sql_two = u"""
            select bl.company_id ,  count(bl.id) ,rc.name from born_license bl
            join res_company rc on bl.company_id = rc.id
                 where  bl.state = 'draft' %s group by bl.company_id,rc.name HAVING count(bl.id) >0
            """ %(where)
        request.cr.execute(sql_two)
        operates_two = request.cr.dictfetchall()

        sql_number_one = u"""
            select count(*) from born_license bl where state in ('confirm','active') %s
        """%(where)
        request.cr.execute(sql_number_one)
        number_one = request.cr.dictfetchall()

        sql_number_two = u"""
            select count(*) from born_license bl where state = 'draft' %s
        """%(where)
        request.cr.execute(sql_number_two)
        number_two = request.cr.dictfetchall()

        val = {
            'display':display_type,
            'accountone':operates_one,
            'accounttwo':operates_two,
            'number_one' : number_one,
            'number_two' : number_two,
            'current_date':current_date,
            'current_month':current_month,
            'current_year':current_year,
            'current_week':current_week,
            'display_current':display_current,
            'filter_week_year':filter_week_year,
            'filter_week':filter_week,
        }

        return json.dumps(val,sort_keys=True)

    #获取公司的终端列表
    @http.route('/manager/licensesdetail',type='http',auth="none")
    def companyLicenses(self,**post):
        uid = request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        page_index=post.get('index',0)
        keyword=post.get('keyword','')
        company_id=int(post.get('company_id',0))
        date = post.get('date','')
        datetype = date.split('+')
        where = "where bl.company_id = %s "%(company_id)
        if datetype[0]=='day':
            where_date = datetype[1]
            where +="  and TO_CHAR(bl.check_date,'YYYY-MM-DD') = '%s' " % (datetype[1])
        elif datetype[0]=='month':
            where += "  and TO_CHAR(bl.check_date,'YYYY-MM') = '%s' " % (datetype[1])
        else:
            where += "  and TO_CHAR(bl.check_date,'YYYY') = '%s' and extract('week' from bl.check_date)::varchar = '%s' " % (datetype[1],datetype[2])

        sql = u"""
        select bl.mac,bl.version,bl.state,bl.check_date,bl.note,bl.id,rc.name as company_name from born_license bl
    join res_company rc on rc.id = bl.company_id %s order by bl.check_date desc limit 20 offset %s
        """ %(where,page_index)
        request.cr.execute(sql)
        operates = request.cr.dictfetchall()

        return json.dumps(operates,sort_keys=True)



    #获取公司的门店列表
    @http.route('/manager/shops', type='http', auth="none",)
    def shops(self, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        data = []
        company_id=post.get('company_id',False)
        if not company_id:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        shop_obj = request.registry.get('born.shop')
        domain=[('company_id','=',int(company_id))]
        shop_ids = shop_obj.search(request.cr, SUPERUSER_ID, domain,order="id desc", context=request.context)
        for shop in shop_obj.browse(request.cr, SUPERUSER_ID,shop_ids, context=request.context):
            val={
                'name': shop.name or '',
                'id' : shop.id,
                'mobile':shop.mobile and shop.mobile or  shop.phone,
            }
            data.append(val)

        return json.dumps(data,sort_keys=True)

    #获取公司的用户的信息
    @http.route('/manager/users', type='http', auth="none",)
    def users(self, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        data = []
        company_id=post.get('company_id',False)
        if not company_id:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        user_obj = request.registry.get('res.users')
        domain=[('company_id','=',int(company_id))]
        users_ids = user_obj.search(request.cr, SUPERUSER_ID, domain,order="id desc", context=request.context)
        for user in user_obj.browse(request.cr, SUPERUSER_ID,users_ids, context=request.context):
            val={
                'name': user.name or '',
                'login' : user.login,
            }
            data.append(val)
        return json.dumps(data,sort_keys=True)


    #获取现金列表
    @http.route('/manager/cashs', type='http', auth="none",)
    def cashs(self, **post):

        page_index=post.get('index',0)

        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        data = []
        type=post.get('type','cash')
        if not type:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        if type=='cash':
            sql=u""" SELECT tb2.id,tb2.name, count(born_operate_sync.id) as cnt, sum(
              case when type in ('card','recharge','active','lost','upgrade','refund') then now_amount
              when type in ('repayment') then now_card_amount
              when type in ('buy','consume') then now_amount+now_card_amount else 0 end) as total
              from born_operate_sync join res_company tb2 on company_id= tb2.id
            group by  tb2.id, tb2.name  limit 20 offset %s """ % (page_index)

        elif type=='consume':
            sql=u""" SELECT  tb2.id,tb2.name,count(born_operate_sync.id) as cnt,sum(abs(now_card_amount)) +sum(consume_amount) as total
                     from born_operate_sync join res_company tb2 on company_id= tb2.id
                     where  type in ('buy','consume')  group by  tb2.id, tb2.name  limit 20 offset %s; """  % (page_index)
        else:
            sql="""SELECT tb2.id,tb2.name, count(born_operate_sync.id) as cnt, sum(now_amount+consume_amount) as total
              from born_operate_sync join res_company tb2 on company_id= tb2.id
            where type='%s' group by  tb2.id, tb2.name limit 20 offset %s """ % (type,page_index)

        request.cr.execute(sql)
        operates = request.cr.dictfetchall()
        for operate in operates:
            val={
                'name': operate['name'] or '',
                'cnt':operate['cnt'] or '',
                'total':'{0:,}'.format(operate['total']),
            }
            data.append(val)
        return json.dumps(data,sort_keys=True)

    #审核设备
    @http.route('/manager/updateLicense', type='http', auth="none",)
    def updateOrder(self, **post):
        ret=False
        license_id=post.get('id',0)

        if not request.session.uid or int(license_id)<=0:
            werkzeug.exceptions.abort(werkzeug.utils.redirect("/except", 303))

        license_obj = request.registry.get('born.license')
        license=license_obj.browse(request.cr, SUPERUSER_ID,int(license_id),context=request.context)

        if license:
            ret=license.write({'state':'confirm'})
        return json.dumps(ret,sort_keys=True)


    #审核设备
    @http.route('/manager/updateCompany', type='http', auth="none",)
    def updateCompany(self, **post):
        ret=False
        comopany_id=post.get('id',0)

        if not request.session.uid or int(comopany_id)<=0:
            werkzeug.exceptions.abort(werkzeug.utils.redirect("/except", 303))

        database_obj = request.registry.get('duplicate.database.wizard')
        ret=database_obj.duplicate(request.cr, SUPERUSER_ID,int(comopany_id),context=request.context)
        return json.dumps(ret,sort_keys=True)


    #获取用户基本信息
    @http.route('/manager/user',type="http",auth="none")
    def user_info(self,**post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        user_obj = request.registry.get('res.users')
        hr_obj = request.registry.get('hr.employee')
        user = user_obj.browse(request.cr, SUPERUSER_ID,uid, context=request.context)




        manager_name=''
        team_name=''
        #查找销售团队和销售经理
        hr_ids = hr_obj.search(request.cr, SUPERUSER_ID,[('user_id','=',user.id)], context=request.context)
        if hr_ids:
            if len(hr_ids)>1:
                where=" and rel.uid in %s " % (tuple(hr_ids),)
            else:
                where=" and rel.uid = %s " % (hr_ids[0])
            sql=u""" select team.name as team_name,emp.name_related as manager_name from commission_team_employee_rel rel join commission_team  team on team.id=rel.tid
                join hr_employee emp on emp.id=team.manager_id
                where 1=1 %s limit 1
             """ % ( where,)
            request.cr.execute(sql)
            row = request.cr.fetchone()
            if row:
                team_name= row[0]
                manager_name=row[1]

        val={
            'role_option':user.role_option,
            'name':user.name or '',
            'tel' :user.login or '',
            'email' :user.email or '',
            'image' :user.image_small or '',
            'team_name':team_name,
            'manager_name':manager_name,
        }
        return json.dumps(val,sort_keys=True)

    #修改用户基本信息
    @http.route('/manager/regiest',type="http",auth="none")
    def regiest(self,**post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        user_obj = request.registry.get('res.users')
        values = dict((key, post.get(key)) for key in ('email', 'name'))
        if(post.get('password')):
            values['password_crypt']=post.get('password')
        # values['image']=self.upLoadS3(post.get('image',''))
        base_64=post.get('image','')
        suffix = base_64[base_64.find(',')+1:]
        values['image']=suffix

        user_obj.write(request.cr,SUPERUSER_ID,uid,values)
        return json.dumps(values,sort_keys=True)
