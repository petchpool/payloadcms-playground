import type { GlobalConfig } from 'payload'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home Page',
  admin: {
    group: 'Content',
  },
  fields: [
    {
      name: 'heroTitle',
      type: 'text',
      required: true,
      defaultValue: 'เริ่มซื้อหวยวันนี้!',
      label: 'หัวข้อหลัก (Hero Title)',
    },
    {
      name: 'heroDescription',
      type: 'textarea',
      label: 'คำอธิบายหลัก (Hero Description)',
      admin: {
        description: 'ข้อความที่แสดงใต้หัวข้อหลัก',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'รูปภาพ Hero',
    },
    {
      name: 'heroButtonText',
      type: 'text',
      defaultValue: 'เข้าสู่ระบบ',
      label: 'ข้อความปุ่ม Hero',
    },
    {
      name: 'heroButtonLink',
      type: 'text',
      defaultValue: '/login',
      label: 'ลิงก์ปุ่ม Hero',
    },
    {
      name: 'showHero',
      type: 'checkbox',
      defaultValue: true,
      label: 'แสดง Hero Section',
    },
    {
      name: 'features',
      type: 'array',
      label: 'Features',
      admin: {
        description: 'Features ที่จะแสดงในหน้าแรก',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'หัวข้อ',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'คำอธิบาย',
        },
        {
          name: 'icon',
          type: 'text',
          label: 'Icon (emoji หรือ text)',
          admin: {
            description: 'เช่น 🎰, 🎯, 💰',
          },
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
          label: 'ลำดับ',
        },
      ],
    },
    {
      name: 'showFeatures',
      type: 'checkbox',
      defaultValue: true,
      label: 'แสดง Features Section',
    },
    {
      name: 'ctaTitle',
      type: 'text',
      defaultValue: 'เริ่มซื้อหวยวันนี้!',
      label: 'หัวข้อ CTA',
    },
    {
      name: 'ctaDescription',
      type: 'textarea',
      defaultValue: 'เข้าสู่ระบบเพื่อซื้อหวยและตรวจผล',
      label: 'คำอธิบาย CTA',
    },
    {
      name: 'ctaButtonText',
      type: 'text',
      defaultValue: 'เข้าสู่ระบบ',
      label: 'ข้อความปุ่ม CTA',
    },
    {
      name: 'ctaButtonLink',
      type: 'text',
      defaultValue: '/login',
      label: 'ลิงก์ปุ่ม CTA',
    },
    {
      name: 'showCTA',
      type: 'checkbox',
      defaultValue: true,
      label: 'แสดง CTA Section',
    },
  ],
  access: {
    read: () => true, // ทุกคนอ่านได้
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
}

