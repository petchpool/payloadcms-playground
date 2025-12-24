import type { Payload, PayloadRequest } from 'payload'

/**
 * ตรวจสอบว่าตั๋วหวยถูกรางวัลหรือไม่
 */
export async function checkTicketResult(
  ticketId: string,
  betType: string,
  result: any,
  payload: Payload,
): Promise<{ won: boolean; prizeAmount: number; prizeType?: string }> {
  // ดึงข้อมูลตั๋ว
  const ticket = await payload.findByID({
    collection: 'lottery-tickets',
    id: ticketId,
    depth: 0,
  })

  if (!ticket || ticket.status !== 'pending') {
    return { won: false, prizeAmount: 0 }
  }

  // ดึงข้อมูลผลหวย
  const drawId =
    typeof ticket.draw === 'string' ? ticket.draw : (ticket.draw as any).id

  const lotteryResult = await payload.find({
    collection: 'lottery-results',
    where: {
      draw: { equals: drawId },
    },
    depth: 0,
    limit: 1,
  })

  if (!lotteryResult.docs.length) {
    return { won: false, prizeAmount: 0 }
  }

  const resultData = lotteryResult.docs[0]
  let totalPrize = 0
  let prizeType: string | undefined

  // ตรวจสอบแต่ละเลขที่ซื้อ
  for (const bet of ticket.numbers) {
    const number = bet.number
    const type = bet.betType || betType

    // ตรวจสอบรางวัลที่ 1 (เลขตรง 6 ตัว)
    if (type === 'straight' && number === resultData.firstPrize) {
      totalPrize += ticket.amount * 6000000 // รางวัลที่ 1 = 6 ล้านบาท
      prizeType = 'firstPrize'
      continue
    }

    // ตรวจสอบรางวัลที่ 2 (เลขตรง 6 ตัว)
    if (
      type === 'straight' &&
      resultData.secondPrize?.some((p: any) => p.number === number)
    ) {
      totalPrize += ticket.amount * 200000 // รางวัลที่ 2 = 2 แสนบาท
      prizeType = 'secondPrize'
      continue
    }

    // ตรวจสอบรางวัลที่ 3 (เลขตรง 6 ตัว)
    if (
      type === 'straight' &&
      resultData.thirdPrize?.some((p: any) => p.number === number)
    ) {
      totalPrize += ticket.amount * 80000 // รางวัลที่ 3 = 8 หมื่นบาท
      prizeType = 'thirdPrize'
      continue
    }

    // ตรวจสอบรางวัลที่ 4 (เลขตรง 6 ตัว)
    if (
      type === 'straight' &&
      resultData.fourthPrize?.some((p: any) => p.number === number)
    ) {
      totalPrize += ticket.amount * 40000 // รางวัลที่ 4 = 4 หมื่นบาท
      prizeType = 'fourthPrize'
      continue
    }

    // ตรวจสอบรางวัลที่ 5 (เลขตรง 6 ตัว)
    if (
      type === 'straight' &&
      resultData.fifthPrize?.some((p: any) => p.number === number)
    ) {
      totalPrize += ticket.amount * 20000 // รางวัลที่ 5 = 2 หมื่นบาท
      prizeType = 'fifthPrize'
      continue
    }

    // ตรวจสอบเลขหน้า 3 ตัว
    if (type === 'running' || type === 'straight') {
      const frontThree = number.substring(0, 3)
      if (
        resultData.frontThreeDigits?.some((p: any) => p.number === frontThree)
      ) {
        totalPrize += ticket.amount * 4000 // เลขหน้า 3 ตัว = 4 พันบาท
        prizeType = 'frontThreeDigits'
        continue
      }
    }

    // ตรวจสอบเลขหลัง 3 ตัว
    if (type === 'running' || type === 'straight') {
      const backThree = number.substring(3, 6)
      if (
        resultData.backThreeDigits?.some((p: any) => p.number === backThree)
      ) {
        totalPrize += ticket.amount * 4000 // เลขหลัง 3 ตัว = 4 พันบาท
        prizeType = 'backThreeDigits'
        continue
      }
    }

    // ตรวจสอบเลขหน้า 2 ตัว
    if (type === 'running' || type === 'straight') {
      const frontTwo = number.substring(0, 2)
      if (resultData.frontTwoDigits?.some((p: any) => p.number === frontTwo)) {
        totalPrize += ticket.amount * 2000 // เลขหน้า 2 ตัว = 2 พันบาท
        prizeType = 'frontTwoDigits'
        continue
      }
    }

    // ตรวจสอบเลขหลัง 2 ตัว
    if (type === 'running' || type === 'straight') {
      const backTwo = number.substring(4, 6)
      if (resultData.backTwoDigits?.some((p: any) => p.number === backTwo)) {
        totalPrize += ticket.amount * 2000 // เลขหลัง 2 ตัว = 2 พันบาท
        prizeType = 'backTwoDigits'
        continue
      }
    }
  }

  return {
    won: totalPrize > 0,
    prizeAmount: totalPrize,
    prizeType,
  }
}

/**
 * ตรวจผลตั๋วหวยทั้งหมดของงวดที่ระบุ
 */
export async function checkAllTicketsForDraw(
  drawId: string,
  req: PayloadRequest,
): Promise<{ checked: number; won: number; totalPrize: number }> {
  const { payload } = req
  const tickets = await payload.find({
    collection: 'lottery-tickets',
    where: {
      draw: { equals: drawId },
      status: { equals: 'pending' },
    },
    depth: 0,
    limit: 1000,
    req,
    overrideAccess: false,
  })

  let checked = 0
  let won = 0
  let totalPrize = 0

  for (const ticket of tickets.docs) {
    checked++

    // ดึงข้อมูลผลหวย
    const lotteryResult = await payload.find({
      collection: 'lottery-results',
      where: {
        draw: { equals: drawId },
      },
      depth: 0,
      limit: 1,
      req,
      overrideAccess: false,
    })

    if (!lotteryResult.docs.length) {
      continue
    }

    const resultData = lotteryResult.docs[0]
    let ticketPrize = 0

    // ตรวจสอบแต่ละเลขที่ซื้อ
    for (const bet of ticket.numbers) {
      const number = bet.number
      const type = bet.betType

      // ตรวจสอบรางวัลต่างๆ (ใช้ logic เดียวกับ checkTicketResult)
      if (type === 'straight' && number === resultData.firstPrize) {
        ticketPrize += (ticket.amount as number) * 6000000
        continue
      }

      if (
        type === 'straight' &&
        resultData.secondPrize?.some((p: any) => p.number === number)
      ) {
        ticketPrize += (ticket.amount as number) * 200000
        continue
      }

      if (
        type === 'straight' &&
        resultData.thirdPrize?.some((p: any) => p.number === number)
      ) {
        ticketPrize += (ticket.amount as number) * 80000
        continue
      }

      // ตรวจสอบเลขหน้า/หลัง 3 ตัว และ 2 ตัว
      const frontThree = number.substring(0, 3)
      const backThree = number.substring(3, 6)
      const frontTwo = number.substring(0, 2)
      const backTwo = number.substring(4, 6)

      if (
        (type === 'running' || type === 'straight') &&
        resultData.frontThreeDigits?.some((p: any) => p.number === frontThree)
      ) {
        ticketPrize += (ticket.amount as number) * 4000
      }

      if (
        (type === 'running' || type === 'straight') &&
        resultData.backThreeDigits?.some((p: any) => p.number === backThree)
      ) {
        ticketPrize += (ticket.amount as number) * 4000
      }

      if (
        (type === 'running' || type === 'straight') &&
        resultData.frontTwoDigits?.some((p: any) => p.number === frontTwo)
      ) {
        ticketPrize += (ticket.amount as number) * 2000
      }

      if (
        (type === 'running' || type === 'straight') &&
        resultData.backTwoDigits?.some((p: any) => p.number === backTwo)
      ) {
        ticketPrize += (ticket.amount as number) * 2000
      }
    }

    // อัปเดตสถานะตั๋ว
    if (ticketPrize > 0) {
      won++
      totalPrize += ticketPrize

      await payload.update({
        collection: 'lottery-tickets',
        id: ticket.id,
        data: {
          status: 'won',
          prizeAmount: ticketPrize,
        },
        req,
        overrideAccess: true, // Admin operation
      })
    } else {
      await payload.update({
        collection: 'lottery-tickets',
        id: ticket.id,
        data: {
          status: 'lost',
        },
        req,
        overrideAccess: true, // Admin operation
      })
    }
  }

  return { checked, won, totalPrize }
}

