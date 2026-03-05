import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import AppHome from "./pages/AppHome";
import AppAgenda from "./pages/AppAgenda";
import AppServices from "./pages/AppServices";
import AppBarbers from "./pages/AppBarbers";
import AppWorkingHours from "./pages/AppWorkingHours";
import AppBlockedSlots from "./pages/AppBlockedSlots";
import AppUsers from "./pages/AppUsers";
import AppSettings from "./pages/AppSettings";
import AppSubscription from "./pages/AppSubscription";
import ShopPublic from "./pages/ShopPublic";
import BookingWizard from "./pages/BookingWizard";
import BookingConfirmation from "./pages/BookingConfirmation";
import InviteAccept from "./pages/InviteAccept";
import SuperAdmin from "./pages/SuperAdmin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/invite" element={<InviteAccept />} />
            <Route path="/s/:slug" element={<ShopPublic />} />
            <Route path="/s/:slug/agendar" element={<BookingWizard />} />
            <Route path="/s/:slug/confirmacao" element={<BookingConfirmation />} />
            <Route path="/super-admin" element={<SuperAdmin />} />

            {/* Onboarding */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Protected app routes */}
            <Route path="/app" element={<ProtectedRoute><AppHome /></ProtectedRoute>} />
            <Route path="/app/agenda" element={<ProtectedRoute><AppAgenda /></ProtectedRoute>} />
            <Route path="/app/servicos" element={<ProtectedRoute requiredRoles={['OWNER', 'ADMIN']}><AppServices /></ProtectedRoute>} />
            <Route path="/app/barbeiros" element={<ProtectedRoute><AppBarbers /></ProtectedRoute>} />
            <Route path="/app/horarios" element={<ProtectedRoute><AppWorkingHours /></ProtectedRoute>} />
            <Route path="/app/bloqueios" element={<ProtectedRoute><AppBlockedSlots /></ProtectedRoute>} />
            <Route path="/app/usuarios" element={<ProtectedRoute requiredRoles={['OWNER', 'ADMIN']}><AppUsers /></ProtectedRoute>} />
            <Route path="/app/configuracoes" element={<ProtectedRoute requiredRoles={['OWNER', 'ADMIN']}><AppSettings /></ProtectedRoute>} />
            <Route path="/app/assinatura" element={<ProtectedRoute requiredRoles={['OWNER', 'ADMIN']}><AppSubscription /></ProtectedRoute>} />

            {/* Landing page */}
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
