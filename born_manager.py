# -*- coding: utf-8 -*-
##############################################################################
#  COMPANY: BORN
#  AUTHOR: LH
#  EMAIL: arborous@qq.com
#  VERSION : 1.0   NEW  2014/08/25
#  UPDATE : NONE
#  Copyright (C) 2011-2014 www.wevip.com All Rights Reserved
##############################################################################

from openerp.osv import fields, osv
from openerp import SUPERUSER_ID
import urllib2
import base64
import openerp



class born_extendpartner(osv.osv):
    _inherit = 'res.partner'

    def born_function_partner(self,cr,uid,ids,context=None):
        user_obj = self.pool.get('res.users')
        user = user_obj.browse(cr,uid,uid,context=context)
        partner_ids = []
        print(user.role_option)
        if user.role_option == '8':

            saleteam_obj = self.pool.get('crm.team')
            domain=[('user_id','=',uid)]
            tid = saleteam_obj.search(cr, uid, domain, context=context)
            if tid:
                team = saleteam_obj.browse(cr, uid, tid[0], context=context)
            else:
                return []
            business_obj = self.pool.get('born.business')
            region_obj = self.pool.get('res.country.state.area.subdivide')

            #获取团队负责的所有商圈id，行政区id
            c_ids = set([city.id for city in team.city_ids])
            s_ids = set([subdivide.id for subdivide in team.subdivide_ids])
            country_ids = set([subdivide.country_id.id for subdivide in team.subdivide_ids])
            b_ids = set([business.id for business in team.business_ids])
            area_ids = set([business.area_id.id for business in team.business_ids])
            all_cityids = [val for val in c_ids.difference(country_ids)]
            exits_ids = region_obj.search(cr, uid,[('country_id','in',all_cityids)], context=context)
            s_ids = s_ids | set(exits_ids)
            all_business = [val for val in s_ids.difference(area_ids)]
            exits_business = business_obj.search(cr, uid,[('area_id','in',all_business)], context=context)
            b_ids = b_ids | set(exits_business)
            businesses_ids = [id for id in b_ids]
            subdivide_ids = [id for id in s_ids]

            partner_obj = self.pool.get('res.partner')
            domain = [('business_id','in',businesses_ids)]
            partner_ids = partner_obj.search(cr, uid, domain, context=context)
            if not partner_ids:
                partner_ids = [-1]
        elif user.role_option == '7':
            track_obj = self.pool.get('born.partner.track')
            track_ids = track_obj.search(cr, uid, [('employee_id','=',uid)], context=context)
            tracks = track_obj.browse(cr, uid, track_ids,context=context)

            for each_track in tracks:
                partner_ids.append(each_track.track_id.id)

            partner_ids = list(set(partner_ids))

            if not partner_ids:
                partner_ids = [-1]
        return partner_ids


class born_manager_mission(osv.osv):
    """Model"""
    _inherit = 'born.partner.track'

    def _get_contacts_mobile(self, cr, uid, ids, field_name, arg=None, context=None):
        res={}

        partner_obj = self.pool.get('res.partner')

        for id in ids:
            contacts_id = self.browse(cr,uid,id,context=context).contacts_id.id

            res[id] = partner_obj.browse(cr,uid,contacts_id,context=context).mobile or ''

        return res

    def _get_contacts_address(self, cr, uid, ids, field_name, arg=None, context=None):
        res={}
        partner_obj = self.pool.get('res.partner')

        # 判断是销售还是技术支持
        res_users_class = self.pool.get('res.users')
        res_user_obj = res_users_class.browse(cr, uid, uid, context=context)

        role_option = res_user_obj.role_option

        if role_option in ['7', '8']:
            for id in ids:
                res[id] = self.browse(cr,uid,id,context=context).track_id.street
        elif role_option in ['9', '10']:
            for id in ids:
                res[id] = self.browse(cr,uid,id,context=context).track_company_id.street

        return res


    def _onchange_track_id(self, cr, uid, ids, track_id, context=None):
        res = {'domain': {'contacts_id': [('id', '=', None)]}}

        if track_id:
            contact_obj = self.pool.get('res.partner').browse(cr, uid, track_id, context=context)
            contact_ids = contact_obj.child_ids.ids

            res['domain'] = {'contacts_id': [('id', 'in', contact_ids)]}

        return res

    def _onchange_track_company_id(self, cr, uid, ids, track_company_id, context=None):
        res = {'domain': {'contacts_id': [('id', '=', None)]}}
        if track_company_id:
            # partner_obj = self.pool.get('res.partner')
            company_obj = self.pool.get('res.company')
            contact_ids = company_obj.browse(cr,SUPERUSER_ID,track_company_id,context=context).partner_id.child_ids.ids

            res['domain'] = {'contacts_id': [('id', 'in', contact_ids)]}
        return res


    def born_function_mission(self, cr, uid, ids, context=None):
        # 判断是经理还是销售人员
        res_users_class = self.pool.get('res.users')
        res_user_obj = res_users_class.browse(cr, uid, uid, context=context)

        role_option = res_user_obj.role_option

        if role_option in ['7', '8', '9', '10']:
            if role_option == '7':
                ids = self.search(cr,uid,[('employee_id','=',uid)],context=context)

            elif role_option == '8':
                saleteam_obj = self.pool.get('crm.team')
                domain=[('user_id','=',uid)]
                tid = saleteam_obj.search(cr, uid, domain, context=context)
                if tid == []:
                    return [-1]
                team = saleteam_obj.browse(cr, uid, tid[0], context=context)

                business_obj = self.pool.get('born.business')
                region_obj = self.pool.get('res.country.state.area.subdivide')

                #获取团队负责的所有商圈id，行政区id
                c_ids = set([city.id for city in team.city_ids])
                s_ids = set([subdivide.id for subdivide in team.subdivide_ids])
                country_ids = set([subdivide.country_id.id for subdivide in team.subdivide_ids])
                b_ids = set([business.id for business in team.business_ids])
                area_ids = set([business.area_id.id for business in team.business_ids])
                all_cityids = [val for val in c_ids.difference(country_ids)]
                exits_ids = region_obj.search(cr, uid,[('country_id','in',all_cityids)], context=context)
                s_ids = s_ids | set(exits_ids)
                all_business = [val for val in s_ids.difference(area_ids)]
                exits_business = business_obj.search(cr, uid,[('area_id','in',all_business)], context=context)
                b_ids = b_ids | set(exits_business)
                businesses_ids = [id for id in b_ids]
                subdivide_ids = [id for id in s_ids]

                partner_obj = self.pool.get('res.partner')
                domain = [('business_id','in',businesses_ids)]
                partner_ids = partner_obj.search(cr, uid, domain, context=context)

                ids = self.search(cr,uid,[('track_id','in',partner_ids)],context=context)

            elif role_option == '9':
                ids = self.search(cr,uid,[('employee_id','=',uid)],context=context)

            elif role_option == '10':
                # 技术经理能看到的任务
                team_obj = self.pool.get('crm.team')
                team_id = team_obj.search(cr,SUPERUSER_ID,[('user_id','=',uid)],context=context)
                if team_id == []:
                    return [-1]
                team = team_obj.browse(cr, SUPERUSER_ID, team_id, context=context)
                employee_ids = team.member_ids
                ids = []
                for employee in employee_ids:
                    ids = self.search(cr, SUPERUSER_ID, [('employee_id','=',employee.id)],context=context)+ids

            if ids == []:
                ids = [-1]


        else:
            ids = []

        return ids





    def _get_user_role(self, cr, uid, ids, name,arg=None, context=None):
        res={}
        user_obj = self.pool.get('res.users')
        print '*************************'

        for id in ids:
            user = user_obj.browse(cr,uid,uid,context=context)

            res[id] = user.role_option

        print res

        return res
    def _default_get_role(self, cr, uid, name,arg=None, context=None):
        res={}
        print '----------------->>>>>>>'
        user_obj = self.pool.get('res.users')

        user = user_obj.browse(cr,uid,uid,context=context)

        return user.role_option


    def button_start(self, cr, uid, ids, context=None):
        self.write(cr,uid,ids,{'state':'start'},context=context)
        return

    def button_pause(self, cr, uid, ids, context=None):
        self.write(cr,uid,ids,{'state':'pause'},context=context)
        return

    def button_finish(self, cr, uid, ids, context=None):
        vals = {}
        vals['track_time'] = fields.datetime.now()
        vals['state'] = 'finished'
        self.write(cr,uid,ids,vals,context=context)

        return

    def button_done(self, cr, uid, ids, context=None):
        self.write(cr,uid,ids,{'state':'done'},context=context)
        return



    _columns = {
        'contacts_mobile': fields.function(_get_contacts_mobile, string=u"联系人手机", type='char', method=True, store=True),
        'contacts_address' : fields.function(_get_contacts_address,string=u'地址',type='char', method=True,store=True),
        'user_role': fields.function(_get_user_role, type='char', method=True, store=False),
    }

    _defaults = {
        'user_role': _default_get_role,
    }


class born_manager_company(osv.osv):
    _inherit = 'res.company'


    def born_function_born_manager_company(self, cr, uid, ids, context=None):
        # 判断是经理还是销售人员
        res_users_class = self.pool.get('res.users')
        res_user_obj = res_users_class.browse(cr, SUPERUSER_ID, uid, context=context)

        role_option = res_user_obj.role_option

        if role_option in ['7', '8', '9', '10']:


            # 从uid得到hr_id
            hr_id_list = self.pool.get('hr.employee').search(cr, SUPERUSER_ID,[('user_id','=', uid)], context=context)
            if hr_id_list:
                hr_id = hr_id_list[0] or ''
            else:
                raise osv.except_osv(u'错误!', u'请先创建和登录账号相匹配的员工账号')



            if role_option == '7':

                ids = self.pool.get('res.company').search(cr, SUPERUSER_ID, [('sale_employee_id', '=', hr_id)], context=context)
            elif role_option == '8':
                ids = []

            elif role_option == '9':
                ids = self.search(cr,SUPERUSER_ID,[('employee_id','=',hr_id)],context=context)

            elif role_option == '10':
                # 技术经理能看到的公司
                team_obj = self.pool.get('crm.team')
                team_id = team_obj.search(cr,SUPERUSER_ID,[('user_id','=',uid)],context=context)
                if team_id == []:
                    return [-1]
                team = team_obj.browse(cr, SUPERUSER_ID, team_id, context=context)
                employee_ids = team.member_ids
                ids = []
                for employee in employee_ids:
                    hr_id_list = self.pool.get('hr.employee').search(cr, SUPERUSER_ID,[('user_id','=', employee.id)], context=context)
                    if hr_id_list:
                        hr_id = hr_id_list[0] or ''
                        ids = self.search(cr,SUPERUSER_ID,[('employee_id','=',hr_id)],context=context)+ids

            if ids == []:
                ids = [-1]
        else:
            ids = []

        return ids








class born_manager_team(osv.osv):
    _inherit = 'crm.team'

    def born_function_team(self, cr, uid, ids, context=None):
        ids = []
        user_obj = self.pool.get('res.users')
        user = user_obj.browse(cr,uid,uid,context=context)
        if user.role_option in ('10','9','8','7'):
            ids = self.search(cr,uid,[('user_id','=',uid)],context=context)
            if ids == []:
                ids = [-1]

        return ids


class born_manager_users(osv.osv):
    _inherit = 'res.users'

    def born_function_manager_user(self, cr, uid, ids, context=None):
        ids = []
        user = self.browse(cr,uid,uid,context=context)
        if user.role_option == '8' or user.role_option == '10':
            team_obj = self.pool.get('crm.team')
            team_id = team_obj.search(cr,SUPERUSER_ID,[('user_id','=',uid)],context=context)
            if team_id == []:
                return [-1]
            team = team_obj.browse(cr, SUPERUSER_ID, team_id, context=context)
            for member in team.member_ids:
                ids.append(member.id)
        else:
            ids = [uid]

        return ids