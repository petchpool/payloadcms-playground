import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation Menu',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'menuItems',
      type: 'array',
      label: 'Menu Items',
      minRows: 1,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Label',
          admin: {
            description: 'ข้อความที่แสดงในเมนู',
          },
        },
        {
          name: 'href',
          type: 'text',
          required: true,
          label: 'Link',
          admin: {
            description: 'URL หรือ path (เช่น /buy, /results)',
          },
        },
        {
          name: 'showWhen',
          type: 'select',
          required: true,
          defaultValue: 'always',
          options: [
            {
              label: 'แสดงเสมอ',
              value: 'always',
            },
            {
              label: 'แสดงเมื่อ login แล้วเท่านั้น',
              value: 'authenticated',
            },
            {
              label: 'แสดงเมื่อยังไม่ login',
              value: 'guest',
            },
          ],
          label: 'แสดงเมื่อ',
        },
        {
          name: 'order',
          type: 'number',
          label: 'ลำดับ',
          admin: {
            description: 'ลำดับการแสดงผล (น้อยกว่า = แสดงก่อน)',
          },
          defaultValue: 0,
        },
      ],
    },
  ],
  access: {
    read: () => true, // ทุกคนอ่านได้
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
}
