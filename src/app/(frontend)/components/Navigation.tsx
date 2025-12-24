import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import LoginLogoutButtons from './LoginLogoutButtons'

export default async function Navigation() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // ดึงข้อมูล navigation จาก Global
  const navigation = await payload.findGlobal({
    slug: 'navigation',
  })

  // กรองและเรียงลำดับ menu items
  const menuItems = (navigation?.menuItems || [])
    .filter((item: any) => {
      if (item.showWhen === 'always') return true
      if (item.showWhen === 'authenticated') return Boolean(user)
      if (item.showWhen === 'guest') return !user
      return true
    })
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

  return (
    <nav className="nav">
      {menuItems.map((item: any, index: number) => {
        // ถ้าเป็น user info ให้แสดง email
        if (item.href === '__USER_INFO__') {
          return user ? (
            <span key={index} className="user-info">
              สวัสดี, {user.email}
            </span>
          ) : null
        }

        // ถ้าเป็น login/logout ให้ใช้ component พิเศษ
        if (
          item.href === '/login' ||
          item.href === '/api/users/login' ||
          item.href === '/api/users/logout'
        ) {
          return (
            <LoginLogoutButtons
              key={index}
              type={item.href === '/api/users/logout' ? 'logout' : 'login'}
              label={item.label}
            />
          )
        }

        return (
          <Link key={index} href={item.href}>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
