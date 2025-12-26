<?php

return [
    'Id'                 => 'ID',
    'User_id'            => '用户ID（鉴权用户）',
    'Address_type'       => '地址类型',
    'Is_default'         => '是否默认地址（同用户同类型仅允许1个默认,事务保证）',
    'First_name'         => '名',
    'Last_name'          => '姓',
    'Company'            => '公司（可选）',
    'Phone_country_code' => '电话国家码,如+1/+86',
    'Phone_number'       => '电话号码（不含国家码）',
    'Country_code'       => '国家代码（ISO 2位,如CA/US）',
    'Province'           => '省/州（自由文本）',
    'Province_code'      => '省/州代码（预留Shopify,如ON/CA）',
    'City'               => '城市（自由文本）',
    'District'           => '区/县（自由文本,可选）',
    'Address_line1'      => '地址行1（必填）',
    'Address_line2'      => '地址行2（公寓/门牌等,可选）',
    'Postal_code'        => '邮编',
    'Tax_region'         => '税区标识（预留）',
    'Shipping_zone'      => '运费/配送区标识（预留）',
    'Is_shippable'       => '是否可配送（预留边界）',
    'Deletetime'         => '删除时间（NULL=未删除）',
    'Createtime'         => '创建时间',
    'Updatetime'         => '更新时间'
];
