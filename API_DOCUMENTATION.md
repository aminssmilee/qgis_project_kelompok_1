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
      "thumbnail_url": "https://..."
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
    "address": "...",
    "npwp": "...",
    "nib": "..."
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
