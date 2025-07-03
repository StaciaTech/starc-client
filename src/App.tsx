import React, { ErrorInfo, ReactNode, createContext, useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Index from "./pages/Index";
import Course from "./pages/Course";
import Book from "./pages/Book";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import SchedulePage from "./pages/SchedulePage";
import SettingsPage from "./pages/SettingsPage";
import WishlistPage from "./pages/WishlistPage";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import LoginPage from "./pages/LoginPage";

// Components
import ScrollToTop from "./components/ScrollTop";
import CardDetail from "./components/CardDetail";
import LearningModule from "./components/LearningModule";
import LearningOverview from "./components/LearningOverview";
import SubmissionSuccess from "./components/SubmissionSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import QuizAttempt from './components/QuizAttempt';

// Admin pages
import AdminCoursePage from './pages/AdminCoursePage';
import AdminCourseStructurePage from './pages/AdminCourseStructurePage';
import AdminCourseDetails from './pages/AdminCourseDetails';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import CourseAssignmentsPage from './pages/CourseAssignmentsPage';

// Services
import authService from "./services/authService";

// Create AuthContext
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  checkAuthStatus: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  checkAuthStatus: () => {}
});

// Custom event for auth state changes
export const AUTH_STATE_CHANGED_EVENT = 'auth-state-changed';

// AuthProvider component
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  const checkAuthStatus = () => {
    const hasToken = authService.isAuthenticated();
    const wasAuthenticated = isAuthenticated;
    
    setIsAuthenticated(hasToken);
    
    if (hasToken) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
          
          // Only dispatch event if state actually changed
          if (!wasAuthenticated) {
            // Dispatch custom event for components that might miss context updates
            window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGED_EVENT, {
              detail: { isAuthenticated: true, user: userData }
            }));
          }
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUser(null);
      }
    } else {
      setUser(null);
      
      // Only dispatch event if state actually changed
      if (wasAuthenticated) {
        // Dispatch custom event for logout
        window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGED_EVENT, {
          detail: { isAuthenticated: false, user: null }
        }));
      }
    }
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for storage events to detect login/logout in other tabs
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-700 mb-4">
              The application encountered an error. Please try refreshing the page.
            </p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40 mb-4">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/Login" element={<LoginPage />} />
                <Route path="/Signup" element={<Signup />} />
                <Route path="/LoginPage" element={<LoginPage />} />
                <Route path="/About" element={<About />} />
                <Route path="/Contact" element={<Contact />} />
                <Route path="/course" element={<Course />} />
                <Route path="/book" element={<Book />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/learning/overview" element={<LearningOverview />} />
                <Route path="/course/:id" element={<ProtectedRoute><CardDetail /></ProtectedRoute>} />
                <Route path="/course/:id/learn" element={<ProtectedRoute><LearningModule /></ProtectedRoute>} />
                <Route path="/course/:id/learning" element={<LearningModule />} />
                <Route path="/course/:courseId/quiz/:quizId" element={<QuizAttempt />} />
                <Route path="/course/:courseId/assignments" element={<ProtectedRoute><CourseAssignmentsPage /></ProtectedRoute>} />

                {/* Success Routes */}
                <Route path="/submit/success" element={<SubmissionSuccess />} />
                
                {/* Admin Routes */}
                <Route path="/admin/courses" element={<AdminRoute><AdminCoursePage /></AdminRoute>} />
                <Route path="/admin/courses/:courseId" element={<AdminRoute><AdminCourseDetails /></AdminRoute>} />
                <Route path="/admin/courses/:courseId/structure" element={<AdminRoute><AdminCourseStructurePage /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUserManagementPage /></AdminRoute>} />
                
                {/* Catch-all Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
