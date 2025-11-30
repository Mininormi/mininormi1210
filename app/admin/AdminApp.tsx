// app/admin/AdminApp.tsx
'use client'

import type { ReactNode } from 'react'
import { Refine } from '@refinedev/core'
import { ThemedLayout, useNotificationProvider } from '@refinedev/antd'
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar'
import routerProvider from '@refinedev/nextjs-router'
import dataProvider from '@refinedev/simple-rest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function AdminApp({ children }: { children: ReactNode }) {
  const notificationProvider = useNotificationProvider()

  return (
    <QueryClientProvider client={queryClient}>
      <RefineKbarProvider>
        <Refine
          routerProvider={routerProvider}
          notificationProvider={notificationProvider}
          dataProvider={dataProvider('/api')}
          resources={[
            {
              name: 'brands',
              list: '/admin/brands',
              create: '/admin/brands/create',
              edit: '/admin/brands/edit/:id',
            },
            {
              name: 'products',
              list: '/admin/products',
              create: '/admin/products/create',
              edit: '/admin/products/edit/:id',
            },
            {
              name: 'variants',
              list: '/admin/variants',
              create: '/admin/variants/create',
              edit: '/admin/variants/edit/:id',
            },
          ]}
        >
          <ThemedLayout>{children}</ThemedLayout>
          <RefineKbar />
        </Refine>
      </RefineKbarProvider>
    </QueryClientProvider>
  )
}
