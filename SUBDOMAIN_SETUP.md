# การตั้งค่า Subdomain Routing

โปรเจคนี้รองรับการแยกโดเมนและ layout ตาม subdomain:

- **lobby.example.com** → Frontend Layout (หน้าผู้ใช้งาน)
- **admin.example.com** → Admin Dashboard (Payload CMS Admin)

## การทำงาน

### Middleware (`src/middleware.ts`)

Middleware จะตรวจสอบ hostname และ route ตาม subdomain:

1. **admin.example.com** → Redirect ไปที่ `/admin` และ block frontend routes
2. **lobby.example.com** → อนุญาตให้เข้าถึง frontend routes และ block admin routes
3. **example.com** (main domain) → อนุญาตให้เข้าถึงได้ทั้งสองแบบ

### Development (localhost)

ในโหมด development (localhost) จะใช้ path-based routing แทน:
- `http://localhost:3000/` → Frontend
- `http://localhost:3000/admin` → Admin Dashboard

## การตั้งค่า DNS

### Production

ตั้งค่า DNS records สำหรับ subdomains:

```
A     lobby.example.com    → [Your Server IP]
A     admin.example.com    → [Your Server IP]
```

หรือใช้ CNAME:

```
CNAME lobby.example.com    → example.com
CNAME admin.example.com    → example.com
```

### Development (Local Testing)

แก้ไขไฟล์ `/etc/hosts` (macOS/Linux) หรือ `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1    lobby.localhost
127.0.0.1    admin.localhost
```

จากนั้นเข้าใช้งาน:
- `http://lobby.localhost:3000` → Frontend
- `http://admin.localhost:3000` → Admin Dashboard

## การตั้งค่า Environment Variables

ไม่จำเป็นต้องตั้งค่า environment variables เพิ่มเติม เพราะ middleware จะตรวจสอบ hostname อัตโนมัติ

## การทดสอบ

### Production

```bash
# ทดสอบ lobby subdomain
curl -H "Host: lobby.example.com" http://your-server/

# ทดสอบ admin subdomain
curl -H "Host: admin.example.com" http://your-server/
```

### Development

```bash
# รัน development server
pnpm dev

# เปิด browser ไปที่:
# - http://lobby.localhost:3000 (Frontend)
# - http://admin.localhost:3000 (Admin)
```

## Routes ที่อนุญาต

### lobby.example.com
- ✅ `/` (หน้าแรก)
- ✅ `/buy` (ซื้อหวย)
- ✅ `/check` (ตรวจผล)
- ✅ `/login` (เข้าสู่ระบบ)
- ✅ `/my-tickets` (ตั๋วของฉัน)
- ✅ `/results` (ผลหวย)
- ❌ `/admin` (ถูก redirect ไปหน้าแรก)

### admin.example.com
- ✅ `/admin` (Admin Dashboard)
- ✅ `/api/*` (API routes)
- ❌ `/buy`, `/check`, `/login`, `/my-tickets`, `/results` (ถูก redirect ไป `/admin`)

## Troubleshooting

### Middleware ไม่ทำงาน

1. ตรวจสอบว่าไฟล์ `src/middleware.ts` อยู่ที่ตำแหน่งที่ถูกต้อง
2. ตรวจสอบว่า hostname ถูกต้อง (ไม่ใช่ IP address)
3. ตรวจสอบ DNS records

### Admin ไม่ redirect

1. ตรวจสอบว่า subdomain ถูกต้อง
2. ลอง clear cache ของ browser
3. ตรวจสอบ console logs ใน browser

### Frontend ไม่แสดง

1. ตรวจสอบว่า middleware ไม่ได้ block frontend routes
2. ตรวจสอบว่า layout ถูกต้อง
3. ตรวจสอบ console logs

