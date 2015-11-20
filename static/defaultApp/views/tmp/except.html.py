# -*- coding:utf-8 -*-
from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
__M_dict_builtin = dict
__M_locals_builtin = locals
_magic_number = 10
_modified_time = 1441590705.203663
_enable_loop = True
_template_filename = '/opt/odoo-dev/born/born_manager/static/defaultApp/views/except.html'
_template_uri = 'except.html'
_source_encoding = 'utf-8'
_exports = []


def render_body(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        __M_locals = __M_dict_builtin(pageargs=pageargs)
        __M_writer = context.writer()
        __M_writer(u'<!DOCTYPE html>\n<html ng-app="reservationApp">\n<head>\n    <title>404</title>\n    <meta http-equiv="X-UA-Compatible" content="IE=edge" />\n    <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0" />\n    <link href="/born_manager/static/src/css/bootstrap.min.css" rel="stylesheet" />\n    <link href="/born_manager/static/src/css/font.css" rel="stylesheet" />\n    <link href="/born_manager/static/src/css/app.min.css" rel="stylesheet" />\n    <link href="/born_manager/static/src/css/font-awesome.min.css" rel="stylesheet" />\n    <link href="/born_manager/static/src/css/styles.css" rel="stylesheet" />\n    <link href="/born_manager/static/src/css/simple-line-icons.css" rel="stylesheet" />\n    <link href="/born_manager/static/src/css/toaster.min.css" rel="stylesheet" />\n</head>\n<body>\n<div class="app app-header-fixed  ">\n  \n\n<div class="container w-xxl w-auto-xs" ng-init="app.settings.container = false;">\n  <div class="text-center m-b-lg">\n    <h1 class="text-shadow text-white">404</h1>\n  </div>\n\n  <div class="text-center" ng-include="\'tpl/blocks/page_footer.html\'">\n    <p>\n  <small class="text-muted">\u4e0a\u6d77\u6ce2\u6069\u7f51\u7edc\u79d1\u6280\u670d\u52a1\u6709\u9650\u516c\u53f8 WE-ERP<br>&copy; 2015</small>\n</p>\n  </div>\n</div>\n\n\n</div>\n\n\n</body>\n</html>\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


"""
__M_BEGIN_METADATA
{"source_encoding": "utf-8", "line_map": {"26": 20, "20": 1, "15": 0}, "uri": "except.html", "filename": "/opt/odoo-dev/born/born_manager/static/defaultApp/views/except.html"}
__M_END_METADATA
"""
