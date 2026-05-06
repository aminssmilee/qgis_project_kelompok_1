Authentication
Login
Endpoint: POST /auth/login
Deskripsi: Autentikasi user dan mendapatkan akses token.
Request Body:
{
  "email": "user@perusahaan.com",
  "password": "password123"
}
Response (200 OK):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR...",
  "refresh_token": "def456...",
  "user": {
  "id": "usr_123",
  "name": "Sapta Adzani Purnama",
  "email": "user@perusahaan.com"
  }
}
Register
Endpoint: POST /auth/register
Deskripsi: Mendaftarkan akun perusahaan baru.
Request Body:
{
  "email": "admin@smartadtech.com",
  "password": "securepassword",
  "company_name": "PT Smart Ad-Tech",
  "nib": "1207000123456"
}
Response (201 Created): (Mengembalikan token)
Refresh Token
Endpoint: POST /auth/refresh
Request Body: { "refresh_token": "def456..." }
Response (200 OK): { "access_token": "new_token..." }
Logout
Endpoint: POST /auth/logout
Header: Authorization: Bearer <access_token>
Response (200 OK): { "success": true, "message": "Logged out successfully" }

User & Profile
Get Current Profile
Endpoint: GET /me
Response (200 OK):
{
  "id": "usr_123",
  "name": "Sapta Adzani",
  "role": "Customer",
  "email": "sapta@smartadtech.com",
  "avatar_url": "https://url.to/avatar.jpg",
  "company_id": "cmp_123"
}

Update Profile
Endpoint: PATCH /me
Request Body: { "name": "Sapta Adzani Purnama", "avatar_url": "..." }
Get Company Detail
Endpoint: GET /companies/:company_id
Response (200 OK):
{
  "id": "cmp_123",
  "name": "PT Smart Ad-Tech",
  "address": "Jl. Basuki Rahmat No.10, Surabaya",
  "npwp": "01.234.567.8-901.000",
  "nib": "1207000123456"
}
Update Company Detail
Endpoint: PATCH /companies/:company_id
Request Body: { "address": "...", "npwp": "..." }

Home Dashboard
Get Dashboard Summary
Endpoint: GET /dashboard/summary
Response (200 OK):
{
  "active_ads_count": 2,
  "pending_invoices_count": 1
}

Get Categories
Endpoint: ET /categories
Response (200 OK):
[
  { "id": "cat_1", "name": "Videotron", "icon": "tv" },
  { "id": "cat_2", "name": "Baliho", "icon": "picture_in_picture" }
]

Explore
Get All Spots (Peta)
Endpoint: GET /spots
Query Params:
lat (float): Latitude pengguna.
lng (float): Longitude pengguna.
radius (int): Radius pencarian dalam KM.
available (boolean): true / false.
q (string): Keyword pencarian nama jalan/area.
Response (200 OK):
[
  {
    "id": "spt_001",
    "title": "Videotron Jl. Basuki Rahmat",
    "latitude": -7.275,
    "longitude": 112.750,
    "price_per_month": 15000000,
    "is_available": true,
    "impressions_per_day": 124500,
    "thumbnail_url": "https://..."
  }
]
Get Spot Detail
Endpoint: GET /spots/:spot_id
Deskripsi: Menampilkan detail lengkap titik reklame.
Book a Spot
Endpoint: POST /spots/:spot_id/book
Request Body:
{
  "start_date": "2026-06-01",
  "end_date": "2026-07-01",
  "notes": "Keperluan promo lebaran"
}
Activity
Get Activities
Endpoint: GET /activities
Query Params:
Status: pending | active | completed
Page: Nomor halaman (opsional)
Response (200 OK):
[
  {
    "id": "act_101",
    "invoice_no": "INV-2405-001",
    "spot": {
      "title": "Videotron Jl. Sudirman",
      "type": "Videotron"
    },
    "status": "pending",
    "total_price": 15000000,
    "deadline_at": "2026-05-07T23:59:59Z",
    "start_date": "2026-06-01",
    "end_date": "2026-07-01"
  }
]
Get Activity Detail
Endpoint: GET /activities/:activity_id

Billing & Invoice
Get Invoices
Endpoint: GET /invoices
Query Params: status=unpaid|paid|overdue
Pay Invoice
Endpoint: POST /invoices/:invoice_id/pay
Response (200 OK): Mengembalikan URL Payment Gateway (Midtrans, Xendit, dll).

Inbox & Notifications
Get Notifications
Endpoint: GET /notifications
Response (200 OK):
[
  {
    "id": "notif_01",
    "title": "Tagihan Jatuh Tempo",
    "body": "Invoice INV-2405-001 jatuh tempo besok.",
    "is_read": false,
    "created_at": "2026-05-06T08:00:00Z"
  }
]
Mark Notification as Read
Endpoint: PATCH /notifications/:notification_id/read
Endpoint: PATCH /notifications/read-all
Get Chat List
Endpoint: GET /chats

Support & Legal

Endpoint: GET /faqs (Menampilkan daftar Frequently Asked Questions)
Endpoint: GET /legal/terms (Menampilkan Syarat & Ketentuan)
Endpoint: GET /legal/privacy (Menampilkan Kebijakan Privasi)

Error Response

Response : 
{
  "error": "invalid_credentials",
  "message": "Email atau password yang Anda masukkan salah.",
  "details": {}
}
Detail Response : 
{
  "error": "validation_error",
  "message": "Data tidak valid",
  "details": {
    "email": ["Format email tidak valid."],
    "password": ["Password minimal 8 karakter."]
  }
}
