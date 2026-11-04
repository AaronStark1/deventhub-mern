import { Suspense, lazy } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import PageLoader from "./components/PageLoader";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./routes/ProtectedRoute";

// Each page is its own chunk, so the landing page's WebGL and animation
// libraries don't load for someone opening /events, and the ticket page's
// PDF libraries only load when a ticket is viewed.
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Auth = lazy(() => import("./pages/Auth"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));

// user pages
const Events = lazy(() => import("./users/pages/Events"));
const EventDetails = lazy(() => import("./users/pages/EventDetails"));
const EventRegistration = lazy(() => import("./users/pages/EventRegistration"));
const EventCheckout = lazy(() => import("./users/pages/EventCheckout"));
const PaymentSuccess = lazy(() => import("./users/pages/PaymentSuccess"));
const TicketPage = lazy(() => import("./users/pages/TicketPage"));
const Dashboard = lazy(() => import("./users/pages/UserDashboard"));

// host pages
const HostDashboard = lazy(() => import("./host/pages/HostDashboard"));
const CreateEvent = lazy(() => import("./host/pages/CreateEvent"));
const EditEvent = lazy(() => import("./host/pages/EditEvent"));

const userOnly = (page) => (
  <ProtectedRoute allowedRole="user">{page}</ProtectedRoute>
);
const hostOnly = (page) => (
  <ProtectedRoute allowedRole="host">{page}</ProtectedRoute>
);

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-bg dark:bg-bg-dark text-text dark:text-text-dark">
          <ScrollToTop />
          <Navbar />

          {/* Keyed by path so a crashed page recovers when the user navigates away */}
          <ErrorBoundary key={location.pathname}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/about" element={<About />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />

                {/* user */}
                <Route path="/events/:id/register" element={userOnly(<EventRegistration />)} />
                <Route path="/events/:id/checkout" element={userOnly(<EventCheckout />)} />
                <Route path="/payment-success" element={userOnly(<PaymentSuccess />)} />
                <Route path="/ticket/:id" element={userOnly(<TicketPage />)} />
                <Route path="/dashboard" element={userOnly(<Dashboard />)} />

                {/* host */}
                <Route path="/host/dashboard" element={hostOnly(<HostDashboard />)} />
                <Route path="/host/events/create" element={hostOnly(<CreateEvent />)} />
                <Route path="/host/events/edit/:id" element={hostOnly(<EditEvent />)} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>

          <Footer />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
