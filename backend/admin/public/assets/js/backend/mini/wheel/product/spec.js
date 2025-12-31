define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'mini.wheel.product.spec/index' + location.search,
                    add_url: 'mini.wheel.product.spec/add',
                    edit_url: 'mini.wheel.product.spec/edit',
                    del_url: 'mini.wheel.product.spec/del',
                    multi_url: 'mini.wheel.product.spec/multi',
                    import_url: 'mini.wheel.product.spec/import',
                    table: 'mini_wheel_product_spec',
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
                        {field: 'product_id', title: __('Product_id')},
                        {field: 'slug', title: __('Slug'), operate: 'LIKE'},
                        {field: 'size', title: __('Size'), operate: 'LIKE'},
                        {field: 'diameter', title: __('Diameter')},
                        {field: 'width', title: __('Width'), operate:'BETWEEN'},
                        {field: 'pcd', title: __('Pcd'), operate: 'LIKE'},
                        {field: 'pcd_lugs', title: __('Pcd_lugs')},
                        {field: 'pcd_mm', title: __('Pcd_mm'), operate:'BETWEEN'},
                        {field: 'offset', title: __('Offset')},
                        {field: 'center_bore', title: __('Center_bore'), operate:'BETWEEN'},
                        {field: 'seat_type', title: __('Seat_type'), searchList: {"cone":__('Cone'),"ball":__('Ball'),"flat":__('Flat')}, formatter: Table.api.formatter.normal},
                        {field: 'bolt_hole_diameter_mm', title: __('Bolt_hole_diameter_mm'), operate:'BETWEEN'},
                        {field: 'weight_kg', title: __('Weight_kg'), operate:'BETWEEN'},
                        {field: 'load_rating_kg', title: __('Load_rating_kg')},
                        {field: 'tpmscompatibleswitch', title: __('Tpmscompatibleswitch'), table: table, formatter: Table.api.formatter.toggle},
                        {field: 'sale_price', title: __('Sale_price'), operate:'BETWEEN'},
                        {field: 'original_price', title: __('Original_price'), operate:'BETWEEN'},
                        {field: 'stock', title: __('Stock')},
                        {field: 'status', title: __('Status'), searchList: {"normal":__('Normal'),"hidden":__('Hidden'),"soldout":__('Soldout')}, formatter: Table.api.formatter.status},
                        {field: 'weigh', title: __('Weigh'), operate: false},
                        {field: 'createtime', title: __('Createtime'), operate:'RANGE', addclass:'datetimerange', autocomplete:false, formatter: Table.api.formatter.datetime},
                        {field: 'updatetime', title: __('Updatetime'), operate:'RANGE', addclass:'datetimerange', autocomplete:false, formatter: Table.api.formatter.datetime},
                        {field: 'product.name', title: __('Product.name'), operate: 'LIKE'},
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
