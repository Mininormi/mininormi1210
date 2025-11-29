// \app\admin\brands\edit\[id]\page.tsx

'use client'

import { Edit, useForm } from '@refinedev/antd'
import { Form, Input } from 'antd'

export default function BrandEditPage() {
  const { formProps, saveButtonProps } = useForm({
    resource: 'brands',
  })

  return (
    <Edit title="Edit Brand" saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        {/* ID 不给改，只当展示用，也可以直接去掉 */}
        <Form.Item label="ID" name="id">
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Slug"
          name="slug"
          rules={[{ required: true, message: 'Slug is required' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  )
}
