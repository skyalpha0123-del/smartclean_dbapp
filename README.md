# Database App - Full-Stack Project

A modern full-stack web application built with React frontend and Express.js backend.

## 🚀 Features

- **Frontend**: React 18 with modern hooks and responsive design
- **Backend**: Express.js with security middleware and RESTful API
- **Styling**: Modern CSS with CSS variables and responsive design
- **Routing**: React Router for client-side navigation
- **API Integration**: Axios for HTTP requests
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Development**: Hot reloading and modern development tools

## 🏗️ Project Structure

```
Database_App/
├── backend/                 # Express.js backend
│   ├── routes/             # API route handlers
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── env.example         # Environment variables template
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json        # Frontend dependencies
├── package.json            # Root package.json
└── README.md               # This file
```

## 🛠️ Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Database_App
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

   Or install manually:
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your configuration
   ```

## 🚀 Running the Application

### Development Mode (Both Frontend and Backend)

```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000).

### Run Backend Only

```bash
npm run server
```

### Run Frontend Only

```bash
npm run client
```

### Production Build

```bash
npm run build
```

## 🌐 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🎨 Frontend Components

- **Navbar**: Responsive navigation with mobile menu
- **Home**: Landing page with features and technology stack
- **Users**: User management with CRUD operations
- **UserForm**: Form for adding/editing users
- **Footer**: Application footer

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration

The frontend is configured to proxy API requests to the backend at `http://localhost:5000`.

## 🚀 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start backend server only
- `npm run client` - Start frontend development server only
- `npm run build` - Build frontend for production
- `npm run install-all` - Install dependencies for all packages

### Backend
- `npm run start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🎯 Development Workflow

1. **Start development servers**: `npm run dev`
2. **Backend runs on**: http://localhost:5000
3. **Frontend runs on**: http://localhost:3000
4. **API proxy**: Frontend automatically proxies `/api/*` requests to backend

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API request rate limiting
- **Input Validation**: Form validation and sanitization
- **Error Handling**: Comprehensive error handling middleware

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🧪 Testing

```bash
# Run frontend tests
cd frontend && npm test

# Run backend tests (when implemented)
cd backend && npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment variables
2. Use `npm start` to run the production server
3. Consider using PM2 or similar process manager

### Frontend Deployment
1. Run `npm run build` to create production build
2. Deploy the `build` folder to your hosting service
3. Update backend CORS settings for production domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure environment variables are set correctly
4. Check that ports 3000 and 5000 are available

## 🔮 Future Enhancements

- Database integration (PostgreSQL, MongoDB)
- User authentication and authorization
- Real-time updates with WebSocket
- File upload functionality
- Advanced search and filtering
- Unit and integration tests
- Docker containerization
- CI/CD pipeline setup
