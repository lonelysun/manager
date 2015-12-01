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
			    where c.sale_employee_id = %s
			    group by 1

		        order by days asc
		        limit 10 offset %s
                ;
        """%(hr_id,page_index)

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
        elif require_mission_state == 'unfinished':
            ids = mission_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',hr_id),('state','!=','finished')],int(page_index),3, context=request.context)


        _logger.info('----------ids--------------------')
        _logger.info(ids)
        objs = mission_obj.browse(request.cr, SUPERUSER_ID,ids, context=request.context)
        missions_list = []

        for each_obj in objs:
            #考虑改写 去掉不必要的字段contacts_phone,contacts_address,要跟创建任务时一致

            mission_id = each_obj.id
            company_id = each_obj.track_id.id
            # mission_company_name = each_obj.track_id.name
            mission_name = each_obj.name
            mission_contacts_phone = each_obj.contacts_phone
            mission_contacts_name = each_obj.contacts_id.name
            mission_date = (each_obj.mission_date)[5:10]
            mission_address = each_obj.contacts_address
            mission_state = each_obj.state


            state_name_dict = {'start':u'开始','pause':u'暂停','finished':u'完成','notstart':u'未开始'}

            mission_state_name = state_name_dict.get(mission_state)



            vals = {
                'mission_id':mission_id,
                'company_id':company_id,
                # 'mission_company_name':mission_company_name,
                'mission_name':mission_name,
                'mission_state_name':mission_state_name,
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


        #This need Change! where clause.
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


    @http.route('/manager/saler/partner/info/<int:partner_id>', type='http', auth="none",)
    def saler_partner_info(self,partner_id):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))


        hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        hr_id = hr_id_list[0] or ''

        partner_obj = request.registry['res.partner']
        partner = partner_obj.browse(request.cr, SUPERUSER_ID,int(partner_id),context=request.context)


        # 联系人数据
        contact_list = []

        _logger.info('--------------- upper---------')
        _logger.info(partner)
        _logger.info(partner.child_ids)
        for contact in partner.child_ids:
            contact_data = {
                'id': contact.id,
                'name': contact.name,
                'function': contact.function or '',
                'mobile': contact.mobile or '',
                'phone': contact.phone or '',
                'wechat': contact.wechat or '',
                'qq': contact.qq or ''
            }
            contact_list.append(contact_data)



        # 来源数据
        if partner.ascription == 'mark':
            source = u"%s  %s  %s" % (u'市场部', (partner.mark_source.name or ''), (partner.mark_source_detail.name or ''))
            source1_id = 'mark'
            source2_id = partner.mark_source.id
            source3_id = partner.mark_source_detail.id
            # source = ('%s' + ' ' +str(partner.mark_source.name or '') + ' '+ str(partner.mark_source_detail.name or '')) % (u'市场部')
        elif partner.ascription == 'sale':
            source = u"%s  %s" % (u'销售部', (partner.sale_source.name or ''))
            # source = ('%s' + ' '+ str(partner.sale_source.name or '') + ' '+ str(partner.source_note or ''))
            source1_id = 'sale'
            source2_id = partner.sale_source.id
            source3_id = ''

        else:
            source = ''
            source1_id = ''
            source2_id = ''
            source3_id = ''
        data = {
            'id':partner.id,
            'name': partner.name,
            'category': partner.categorys_id.name or '',
            'category_id': partner.categorys_id.id or '',
            'bussiness': partner.business_id.name or '',
            'bussiness_id': partner.business_id.id or '',
            'address': partner.street or '',
            'contacts':contact_list,
            'source': source,
            'source2_id': source2_id,
            'source3_id': source3_id,
            #need source_id?
            'size' : partner.partner_size_id.name or '',
            'size_id' : partner.partner_size_id.id or '',
            'environment':partner.partner_environment_id.name or '',
            'environment_id':partner.partner_environment_id.id or '',
            'employee':partner.partner_employee_id.name or '',
            'employee_id':partner.partner_employee_id.id or '',
            'room': partner.partner_room_id.name or '',
            'room_id': partner.partner_room_id.id or '',
            'comment' : partner.comment or ''
        }
        return json.dumps(data,sort_keys=True)


    @http.route('/manager/saler/partner/mission', type='http', auth="none",)
    def saler_partner_mission(self, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))


        hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        hr_id = hr_id_list[0] or ''

        mission_obj = request.registry['born.partner.track']

        partner_id = int(post.get('partnerId'))
        page_index=post.get('index',0)


        _logger.info('-----------saler_partner_mission  partner_id ------------')
        _logger.info(partner_id)

        ids = mission_obj.search(request.cr, SUPERUSER_ID,[('track_id','=',int(partner_id)),('state','=','finished')],int(page_index),3, context=request.context)
        # ids = mission_obj.search(request.cr, SUPERUSER_ID,[], context=request.context)

        _logger.info('-----------saler_partner_mission  ids ------------')
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

        data = {
            'missions_list':missions_list,
        }

        _logger.info('-----------saler_partner_mission------------')
        _logger.info(data)

        return json.dumps(data,sort_keys=True)


    @http.route('/manager/saler/partner/post/<int:partner_id>', type='http', auth="none",)
    def saler_partner_post(self, partner_id, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))


        hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        hr_id = hr_id_list[0] or ''


        # 考虑取消接受参数partner_id,因为在  post.get('id',0)里 有


        vals = {}
        vals['name'] = post.get('name','')
        vals['categorys_id'] = post.get('category_id','')
        vals['business_id'] = post.get('bussiness_id','')

        #根据business_id得到上层数据
        if vals['business_id']:
            obj = request.registry['born.business'].browse(request.cr, SUPERUSER_ID,int(vals['business_id']),context=request.context)
            vals['subdivide_id'] = obj.area_id.id
            vals['area_id'] = obj.area_id.country_id.id
            vals['state_id'] = obj.area_id.country_id.country_id.id



        street = post.get('street','')

        #联系人
        vals['child_ids'] = []
        contacts_json = post.get('contacts_json','')
        contacts = json.loads(contacts_json)
        # contact_obj = request.registry['res.partner']
        for each_contact in contacts:
            if each_contact.has_key('id'):
                # 更新联系人信息
                contact_id = each_contact['id']
                contact_vals = {
                    'name':each_contact['name'],
                    'mobile':each_contact['mobile'],
                    'phone':each_contact['phone'],
                    'qq':each_contact['qq'],
                    'wechat':each_contact['wechat'],
                    'function':each_contact['function'],

                }
                vals['child_ids'].append((1,contact_id,contact_vals))
            else:
                # 新建联系人信息
                contact_vals = {
                    'name':each_contact['name'],
                    'mobile':each_contact['mobile'],
                    'phone':each_contact['phone'],
                    'qq':each_contact['qq'],
                    'wechat':each_contact['wechat'],
                    'function':each_contact['function'],

                }
                vals['child_ids'].append((0,0,contact_vals))

        #end

        vals['ascription'] =  post.get('source1_id','')

        if  vals['ascription'] == 'sale':
            vals['sale_source'] = post.get('source2_id','')
        elif vals['ascription'] == 'mark':
            vals['mark_source_detail'] = post.get('source3_id','')
            obj = request.registry['born.mark.source.detail'].browse(request.cr, SUPERUSER_ID,int(vals['mark_source_detail']),context=request.context)
            vals['mark_source'] = obj.source_id.id

        vals['partner_size_id'] = post.get('size_id','')
        vals['partner_environment_id'] = post.get('size_id','')
        vals['partner_employee_id'] = post.get('size_id','')
        vals['partner_room_id'] = post.get('size_id','')


        if partner_id != 0:
            # 修改商户
            obj = request.registry['res.partner'].browse(request.cr, SUPERUSER_ID,partner_id, context=request.context)
            obj.write(vals)
            return json.dumps(True,sort_keys=True)
        else:
            # 新建商户
            id = request.registry['res.partner'].create(request.cr, SUPERUSER_ID,vals,context=request.context)
            return json.dumps({'id':id},sort_keys=True)




    @http.route('/manager/saler/options/<option>', type='http', auth="none",)
    def saler_options(self, option, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))


        hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        hr_id = hr_id_list[0] or ''
        
        record_limit = 10


        option = option
        environment = post.get('environment','')
        page_index = int(post.get('pageIndex',0))

        if option == 'categories':
            # 经营类型options
            obj = request.registry.get('born.partner.categorys')
            ids = obj.search(request.cr, SUPERUSER_ID,[],page_index,record_limit,context=request.context)
            data = obj.read(request.cr,SUPERUSER_ID,ids,fields=['name'],context=request.context)

        elif option == 'states':
            obj = request.registry.get('res.country.state')
            ids = obj.search(request.cr, SUPERUSER_ID,[], page_index,record_limit,context=request.context)
            data = obj.read(request.cr, SUPERUSER_ID,ids,fields=['name'], context=request.context)

        elif option == 'areas':

            state_id = int(environment)
            obj = request.registry.get('res.country.state.area')
            ids = obj.search(request.cr, SUPERUSER_ID,[('country_id','=',state_id)], page_index,record_limit,context=request.context)
            data = obj.read(request.cr, SUPERUSER_ID,ids,fields=['name'], context=request.context)

        elif option == 'subdivides':
            area_id = int(environment)

            obj = request.registry.get('res.country.state.area.subdivide')
            ids = obj.search(request.cr, SUPERUSER_ID,[('country_id','=',area_id)], page_index,record_limit,context=request.context)
            data = obj.read(request.cr, SUPERUSER_ID,ids,fields=['name'], context=request.context)


        elif option == 'businesses':
            subdivide_id = int(environment)

            # 这边有字段取名字上留下的坑，要小心
            obj = request.registry.get('born.business')
            ids = obj.search(request.cr, SUPERUSER_ID,[('area_id','=',subdivide_id)],page_index,record_limit, context=request.context)
            data = obj.read(request.cr, SUPERUSER_ID,ids,fields=['name'], context=request.context)

        elif option == 'contacts':
            partner_id = int(environment)

            obj = request.registry.get('res.partner')


            ids = obj.search(request.cr, SUPERUSER_ID,[('parent_id','=',partner_id)],page_index,record_limit,context=request.context)

            data = obj.read(request.cr, SUPERUSER_ID,ids,fields=['name','mobile'], context=request.context)


            # instance_obj = obj.browse(request.cr, SUPERUSER_ID,partner_id, context=request.context)
            # _logger.info('-----------elif option ==:---------')
            # _logger.info(instance_obj)
            #
            # len_contact_objs = len(instance_obj.child_ids.ids)
            # if page_index == 0:
            #     ids = instance_obj.child_ids.ids[0:record_limit-1]
            # else:
            #     ids = instance_obj.child_ids.ids[record_limit:record_limit*2 -1]
            #
            #
            # _logger.info(contact_objs)
            #
            # # data = []
            # for each_contact in contact_objs:
            #     val = {
            #         'id':each_contact.id,
            #         'name':each_contact.name,
            #         'mobile':each_contact.mobile
            #     }
            #     data.append(val)






        elif option == 'sources1':
            if page_index < 2:
                data = [{'id':'mark','name':u'市场部'},{'id':'sale','name':u'销售部'}]
            else:
                data = []

        elif option == 'sources2':
            source1 = environment
            if source1 == 'mark':
                obj = request.registry.get('born.mark.source')
                ids = obj.search(request.cr, SUPERUSER_ID,[], page_index,record_limit,context=request.context)
                data = obj.read(request.cr, SUPERUSER_ID,ids,fields=['name'], context=request.context)

            elif source1 == 'sale':
                obj = request.registry.get('born.sale.source')
                ids = obj.search(request.cr, SUPERUSER_ID,[],page_index,record_limit, context=request.context)
                data = obj.read(request.cr, SUPERUSER_ID,ids,fields=['name'], context=request.context)

        elif option == 'sources3':
            obj = request.registry.get('born.mark.source.detail')
            ids = obj.search(request.cr, SUPERUSER_ID,[], page_index,record_limit,context=request.context)
            data = obj.read(request.cr, SUPERUSER_ID,ids,fields=['name'], context=request.context)

        elif option == 'sizes':
            obj = request.registry.get('born.partner.size')
            ids = obj.search(request.cr, SUPERUSER_ID,[],page_index,record_limit,context=request.context)
            data = obj.read(request.cr,SUPERUSER_ID,ids,fields=['name'],context=request.context)

        elif option == 'environments':
            obj = request.registry.get('born.partner.environment')
            ids = obj.search(request.cr, SUPERUSER_ID,[],page_index,record_limit,context=request.context)
            data = obj.read(request.cr,SUPERUSER_ID,ids,fields=['name'],context=request.context)

        elif option == 'employees':
            obj = request.registry.get('born.partner.employee')
            ids = obj.search(request.cr, SUPERUSER_ID,[],page_index,record_limit,context=request.context)
            data = obj.read(request.cr,SUPERUSER_ID,ids,fields=['name'],context=request.context)

        elif option == 'rooms':
            obj = request.registry.get('born.partner.room')
            ids = obj.search(request.cr, SUPERUSER_ID,[],page_index,record_limit,context=request.context)
            data = obj.read(request.cr,SUPERUSER_ID,ids,fields=['name'],context=request.context)
        
        elif option == 'partners':
            if environment == 'fromSalerSelectParner':
                # 销售人员选择商户看到的商户

                #!!! where 条件要改
                sql = u"""
                SELECT
                    tb1.id,
                    tb1.name,
                    tb1.street
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
                    tb1.id,tb1.name,tb1.street
                ORDER By
                    tb1.id DESC
                LIMIT
                    %s
                OFFSET
                    %s

                """% (hr_id, record_limit,page_index)

                request.cr.execute(sql)
                partners = request.cr.dictfetchall()


                data = []

                for each_partner in partners:

                    vals = {
                        'id':each_partner['id'],
                        'name':each_partner['name'],
                        'street':each_partner['street'],
                    }
                    data.append(vals)


            else:
                # 销售经理选择商户看到的商户
                business_id = int(environment)

                obj = request.registry.get('res.partner')
                # !!! This is true
                # ids = obj.search(request.cr, SUPERUSER_ID,[('business_id','=',business_id),('has_installed','=','false')],page_index,record_limit,context=request.context)
                #上面这个多个限制条件是对的
                ids = obj.search(request.cr, SUPERUSER_ID,[('business_id','=',business_id)],page_index,record_limit,context=request.context)
                partner_objs = obj.browse(request.cr,SUPERUSER_ID,ids,context=request.context)
                data = []
                for each_partner in partner_objs:
                    vals = {
                        'id':each_partner.id,
                        'name':each_partner.name,
                        'street':each_partner.street or ''
                    }
                    data.append(vals)


        # data is a list of dictionaies,need to be a dictionary?
        _logger.info('----------data--------------------')
        _logger.info(data)
        return json.dumps(data,sort_keys=True)


    #图片上传S3，返回url
    def upLoadS3(self,base64data):
        if base64data=='':
            return ''
        permision = "public-read"
        suffix = base64data[base64data.find(',')+1:]#只取出base64
        sha = hashlib.sha1(suffix).hexdigest()# 文件hash值
        f = BytesIO()
        f.write(base64.b64decode(str(suffix)))
        f.seek(0)
        uploadfile="res_partner/images/"+sha.strip()+".jpg"# 图片文件使用hash值
        ob=self.__s3.Object(self.__bucketname, uploadfile)
        result=ob.put(Body=f,ServerSideEncryption='AES256',StorageClass='STANDARD',ACL=permision)
        url = 'https://s3.cn-north-1.amazonaws.com.cn/'+self.__bucketname+'/'+uploadfile
        return url

    # @http.route('/manager/saler/mission/post/<int:mission>', type='http', auth="none",)
    # def saler_partner_post(self, mission, **post):
    #     uid=request.session.uid
    #     if not uid:
    #         werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))
    #
    #
    #     hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
    #     hr_id = hr_id_list[0] or ''
    #
    #     vals = {}
    #     vals['result_title'] = post.get('result_title','')
    #     #结果,多选
    #
    #     #
    #
    #     vals['notes'] = post.get('notes','')
    #     vals['image'] = self.upLoadS3(post.get('mission_img',''))
    #
    #     #need finish
    #
    #
    #     return json.dumps(True,sort_keys=True)


        # hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        # hr_id = hr_id_list[0] or ''
        # 
        # vals = {}
        # vals['result_title'] = post.get('result_title','')
        # #结果,多选
        # 
        # #
        # 
        # vals['notes'] = post.get('notes','')
        # vals['image'] = self.upLoadS3(post.get('mission_img',''))
        # 
        # #need finish
        # 
        # 
        # return json.dumps(True,sort_keys=True)





    @http.route('/manager/saler/missionresults', type='http', auth="none",)
    def saler_mission_results(self, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))


        hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        hr_id = hr_id_list[0] or ''

        page_index = int(post.get('pageIndex',0))
        record_limit = 10

        obj = request.registry.get('born.track.result')
        ids = obj.search(request.cr, SUPERUSER_ID,[], page_index,record_limit,context=request.context)
        data = obj.read(request.cr, SUPERUSER_ID,ids,fields=['name'], context=request.context)

        _logger.info('----------data-results--------------------')
        _logger.info(data)
        return json.dumps(data,sort_keys=True)



    @http.route('/manager/saler/finishMission/post', type='http', auth="none",)
    def saler_finish_mission_post(self, **post):
        print '---post----'
        print post
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))


        hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        hr_id = hr_id_list[0] or ''

        mission_id = int(post.get('id'));

        vals = {}
        vals['result_title'] = post.get('result_title','')

        # 处理many2many
        result_ids_list = []
        if post.get('result_ids'):
            result_ids = json.loads(post.get('result_ids'))
            for each in result_ids:
                result_ids_list.append((4,each))

        vals['result_ids'] = result_ids_list



        vals['notes'] = post.get('notes','')
        if post.get('mission_img'):
            vals['image_url'] = self.upLoadS3(post.get('mission_img'))

        vals['state'] = 'finished'

        _logger.info('----------vals--------------------')
        _logger.info(vals)

        request.registry['born.partner.track'].write(request.cr, SUPERUSER_ID,mission_id,vals,context=request.context)

        return json.dumps(True,sort_keys=True)



    @http.route('/manager/saler/changeMissionState/post', type='http', auth="none",)
    def saler_change_mission_state(self, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        mission_id = int(post.get('mission_id'))
        action = post.get('action')

        request.registry['born.partner.track'].write(request.cr, SUPERUSER_ID,mission_id,{'state':action},context=request.context)

        return json.dumps(True,sort_keys=True)

    @http.route('/manager/saler/getFinishedMission/<int:mission_id>', type='http', auth="none",)
    def saler_get_finished_mission(self, mission_id,**post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        mission_id = int(mission_id)

        obj = request.registry['born.partner.track'].browse(request.cr, SUPERUSER_ID,mission_id,context=request.context)
        result_list = []
        for each_obj in obj.result_ids:
            result_list.append({'name':each_obj.name})

        data = {
            'result_title':obj.result_title or '',
            'result_list':result_list,
            'notes':obj.notes or '',
            'image_url':obj.image_url or '',
            'remark':obj.remark or ''
        }

        return json.dumps(data,sort_keys=True)