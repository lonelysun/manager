# -*- coding: utf-8 -*-
##############################################################################
#  COMPANY: BORN
#  AUTHOR: KIWI
#  EMAIL: arborous@gmail.com
#  VERSION : 1.0   NEW  2014/07/21
#  UPDATE : NONE
#  Copyright (C) 2011-2014 www.wevip.com All Rights Reserved
##############################################################################

{
    'name': "移动办公",
    'author': 'BORN',
    'summary': 'BORN',
    'description': """
     """,
    'category': 'BORN',
    'sequence': 8,
    'website': 'http://www.wevip.com',
    'images': [],
    'depends': ['base','born_partner','site','sale','sales_team'],
    'demo': [],
    'init_xml': [],
    'data': [
        'security/groups.xml',
        # 'security/rule.xml',
        # 'security/ir.model.access.csv',
        'born_manager.xml',
    ],
    'demo': [],
    'init_xml': [],
    'auto_install': False,
    'application': True,
    'installable': True,
}
