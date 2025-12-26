<?php

namespace app\admin\controller\general;

use app\common\controller\Backend;

/**
 * 附件管理
 *
 * @icon   fa fa-circle-o
 * @remark 主要用于管理上传到服务器或第三方存储的数据
 */
class Attachment extends Backend
{

    /**
     * @var \app\common\model\Attachment
     */
    protected $model = null;

    protected $searchFields = 'id,filename,url';
    protected $noNeedRight = ['classify'];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('Attachment');
        $this->view->assign("mimetypeList", \app\common\model\Attachment::getMimetypeList());
        $this->view->assign("categoryList", \app\common\model\Attachment::getCategoryList());
        $this->assignconfig("categoryList", \app\common\model\Attachment::getCategoryList());
    }

    /**
     * 查看
     */
    public function index()
    {
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            $mimetypeQuery = [];
            $filter = $this->request->request('filter');
            $filterArr = (array)json_decode($filter, true);
            if (isset($filterArr['category']) && $filterArr['category'] == 'unclassed') {
                $filterArr['category'] = ',unclassed';
                $this->request->get(['filter' => json_encode(array_diff_key($filterArr, ['category' => '']))]);
            }
            if (isset($filterArr['mimetype']) && preg_match("/(\/|\,|\*)/", $filterArr['mimetype'])) {
                $mimetype = $filterArr['mimetype'];
                $filterArr = array_diff_key($filterArr, ['mimetype' => '']);
                $mimetypeQuery = function ($query) use ($mimetype) {
                    $mimetypeArr = array_filter(explode(',', $mimetype));
                    foreach ($mimetypeArr as $index => $item) {
                        $query->whereOr('mimetype', 'like', '%' . str_replace("/*", "/", $item) . '%');
                    }
                };
            }
            $this->request->get(['filter' => json_encode($filterArr)]);

            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            $list = $this->model
                ->where($mimetypeQuery)
                ->where($where)
                ->order($sort, $order)
                ->paginate($limit);

            $cdnurl = preg_replace("/\/(\w+)\.php$/i", '', $this->request->root());
            foreach ($list as $k => &$v) {
                // 预览始终使用本地链接（节省 R2 读取次数）
                // R2 的完整 URL 存储在 r2_url 字段中
                $v['fullurl'] = $cdnurl . $v['url'];
                // 如果存在 r2_url，也返回给前端（可选显示）
                if (isset($v['r2_url']) && !empty($v['r2_url'])) {
                    $v['r2_url_display'] = $v['r2_url'];
                }
            }
            unset($v);
            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 选择附件
     */
    public function select()
    {
        if ($this->request->isAjax()) {
            return $this->index();
        }
        $mimetype = $this->request->get('mimetype', '');
        $mimetype = substr($mimetype, -1) === '/' ? $mimetype . '*' : $mimetype;
        $this->view->assign('mimetype', $mimetype);
        return $this->view->fetch();
    }

    /**
     * 添加
     */
    public function add()
    {
        if ($this->request->isAjax()) {
            $this->error();
        }
        return $this->view->fetch();
    }

    /**
     * 删除附件
     * @param array $ids
     */
    public function del($ids = "")
    {
        if (!$this->request->isPost()) {
            $this->error(__("Invalid parameters"));
        }
        $ids = $ids ? $ids : $this->request->post("ids");
        if ($ids) {
            // 添加本地文件删除的 hook（仅当 storage 为 local 时）
            \think\Hook::add('upload_delete', function ($params) {
                if ($params['storage'] == 'local') {
                    $attachmentFile = ROOT_PATH . '/public' . $params['url'];
                    if (is_file($attachmentFile)) {
                        @unlink($attachmentFile);
                    }
                }
                // R2 存储的删除逻辑由 R2Storage 行为类处理
            });
            $attachmentlist = $this->model->where('id', 'in', $ids)->select();
            foreach ($attachmentlist as $attachment) {
                \think\Hook::listen("upload_delete", $attachment);
                $attachment->delete();
            }
            $this->success();
        }
        $this->error(__('Parameter %s can not be empty', 'ids'));
    }

    /**
     * 归类
     */
    public function classify()
    {
        if (!$this->auth->check('general/attachment/edit')) {
            \think\Hook::listen('admin_nopermission', $this);
            $this->error(__('You have no permission'), '');
        }
        if (!$this->request->isPost()) {
            $this->error(__("Invalid parameters"));
        }
        $category = $this->request->post('category', '');
        $ids = $this->request->post('ids');
        if (!$ids) {
            $this->error(__('Parameter %s can not be empty', 'ids'));
        }
        $categoryList = \app\common\model\Attachment::getCategoryList();
        if ($category && !isset($categoryList[$category])) {
            $this->error(__('Category not found'));
        }
        $category = $category == 'unclassed' ? '' : $category;
        \app\common\model\Attachment::where('id', 'in', $ids)->update(['category' => $category]);
        $this->success();
    }

}
