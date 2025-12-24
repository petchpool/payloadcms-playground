'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import LoginLogoutButtons from './LoginLogoutButtons'

interface MenuItem {
  label: string
  href: string
  showWhen: 'always' | 'authenticated' | 'guest'
  order: number
}

interface NavigationData {
  menuItems?: MenuItem[]
}

export default function NavigationClient() {
  const [navigation, setNavigation] = useState<NavigationData | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // ดึงข้อมูล navigation
        const navRes = await fetch('/api/globals/navigation')
        if (navRes.ok) {
          const navData = await navRes.json()
          setNavigation(navData)
        }

        // ตรวจสอบ user
        const userRes = await fetch('/api/users/me')
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData.user)
        }
      } catch (error) {
        console.error('Error fetching navigation:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading || !navigation) {
    return (
      <nav className="nav">
        <Link href="/">หน้าแรก</Link>
      </nav>
    )
  }

  // กรองและเรียงลำดับ menu items
  const menuItems = (navigation.menuItems || [])
    .filter((item) => {
      if (item.showWhen === 'always') return true
      if (item.showWhen === 'authenticated') return Boolean(user)
      if (item.showWhen === 'guest') return !user
      return true
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <nav className="nav">
      {menuItems.map((item, index) => {
        // ถ้าเป็น user info ให้แสดง email
        if (item.href === '__USER_INFO__') {
          return user ? (
            <span key={index} className="user-info">
              สวัสดี, {user.email}
            </span>
          ) : null
        }

        // ถ้าเป็น login/logout ให้ใช้ component พิเศษ
        if (item.href === '/login' || item.href === '/api/users/login' || item.href === '/api/users/logout') {
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

