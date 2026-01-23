# EventHive - Frontend

A modern, responsive event management web application built with **React**, **Vite**, **Tailwind CSS**, and **DaisyUI**. EventHive allows users to discover, create, and manage events in a vibrant community-driven platform.

This is the frontend of a **MERN stack** application. For the backend repository, see [EventHive Backend](https://github.com/carlosalfonzo/eventhive-backend).

## 🌐 Live Demo

**[EventHive Live on Vercel](https://eventhive.vercel.app)**

## 🎯 Features

- **Event Discovery** - Browse public events with filtering and search capabilities
- **Event Management** - Create, edit, and delete your own events
- **Event Attendance** - Join or leave events and track your attendance
- **User Authentication** - Secure signup and login with JWT tokens
- **User Profiles** - View and manage your profile information
- **Favorites** - Save your favorite events for quick access
- **Event Comments** - Add and view comments on event details
- **Mobile-Responsive Design** - Optimized for desktop and mobile devices with bottom navigation
- **Photo Gallery** - Event creators can add and manage event photos
- **Modern UI** - Built with Tailwind CSS and DaisyUI components

## 🛠️ Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **React Icons** - Icon library

## 📋 Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- Access to the [EventHive Backend API](https://github.com/carlosalfonzo/eventhive-backend)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/carlosalfonzo/eventhive-frontend.git
cd eventhive-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
VITE_API_URL=http://localhost:5000
```

**Environment Variables:**
- `VITE_API_URL` - Backend API base URL (default: `http://localhost:5000`)

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

The optimized production build will be generated in the `dist/` directory.

### 6. Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/       # Reusable React components
├── context/         # React Context for global state (auth, language)
├── hooks/           # Custom React hooks
├── layouts/         # Page layout components
├── pages/           # Page components for different routes
├── services/        # API service layer
├── utils/           # Utility functions
├── App.jsx          # Main app component with routing
├── main.jsx         # Entry point
└── index.css        # Global styles
```

## 🔗 Backend Integration

EventHive Frontend communicates with the EventHive Backend API for:
- Authentication (signup, login, verification)
- Event CRUD operations
- User management
- Comments and favorites
- Event attendance tracking

Make sure the backend is running before starting the frontend development server.

**Backend Repository:** [EventHive Backend](https://github.com/carlosalfonzo/eventhive-backend)

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## 🎓 Project Context

EventHive is an **Ironhack final project** demonstrating full-stack web development skills with the MERN stack, responsive design, and modern development practices.

## 👨‍💻 Author

**Carlos Alfonzo**

## 📄 License

This project is provided as-is for educational purposes.
