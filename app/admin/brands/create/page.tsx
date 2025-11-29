// \app\admin\brands\create\page.tsx

'use client'

import { Create, useForm } from '@refinedev/antd'
import { Form, Input } from 'antd'

export default function BrandCreatePage() {
  const { formProps, saveButtonProps } = useForm({
    resource: 'brands',
  })

  return (
    <Create title="Create Brand" saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
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
    </Create>
  )
}
