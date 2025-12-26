define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'mini/user/address/index' + location.search,
                    add_url: 'mini/user/address/add',
                    edit_url: 'mini/user/address/edit',
                    del_url: 'mini/user/address/del',
                    multi_url: 'mini/user/address/multi',
                    import_url: 'mini/user/address/import',
                    table: 'mini_user_address',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                fixedColumns: true,
                fixedRightNumber: 1,
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {field: 'user_id', title: __('User_id')},
                        {field: 'address_type', title: __('Address_type'), searchList: {"shipping":__('Shipping'),"billing":__('Billing')}, formatter: Table.api.formatter.normal},
                        {field: 'is_default', title: __('Is_default')},
                        {field: 'first_name', title: __('First_name'), operate: 'LIKE'},
                        {field: 'last_name', title: __('Last_name'), operate: 'LIKE'},
                        {field: 'company', title: __('Company'), operate: 'LIKE'},
                        {field: 'phone_country_code', title: __('Phone_country_code'), operate: 'LIKE'},
                        {field: 'phone_number', title: __('Phone_number'), operate: 'LIKE'},
                        {field: 'country_code', title: __('Country_code')},
                        {field: 'province', title: __('Province'), operate: 'LIKE'},
                        {field: 'province_code', title: __('Province_code'), operate: 'LIKE'},
                        {field: 'city', title: __('City'), operate: 'LIKE'},
                        {field: 'district', title: __('District'), operate: 'LIKE'},
                        {field: 'address_line1', title: __('Address_line1'), operate: 'LIKE', table: table, class: 'autocontent', formatter: Table.api.formatter.content},
                        {field: 'address_line2', title: __('Address_line2'), operate: 'LIKE', table: table, class: 'autocontent', formatter: Table.api.formatter.content},
                        {field: 'postal_code', title: __('Postal_code'), operate: 'LIKE'},
                        {field: 'tax_region', title: __('Tax_region'), operate: 'LIKE'},
                        {field: 'shipping_zone', title: __('Shipping_zone'), operate: 'LIKE'},
                        {field: 'is_shippable', title: __('Is_shippable')},
                        {field: 'createtime', title: __('Createtime'), operate:'RANGE', addclass:'datetimerange', autocomplete:false, formatter: Table.api.formatter.datetime},
                        {field: 'updatetime', title: __('Updatetime'), operate:'RANGE', addclass:'datetimerange', autocomplete:false, formatter: Table.api.formatter.datetime},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        recyclebin: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    'dragsort_url': ''
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: 'mini/user/address/recyclebin' + location.search,
                pk: 'id',
                sortName: 'id',
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {
                            field: 'deletetime',
                            title: __('Deletetime'),
                            operate: 'RANGE',
                            addclass: 'datetimerange',
                            formatter: Table.api.formatter.datetime
                        },
                        {
                            field: 'operate',
                            width: '140px',
                            title: __('Operate'),
                            table: table,
                            events: Table.api.events.operate,
                            buttons: [
                                {
                                    name: 'Restore',
                                    text: __('Restore'),
                                    classname: 'btn btn-xs btn-info btn-ajax btn-restoreit',
                                    icon: 'fa fa-rotate-left',
                                    url: 'mini/user/address/restore',
                                    refresh: true
                                },
                                {
                                    name: 'Destroy',
                                    text: __('Destroy'),
                                    classname: 'btn btn-xs btn-danger btn-ajax btn-destroyit',
                                    icon: 'fa fa-times',
                                    url: 'mini/user/address/destroy',
                                    refresh: true
                                }
                            ],
                            formatter: Table.api.formatter.operate
                        }
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);
        },

        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});
