
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// Pages
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import ClientsPage from "@/pages/clients/ClientsPage";
import ClientDetail from "@/pages/clients/ClientDetail";
import ProductsPage from "@/pages/products/ProductsPage";
import ProductDetail from "@/pages/products/ProductDetail";
import ProformaInvoicesPage from "@/pages/invoices/ProformaInvoicesPage";
import ProformaDetail from "@/pages/invoices/ProformaDetail";
import FinalInvoicesPage from "@/pages/invoices/FinalInvoicesPage";
import FinalInvoiceDetail from "@/pages/invoices/FinalInvoiceDetail";
import DeliveryNotesPage from "@/pages/delivery/DeliveryNotesPage";
import DeliveryNoteDetail from "@/pages/delivery/DeliveryNoteDetail";
import Etat104Page from "@/pages/reports/Etat104Page";
import UsersPage from "@/pages/admin/UsersPage";
import UserDetail from "@/pages/admin/UserDetail";

// Layout
import MainLayout from "@/components/layouts/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              
              <Route path="/invoices/proforma" element={<ProformaInvoicesPage />} />
              <Route path="/invoices/proforma/:id" element={<ProformaDetail />} />
              
              <Route path="/invoices/final" element={<FinalInvoicesPage />} />
              <Route path="/invoices/final/:id" element={<FinalInvoiceDetail />} />
              
              <Route path="/delivery-notes" element={<DeliveryNotesPage />} />
              <Route path="/delivery-notes/:id" element={<DeliveryNoteDetail />} />
              
              <Route path="/reports/etat104" element={<Etat104Page />} />
              
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/users/:id" element={<UserDetail />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
