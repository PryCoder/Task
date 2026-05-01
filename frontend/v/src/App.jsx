import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';

// Define multiple font families
const fonts = {
  heading: `'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif`,
  mono: `'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Courier New', monospace`,
};

// Define colors
const colors = {
  purple: {
    50: '#f5e6ff',
    100: '#e6ccff',
    200: '#cc99ff',
    300: '#b366ff',
    400: '#9933ff',
    500: '#7f00ff',
    600: '#6600cc',
    700: '#4c0099',
    800: '#330066',
    900: '#190033',
  },
  pink: {
    500: '#d53f8c',
  },
  gray: {
    50: '#f7fafc',
    100: '#edf2f7',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#718096',
    600: '#4a5568',
    700: '#2d3748',
    800: '#1a202c',
    900: '#171923',
  },
  brand: {
    50: '#e6f7ff',
    100: '#bae7ff',
    200: '#91d5ff',
    300: '#69c0ff',
    400: '#40a9ff',
    500: '#1890ff',
    600: '#096dd9',
    700: '#0050b3',
    800: '#003a8c',
    900: '#002766',
  }
};

// Global styles with multiple font applications
const styles = {
  global: {
    body: {
      bg: 'gray.50',
      fontFamily: fonts.body,
      fontSize: 'md',
      lineHeight: 'tall',
    },
    h1: {
      fontFamily: fonts.heading,
      fontWeight: 'bold',
    },
    h2: {
      fontFamily: fonts.heading,
      fontWeight: 'semibold',
    },
    h3: {
      fontFamily: fonts.heading,
      fontWeight: 'medium',
    },
    'code, pre': {
      fontFamily: fonts.mono,
    },
    '.gradient-text': {
      bgGradient: 'linear(to-r, purple.500, pink.500)',
      bgClip: 'text',
      fontWeight: 'bold',
    }
  },
};

// Component style overrides
const components = {
  Button: {
    baseStyle: {
      fontFamily: fonts.body,
      fontWeight: 'semibold',
    },
    defaultProps: {
      colorScheme: 'purple',
    },
  },
  Heading: {
    baseStyle: {
      fontFamily: fonts.heading,
    },
  },
  Text: {
    baseStyle: {
      fontFamily: fonts.body,
    },
  },
  Input: {
    baseStyle: {
      fontFamily: fonts.body,
    },
  },
  Label: {
    baseStyle: {
      fontFamily: fonts.body,
      fontWeight: 'medium',
    },
  },
  Card: {
    baseStyle: {
      fontFamily: fonts.body,
    },
  },
  Menu: {
    baseStyle: {
      fontFamily: fonts.body,
    },
  },
  Modal: {
    baseStyle: {
      fontFamily: fonts.body,
    },
  },
};

// Create the theme
const theme = extendTheme({
  colors,
  fonts,
  styles,
  components,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  shadows: {
    outline: '0 0 0 3px rgba(127, 0, 255, 0.6)',
  },
  radii: {
    lg: '0.75rem',
    xl: '1rem',
  },
});

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/projects" 
          element={
            <PrivateRoute>
              <Projects />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <PrivateRoute>
              <Tasks />
            </PrivateRoute>
          } 
        />
           <Route 
          path="/admin" 
          element={
            <PrivateRoute adminOnly={true}>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;