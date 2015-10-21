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
class born_manager_sale(http.Controller):

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
    @http.route('/manager/partners', type='http', auth="none",)
    def partners(self, **post):

        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        page_index=post.get('index',0)

        keyword=post.get('keyword','')


        hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        hr_id = hr_id_list[0] or ''


        #here is a bug to search all with '%'
        #and How to prevent sql injection
        if keyword == '':
            where = "and tb1.employee_id=%s" % (hr_id)
        else:


            where = " and (tb1.name like '%%%s%%'  or tb1.phone like '%%%s%%' or tb1.street like '%%%s%%') " %(keyword,keyword,keyword)

            #折衷方法，如果搜索的字符串包含% 或者 以_开头则不返回内容
            if keyword.find('%') != -1 or keyword.find('_') == 0:
                where = 'and false '

        # 后台筛选商户状态
        state_filter = post.get('statefilter','')
        if state_filter:
            where2 = "and tb1.state='%s'" % (state_filter)
        else:
            where2 = "and true"


        data = {}
        partner_list = []



        sql=u""" select count(id) as cnt  from res_partner
            where res_partner.employee_id=%s""" % (hr_id)
        request.cr.execute(sql)
        res_count=request.cr.fetchall()
        partner_count= int(res_count and res_count[0][0] or 0)


        sql=u""" select count(id) as cnt  from res_partner
            where state='tovisit'  and res_partner.employee_id=%s""" % (hr_id)
        request.cr.execute(sql)
        res_count=request.cr.fetchall()
        tovisit_count= int(res_count and res_count[0][0] or 0)


        sql=u""" select count(id) as cnt  from res_partner
            where state='visiting'  and res_partner.employee_id=%s""" % (hr_id)
        request.cr.execute(sql)
        res_count=request.cr.fetchall()
        visiting_count= int(res_count and res_count[0][0] or 0)

        sql=u""" select count(id) as cnt  from res_partner
            where state='installed'  and res_partner.employee_id=%s""" % (hr_id)
        request.cr.execute(sql)
        res_count=request.cr.fetchall()
        installed_count= int(res_count and res_count[0][0] or 0)


        sql=u"""SELECT
                tb1. ID,
                tb1. NAME,
                tb1.state,
                tb1.phone,
                tb1.mobile,
                tb1.employee_id,
                tb1.city,
                COALESCE (tb2.name, '') address_state,
                COALESCE (tb5.name, '') address_city,
                COALESCE (tb6.name, '') address_subdivide,

                tb1.street,
                tb1.street2,
                
                COALESCE(tb4.track_count,0) as track_count

            FROM
                res_partner tb1
            LEFT JOIN res_country_state tb2 ON tb2.id = tb1.state_id
            LEFT JOIN res_country_state_area tb5 ON tb5.id = tb1.area_id
            LEFT JOIN res_country_state_area_subdivide tb6 ON tb6.id = tb1.subdivide_id
            LEFT JOIN (select count(distinct id) as track_count ,track_id from born_partner_track tb4 group by track_id) as tb4 on tb4.track_id = tb1.id
            WHERE
                tb1. ID > 1 and tb1.is_company='true' %s %s



            order by tb1.id desc
            limit 10 offset %s
                ;

            """ % (where,where2,page_index)

        request.cr.execute(sql)




        partners = request.cr.dictfetchall()
        for partner in partners:
            address ='%s%s%s%s%s' % (partner['address_state'] or '',partner['address_city'] or '',partner['address_subdivide'] or '',partner['street'] or '',partner['street2'] or '')

            # 判断此商户是不是自己负责的
            if partner['employee_id'] == hr_id:
                my_customer = 'yes'
            else:
                my_customer = 'no'

            val = {
                'id':partner['id'],
                'name':partner['name']  or '',
                'state':partner['state']  or '',
                'phone': partner['phone']  or '',
                'mobile': partner['mobile']  or '',
                'address': address,
                'track_count':partner['track_count'],
                'my_customer':my_customer

            }
            partner_list.append(val)

        data = {
            'partner_list': partner_list,
            'tovisit_count':tovisit_count,
            'visiting_count': visiting_count,
            'installed_count':installed_count,
            'partner_count':partner_count
        }


        return json.dumps(data,sort_keys=True)


    #获取partner的详细信息
    @http.route('/manager/partners/<int:partner_id>', type='http', auth="none")
    def getPartner(self, partner_id):


        # 有权访问判定
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))


        hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        hr_id = hr_id_list[0] or ''




        data={}
        partner_obj = request.registry.get('res.partner')
        partner = partner_obj.browse(request.cr, SUPERUSER_ID,partner_id, context=request.context)


        # 如果访问不属于自己的商户（而且是通过url中拼写id直接访问）,则跳到指定页面
        # 增加判定，如果partner id 为0 则也可以
        if partner_id != 0 and partner.employee_id.id != hr_id:
            return



        # 跟踪方式选项options,
        track_ways_options = [{'value':'call','display':u'电话'},
                              {'value':'message','display':u'信息'},
                              {'value':'visit','display':u'上门拜访'},
                              {'value':'video','display':u'视频'},
                              {'value':'other','display':u'其它'}]


        # 以下几条选项数据考虑在模型上建立字段来存储（当相应字段更新时更新），每次访问时可以直接读取，而不用每次访问都计算得到，这样比较浪费资源
        # 拜访结果数据
        obj = request.registry.get('born.track.result')
        ids = obj.search(request.cr, SUPERUSER_ID,[],context=request.context)
        result_ids_options = obj.read(request.cr,SUPERUSER_ID,ids,fields=['name'],context=request.context)

        # 经营类型options
        obj = request.registry.get('born.partner.categorys')
        ids = obj.search(request.cr, SUPERUSER_ID,[],context=request.context)
        categorys_id_options = obj.read(request.cr,SUPERUSER_ID,ids,fields=['name'],context=request.context)

        # 员工人数options
        obj = request.registry.get('born.partner.employee')
        ids = obj.search(request.cr, SUPERUSER_ID,[],context=request.context)
        partner_employee_id_options = obj.read(request.cr,SUPERUSER_ID,ids,fields=['name'],context=request.context)

        # 规模options
        obj = request.registry.get('born.partner.size')
        ids = obj.search(request.cr, SUPERUSER_ID,[],context=request.context)
        partner_size_id_options = obj.read(request.cr,SUPERUSER_ID,ids,fields=['name'],context=request.context)

        # 环境options
        obj = request.registry.get('born.partner.environment')
        ids = obj.search(request.cr, SUPERUSER_ID,[],context=request.context)
        partner_environment_id_options = obj.read(request.cr,SUPERUSER_ID,ids,fields=['name'],context=request.context)

        # 房间数options
        obj = request.registry.get('born.partner.room')
        ids = obj.search(request.cr, SUPERUSER_ID,[],context=request.context)
        partner_room_id_options = obj.read(request.cr,SUPERUSER_ID,ids,fields=['name'],context=request.context)




        # 判断是否为新建partner
        if partner_id == 0:
            data = {
                'name': '',
                'phone':'',
                'mobile': '',
                'categorys_id_options':categorys_id_options,
                'partner_employee_id_options':partner_employee_id_options ,
                'partner_size_id_options':partner_size_id_options,
                'partner_environment_id_options':partner_environment_id_options,
                'partner_room_id_options':partner_room_id_options,
                'track_ways_options':track_ways_options,
                'result_ids_options': result_ids_options,

                # 拜访记录必填
                'track_ways': '',
                'track_result_ids': '',
                'track_notes': '',

                #省市县商区
                'state_id':'',
                'area_id':'',
                'subdivide_id':'',
                'business_id':'',


            }

            return json.dumps(data,sort_keys=True)



        # 以下为选中联系人的详细数据
        # 联系人
        contact_data_list = []
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
            contact_data_list.append(contact_data)

        # 跟踪记录
        track_data_list = []
        for track in partner.track_ids:
            ways = track.ways
            if ways == 'visit':
                ways = u'上门拜访'
            elif ways == 'call':
                ways = u'电话'
            elif ways == 'message':
                ways = u'信息'
            elif ways == 'video':
                ways = u'视频'
            elif ways == 'other':
                ways = u'其他'
            else:
                ways = ''

            result_name_string = ''
            for each in track.result_ids:
                result_name_string = result_name_string + ' ' +each.name

            track_data = {
                'id': track.id,
                'ways': ways,
                'track_time':track.track_time or '',
                'notes':track.notes or '',
                'remark':track.remark or '',
                'remark_time':track.write_date or '',
                'employee_id':track.employee_id.name or '',
                'result_name_string':result_name_string
            }
            track_data_list.append(track_data)


        # 该partner选定的类型
        categorys_id = partner.categorys_id.id or ''

        # 该partner选定的员工人数
        partner_employee_id = partner.partner_employee_id.id or ''

        # 该partner选定的规模
        partner_size_id = partner.partner_size_id.id or ''

        # 该partner选定的环境
        partner_environment_id = partner.partner_environment_id.id or ''

        # 该partner选定的房间数
        partner_room_id = partner.partner_room_id.id or ''



        data = {
            'id': partner.id,
            'name': partner.name or '',
            'phone':partner.phone or '',
            'mobile':partner.mobile or '',
            'shop_brand':partner.shop_brand or '',
            # 地址数据
            'street': partner.street or '',

            'state_id':partner.state_id.id or '',
            'area_id':partner.area_id.id or '',
            'subdivide_id':partner.subdivide_id.id or '',
            'business_id':partner.business_id.id or '',


            # 经营类型/类别下拉框
            'categorys_id':categorys_id,
            'categorys_id_options':categorys_id_options,
            # 员工人数下拉框
            'partner_employee_id':partner_employee_id,
            'partner_employee_id_options':partner_employee_id_options,
            # 规模下拉框
            'partner_size_id':partner_size_id,
            'partner_size_id_options':partner_size_id_options,
            # 环境下拉框
            'partner_environment_id':partner_environment_id,
            'partner_environment_id_options':partner_environment_id_options,
            # 房间数下拉框
            'partner_room_id':partner_room_id,
            'partner_room_id_options':partner_room_id_options,


            # 备注
            'comment':partner.comment or '',

            # 联系人
            'contact_data_list': contact_data_list,

            'state': partner.state or '',
            'phone': partner.phone or '',
            'mobile': partner.mobile or '',
            'contact_data_list': contact_data_list,
            'comment': partner.comment or '',
            'track_data_list':track_data_list,
            'track_ways_options':track_ways_options,
            'result_ids_options': result_ids_options,
            # 拜访记录必填
            'track_ways': '',
            'track_result_ids': '',
            'track_notes': ''

        }

        return json.dumps(data,sort_keys=True)


    #保存partner
    @http.route('/manager/partners/<int:partner_id>/submitPartner',type="http",auth="none")
    def postPartner(self, partner_id, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        vals = {}
        partner_obj = request.registry.get('res.partner')

        hr_id_list = request.registry['hr.employee'].search(request.cr, SUPERUSER_ID,[('user_id','=',uid)], context=request.context)
        hr_id = hr_id_list[0]

        vals['name'] = post.get('name','')
        vals['mobile'] = post.get('mobile','')
        vals['phone'] = post.get('phone','')
        vals['street'] = post.get('street','')





        # 处理省市县数据
        vals['state_id'] = post.get('state_id','')
        vals['area_id'] = post.get('area_id','')
        vals['subdivide_id'] = post.get('subdivide_id','')
        vals['business_id'] = post.get('business_id','')






        if post.get('partner_employee_id'):
            vals['partner_employee_id'] = int(post.get('partner_employee_id'))

        if post.get('partner_environment_id'):
            vals['partner_environment_id'] = int(post.get('partner_environment_id'))

        if post.get('partner_room_id'):
            vals['partner_room_id'] = int(post.get('partner_room_id'))

        if post.get('categorys_id'):
            vals['categorys_id'] = int(post.get('categorys_id'))


        vals['comment'] = post.get('comment','')

        vals['is_company'] = True




        # 跟踪记录
        track_vals ={}

        if not((not post.get('track_ways')) and not(post.get('track_notes')) and (not post.get('track_result_ids'))):

            track_vals['ways'] = post.get('track_ways')
            track_vals['notes'] = post.get('track_notes')

            track_vals['result_ids'] = post.get('track_result_ids')

            track_vals['employee_id'] = hr_id

            if post.get('track_result_ids'):
                result_ids = json.loads(post.get('track_result_ids'))
                result_ids_list = []
                for each in result_ids:
                    result_ids_list.append((4,each))
                track_vals['result_ids'] = result_ids_list

            vals['track_ids'] = [(0,0,track_vals)]

            #如果有拜访记录，将状态改为拜访中
            vals['state'] = 'visiting'



        # 保存数据
        # 判断是新建还是更新
        if partner_id != 0:

            partner_obj.write(request.cr, SUPERUSER_ID, partner_id, vals, context=request.context)

        else:
            vals['employee_id'] = hr_id
            partner_id = partner_obj.create(request.cr, SUPERUSER_ID,vals,context=request.context)

        data = {'partner_id':partner_id}

        return json.dumps(data,sort_keys=True)




    #更新联系人信息
    @http.route('/manager/partners/<int:partner_id>/<int:contact_id>/submitContact',type="http",auth="none")
    def submitContact(self, partner_id,contact_id, **post):
        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        vals = {}
        partner_obj = request.registry.get('res.partner')
        partner = partner_obj.browse(request.cr, SUPERUSER_ID,partner_id, context=request.context)


        vals = dict((key, post.get(key,'')) for key in ('name', 'mobile', 'function','phone','qq','wechat','use_parent_address'))


        if contact_id == 0:
            partner.write({'child_ids':[(0,0,vals)]})
        else:
            partner.write({'child_ids':[(1,contact_id,vals)]})

        return json.dumps(True,sort_keys=True)



    #获取联系人信息
    @http.route('/manager/partners/<int:partner_id>/<int:contact_id>', type='http', auth="none",)
    def getcontact(self, partner_id, contact_id, **post):


        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))


        data={}
        # 此处 contact obj　也是partner obj
        obj = request.registry.get('res.partner')
        contact_obj = obj.browse(request.cr, SUPERUSER_ID,contact_id, context=request.context)

        data = {
            'id':contact_obj.id,
            'name':contact_obj.name or '',
            'mobile':contact_obj.mobile or '',
            'function':contact_obj.function or '',
            'phone':contact_obj.phone or '',
        }


        return json.dumps(data,sort_keys=True)

    #获取所有省
    @http.route('/manager/partners/getstate', type='http', auth="none",)
    def getstate(self):


        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))


        state_obj = request.registry.get('res.country.state')
        state_ids = state_obj.search(request.cr, SUPERUSER_ID,[], context=request.context)
        data = state_obj.read(request.cr, SUPERUSER_ID,state_ids,fields=['name'], context=request.context)



        return json.dumps(data,sort_keys=True)

    #获取城市
    @http.route('/manager/partners/getarea/bystateid/<int:state_id>', type='http', auth="none",)
    def getarea(self,state_id):


        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))


        state_id = int(state_id)

        area_obj = request.registry.get('res.country.state.area')
        area_ids = area_obj.search(request.cr, SUPERUSER_ID,[('country_id','=',state_id)], context=request.context)
        data = area_obj.read(request.cr, SUPERUSER_ID,area_ids,fields=['name'], context=request.context)

        return json.dumps(data,sort_keys=True)

    #获取城市
    @http.route('/manager/partners/getsubdivide/byareaid/<int:area_id>', type='http', auth="none",)
    def getsubdivide(self,area_id):


        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))


        area_id = int(area_id)

        subdivide_obj = request.registry.get('res.country.state.area.subdivide')
        subdivide_ids = subdivide_obj.search(request.cr, SUPERUSER_ID,[('country_id','=',area_id)], context=request.context)
        data = subdivide_obj.read(request.cr, SUPERUSER_ID,subdivide_ids,fields=['name'], context=request.context)

        return json.dumps(data,sort_keys=True)


    #获取商圈
    @http.route('/manager/partners/getbusiness/bysubdivideid/<int:subdivide_id>', type='http', auth="none",)
    def getbusiness(self,subdivide_id):


        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))


        subdivide_id = int(subdivide_id)

        # 这边有字段取名字上留下的坑，要小心
        business_obj = request.registry.get('born.business')
        business_ids = business_obj.search(request.cr, SUPERUSER_ID,[('area_id','=',subdivide_id)], context=request.context)
        data = business_obj.read(request.cr, SUPERUSER_ID,business_ids,fields=['name'], context=request.context)

        return json.dumps(data,sort_keys=True)










