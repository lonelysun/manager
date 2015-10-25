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
        team_obj = request.registry.get('commission.team')
        tid = team_obj.search(request.cr, SUPERUSER_ID,[], context=request.context)
        teams = team_obj.browse(request.cr, SUPERUSER_ID, tid, context=request.context)
        hr_obj = request.registry.get('hr.employee')
        hr_id= hr_obj.search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        ismanager = False
        sql = """
            select a.user_id from resource_resource a join hr_employee b on a.id=b.resource_id
             join res_users c on c.id = a.user_id
             join commission_team_employee_rel d on d.uid = b.id
        """
        request.cr.execute(sql)
        business_ids=request.cr.fetchall()
        issaler = False
        for bus in business_ids:
            if uid in bus:
                issaler = True
                break
            pass
        users_obj = request.registry.get('res.users')
        user=users_obj.browse(request.cr, SUPERUSER_ID, uid)
        for team in teams:
            if team.manager_id.id == hr_id[0]:
                ismanager = True
                break
            pass
#         today = datetime.date.today()
#         print today
#         print (int(today)-1)
#         company_obj = request.registry.get('res.company')
#         company_ids = company_obj.search(request.cr, SUPERUSER_ID,[('approve_date','>','2015-10-10')], context=request.context)
#         companys = company_obj.browse(request.cr,SUPERUSER_ID,company_ids)
#         for company in companys:
#             print company.name
#             company_val = {
#                            'name' : company.name,
#                            
#             }
#         
        val = {
               'ismanager' : ismanager,
               'issaler' : issaler,
               'option':user.role_option,
        }
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
        if keyword == '':
            where = " and  tb1.state='draft' "
        else:
            where = " and (tb1.name like '%%%s%%'  or tb1.contact_name like '%%%s%%' or tb1.phone like '%%%s%%' ) " % (keyword,keyword,keyword)
        data = []
        sql=u"""SELECT
                tb1. ID,
                tb1. NAME,
            tb1.state,
                (
                    CASE
                    WHEN tb1. STATE = 'draft' THEN
                        '草稿'
                    WHEN tb1. STATE = 'review' THEN
                        '提交申请'
                    WHEN tb1. STATE = 'done' THEN
                        '运行中'
                    WHEN tb1. STATE = 'sent' THEN
                        '发送邮件'
                    WHEN tb1. STATE = 'cancel' THEN
                        '关闭'
                    ELSE
                        NULL
                    END
                ) AS STATE_name,
                tb1.contact_name,
                tb1.phone,
                COALESCE (
                    to_char(tb1.create_date, 'yyyy-mm-dd'),
                    ''
                ) as create_date,
                date_part('days', now() - tb1.approve_date) use_dates,
                COUNT (distinct tb2. ID) AS shop_count,
                COUNT (distinct tb3. ID) AS license_count,
                COALESCE (
                    to_char(
                        MAX (tb4.create_date),
                        'yyyy-mm-dd'
                    ),
                    ''
                ) AS last_consume_date,
                COALESCE (
                    to_char(tb1.approve_date, 'yyyy-mm-dd'),
                    ''
                ) approve_date,
                COALESCE (tb5.name_related, '') employee_name,
                COUNT (distinct
                    CASE
                    WHEN tb3. STATE = 'draft' THEN
                        tb3. ID
                    ELSE
                        NULL
                    END
                ) AS draft_license_count
            FROM
                res_company tb1
            LEFT JOIN born_shop tb2 ON tb2.company_id = tb1. ID
            LEFT JOIN born_license tb3 ON tb3.company_id = tb1. ID
            LEFT JOIN born_operate_sync tb4 ON tb4.company_id = tb1. ID
            LEFT JOIN hr_employee tb5 ON tb1.employee_id = tb5. ID
            WHERE
                tb1. ID > 1   %s
            GROUP BY
                tb1. ID,
                tb1. NAME,
                tb1. STATE,
                tb1.contact_name,
                tb1.phone,
                tb1.create_date,
                tb5.name_related order by tb1.state desc,tb1.id desc limit 10 offset %s """ % (where,page_index)

        request.cr.execute(sql)
        companys = request.cr.dictfetchall()
        for company in companys:

            company_image_medium='/web/binary/image?model=res.company&id=%s&field=logo' % (company['id'])

            val = {
                'id': company['id'],
                'company_image_medium':company_image_medium,
                'name': company['name'],
                'state': company['state'],
                'state_name': company['state_name'],
                'contact_name':company['contact_name'],
                'phone':company['phone'],
                'create_date':company['create_date'],
                'shop_count':company['shop_count'],
                'use_dates':company['use_dates'],
                'license_count':company['license_count'],
                'last_consume_date':company['last_consume_date'],
                'approve_date':company['approve_date'],
                'employee_name':company['employee_name'],
                'draft_license_count':company['draft_license_count'],
            }
            data.append(val)
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

    #获取终端列表
    @http.route('/manager/licenses', type='http', auth="none",)
    def licenses(self, **post):

        page_index=post.get('index',0)

        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        data = []
        company_id=int(post.get('company_id',0))
        if company_id<=0:
            domain=[]
        else:
            domain=[('company_id','=',int(company_id))]

        license_obj = request.registry.get('born.license')
        license_ids = license_obj.search(request.cr, SUPERUSER_ID, domain,int(page_index),20,order="state desc ,id desc", context=request.context)
        for license in license_obj.browse(request.cr, SUPERUSER_ID,license_ids, context=request.context):

            if license.state == 'draft':
                state_display=u'待审核'
            elif license.state == 'confirm' or license.state == 'confirm' :
                state_display=u'已激活'
            else:
                state_display=u'无效'
            val={
                'mac': license.mac or '',
                'company_name': license.company_id.name or '',
                'version' : license.version,
                'state':license.state,
                'check_date':license.check_date,
                'note':license.note or '',
                'state_display':state_display,
                'id': license.id,
            }
            data.append(val)

        return json.dumps(data,sort_keys=True)


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


    #获取设置内信息
    @http.route('/manager/user',type="http",auth="none")
    def user(self,**post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        user_obj = request.registry.get('res.users')
        user = user_obj.browse(request.cr, SUPERUSER_ID,uid, context=request.context)
        val={
            'name':user.name or '',
            'tel' :user.login or '',
            'email' :user.email or '',
            'image' :user.image,
        }
        return json.dumps(val,sort_keys=True)
    
    @http.route('/manager/regiest',type="http",auth="none")
    def regiest(self,**post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
        user_obj = request.registry.get('res.users')
        values = dict((key, post.get(key)) for key in ('email', 'name'))
        if(post.get('password')):
            values['password_crypt']=post.get('password')

        user_obj.write(request.cr,SUPERUSER_ID,uid,values)
        return json.dumps(values,sort_keys=True)