'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface LoginLogoutButtonsProps {
  type: 'login' | 'logout'
  label: string
}

export default function LoginLogoutButtons({ type, label }: LoginLogoutButtonsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    // Redirect ไปหน้า login ที่สร้างเอง
    router.push('/login')
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (res.ok) {
        // Reload page เพื่อ refresh authentication state
        window.location.href = '/'
      } else {
        console.error('Logout failed')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error logging out:', error)
      setLoading(false)
    }
  }

  if (type === 'login') {
    return (
      <button onClick={handleLogin} className="nav-button" type="button">
        {label}
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      className="nav-button"
      type="button"
      disabled={loading}
    >
      {loading ? 'กำลังออกจากระบบ...' : label}
    </button>
  )
}

