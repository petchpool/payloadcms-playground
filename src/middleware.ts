import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // แยก subdomain ออกมา
  const subdomain = hostname.split('.')[0]
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')

  // สำหรับ localhost ใน development - ให้ใช้ path-based routing แทน
  if (isLocalhost) {
    return NextResponse.next()
  }

  // ตรวจสอบว่าเป็น admin subdomain หรือไม่
  if (subdomain === 'admin' || hostname.startsWith('admin.')) {
    // ถ้าไม่ใช่ path ที่ขึ้นต้นด้วย /admin หรือ /api ให้ redirect ไป /admin
    if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/api')) {
      url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`
      return NextResponse.redirect(url)
    }
    // ถ้าเป็น admin subdomain แต่พยายามเข้าถึง frontend routes ให้ block
    if (
      url.pathname.startsWith('/buy') ||
      url.pathname.startsWith('/check') ||
      url.pathname.startsWith('/login') ||
      url.pathname.startsWith('/my-tickets') ||
      url.pathname.startsWith('/results')
    ) {
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
    // อนุญาตให้เข้าถึง admin และ API ได้
    return NextResponse.next()
  }

  // ตรวจสอบว่าเป็น lobby subdomain หรือไม่
  if (subdomain === 'lobby' || hostname.startsWith('lobby.')) {
    // ถ้าพยายามเข้าถึง admin routes ให้ redirect ไปหน้าแรก
    if (url.pathname.startsWith('/admin')) {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    // อนุญาตให้เข้าถึง frontend routes ได้
    return NextResponse.next()
  }

  // สำหรับ main domain (example.com) - ให้เข้าถึงได้ทั้งสองแบบ
  // แต่ถ้าเข้าหน้าแรกให้ไปที่ frontend
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
