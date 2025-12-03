# WarungKu Financial App

A comprehensive financial management application designed specifically for small shop (warung) operations in Indonesia. Now available on **Web** and **Mobile**!

## 🌟 Features

### Core Functionality
- **Session Management**: Open and close daily sessions with initial and final balance tracking.
- **Transaction Recording**: Record income, expenses, and transfers between wallets.
- **Multi-Wallet Support**: Manage multiple cash drawers and digital wallets (Brilink, Dana, Digipos).
- **Real-time Balance Calculation**: Automatic balance updates based on transactions.
- **Auto-Fill Opening Balance**: Automatically fetches the last session's closing balance when opening a new session.

### Advanced Features
- **User Authentication**: JWT-based secure login system with role-based access control (Admin & Kasir).
- **User Management**: Admin can create and manage Kasir (cashier) accounts.
- **Master Data Management**: Dynamically manage transaction categories.
- **Financial Reporting**: 
  - Monthly and daily transaction reports.
  - Visual charts (income vs expense).
  - Detailed transaction lists with filtering.
- **Cash Reconciliation**: Count physical cash and compare with system records.
- **Admin Privileges**: Admins can perform transactions even when the session is closed.

### Mobile App (New!) 📱
- **Cross-Platform**: Built with Flutter for Android and iOS.
- **Modern UI**: Clean interface with Google Fonts (Inter).
- **Quick Actions**: "Tutup Warung" button directly on the dashboard for Cashiers.
- **Secure Workflow**: 2-Step Close Session process (Input -> Review) to minimize errors.

## 🛠️ Tech Stack

### Frontend (Web)
- **React** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Lucide React** - Icons

### Mobile
- **Flutter** - Cross-platform framework
- **Provider** - State management
- **Google Fonts** - Typography
- **Lucide Icons** - Consistent iconography

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication

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

Create a `.env` file in the `backend` directory:
```env
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=warungku
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_secret_key
```

Run the backend:
```bash
npm start
```

### 3. Frontend Setup (Web)
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Mobile Setup (Flutter)
Ensure you have Flutter installed.
```bash
cd ../warung_h12_mobile
flutter pub get
flutter run -d chrome  # For Web/Debug
# or flutter run -d android/ios
```

## 👤 Default Login Credentials

**Owner (Admin)**
- Username: `owner`
- Password: `owner123`

**Kasir**
- Username: `rahmi`
- Password: `rahmi123`

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.

## 👨‍💻 Author
**Armanda Wahyu**
- GitHub: [@armandawahyuu](https://github.com/armandawahyuu)

## 🙏 Acknowledgments
Built with ❤️ for Indonesian warung owners to simplify their financial management.
