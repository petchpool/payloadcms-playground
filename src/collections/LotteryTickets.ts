import type { CollectionConfig, Endpoint } from 'payload'
import { APIError } from 'payload'
import { checkTicketResult } from '../hooks/checkLotteryResults'

export const LotteryTickets: CollectionConfig = {
  slug: 'lottery-tickets',
  admin: {
    useAsTitle: 'ticketNumber',
    defaultColumns: ['ticketNumber', 'amount', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'ticketNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'เลขที่ตั๋ว',
      admin: {
        description: 'เลขที่ตั๋วหวย (อัตโนมัติ)',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      label: 'ผู้ซื้อ',
    },
    {
      name: 'draw',
      type: 'relationship',
      relationTo: 'lottery-draws',
      required: true,
      index: true,
      label: 'งวดหวย',
    },
    {
      name: 'numbers',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 10,
      label: 'เลขที่ซื้อ',
      fields: [
        {
          name: 'number',
          type: 'text',
          required: true,
          label: 'เลข',
          validate: (value: string | string[] | null | undefined) => {
            if (typeof value !== 'string') {
              return 'เลขหวยต้องเป็นตัวอักษร'
            }
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
          name: 'betType',
          type: 'select',
          required: true,
          options: [
            {
              label: 'เลขตรง',
              value: 'straight',
            },
            {
              label: 'เลขวิ่ง',
              value: 'running',
            },
            {
              label: 'เลขโต๊ด',
              value: 'tod',
            },
          ],
          label: 'ประเภทการแทง',
        },
      ],
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 1,
      label: 'จำนวนเงิน (บาท)',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: 'รอตรวจผล',
          value: 'pending',
        },
        {
          label: 'ถูกรางวัล',
          value: 'won',
        },
        {
          label: 'ไม่ถูกรางวัล',
          value: 'lost',
        },
        {
          label: 'ยกเลิก',
          value: 'cancelled',
        },
      ],
      label: 'สถานะ',
    },
    {
      name: 'prizeAmount',
      type: 'number',
      label: 'จำนวนเงินรางวัล (บาท)',
      admin: {
        description: 'จำนวนเงินรางวัลที่ได้รับ (ถ้ามี)',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && data) {
          // Auto-set user from req.user if not provided
          if (!data.user && req.user?.id) {
            data.user = req.user.id
          }

          // สร้างเลขที่ตั๋วอัตโนมัติ
          if (!data.ticketNumber) {
            const timestamp = Date.now()
            const random = Math.floor(Math.random() * 1000)
            data.ticketNumber = `TKT${timestamp}${random.toString().padStart(3, '0')}`
          }
        }
        return data
      },
    ],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      // Admin อ่านได้ทั้งหมด, ผู้ใช้อ่านได้เฉพาะของตัวเอง
      if (user.roles?.includes('admin')) return true
      return {
        user: { equals: user.id },
      }
    },
    create: ({ req: { user } }) => Boolean(user), // ผู้ใช้ที่ login แล้วซื้อได้
    update: ({ req: { user } }) => {
      if (!user) return false
      // Admin อัปเดตได้ทั้งหมด, ผู้ใช้อัปเดตได้เฉพาะของตัวเอง (เฉพาะก่อนออกผล)
      if (user.roles?.includes('admin')) return true
      return {
        user: { equals: user.id },
        status: { equals: 'pending' },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      // Admin ลบได้ทั้งหมด, ผู้ใช้ลบได้เฉพาะของตัวเอง (เฉพาะก่อนออกผล)
      if (user.roles?.includes('admin')) return true
      return {
        user: { equals: user.id },
        status: { equals: 'pending' },
      }
    },
  },
  endpoints: [
    {
      path: '/:id/check-result',
      method: 'get',
      handler: async (req) => {
        if (!req.user) {
          throw new APIError('Unauthorized', 401)
        }

        const id = req.routeParams?.id
        if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
          throw new APIError('Ticket ID is required', 400)
        }

        // ดึงข้อมูลตั๋ว
        const ticket = await req.payload.findByID({
          collection: 'lottery-tickets',
          id: typeof id === 'string' ? id : String(id),
          depth: 1,
        })

        if (!ticket) {
          throw new APIError('Ticket not found', 404)
        }

        // ตรวจสอบสิทธิ์: ผู้ใช้สามารถตรวจผลตั๋วของตัวเองได้, Admin ตรวจได้ทั้งหมด
        const userId = req.user?.id
        if (
          !userId ||
          (!req.user.roles?.includes('admin') &&
            (typeof ticket.user === 'string'
              ? ticket.user !== userId
              : (ticket.user as any)?.id !== userId))
        ) {
          throw new APIError('Forbidden', 403)
        }

        // ดึงข้อมูลผลหวย
        const drawId = typeof ticket.draw === 'string' ? ticket.draw : (ticket.draw as any).id

        const lotteryResult = await req.payload.find({
          collection: 'lottery-results',
          where: {
            draw: { equals: drawId },
          },
          depth: 0,
          limit: 1,
        })

        if (!lotteryResult.docs.length) {
          return Response.json({
            ticket: ticket.id,
            status: ticket.status,
            message: 'ยังไม่มีผลหวยสำหรับงวดนี้',
            won: false,
            prizeAmount: 0,
          })
        }

        // ตรวจผล
        const resultData = lotteryResult.docs[0]
        let totalPrize = 0
        const checkedNumbers: Array<{
          number: string
          betType: string
          won: boolean
          prizeAmount: number
          prizeType?: string
        }> = []

        for (const bet of ticket.numbers) {
          const number = bet.number
          const type = bet.betType
          let betPrize = 0
          let prizeType: string | undefined

          // ตรวจสอบรางวัลที่ 1 (เลขตรง 6 ตัว)
          if (type === 'straight' && number === resultData.firstPrize) {
            betPrize = (ticket.amount as number) * 6000000
            prizeType = 'firstPrize'
          }
          // ตรวจสอบรางวัลที่ 2 (เลขตรง 6 ตัว)
          else if (
            type === 'straight' &&
            resultData.secondPrize?.some((p: any) => p.number === number)
          ) {
            betPrize = (ticket.amount as number) * 200000
            prizeType = 'secondPrize'
          }
          // ตรวจสอบรางวัลที่ 3 (เลขตรง 6 ตัว)
          else if (
            type === 'straight' &&
            resultData.thirdPrize?.some((p: any) => p.number === number)
          ) {
            betPrize = (ticket.amount as number) * 80000
            prizeType = 'thirdPrize'
          }
          // ตรวจสอบรางวัลที่ 4 (เลขตรง 6 ตัว)
          else if (
            type === 'straight' &&
            resultData.fourthPrize?.some((p: any) => p.number === number)
          ) {
            betPrize = (ticket.amount as number) * 40000
            prizeType = 'fourthPrize'
          }
          // ตรวจสอบรางวัลที่ 5 (เลขตรง 6 ตัว)
          else if (
            type === 'straight' &&
            resultData.fifthPrize?.some((p: any) => p.number === number)
          ) {
            betPrize = (ticket.amount as number) * 20000
            prizeType = 'fifthPrize'
          }
          // ตรวจสอบเลขหน้า 3 ตัว
          else if (type === 'running' || type === 'straight') {
            const frontThree = number.substring(0, 3)
            if (resultData.frontThreeDigits?.some((p: any) => p.number === frontThree)) {
              betPrize = (ticket.amount as number) * 4000
              prizeType = 'frontThreeDigits'
            }
            // ตรวจสอบเลขหลัง 3 ตัว
            else {
              const backThree = number.substring(3, 6)
              if (resultData.backThreeDigits?.some((p: any) => p.number === backThree)) {
                betPrize = (ticket.amount as number) * 4000
                prizeType = 'backThreeDigits'
              }
              // ตรวจสอบเลขหน้า 2 ตัว
              else {
                const frontTwo = number.substring(0, 2)
                if (resultData.frontTwoDigits?.some((p: any) => p.number === frontTwo)) {
                  betPrize = (ticket.amount as number) * 2000
                  prizeType = 'frontTwoDigits'
                }
                // ตรวจสอบเลขหลัง 2 ตัว
                else {
                  const backTwo = number.substring(4, 6)
                  if (resultData.backTwoDigits?.some((p: any) => p.number === backTwo)) {
                    betPrize = (ticket.amount as number) * 2000
                    prizeType = 'backTwoDigits'
                  }
                }
              }
            }
          }

          checkedNumbers.push({
            number: bet.number,
            betType: bet.betType,
            won: betPrize > 0,
            prizeAmount: betPrize,
            prizeType,
          })

          totalPrize += betPrize
        }

        return Response.json({
          ticket: ticket.id,
          status: ticket.status,
          ticketNumber: ticket.ticketNumber,
          checkedNumbers,
          won: totalPrize > 0,
          prizeAmount: totalPrize,
          result: lotteryResult.docs[0],
        })
      },
    } as Endpoint,
  ],
}
