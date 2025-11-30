// \app\admin\products\create\page.tsx

// app/admin/products/create/page.tsx
'use client'

import { Create, useForm, useSelect } from '@refinedev/antd'
import { Form, Input, Select } from 'antd'

type BrandOption = {
  id: number
  name: string
}

export default function ProductCreatePage() {
  const { formProps, saveButtonProps } = useForm({
    resource: 'products',
  })

  const { selectProps: brandSelectProps } = useSelect<BrandOption>({
    resource: 'brands',
    optionLabel: 'name',
    optionValue: 'id',
  })

  return (
    <Create saveButtonProps={saveButtonProps} title="Create Product">
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter product name' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Brand"
          name="brandId"
          rules={[{ required: true, message: 'Please select a brand' }]}
        >
          <Select {...brandSelectProps} />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label="Main Image URL" name="mainImage">
          <Input />
        </Form.Item>
      </Form>
    </Create>
  )
}
