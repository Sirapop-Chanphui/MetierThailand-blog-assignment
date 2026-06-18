# Blog

เว็บบล็อกส่วนตัว สร้างด้วย **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS** และ **Supabase** (Database, Auth, Storage)

## ฟีเจอร์หลัก

### หน้าสาธารณะ (`/`)

- แสดงรายการบทความที่ publish แล้ว พร้อม pagination
- ค้นหาบทความ (debounce + suggestions)
- หน้ารายละเอียดบทความ (`/blog/[slug]`)
- นับผู้เข้าชมต่อบทความ (ไม่นับเมื่อ admin login อยู่)
- ส่งความคิดเห็น (รอ admin อนุมัติก่อนแสดง)
- แสดงความคิดเห็นล่าสุด 5 รายการ + ปุ่มโหลดเพิ่ม

### หน้า Admin (`/admin`)

- Login ผ่าน Supabase Auth
- Dashboard จัดการบทความ (สร้าง / แก้ไข / ลบ / publish)
- อัปโหลดรูปปกและแกลเลอรีไป Supabase Storage
- จัดการความคิดเห็น (อนุมัติ / ปฏิเสธ)

## โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── (public)/          # หน้าเว็บคนทั่วไป
│   ├── (admin)/           # หน้า admin
│   └── api/               # API Routes
├── components/            # UI components
├── lib/                   # Supabase, validation, utils
├── types/                 # TypeScript types
└── middleware.ts          # ป้องกัน route /admin
```

## ความต้องการของระบบ

- Node.js 20+
- บัญชี [Supabase](https://supabase.com)

## ติดตั้งและรัน local

### 1. Clone และติดตั้ง dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ที่ root โปรเจกต์:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> `NEXT_PUBLIC_SUPABASE_URL` ใส่แค่ base URL **ไม่ต้อง** ต่อท้าย `/rest/v1/`

ค่าเหล่านี้หาได้ที่ Supabase Dashboard → **Project Settings → API**

### 3. ตั้งค่า Database (รันตามลำดับใน SQL Editor)

| ลำดับ | ไฟล์ | รายละเอียด |
|-------|------|------------|
| 1 | `supabase/schema.sql` | สร้างตาราง `blogs`, `comments` |
| 2 | RLS policies | เปิด RLS + policy อ่าน/เขียน (ดูหมายเหตุด้านล่าง) |
| 3 | `supabase/comments_review_status.sql` | คอลัมน์ `review_status` (ถ้าโปรเจกต์เก่า) |
| 4 | `supabase/storage.sql` | bucket `blog-images` + policy |
| 5 | `supabase/increment_blog_view.sql` | ฟังก์ชันนับผู้เข้าชม |

### 4. สร้างบัญชี Admin

Supabase Dashboard → **Authentication → Users → Add user**

- ปิด **Enable sign ups** ใน Email provider (ให้มีแค่ admin คนเดียว)
- สร้าง user ด้วยอีเมลและรหัสผ่านที่ต้องการ

### 5. รัน dev server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)


## Deploy บน Vercel

1. Push โปรเจกต์ขึ้น GitHub
2. Import โปรเจกต์ใน [Vercel](https://vercel.com)
3. ตั้ง **Environment Variables** ให้ครบทั้ง 3 ตัว (เหมือน `.env.local`)
4. Deploy

```bash
npm run build
npm run start
```

## สคริปต์

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run dev` | รัน development server |
| `npm run build` | build สำหรับ production |
| `npm run start` | รัน production server |
| `npm run lint` | ตรวจ ESLint |

## เทคโนโลยีที่ใช้

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [Supabase](https://supabase.com)
- [Tailwind CSS 4](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
