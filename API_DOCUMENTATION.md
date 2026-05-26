# Dokumentasi API - QGIS Billboard Rental System

Dokumen ini berisi seluruh endpoint API yang ada di `routes/api.php`, lengkap dengan payload dan contoh respons sesuai controller/validation saat ini.

## Base URL
- **User API (Mobile)**: `{{APP_URL}}/api/v1/user`
- **Admin API (Web Dashboard)**: `{{APP_URL}}/api/v1/admin`
- **Dashboard Data (non-v1)**: `{{APP_URL}}/api/dashboard-data`

## Headers Umum
```
Accept: application/json
Content-Type: application/json
```

## Autentikasi
Endpoint terproteksi menggunakan Sanctum dengan header:
```
Authorization: Bearer <access_token>
```

---

# USER API (Mobile)

## 1) Auth

### Register
- **Method**: `POST`
- **Endpoint**: `/auth/register`
- **Body**:
```json
{
  "email": "admin@company.com",
  "password": "securepassword",
  "company_name": "PT Smart Tech",
  "nib": "1207000123456"
}
```
- **Validasi**: `email` unique, `password` min 8
- **Response (201)**:
```json
{
  "access_token": "1|token",
  "refresh_token": "dummy_refresh_token_for_sanctum",
  "user": {
    "id": "uuid",
    "name": "Admin PT Smart Tech",
    "role": "user",
    "email": "admin@company.com",
    "avatar_url": null,
    "company_id": "uuid"
  }
}
```

### Login
- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response (200)**:
```json
{
  "access_token": "1|token",
  "refresh_token": "dummy_refresh_token_for_sanctum",
  "user": {
    "id": "uuid",
    "name": "Nama User",
    "role": "user",
    "email": "user@example.com",
    "avatar_url": null,
    "company_id": "uuid"
  }
}
```

### Get Profile (Me)
- **Method**: `GET`
- **Endpoint**: `/me`
- **Auth**: Required
- **Response (200)**:
```json
{
  "id": "uuid",
  "name": "Nama User",
  "role": "user",
  "email": "user@example.com",
  "avatar_url": null,
  "company_id": "uuid"
}
```

### Update Profile
- **Method**: `PATCH`
- **Endpoint**: `/me`
- **Auth**: Required
- **Body**:
```json
{
  "name": "Nama Baru",
  "avatar_url": "https://example.com/avatar.png",
  "phone": "08123456789"
}
```
- **Response (200)**:
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "name": "Nama Baru",
    "role": "user",
    "email": "user@example.com",
    "avatar_url": "https://example.com/avatar.png",
    "company_id": "uuid"
  }
}
```

### Logout
- **Method**: `POST`
- **Endpoint**: `/logout`
- **Auth**: Required
- **Response (200)**:
```json
{
  "message": "Logged out successfully"
}
```

---

## 2) Dashboard

### Get Dashboard Summary
- **Method**: `GET`
- **Endpoint**: `/dashboard/summary`
- **Auth**: Required
- **Response (200)**:
```json
{
  "message": "Dashboard summary retrieved successfully",
  "data": {
    "active_ads_count": 2,
    "pending_invoices_count": 1
  }
}
```

---

## 3) Categories

### Get All Categories
- **Method**: `GET`
- **Endpoint**: `/categories`
- **Response (200)**:
```json
{
  "message": "Categories retrieved successfully",
  "data": [
    { "id": "uuid", "name": "Videotron", "icon": "tv" },
    { "id": "uuid", "name": "Baliho", "icon": "picture_in_picture" }
  ]
}
```

---

## 4) Spots (Explore)

### Get All Spots
- **Method**: `GET`
- **Endpoint**: `/spots`
- **Query Params**:
  - `lat` (float, optional)
  - `lng` (float, optional)
  - `radius` (int, optional, default 10 KM)
  - `q` (string, optional)
- **Response (200)**:
```json
{
  "message": "Billboards retrieved successfully",
  "data": {
    "data": [
      {
        "id": "uuid",
        "title": "Videotron Jl. Basuki Rahmat",
        "latitude": -7.275,
        "longitude": 112.75,
        "price_per_month": 15000000,
        "is_available": true,
        "impressions_per_day": 124500,
        "thumbnail_url": "https://example.com/thumb.jpg",
        "category": "Videotron"
      }
    ],
    "links": {
      "first": "...",
      "last": "...",
      "prev": null,
      "next": null
    },
    "meta": {
      "current_page": 1,
      "from": 1,
      "last_page": 1,
      "per_page": 15,
      "to": 1,
      "total": 1
    }
  }
}
```

### Get Spot Detail
- **Method**: `GET`
- **Endpoint**: `/spots/{id}`
- **Response (200)**:
```json
{
  "message": "Billboard detail retrieved successfully",
  "data": {
    "id": "uuid",
    "title": "Videotron Jl. Basuki Rahmat",
    "latitude": -7.275,
    "longitude": 112.75,
    "price_per_month": 15000000,
    "is_available": true,
    "impressions_per_day": 124500,
    "thumbnail_url": "https://example.com/thumb.jpg",
    "category": "Videotron",
    "code": "BBD-ABC123",
    "description": "Ukuran: 4x8 | Harga: Rp 15.000.000/bulan",
    "address": "Jl. Basuki Rahmat, Surabaya",
    "district": "Tegalsari",
    "city": "Surabaya",
    "facing_direction": "north",
    "traffic_density": "high",
    "is_illuminated": true,
    "is_featured": false,
    "created_at": "2026-05-16T10:00:00Z"
  }
}
```

---

## 5) Booking & Activity

### Book a Spot
- **Method**: `POST`
- **Endpoint**: `/spots/{id}/book`
- **Auth**: Required
- **Body**:
```json
{
  "start_date": "2026-06-01",
  "end_date": "2026-07-01",
  "duration_type": "monthly",
  "duration_value": 1,
  "notes": "Promo Lebaran"
}
```
- **Response (201)**:
```json
{
  "message": "Booking created successfully",
  "data": {
    "id": "uuid",
    "invoice_no": "ORD-20260516-ABC123",
    "spot": {
      "title": "Videotron Jl. Basuki Rahmat",
      "type": "Videotron"
    },
    "status": "pending",
    "total_price": 15000000,
    "deadline_at": "2026-05-17T10:00:00Z",
    "start_date": "2026-06-01",
    "end_date": "2026-07-01"
  }
}
```

### Get Activities (History)
- **Method**: `GET`
- **Endpoint**: `/activities`
- **Auth**: Required
- **Query Params**:
  - `status` (string): `pending`, `active`, `completed`
- **Response (200)**:
```json
{
  "message": "Activities retrieved successfully",
  "data": {
    "data": [
      {
        "id": "uuid",
        "invoice_no": "ORD-20260516-ABC123",
        "spot": {
          "title": "Videotron Jl. Basuki Rahmat",
          "type": "Videotron"
        },
        "status": "pending",
        "total_price": 15000000,
        "deadline_at": "2026-05-17T10:00:00Z",
        "start_date": "2026-06-01",
        "end_date": "2026-07-01"
      }
    ],
    "links": {
      "first": "...",
      "last": "...",
      "prev": null,
      "next": null
    },
    "meta": {
      "current_page": 1,
      "from": 1,
      "last_page": 1,
      "per_page": 15,
      "to": 1,
      "total": 1
    }
  }
}
```

### Get Activity Detail
- **Method**: `GET`
- **Endpoint**: `/activities/{id}`
- **Auth**: Required
- **Response (200)**: sama dengan item pada list `activities`.

### Cancel Booking
- **Method**: `PATCH`
- **Endpoint**: `/activities/{id}/cancel`
- **Auth**: Required
- **Body**:
```json
{
  "cancel_reason": "Ganti tanggal"
}
```
- **Response (200)**:
```json
{
  "message": "Booking cancelled successfully",
  "data": {
    "id": "uuid",
    "invoice_no": "ORD-20260516-ABC123",
    "spot": {
      "title": "Videotron Jl. Basuki Rahmat",
      "type": "Videotron"
    },
    "status": "cancelled",
    "total_price": 15000000,
    "deadline_at": "2026-05-17T10:00:00Z",
    "start_date": "2026-06-01",
    "end_date": "2026-07-01"
  }
}
```

---

## 6) Company

### Get Company Detail
- **Method**: `GET`
- **Endpoint**: `/companies/{id}`
- **Auth**: Required
- **Response (200)**:
```json
{
  "message": "Company detail retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "PT Smart Tech",
    "email": "admin@company.com",
    "phone": "08123456789",
    "address": "Jl. Basuki Rahmat No.10, Surabaya",
    "city": "Surabaya",
    "npwp": "01.234.567.8-901.000",
    "nib": "1207000123456",
    "status": "Active",
    "created_at": "2026-05-16T10:00:00Z"
  }
}
```

### Update Company Detail
- **Method**: `PATCH`
- **Endpoint**: `/companies/{id}`
- **Auth**: Required
- **Body**:
```json
{
  "email": "admin@company.com",
  "phone": "08123456789",
  "address": "Alamat baru",
  "city": "Surabaya",
  "npwp": "01.234.567.8-901.000",
  "nib": "1207000123456"
}
```
- **Response (200)**:
```json
{
  "message": "Company updated successfully",
  "data": {
    "id": "uuid",
    "name": "PT Smart Tech",
    "email": "admin@company.com",
    "phone": "08123456789",
    "address": "Alamat baru",
    "city": "Surabaya",
    "npwp": "01.234.567.8-901.000",
    "nib": "1207000123456",
    "status": "Active",
    "created_at": "2026-05-16T10:00:00Z"
  }
}
```

---

# ADMIN API (Web Dashboard)

## 1) Auth

### Login
- **Method**: `POST`
- **Endpoint**: `/login`
- **Body**:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
- **Response (200)**:
```json
{
  "message": "Login success",
  "data": {
    "id": "uuid",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "Admin",
    "phone": "08123456789",
    "is_verified": true,
    "is_active": true,
    "created_at": "2026-05-16T10:00:00Z"
  },
  "token": "1|admin_token"
}
```

### Logout
- **Method**: `POST`
- **Endpoint**: `/logout`
- **Auth**: Required
- **Response (200)**:
```json
{
  "message": "Logout success"
}
```

---

## 2) Billboards

### Get All Billboards
- **Method**: `GET`
- **Endpoint**: `/billboards`
- **Auth**: Required
- **Response (200)**:
```json
{
  "message": "Billboards retrieved",
  "data": [
    {
      "id": "uuid",
      "name": "Videotron Jl. Basuki Rahmat",
      "code": "BBD-ABC123",
      "category_id": "uuid",
      "category": "Videotron",
      "description": "Ukuran: 4x8 | Harga: Rp 15.000.000/bulan",
      "size": "4x8",
      "price_label": "Rp 15.000.000/bulan",
      "price_per_month": 15000000,
      "address": "Jl. Basuki Rahmat, Surabaya",
      "district": "Tegalsari",
      "city": "Surabaya",
      "lat": -7.275,
      "lng": 112.75,
      "facing_direction": "north",
      "traffic_density": "high",
      "is_illuminated": true,
      "is_active": true,
      "is_featured": false,
      "photo_url": "https://example.com/photo.jpg",
      "created_at": "2026-05-16T10:00:00Z"
    }
  ]
}
```

### Get Billboard Detail
- **Method**: `GET`
- **Endpoint**: `/billboards/{id}`
- **Auth**: Required
- **Response (200)**: Sama dengan format item pada list billboards.

### Create Billboard
- **Method**: `POST`
- **Endpoint**: `/billboards`
- **Auth**: Required
- **Body**:
```json
{
  "name": "Videotron Jl. Basuki Rahmat",
  "code": "BBD-ABC123",
  "category_id": "uuid",
  "description": "Ukuran: 4x8",
  "address": "Jl. Basuki Rahmat, Surabaya",
  "district": "Tegalsari",
  "city": "Surabaya",
  "lat": -7.275,
  "lng": 112.75,
  "facing_direction": "north",
  "traffic_density": "high",
  "is_illuminated": true,
  "is_active": true,
  "is_featured": false,
  "size": "4x8",
  "price_label": "Rp 15.000.000/bulan",
  "price_per_month": 15000000
}
```
- **Response (201)**: Sama dengan format item pada list billboards.

### Update Billboard
- **Method**: `PUT`
- **Endpoint**: `/billboards/{id}`
- **Auth**: Required
- **Body**: Field yang ingin diubah dari payload create.
- **Response (200)**: Sama dengan format item pada list billboards.

### Delete Billboard
- **Method**: `DELETE`
- **Endpoint**: `/billboards/{id}`
- **Auth**: Required
- **Response (200)**:
```json
{ "message": "Billboard berhasil dihapus" }
```

### Upload Billboard Photo
- **Method**: `POST`
- **Endpoint**: `/billboards/{id}/photos`
- **Auth**: Required
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `photo` (file): jpeg/png/jpg/webp, max 5MB
- **Response (201)**:
```json
{
  "message": "Foto berhasil diunggah",
  "data": {
    "id": "uuid",
    "billboard_id": "uuid",
    "photo_url": "https://example.com/storage/billboards/photo.jpg",
    "is_primary": true,
    "sort_order": 1,
    "created_at": "2026-05-16T10:00:00Z",
    "updated_at": "2026-05-16T10:00:00Z"
  }
}
```

---

## 3) Users (Admin)

### Get All Users
- **Method**: `GET`
- **Endpoint**: `/users`
- **Auth**: Required
- **Response (200)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Nama User",
      "email": "user@example.com",
      "phone": "08123456789",
      "role": "user",
      "status": "Active",
      "is_active": true,
      "is_verified": true,
      "joinDate": "2026-05-16",
      "lastLogin": "-"
    }
  ]
}
```

### Get User Detail
- **Method**: `GET`
- **Endpoint**: `/users/{id}`
- **Auth**: Required
- **Response (200)**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Nama User",
    "email": "user@example.com",
    "phone": "08123456789",
    "role": "user",
    "is_active": true,
    "is_verified": true,
    "created_at": "2026-05-16T10:00:00Z",
    "updated_at": "2026-05-16T10:00:00Z"
  }
}
```

### Create User
- **Method**: `POST`
- **Endpoint**: `/users`
- **Auth**: Required
- **Body**:
```json
{
  "name": "Nama User",
  "email": "user@example.com",
  "phone": "08123456789",
  "password": "secret123",
  "role": "user",
  "status": "Active"
}
```
- **Response (201)**:
```json
{
  "status": "success",
  "message": "User created successfully.",
  "data": {
    "id": "uuid",
    "name": "Nama User",
    "email": "user@example.com",
    "phone": "08123456789",
    "role": "user",
    "is_active": true,
    "is_verified": true,
    "created_at": "2026-05-16T10:00:00Z",
    "updated_at": "2026-05-16T10:00:00Z"
  }
}
```

### Update User
- **Method**: `PUT`
- **Endpoint**: `/users/{id}`
- **Auth**: Required
- **Body**: Field yang ingin diubah dari payload create.
- **Response (200)**:
```json
{
  "status": "success",
  "message": "User updated successfully.",
  "data": {
    "id": "uuid",
    "name": "Nama User",
    "email": "user@example.com",
    "phone": "08123456789",
    "role": "user",
    "is_active": true,
    "is_verified": true,
    "created_at": "2026-05-16T10:00:00Z",
    "updated_at": "2026-05-16T10:00:00Z"
  }
}
```

### Delete User
- **Method**: `DELETE`
- **Endpoint**: `/users/{id}`
- **Auth**: Required
- **Response (200)**:
```json
{
  "status": "success",
  "message": "User deleted successfully."
}
```

---

## 4) Clients

### Get All Clients
- **Method**: `GET`
- **Endpoint**: `/clients`
- **Auth**: Required
- **Response (200)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "PT Smart Tech",
      "email": "admin@company.com",
      "phone": "08123456789",
      "city": "Surabaya",
      "status": "Active",
      "totalRentals": 0,
      "joinDate": "2026-05-16"
    }
  ]
}
```

### Get Client Detail
- **Method**: `GET`
- **Endpoint**: `/clients/{id}`
- **Auth**: Required
- **Response (200)**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "PT Smart Tech",
    "email": "admin@company.com",
    "phone": "08123456789",
    "city": "Surabaya",
    "status": "Active",
    "totalRentals": 0,
    "joinDate": "2026-05-16"
  }
}
```

### Create Client
- **Method**: `POST`
- **Endpoint**: `/clients`
- **Auth**: Required
- **Body**:
```json
{
  "name": "PT Smart Tech",
  "email": "admin@company.com",
  "phone": "08123456789",
  "city": "Surabaya",
  "status": "Active"
}
```
- **Response (201)**:
```json
{
  "status": "success",
  "message": "Klien berhasil ditambahkan.",
  "data": {
    "id": "uuid",
    "name": "PT Smart Tech",
    "email": "admin@company.com",
    "phone": "08123456789",
    "city": "Surabaya",
    "status": "Active",
    "totalRentals": 0,
    "joinDate": "2026-05-16"
  }
}
```

### Update Client
- **Method**: `PUT`
- **Endpoint**: `/clients/{id}`
- **Auth**: Required
- **Body**: Field yang ingin diubah dari payload create.
- **Response (200)**:
```json
{
  "status": "success",
  "message": "Data klien berhasil diperbarui.",
  "data": {
    "id": "uuid",
    "name": "PT Smart Tech",
    "email": "admin@company.com",
    "phone": "08123456789",
    "city": "Surabaya",
    "status": "Active",
    "totalRentals": 0,
    "joinDate": "2026-05-16"
  }
}
```

### Delete Client
- **Method**: `DELETE`
- **Endpoint**: `/clients/{id}`
- **Auth**: Required
- **Response (200)**:
```json
{
  "status": "success",
  "message": "Klien berhasil dihapus."
}
```

---

## 5) Bookings (Admin)

### Get All Bookings
- **Method**: `GET`
- **Endpoint**: `/bookings`
- **Auth**: Required
- **Query Params**:
  - `status` (string, optional): `pending_payment`, `waiting_confirmation`, `active`, `completed`, `cancelled`, `rejected`
- **Response (200)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "booking_code": "ORD-20260516-ABC123",
      "client": "PT Smart Tech",
      "billboard": "Videotron Jl. Basuki Rahmat",
      "start_date": "2026-06-01",
      "end_date": "2026-07-01",
      "duration": "1 monthly",
      "amount": "Rp 15.000.000",
      "status": "Pending",
      "payment": "Unpaid"
    }
  ]
}
```

---

# DASHBOARD DATA (Non-v1)

### Get Dashboard Table Data
- **Method**: `GET`
- **Endpoint**: `/dashboard-data`
- **Response (200)**:
```json
[
  {
    "id": 1,
    "header": "Cover page",
    "type": "Cover page",
    "status": "In Process",
    "target": "18",
    "limit": "5",
    "reviewer": "Eddie Lake"
  },
  {
    "id": 2,
    "header": "Table of contents",
    "type": "Table of contents",
    "status": "Done",
    "target": "29",
    "limit": "24",
    "reviewer": "Eddie Lake"
  }
]
```

---

# Error Response

Contoh error umum:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

Status yang mungkin muncul:
- `401` Unauthorized (token tidak ada/invalid)
- `403` Forbidden (role tidak sesuai)
- `404` Not Found (data tidak ditemukan)
- `409` Conflict (jadwal booking bentrok)
- `422` Validation Error (input tidak valid)

