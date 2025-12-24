import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { LotteryDraws } from './collections/LotteryDraws'
import { LotteryTickets } from './collections/LotteryTickets'
import { LotteryResults } from './collections/LotteryResults'
import { Navigation } from './globals/Navigation'
import { SiteSettings } from './globals/SiteSettings'
import { HomePage } from './globals/HomePage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, LotteryDraws, LotteryTickets, LotteryResults],
  globals: [Navigation, SiteSettings, HomePage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
  onInit: async (payload) => {
    // Seed default navigation menu if it doesn't exist
    try {
      let existingNav: any = null
      let shouldSeedNav = false

      try {
        existingNav = await payload.findGlobal({
          slug: 'navigation',
        })
        if (!existingNav.menuItems || existingNav.menuItems.length === 0) {
          shouldSeedNav = true
        }
      } catch {
        shouldSeedNav = true
      }

      if (shouldSeedNav) {
        await payload.updateGlobal({
          slug: 'navigation',
          data: {
            menuItems: [
              {
                label: 'หน้าแรก',
                href: '/',
                showWhen: 'always',
                order: 1,
              },
              {
                label: 'ซื้อหวย',
                href: '/buy',
                showWhen: 'authenticated',
                order: 2,
              },
              {
                label: 'ตั๋วของฉัน',
                href: '/my-tickets',
                showWhen: 'authenticated',
                order: 3,
              },
              {
                label: 'ผลหวย',
                href: '/results',
                showWhen: 'always',
                order: 4,
              },
              {
                label: 'ตรวจผล',
                href: '/check',
                showWhen: 'authenticated',
                order: 5,
              },
              {
                label: '__USER_INFO__',
                href: '__USER_INFO__',
                showWhen: 'authenticated',
                order: 6,
              },
              {
                label: 'เข้าสู่ระบบ',
                href: '/login',
                showWhen: 'guest',
                order: 7,
              },
              {
                label: 'ออกจากระบบ',
                href: '/api/users/logout',
                showWhen: 'authenticated',
                order: 8,
              },
            ],
          },
          overrideAccess: true,
        })

        payload.logger.info('✅ Default navigation menu seeded successfully')
      }
    } catch (error) {
      payload.logger.error(
        `❌ Error seeding navigation menu: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    // Seed default lottery draws if none exist
    try {
      const existingDraws = await payload.count({
        collection: 'lottery-draws',
      })

      // ถ้ายังไม่มีงวดหวย ให้ seed ข้อมูลเริ่มต้น
      if (existingDraws.totalDocs === 0) {
        const today = new Date()
        const rounds = ['morning', 'afternoon', 'evening'] as const
        const roundLabels = {
          morning: 'รอบเช้า',
          afternoon: 'รอบบ่าย',
          evening: 'รอบเย็น',
        }

        // สร้างงวดหวยสำหรับวันนี้และ 7 วันข้างหน้า (แต่ละวันมี 3 รอบ)
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const drawDate = new Date(today)
          drawDate.setDate(today.getDate() + dayOffset)
          drawDate.setHours(0, 0, 0, 0)

          const year = drawDate.getFullYear()
          const month = String(drawDate.getMonth() + 1).padStart(2, '0')
          const day = String(drawDate.getDate()).padStart(2, '0')
          const dateStr = `${year}${month}${day}`

          for (const round of rounds) {
            // สร้างเลขงวด: YYYYMMDD + รอบ (1=เช้า, 2=บ่าย, 3=เย็น)
            const roundNum = round === 'morning' ? '1' : round === 'afternoon' ? '2' : '3'
            const drawNumber = `${dateStr}${roundNum}`

            // ตั้งเวลาให้เหมาะสมกับแต่ละรอบ
            const roundDrawDate = new Date(drawDate)
            if (round === 'morning') {
              roundDrawDate.setHours(10, 0, 0, 0) // 10:00 น.
            } else if (round === 'afternoon') {
              roundDrawDate.setHours(14, 0, 0, 0) // 14:00 น.
            } else {
              roundDrawDate.setHours(18, 0, 0, 0) // 18:00 น.
            }

            await payload.create({
              collection: 'lottery-draws',
              data: {
                drawNumber,
                drawDate: roundDrawDate.toISOString(),
                round,
                status: 'pending',
                description: `งวดหวย ${dateStr} ${roundLabels[round]}`,
              },
            })
          }
        }

        payload.logger.info('✅ Default lottery draws seeded successfully (7 days, 3 rounds each)')
      }
    } catch (error) {
      payload.logger.error(
        `❌ Error seeding lottery draws: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    // Seed default site settings if it doesn't exist
    try {
      let existingSiteSettings: any = null
      let shouldSeed = false

      try {
        existingSiteSettings = await payload.findGlobal({
          slug: 'site-settings',
        })
        payload.logger.info(
          `ℹ️ Found existing site settings: ${JSON.stringify(existingSiteSettings)}`,
        )
        // ถ้ามีแล้วแต่ไม่มี siteName ให้ seed ใหม่
        if (!existingSiteSettings?.siteName) {
          shouldSeed = true
          payload.logger.info('ℹ️ Site settings exists but missing siteName, will seed')
        }
      } catch (err: any) {
        // Global doesn't exist yet, will create it
        payload.logger.info(`ℹ️ Site settings not found: ${err.message}, will create`)
        shouldSeed = true
      }

      if (shouldSeed) {
        payload.logger.info('🌱 Seeding site settings...')
        const result = await payload.updateGlobal({
          slug: 'site-settings',
          data: {
            siteName: 'Smart Lotto',
            siteDescription: 'ระบบหวยออนไลน์ที่ทันสมัยและปลอดภัย',
            footerText: 'Smart Lotto - ระบบหวยออนไลน์',
          },
          overrideAccess: true,
        })
        payload.logger.info(
          `✅ Default site settings seeded successfully: ${JSON.stringify(result)}`,
        )
      } else {
        payload.logger.info('ℹ️ Site settings already exists with data, skipping seed')
      }
    } catch (error) {
      payload.logger.error(
        `❌ Error seeding site settings: ${error instanceof Error ? error.message : String(error)}`,
      )
      payload.logger.error(
        `❌ Error stack: ${error instanceof Error ? error.stack : String(error)}`,
      )
    }

    // Seed default home page if it doesn't exist
    try {
      let existingHomePage: any = null
      let shouldSeed = false

      try {
        existingHomePage = await payload.findGlobal({
          slug: 'home-page',
        })
        payload.logger.info(`ℹ️ Found existing home page: ${JSON.stringify(existingHomePage)}`)
        // ถ้ามีแล้วแต่ไม่มี heroTitle ให้ seed ใหม่
        if (!existingHomePage?.heroTitle) {
          shouldSeed = true
          payload.logger.info('ℹ️ Home page exists but missing heroTitle, will seed')
        }
      } catch (err: any) {
        // Global doesn't exist yet, will create it
        payload.logger.info(`ℹ️ Home page not found: ${err.message}, will create`)
        shouldSeed = true
      }

      if (shouldSeed) {
        payload.logger.info('🌱 Seeding home page...')
        const result = await payload.updateGlobal({
          slug: 'home-page',
          data: {
            heroTitle: 'เริ่มซื้อหวยวันนี้!',
            heroDescription: 'ระบบหวยออนไลน์ที่ทันสมัย ปลอดภัย และตรวจผลได้ทันที',
            heroButtonText: 'เข้าสู่ระบบ',
            heroButtonLink: '/login',
            showHero: true,
            features: [
              {
                title: 'ซื้อหวยง่าย',
                description: 'ซื้อหวยได้ทุกที่ทุกเวลา เพียงไม่กี่คลิก',
                icon: '🎰',
                order: 1,
              },
              {
                title: 'ตรวจผลทันที',
                description: 'ตรวจผลหวยได้ทันทีหลังประกาศผล',
                icon: '🎯',
                order: 2,
              },
              {
                title: 'ปลอดภัย',
                description: 'ระบบรักษาความปลอดภัยสูงสุด',
                icon: '🔒',
                order: 3,
              },
            ],
            showFeatures: true,
            ctaTitle: 'เริ่มซื้อหวยวันนี้!',
            ctaDescription: 'เข้าสู่ระบบเพื่อซื้อหวยและตรวจผล',
            ctaButtonText: 'เข้าสู่ระบบ',
            ctaButtonLink: '/login',
            showCTA: true,
          },
          overrideAccess: true,
        })
        payload.logger.info(`✅ Default home page seeded successfully: ${JSON.stringify(result)}`)
      } else {
        payload.logger.info('ℹ️ Home page already exists with data, skipping seed')
      }
    } catch (error) {
      payload.logger.error(
        `❌ Error seeding home page: ${error instanceof Error ? error.message : String(error)}`,
      )
      payload.logger.error(
        `❌ Error stack: ${error instanceof Error ? error.stack : String(error)}`,
      )
    }
  },
})
