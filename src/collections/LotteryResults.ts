import type { CollectionConfig } from 'payload'
import { checkAllTicketsForDraw } from '../hooks/checkLotteryResults'

export const LotteryResults: CollectionConfig = {
  slug: 'lottery-results',
  admin: {
    useAsTitle: 'draw',
    defaultColumns: ['draw', 'firstPrize', 'secondPrize', 'thirdPrize', 'createdAt'],
  },
  fields: [
    {
      name: 'draw',
      type: 'relationship',
      relationTo: 'lottery-draws',
      required: true,
      unique: true,
      index: true,
      label: 'งวดหวย',
    },
    {
      name: 'firstPrize',
      type: 'text',
      required: true,
      label: 'รางวัลที่ 1',
      validate: (value: string | null | undefined) => {
        if (!value || value.length !== 6) {
          return 'เลขหวยต้องเป็น 6 หลัก'
        }
        if (!/^\d{6}$/.test(value)) {
          return 'เลขหวยต้องเป็นตัวเลขเท่านั้น'
        }
        return true
      },
    },
    {
      name: 'secondPrize',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 5,
      label: 'รางวัลที่ 2',
      fields: [
        {
          name: 'number',
          type: 'text',
          required: true,
          validate: (value: string | null | undefined) => {
            if (!value || value.length !== 6) {
              return 'เลขหวยต้องเป็น 6 หลัก'
            }
            if (!/^\d{6}$/.test(value)) {
              return 'เลขหวยต้องเป็นตัวเลขเท่านั้น'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'thirdPrize',
      type: 'array',
      required: true,
      minRows: 3,
      maxRows: 10,
      label: 'รางวัลที่ 3',
      fields: [
        {
          name: 'number',
          type: 'text',
          required: true,
          validate: (value: string | null | undefined) => {
            if (!value || value.length !== 6) {
              return 'เลขหวยต้องเป็น 6 หลัก'
            }
            if (!/^\d{6}$/.test(value)) {
              return 'เลขหวยต้องเป็นตัวเลขเท่านั้น'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'fourthPrize',
      type: 'array',
      label: 'รางวัลที่ 4',
      fields: [
        {
          name: 'number',
          type: 'text',
          required: true,
          validate: (value: string | null | undefined) => {
            if (!value || value.length !== 6) {
              return 'เลขหวยต้องเป็น 6 หลัก'
            }
            if (!/^\d{6}$/.test(value)) {
              return 'เลขหวยต้องเป็นตัวเลขเท่านั้น'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'fifthPrize',
      type: 'array',
      label: 'รางวัลที่ 5',
      fields: [
        {
          name: 'number',
          type: 'text',
          required: true,
          validate: (value: string | null | undefined) => {
            if (!value || value.length !== 6) {
              return 'เลขหวยต้องเป็น 6 หลัก'
            }
            if (!/^\d{6}$/.test(value)) {
              return 'เลขหวยต้องเป็นตัวเลขเท่านั้น'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'frontThreeDigits',
      type: 'array',
      label: 'เลขหน้า 3 ตัว',
      fields: [
        {
          name: 'number',
          type: 'text',
          required: true,
          validate: (value: string | null | undefined) => {
            if (!value || value.length !== 3) {
              return 'เลขหน้า 3 ตัวต้องเป็น 3 หลัก'
            }
            if (!/^\d{3}$/.test(value)) {
              return 'เลขหน้า 3 ตัวต้องเป็นตัวเลขเท่านั้น'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'backThreeDigits',
      type: 'array',
      label: 'เลขหลัง 3 ตัว',
      fields: [
        {
          name: 'number',
          type: 'text',
          required: true,
          validate: (value: string | null | undefined) => {
            if (!value || value.length !== 3) {
              return 'เลขหลัง 3 ตัวต้องเป็น 3 หลัก'
            }
            if (!/^\d{3}$/.test(value)) {
              return 'เลขหลัง 3 ตัวต้องเป็นตัวเลขเท่านั้น'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'frontTwoDigits',
      type: 'array',
      label: 'เลขหน้า 2 ตัว',
      fields: [
        {
          name: 'number',
          type: 'text',
          required: true,
          validate: (value: string | null | undefined) => {
            if (!value || value.length !== 2) {
              return 'เลขหน้า 2 ตัวต้องเป็น 2 หลัก'
            }
            if (!/^\d{2}$/.test(value)) {
              return 'เลขหน้า 2 ตัวต้องเป็นตัวเลขเท่านั้น'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'backTwoDigits',
      type: 'array',
      label: 'เลขหลัง 2 ตัว',
      fields: [
        {
          name: 'number',
          type: 'text',
          required: true,
          validate: (value: string | null | undefined) => {
            if (!value || value.length !== 2) {
              return 'เลขหลัง 2 ตัวต้องเป็น 2 หลัก'
            }
            if (!/^\d{2}$/.test(value)) {
              return 'เลขหลัง 2 ตัวต้องเป็นตัวเลขเท่านั้น'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'วันที่ประกาศผล',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  timestamps: true,
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // เมื่อมีการสร้างหรืออัปเดตผลหวย ให้ตรวจผลตั๋วทั้งหมดอัตโนมัติ
        if (operation === 'create' || operation === 'update') {
          const drawId = typeof doc.draw === 'string' ? doc.draw : (doc.draw as any).id

          if (drawId) {
            try {
              const result = await checkAllTicketsForDraw(drawId, req)
              req.payload.logger.info(
                `Checked ${result.checked} tickets: ${result.won} won, total prize: ${result.totalPrize} THB`,
              )
            } catch (error) {
              req.payload.logger.error(`Error checking tickets for draw ${drawId}:`, error)
            }
          }
        }
        return doc
      },
    ],
  },
  access: {
    read: () => true, // ทุกคนอ่านได้
    create: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
}
