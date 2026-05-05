# 🗺️ QGIS Billboard Rental System

A modern Web Application for managing and booking billboards with Geographic Information System (GIS) integration. Built with a robust Laravel backend and a reactive React SPA frontend, featuring a modern UI design, interactive maps, and a real-time booking system.

---

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure authentication with role-based access control (User & Admin).
- **Interactive Map Browsing**: Beautiful billboard listings integrated with a Web Map (GIS) for easy location-based search.
- **Advanced Filtering**: Filter billboards by category, size, price, and availability.
- **Booking System**: Date selection, creative (design) upload, and dynamic price calculation.
- **Payment Integration**: Automated payment processing and confirmation.
- **User Profile**: Profile management, booking history, and active rental status.

### Admin Features
- **Dashboard Analytics**: Overview of active bookings, revenue, and occupancy rates.
- **Master Data Management**: Full CRUD operations for Billboards, Categories, Sizes, and Pricing.
- **Booking Management**: Review, approve, or reject billboard creatives and manage payments.
- **Map Picker**: Accurately set billboard coordinates (Latitude/Longitude) via an interactive admin map.
- **Activity Logs**: Track system changes and administrative actions.

### Technical Features
- **Ultra-Strict Backend**: Built on a strict, type-safe Laravel 12 architecture enforcing 100% type coverage.
- **React SPA**: Lightning-fast page transitions using React & Inertia.js.
- **Automated Testing**: 100% code coverage requirement enforced via Pest v4.
- **Modern UI**: Styled with Tailwind CSS v4 using a sleek, premium design system.
- **Error Handling**: Comprehensive error handling and API resource standardization.

---

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#2563EB` (Modern blue for CTAs)
- **Dark Mode / Accents**: Smooth gradients and deep dark backgrounds for premium feel.
- **Success Green**: `#10B981` (Success states)
- **Error Red**: `#EF4444` (Error states)

### Typography
- **Font Family**: Inter / Poppins (Google Fonts)
- **Consistent Spacing**: 8px base unit system (Tailwind standards)

---

## 📱 Pages & Screens

### Authentication:
- Login Screen
- Sign Up Screen

### Main Application (User):
- Home / Map Explorer Screen
- Billboard Details Screen
- Booking & Checkout Screen
- User Dashboard & Booking History

### Admin Panel (Admin Users Only):
- **Overview Dashboard**: Statistics and charts.
- **Billboard Management**: Add, edit, and position billboards on the map.
- **Booking Approvals**: Review pending rental requests.
- **Settings**: Manage categories, sizes, and pricing tiers.

---

## 🛠 Technology Stack

### Backend
- **Framework**: Laravel 12 (PHP 8.4+)
- **Database**: SQLite / MySQL
- **Authentication**: Laravel Sanctum
- **Code Quality**: PHPStan (Level 9), Rector, Pint

### Frontend
- **Framework**: React 19 (via Inertia.js)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

### Testing & Tooling
- **Testing**: Pest PHP v4 (Unit, Feature, & Browser tests)
- **Package Manager**: Composer & Bun / NPM

---

## 🏗 Project Structure

```text
qgis_project_kelompok_1/
├── app/
│   ├── Http/
│   │   ├── Controllers/   # API & Web Controllers (Admin/User grouped)
│   │   ├── Requests/      # Form Requests for Validation
│   │   └── Resources/     # Eloquent API Resources
│   └── Models/            # Strictly typed Eloquent Models
├── database/
│   ├── factories/         # Model Factories for testing
│   ├── migrations/        # Database Schema
│   └── seeders/           # Database Seeders
├── resources/
│   ├── js/                # React SPA Frontend
│   │   ├── Components/    # Reusable UI components
│   │   ├── Pages/         # Full page views
│   │   └── app.tsx        # React entry point
│   └── css/               # Tailwind CSS v4 configuration
├── routes/                # API and Web routing definitions
└── tests/                 # Pest 4 test suites (Unit/Feature)
```

---

## 🔧 Getting Started

> **Requires [PHP 8.4+](https://php.net/releases/)**, [Bun](https://bun.sh), and a code coverage driver like **xdebug**.

Create your type-safe Laravel application using [Composer](https://getcomposer.org) (or clone this repository):

```bash
git clone https://github.com/aminssmilee/qgis_project_kelompok_1.git
cd qgis_project_kelompok_1
```

### Initial Setup

Navigate to your project and complete the setup:

```bash
# Setup project
composer setup

# Start the development server
composer dev
```

### Optional: Browser Testing Setup

If you plan to use Pest's browser testing capabilities:

```bash
bun add playwright
bunx playwright install
```

### Verify Installation

Run the test suite to ensure everything is configured correctly:

```bash
composer test
```

You should see 100% test coverage and all quality checks passing.

## 🛠 Available Tooling

### Development
- `composer dev` - Starts Laravel server, queue worker, log monitoring, and Vite+ dev server concurrently

### Code Quality
- `composer lint` - Runs Rector (refactoring), Pint (PHP formatting), and Oxfmt (JS/TS formatting)
- `composer test:lint` - Dry-run mode for CI/CD pipelines

### Testing
- `composer test:type-coverage` - Ensures 100% type coverage with Pest
- `composer test:types` - Runs PHPStan at level 9 (maximum strictness)
- `composer test:unit` - Runs Pest tests with 100% code coverage requirement
- `composer test` - Runs the complete test suite (type coverage, unit tests, linting, static analysis)

### Maintenance
- `composer update:requirements` - Updates all PHP and Bun dependencies to latest versions

---

## 👑 Creating an Admin User

By default, users registered via the app are assigned a standard `user` role. To grant admin access:

1. Register a new account via the frontend.
2. Open your database client (e.g., Tinker or DB viewer).
3. Update the user's role to Admin (or create one using the seeder).
   ```bash
   php artisan tinker
   > App\Models\User::first()->update(['is_active' => true]); # (Sesuaikan dengan logic role admin di DB Anda)
   ```

---

## 📊 Performance Optimizations
- **Eager Loading**: Strictly enforced eager loading to prevent N+1 query problems.
- **Caching**: Configured caching for static billboard data.
- **Asset Bundling**: Optimized production builds using Vite.
- **Code Linting**: Automated code formatting via Pint and Prettier.

---

## 🎯 Future Enhancements
- [ ] Push Notifications for booking status updates.
- [ ] Advanced map drawing tools (Polygons for viewing exact billboard viewing angles).
- [ ] Social Login integration.
- [ ] Dark Mode Support across the entire application.
- [ ] Export reports (PDF/Excel) for admin revenue tracking.

---

## 📄 License
This project is created for portfolio and academic purposes.

**Developer**: Kelompok 1
Showcasing modern Laravel development, strict type safety, GIS integration, and clean SPA architecture.
