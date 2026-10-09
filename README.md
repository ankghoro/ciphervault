# CipherVault — Assessment Tasks

## 1. Enkripsi (AES-256-GCM)

- Password credential dienkripsi sebelum disimpan ke database memakai AES-256-GCM (authenticated encryption gaya NIST SP 800-38D).
- Format yang disimpan di database:

```
iv(hex):authTag(hex):ciphertext(hex)
```

---

## 2. Prerequisites

Tools yang harus terpasang di mesin:

| Tool                       | Version        | Catatan                |
|----------------------------|----------------|------------------------|
| Node.js                    | 20.x or later  | Tested v22.12.0        |
| npm                        | 10.x or later  | Tested v10.9.8         |
| Docker with Docker Compose | Latest stable  | Tested 27.5.1          |
| Git                        | Recent version | -                      |

Cek instalasi:

```bash
node -v
npm -v
docker -v
docker compose version
```

### Contoh isi file environment

**`backend/.env`**

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://username:password@localhost:5432/ciphervault?schema=public
APP_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
JWT_SECRET=jwt-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

**`frontend/.env`**

```env
NUXT_PUBLIC_API_BASE=http://localhost:4000/api
```

> Ganti `username` dan `password` di `DATABASE_URL` sesuai user PostgreSQL mesinmu.  
> Untuk Docker, lihat catatan override host di bagian 3.

---

## 3. Menjalankan Docker Compose

Perintah ini menjalankan PostgreSQL, backend NestJS, dan frontend Nuxt sekaligus.  
Pastikan `DATABASE_URL` memakai username dan password yang benar.

### 3.1 Buat folder project dan file `.env`

```bash
cd ciphervault

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` dan `frontend/.env` sesuai kebutuhan (lihat contoh di bagian 2).

### 3.2 Build and start all services

```bash
docker compose up --build
```

Saat pertama kali jalan, container backend akan:

1. Membaca variabel dari `backend/.env` (plus override `DATABASE_URL`)
2. Menjalankan `npx prisma db push` untuk sync skema
3. Menjalankan API NestJS di port `4000`

Frontend di-build dengan `NUXT_PUBLIC_API_BASE` lalu di-serve di port `3000`.

### 3.3 Seed the database

Buka terminal lain:

```bash
docker compose exec backend npx ts-node prisma/seed.ts
```

Atau, jika seed terdaftar di Prisma:

```bash
docker compose exec backend npx prisma db seed
```

### 3.4 Akses aplikasi

| Service       | URL                       |
|---------------|---------------------------|
| Frontend      | http://localhost:3000     |
| Backend API   | http://localhost:4000/api |
| PostgreSQL    | localhost:5432            |

### 3.5 Mengubah `.env` setelah container sudah jalan

```bash
# Backend — restart agar env baru terbaca
docker compose up -d --force-recreate backend

# Frontend — jika NUXT_PUBLIC_API_BASE berubah, perlu rebuild
docker compose up -d --build frontend
```

### 3.6 Menghentikan service

```bash
docker compose down
```

Menghentikan service **dan** menghapus volume database:

```bash
docker compose down -v
```

---

## 4. Manual Setup

Pakai cara ini jika process Node dijalankan di host, sementara PostgreSQL bisa lewat Docker atau instalasi lokal.

### 4.1 Menjalankan PostgreSQL

**Opsi A — Docker hanya untuk database:**

```bash
docker compose up postgres -d
```

**Opsi B — PostgreSQL lokal:**

Buat database dan user yang sesuai dengan `DATABASE_URL` di `backend/.env`:

```sql
CREATE DATABASE ciphervault OWNER local_owner_mesinmu;
```

**Instalasi package backend dan frontend dari root projek**

```bash
npm run install:all
```

### 4.2 Setup Backend

Jalankan perintah berikut di terminal:

```bash
cd backend

# Install dependencies
npm install

# Buat file environment
# Edit .env — pastikan DATABASE_URL, APP_ENCRYPTION_KEY, JWT_SECRET terisi
cp .env.example .env
# Edit .env sesuai nomor 2

# Generate Prisma client
npx prisma generate

# Sync skema ke database
npx prisma db push

# Seed sample data
npx ts-node prisma/seed.ts

# Jalankan API mode watch
npm run start:dev
```

Backend berjalan di **http://localhost:4000** (prefix `/api`).

### 4.3 Setup Frontend

Buka terminal baru:

```bash
cd frontend

# Install dependencies
npm install

# Buat file environment
cp .env.example .env
# Edit .env dan tambahkan variabel ini NUXT_PUBLIC_API_BASE=http://localhost:4000/api

# Jalankan Nuxt dev server
npm run dev
```

Jalankan di browser **http://localhost:3000**.

### 4.4 Build lokal versi production (opsional)

**Backend:**

```bash
cd backend
npm run build
npm run start:prod
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

---

## 5. Generate kunci enkripsi secara acak

```bash
openssl rand -hex 32
```

Generate JWT secret secara acak:

```bash
openssl rand -hex 32
```

---

## 6. Database Seeder & Initial Credentials

Script seed (`backend/prisma/seed.ts`) membuat:

- Satu user admin
- Category sample (Infrastructure, API Keys, Databases, Finance, Workspace)
- Group sample (termasuk group bersarang untuk demo submenu sidebar)
- Kredensial sample

**Login default:**

```
Email		: admin@ciphervault.sample
Password	: password123
```

---
