define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'mini/wheel/product/index' + location.search,
                    add_url: 'mini/wheel/product/add',
                    edit_url: 'mini/wheel/product/edit',
                    del_url: 'mini/wheel/product/del',
                    multi_url: 'mini/wheel/product/multi',
                    import_url: 'mini/wheel/product/import',
                    table: 'mini_wheel_product',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'weigh',
                fixedColumns: true,
                fixedRightNumber: 1,
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {field: 'brand_id', title: __('Brand_id')},
                        {field: 'name', title: __('Name'), operate: 'LIKE'},
                        {field: 'slug', title: __('Slug'), operate: 'LIKE'},
                        {field: 'tagline', title: __('Tagline'), operate: 'LIKE', table: table, class: 'autocontent', formatter: Table.api.formatter.content},
                        {field: 'image', title: __('Image'), operate: false, events: Table.api.events.image, formatter: Table.api.formatter.image},
                        {field: 'manufacturing_process', title: __('Manufacturing_process'), operate: 'LIKE'},
                        {field: 'finish_name', title: __('Finish_name'), operate: 'LIKE'},
                        {field: 'center_cap_included', title: __('Center_cap_included')},
                        {field: 'hub_ring_included', title: __('Hub_ring_included')},
                        {field: 'design_style', title: __('Design_style'), operate: 'LIKE'},
                        {field: 'status', title: __('Status'), searchList: {"normal":__('Normal'),"hidden":__('Hidden'),"soldout":__('Soldout')}, formatter: Table.api.formatter.status},
                        {field: 'featuredswitch', title: __('Featuredswitch'), table: table, formatter: Table.api.formatter.toggle},
                        {field: 'newswitch', title: __('Newswitch'), table: table, formatter: Table.api.formatter.toggle},
                        {field: 'winterapprovedswitch', title: __('Winterapprovedswitch'), table: table, formatter: Table.api.formatter.toggle},
                        {field: 'weigh', title: __('Weigh'), operate: false},
                        {field: 'createtime', title: __('Createtime'), operate:'RANGE', addclass:'datetimerange', autocomplete:false, formatter: Table.api.formatter.datetime},
                        {field: 'updatetime', title: __('Updatetime'), operate:'RANGE', addclass:'datetimerange', autocomplete:false, formatter: Table.api.formatter.datetime},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
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
