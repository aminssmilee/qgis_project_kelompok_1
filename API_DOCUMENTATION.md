# API Documentation - Billboard Rental System (Mobile)

## Base URL
`{{APP_URL}}/api/v1/user`

---

## Authentication

### Login
- **Endpoint**: `POST /auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "...",
    "refresh_token": "...",
    "user": {
      "id": "...",
      "name": "...",
      "role": "Customer",
      "email": "...",
      "avatar_url": "...",
      "company_id": "..."
    }
  }
  ```

### Register (Company Based)
- **Endpoint**: `POST /auth/register`
- **Request Body**:
  ```json
  {
    "email": "admin@company.com",
    "password": "securepassword",
    "company_name": "PT Smart Tech",
    "nib": "1207000123456"
  }
  ```
- **Response (201 Created)**: Same structure as Login.

---

## Dashboard

### Get Dashboard Summary
- **Endpoint**: `GET /dashboard/summary`
- **Headers**: `Authorization: Bearer {token}`
- **Response (200 OK)**:
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

## Categories

### Get All Categories
- **Endpoint**: `GET /categories`
- **Response (200 OK)**:
  ```json
  {
    "message": "Categories retrieved successfully",
    "data": [
      { "id": "...", "name": "Videotron", "icon": "tv" },
      { "id": "...", "name": "Baliho", "icon": "picture_in_picture" }
    ]
  }
  ```

---

## Explore

### Get All Spots (Peta & List)
- **Endpoint**: `GET /spots`
- **Query Params**:
  - `lat` (float): Latitude pusat pencarian.
  - `lng` (float): Longitude pusat pencarian.
  - `radius` (int): Radius dalam KM (Default: 10).
  - `q` (string): Keyword pencarian nama/alamat.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "...",
      "title": "Videotron Jl. Basuki Rahmat",
      "latitude": -7.275,
      "longitude": 112.750,
      "price_per_month": 15000000,
      "is_available": true,
      "impressions_per_day": 124500,
      "thumbnail_url": "https://...",
      "category": "Videotron"
    }
  ]
  ```

### Get Spot Detail
- **Endpoint**: `GET /spots/{id}`
- **Response (200 OK)**: Detail lengkap billboard.

---

## Profile

### Get Profile
- **Endpoint**: `GET /me`
- **Headers**: `Authorization: Bearer {token}`

### Update Profile
- **Endpoint**: `PATCH /me`
- **Request Body**:
  ```json
  {
    "name": "New Name",
    "avatar_url": "...",
    "phone": "08123456789"
  }
  ```

---

## Company

### Get Company Detail
- **Endpoint**: `GET /companies/{company_id}`
- **Headers**: `Authorization: Bearer {token}`
- **Response (200 OK)**:
  ```json
  {
    "id": "...",
    "name": "PT Smart Tech",
    "email": "admin@company.com",
    "phone": "08123456789",
    "address": "...",
    "city": "Surabaya",
    "npwp": "...",
    "nib": "...",
    "status": "Active"
  }
  ```

### Update Company Detail
- **Endpoint**: `PATCH /companies/{company_id}`
- **Request Body**:
  ```json
  {
    "address": "New Address",
    "npwp": "...",
    "nib": "..."
  }
  ```

---

## Booking

### Book a Spot
- **Endpoint**: `POST /spots/{id}/book`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "start_date": "2026-06-01",
    "end_date": "2026-07-01",
    "duration_type": "monthly",
    "duration_value": 1,
    "notes": "Promo Lebaran"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Booking created successfully",
    "data": {
      "id": "...",
      "booking_code": "ORD-20260506-XYZ123",
      "total_price": 15000000,
      "status": "pending_payment"
    }
  }
  ```

---

## Activity

### Get All Activities (History)
- **Endpoint**: `GET /activities`
- **Headers**: `Authorization: Bearer {token}`
- **Query Params**:
  - `status` (string): `pending`, `active`, `completed`.
- **Response (200 OK)**:
  ```json
  {
    "message": "Activities retrieved successfully",
    "data": [
      {
        "id": "...",
        "invoice_no": "ORD-20260506-XYZ123",
        "spot": {
          "title": "Videotron Basuki Rahmat",
          "type": "Videotron"
        },
        "status": "pending",
        "total_price": 15000000,
        "deadline_at": "2026-05-07T23:59:59Z",
        "start_date": "2026-06-01",
        "end_date": "2026-07-01"
      }
    ]
  }
  ```

### Get Activity Detail
- **Endpoint**: `GET /activities/{id}`
- **Headers**: `Authorization: Bearer {token}`
- **Response (200 OK)**: Detailed activity information.

### Cancel a Pending Booking
- **Endpoint**: `PATCH /activities/{id}/cancel`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "cancel_reason": "Berubah pikiran"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Booking cancelled successfully"
  }
  ```

---

## Design/Creative Upload

### Get All Creatives for a Booking
- **Endpoint**: `GET /activities/{bookingId}/creatives`
- **Headers**: `Authorization: Bearer {token}`
- **Response (200 OK)**:
  ```json
  {
    "message": "Creatives retrieved successfully.",
    "data": [
      {
        "id": "...",
        "file_name": "design.jpg",
        "file_url": "http://...",
        "file_size_kb": 2048,
        "file_type": "image/jpeg",
        "status": "pending_review",
        "admin_note": null,
        "uploaded_at": "2026-05-10 12:00"
      }
    ]
  }
  ```

### Upload a Creative Design
- **Endpoint**: `POST /activities/{bookingId}/creatives`
- **Headers**: 
  - `Authorization: Bearer {token}`
  - `Content-Type: multipart/form-data`
- **Request Body (FormData)**:
  - `file`: (File - max 20MB, allowed: jpg, jpeg, png, pdf, ai, psd)
- **Response (201 Created)**:
  ```json
  {
    "message": "Creative file uploaded successfully. It is pending admin review.",
    "data": {
      "id": "...",
      "file_name": "promo.pdf",
      "file_url": "http://...",
      "file_size_kb": 5000,
      "status": "pending_review"
    }
  }
  ```


