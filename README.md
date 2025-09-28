# BrewOps - Role-Based Authentication System

A full-stack web application with React frontend and Node.js/Express backend featuring role-based authentication and authorization.

## 🚀 Features

- **Role-Based Authentication**: Admin, Manager, Supplier, and Staff roles
- **JWT Token Authentication**: Secure token-based authentication
- **Protected Routes**: Role-based access control
- **Responsive Design**: Modern, mobile-friendly UI
- **User Management**: Admin can manage users and roles
- **Dashboard System**: Role-specific dashboards with relevant features

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios for HTTP requests
- Context API for state management
- CSS3 with modern animations

### Backend
- Node.js
- Express.js
- MySQL with connection pooling
- JWT (JSON Web Tokens)
- bcryptjs for password hashing
- express-validator for input validation

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [XAMPP](https://www.apachefriends.org/) (for MySQL database)
- [Git](https://git-scm.com/) (optional)

## 🔧 Installation & Setup

### 1. Clone or Download the Project

```bash
# If using Git
git clone https://github.com/thennakoontakk/BrewOps.git
cd BrewOps

# Or download and extract the ZIP file
```

### 2. Database Setup

1. **Start XAMPP**:
   - Open XAMPP Control Panel
   - Start Apache and MySQL services

2. **Create Database**:
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Create a new database named `brewops_db`
   - Import the schema from `database/schema.sql` or run the SQL commands manually

3. **Database Schema**:
   ```sql
   -- The schema includes:
   -- - roles table (admin, manager, supplier, staff)
   -- - users table with foreign key to roles
   -- - Default admin user (admin@brewops.com / admin123)
   ```

### 3. Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   - Copy `.env.example` to `.env`
   - Update the `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=brewops_db
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the backend server**:
   ```bash
   npm run dev
   ```
   The backend will run on http://localhost:5000

### 4. Frontend Setup

1. **Open a new terminal and navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the frontend development server**:
   ```bash
   npm start
   ```
   The frontend will run on http://localhost:3000

### 5. Run Both Servers Simultaneously (Optional)

From the root directory:
```bash
npm install
npm run dev
```

## 👥 Default Users & Roles

### Default Admin User
- **Email**: admin@brewops.com
- **Password**: admin123
- **Role**: Admin (full access)

### Role Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, all dashboards |
| **Manager** | Team management, operational oversight, limited user access |
| **Supplier** | Inventory management, order processing |
| **Staff** | Task management, daily operations |

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile (protected)
- `GET /api/auth/roles` - Get all roles

### User Management (Admin/Manager only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/status` - Update user status (Admin only)
- `PUT /api/users/:id/role` - Update user role (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

## 🎨 Frontend Routes

- `/` - Redirects to dashboard if authenticated, login if not
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Main dashboard (role-based content)
- `/admin` - Admin dashboard (Admin only)
- `/manager` - Manager dashboard (Manager only)
- `/supplier` - Supplier dashboard (Supplier only)
- `/staff` - Staff dashboard (Staff only)

## 🧪 Testing the Application

### 1. Test Authentication
1. Open http://localhost:3000
2. Login with default admin credentials
3. Verify dashboard loads correctly
4. Test logout functionality

### 2. Test Role-Based Access
1. Try accessing different role routes
2. Verify access control works
3. Test user management features (Admin only)

### 3. Test Registration
1. Register a new user
2. Verify email validation
3. Test login with new credentials

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Ensure XAMPP MySQL is running
   - Check database credentials in `.env`
   - Verify database `brewops_db` exists

2. **Port Already in Use**:
   - Backend: Change `PORT` in `.env` file
   - Frontend: Set `PORT=3001` in frontend `.env` file

3. **CORS Errors**:
   - Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
   - Check if both servers are running

4. **JWT Token Issues**:
   - Clear browser localStorage
   - Ensure `JWT_SECRET` is set in backend `.env`

### Development Tips

1. **Hot Reload**: Both servers support hot reload during development
2. **Debugging**: Check browser console and terminal logs for errors
3. **Database**: Use phpMyAdmin to inspect database changes
4. **API Testing**: Use tools like Postman to test API endpoints

## 📁 Project Structure

```
brewops/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── users.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboards/
│   │   │   ├── Auth.css
│   │   │   ├── Dashboard.css
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── Register.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── App.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── database/
│   └── schema.sql
├── package.json
└── README.md
```

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Input validation and sanitization
- Role-based access control
- Protected API endpoints
- CORS configuration
- Environment variable protection

## 🚀 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
JWT_SECRET=your-very-secure-production-jwt-secret
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_NAME=brewops_db
FRONTEND_URL=https://your-production-domain.com
```

### Build Commands
```bash
# Frontend build
cd frontend
npm run build

# Backend (use PM2 or similar for production)
cd backend
npm start
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please create an issue in the repository or contact the development team.

---

**Happy Coding! 🎉**