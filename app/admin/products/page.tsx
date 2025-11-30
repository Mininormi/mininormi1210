// \app\admin\products\page.tsx

'use client'

import { List, useTable, EditButton, CreateButton, DeleteButton } from '@refinedev/antd'
import { Table, Space } from 'antd'

type Product = {
  id: number
  name: string
  description?: string | null
  mainImage?: string | null
  brandId: number
  brand?: {
    id: number
    name: string
  }
}

export default function ProductListPage() {
  const { tableProps } = useTable<Product>({
    resource: 'products',
  })

  return (
    <List title="Products" headerButtons={<CreateButton />}>
      <Table {...tableProps} rowKey="id">
        <Table.Column<Product> dataIndex="id" title="ID" />
        <Table.Column<Product> dataIndex="name" title="Name" />

        {/* 嵌套字段：brand.name */}
        <Table.Column<Product> dataIndex={['brand', 'name']} title="Brand" />

        <Table.Column<Product> dataIndex="description" title="Description" ellipsis />

        <Table.Column<Product>
          dataIndex="mainImage"
          title="Image"
          render={(value) =>
            value ? (
              <img
                src={value}
                style={{
                  width: 60,
                  height: 60,
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
            ) : (
              '-'
            )
          }
        />

        <Table.Column<Product>
          title="Actions"
          render={(_, record) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  )
}
