# 📱 Dokumentasi API untuk Mobile (Flutter)
**QGIS Billboard Rental System - API V1**

Dokumen ini berisi panduan teknis bagi Flutter Developer untuk melakukan integrasi dengan sistem backend.

## 🔗 Base URL
`http://<server-ip>:8000/api/v1`

---

## 🛠️ Headers Wajib
Setiap request ke server **WAJIB** menyertakan header berikut:
```text
Accept: application/json
Content-Type: application/json
```

---

## 🔐 Autentikasi User (Public)

### 1. Register Akun Baru
Endpoint untuk pendaftaran user baru.
*   **Method:** `POST`
*   **Endpoint:** `/user/register`
*   **Payload:**
```json
{
    "name": "Nama Lengkap",
    "email": "user@example.com",
    "phone": "08123456789",
    "password": "password123",
    "password_confirmation": "password123"
}
```

### 2. Login
Mendapatkan token untuk mengakses rute terproteksi.
*   **Method:** `POST`
*   **Endpoint:** `/user/login`
*   **Payload:**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```
*   **Response Sukses (200):**
```json
{
    "message": "Login successful",
    "data": {
        "id": "uuid-string",
        "name": "Nama User",
        "email": "user@example.com"
    },
    "access_token": "1|secret_token_string",
    "token_type": "Bearer"
}
```

---

## 🛡️ Rute Terproteksi (Private)
Membutuhkan header: `Authorization: Bearer <access_token>`

### 3. Ambil Profil (Me)
Mengambil data user yang sedang aktif.
*   **Method:** `GET`
*   **Endpoint:** `/user/me`

### 4. Logout
Menghapus sesi token aktif di server.
*   **Method:** `POST`
*   **Endpoint:** `/user/logout`

---

## 🗺️ Billboard & GIS (Public)

### 5. Daftar Billboard
Mengambil semua data billboard untuk ditampilkan di peta atau list.
*   **Method:** `GET`
*   **Endpoint:** `/user/billboards`

### 6. Detail Billboard
Mengambil data detail billboard spesifik.
*   **Method:** `GET`
*   **Endpoint:** `/user/billboards/{id}`

---

## ⚠️ Penanganan Error (Error Codes)
Backend menggunakan standar HTTP status codes:
*   **422 (Unprocessable Content)**: Validasi gagal (email sudah ada, password kurang panjang, dll).
*   **401 (Unauthorized)**: Token tidak ada atau sudah expired.
*   **500 (Server Error)**: Masalah pada server backend.

---

## 💡 Tips Integrasi Flutter
1.  **Dio/Http Package**: Gunakan package `dio` karena lebih mudah menangani header global dan interceptors.
2.  **Secure Storage**: Simpan `access_token` menggunakan `flutter_secure_storage`. Jangan simpan di SharedPreferences biasa demi keamanan.
3.  **Model Class**: Gunakan tool seperti `json_to_dart` untuk membuat model dari struktur JSON di atas.
