<?php

namespace app\admin\model\mini\wheel\product;

use think\Model;


class Spec extends Model
{

    

    

    // 表名
    protected $table = 'mini_wheel_product_spec';
    
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'integer';

    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $deleteTime = false;

    // 追加属性
    protected $append = [
        'seat_type_text',
        'status_text'
    ];
    

    protected static function init()
    {
        self::afterInsert(function ($row) {
            if (!$row['weigh']) {
                $pk = $row->getPk();
                $row->getQuery()->where($pk, $row[$pk])->update(['weigh' => $row[$pk]]);
            }
        });
    }

    
    public function getSeatTypeList()
    {
        return ['cone' => __('Cone'), 'ball' => __('Ball'), 'flat' => __('Flat')];
    }

    public function getStatusList()
    {
        return ['normal' => __('Normal'), 'hidden' => __('Hidden'), 'soldout' => __('Soldout')];
    }


    public function getSeatTypeTextAttr($value, $data)
    {
        $value = $value ?: ($data['seat_type'] ?? '');
        $list = $this->getSeatTypeList();
        return $list[$value] ?? '';
    }


    public function getStatusTextAttr($value, $data)
    {
        $value = $value ?: ($data['status'] ?? '');
        $list = $this->getStatusList();
        return $list[$value] ?? '';
    }




    public function product()
    {
        return $this->belongsTo('app\admin\model\mini\wheel\Product', 'product_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }
}
