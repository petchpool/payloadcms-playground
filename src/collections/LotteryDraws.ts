import type { CollectionConfig } from 'payload'

export const LotteryDraws: CollectionConfig = {
  slug: 'lottery-draws',
  admin: {
    useAsTitle: 'drawDate',
    defaultColumns: ['drawDate', 'drawNumber', 'round', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'drawNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'เลขงวด',
      admin: {
        description: 'เลขงวดหวย เช่น 25670101',
      },
    },
    {
      name: 'drawDate',
      type: 'date',
      required: true,
      index: true,
      label: 'วันที่ออกผล',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'round',
      type: 'select',
      required: true,
      defaultValue: 'morning',
      options: [
        {
          label: 'รอบเช้า',
          value: 'morning',
        },
        {
          label: 'รอบบ่าย',
          value: 'afternoon',
        },
        {
          label: 'รอบเย็น',
          value: 'evening',
        },
      ],
      label: 'รอบหวย',
      admin: {
        description: 'เลือกรอบหวย (เช้า/บ่าย/เย็น)',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: 'รอออกผล',
          value: 'pending',
        },
        {
          label: 'ออกผลแล้ว',
          value: 'completed',
        },
        {
          label: 'ยกเลิก',
          value: 'cancelled',
        },
      ],
      label: 'สถานะ',
    },
    {
      name: 'description',
      type: 'text',
      label: 'รายละเอียด',
    },
  ],
  timestamps: true,
  access: {
    read: () => true, // ทุกคนอ่านได้
    create: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
}
