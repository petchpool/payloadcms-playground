import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Smart Lotto',
      label: 'ชื่อเว็บไซต์',
    },
    {
      name: 'siteDescription',
      type: 'text',
      label: 'คำอธิบายเว็บไซต์',
      admin: {
        description: 'คำอธิบายสั้นๆ ของเว็บไซต์',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'โลโก้',
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      label: 'Favicon',
    },
    {
      name: 'footerText',
      type: 'text',
      defaultValue: 'Smart Lotto - ระบบหวยออนไลน์',
      label: 'ข้อความ Footer',
    },
    {
      name: 'contactEmail',
      type: 'email',
      label: 'อีเมลติดต่อ',
    },
    {
      name: 'contactPhone',
      type: 'text',
      label: 'เบอร์โทรติดต่อ',
    },
  ],
  access: {
    read: () => true, // ทุกคนอ่านได้
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
}

