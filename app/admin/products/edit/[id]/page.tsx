// \app\admin\products\edit\[id]\page.tsx

'use client'

import { Edit, useForm, useSelect } from '@refinedev/antd'
import { Form, Input, Select } from 'antd'

type BrandOption = {
  id: number
  name: string
}

export default function ProductEditPage() {
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: 'products',
  })

  const { selectProps: brandSelectProps } = useSelect<BrandOption>({
    resource: 'brands',
    optionLabel: 'name',
    optionValue: 'id',
  })

  const record = queryResult?.data?.data

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      title={record ? `Edit Product: ${record.name}` : 'Edit Product'}
    >
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
    </Edit>
  )
}
