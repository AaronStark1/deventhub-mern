import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";

import Auth from "./pages/Auth";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import About from "./pages/About";

// user pages
import Events from "./users/pages/Events";
import EventDetails from "./users/pages/EventDetails";
import EventRegistration from "./users/pages/EventRegistration";
import EventCheckout from "./users/pages/EventCheckout";
import Dashboard from "./users/pages/UserDashboard";

// host pages
import HostDashboard from "./host/pages/HostDashboard";
import CreateEvent from "./host/pages/CreateEvent";
import EditEvent from "./host/pages/EditEvent";
import { AuthProvider } from "./context/AuthContext";
import PaymentSuccess from "./users/pages/PaymentSuccess";
import TicketPage from "./users/pages/TicketPage";
import Footer from "./components/Footer";


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-bg dark:bg-bg-dark text-text dark:text-text-dark">
          <Navbar />

          <Routes>
            {/* public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/about" element={<About />} />

            {/* user */}
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/events/:id/register" element={<EventRegistration />} />
            <Route path="/events/:id/checkout" element={<EventCheckout />} />
            <Route path="/ticket/:id" element={<TicketPage />} />

            <Route path="/payment-success" element={<PaymentSuccess />} />


            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRole="user">
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* host */}
            <Route
              path="/host/dashboard"
              element={
                <ProtectedRoute allowedRole="host">
                  <HostDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/host/events/create"
              element={
                <ProtectedRoute allowedRole="host">
                  <CreateEvent />
                </ProtectedRoute>
              }
            />

            <Route
              path="/host/events/edit/:id"
              element={
                <ProtectedRoute allowedRole="host">
                  <EditEvent />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Footer/>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
