// \app\admin\brands\page.tsx

'use client'

import { List, useTable, EditButton, CreateButton } from '@refinedev/antd'
import { Table } from 'antd'

export default function BrandListPage() {
  const { tableProps } = useTable({
    resource: 'brands',
  })

  return (
    <List title="Brands" headerButtons={<CreateButton />}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column dataIndex="slug" title="Slug" />
        <Table.Column
          title="Actions"
          render={(_, record: any) => <EditButton hideText recordItemId={record.id} />}
        />
      </Table>
    </List>
  )
}
