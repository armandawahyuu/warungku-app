# WarungKu Financial App

A comprehensive financial management application designed specifically for small shop (warung) operations in Indonesia.

## 🌟 Features

### Core Functionality
- **Session Management**: Open and close daily sessions with initial and final balance tracking
- **Transaction Recording**: Record income, expenses, and transfers between wallets
- **Multi-Wallet Support**: Manage multiple cash drawers and digital wallets (Brilink, Dana, Digipos)
- **Real-time Balance Calculation**: Automatic balance updates based on transactions

### Advanced Features
- **User Authentication**: JWT-based secure login system with role-based access control
- **User Management**: Admin can create and manage Kasir (cashier) accounts
- **Master Data Management**: Dynamically manage transaction categories
- **Financial Reporting**: 
  - Monthly and daily transaction reports
  - Visual charts (income vs expense)
  - Detailed transaction lists with filtering
- **Cash Reconciliation**: Count physical cash and compare with system records

### UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Collapsible Sidebar**: Clean navigation with role-based menu items
- **Currency Formatting**: Automatic thousands separator for better readability
- **Modern Interface**: Built with TailwindCSS for a clean, professional look

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **TailwindCSS** - Styling
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/armandawahyuu/warungku-app.git
cd warungku-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=warungku
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
```

Create PostgreSQL database:
```bash
psql -U postgres
CREATE DATABASE warungku;
\q
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Run the Application

**Backend** (in `backend/` directory):
```bash
npm run dev
```
Backend will run on http://localhost:5001

**Frontend** (in `frontend/` directory):
```bash
npm run dev
```
Frontend will run on http://localhost:5174

## 👤 Default Login Credentials

```
Username: admin
Password: admin123
```

**⚠️ Important:** Change the default password after first login for security.

## 📱 Usage Guide

### 1. Opening a Session
1. Login with admin credentials
2. Navigate to "Buka Warung" from the dashboard
3. Enter opening balances for all wallets
4. Click "Buka Warung" to start the session

### 2. Recording Transactions
- **Income**: Click "Pemasukan" → Select category and destination wallet
- **Expense**: Click "Pengeluaran" → Select category and source wallet
- **Transfer**: Click "Transfer" → Select source and destination wallets

### 3. Managing Categories
1. Click "Kategori" in the sidebar
2. Switch between "Pengeluaran" and "Pemasukan" tabs
3. Add new categories or delete existing ones

### 4. Viewing Reports
1. Click "Laporan" in the sidebar
2. Filter by month and year
3. View charts, summary cards, and detailed transaction list

### 5. User Management (Admin Only)
1. Click "Kelola User" in the sidebar
2. Create new Kasir accounts
3. Delete users (except yourself)

### 6. Closing a Session
1. Click "Tutup Warung" button
2. Enter closing balances for digital wallets
3. Count physical cash for each drawer
4. Review discrepancies (if any)
5. Click "Tutup Sesi" to finalize

## 🗂️ Project Structure

```
warungku-app/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── seedUsers.js     # Default admin seeder
│   └── index.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── api/         # API client
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context
│   │   ├── hooks/       # Custom hooks
│   │   └── pages/       # Page components
│   └── index.html
└── README.md
```

## 🔒 Security Features

- JWT-based authentication with 24-hour expiration
- Password hashing using bcrypt (10 rounds)
- Protected API routes with middleware
- Role-based access control (Admin/Kasir)
- Prevention of self-account deletion

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Armanda Wahyu**
- GitHub: [@armandawahyuu](https://github.com/armandawahyuu)

## 🙏 Acknowledgments

Built with ❤️ for Indonesian warung owners to simplify their financial management.
