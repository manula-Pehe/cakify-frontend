import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";

// Customer Pages
import Home from "./pages/customer/Home";
import Cakes from "./pages/customer/Cakes";
import CakeDetails from "./pages/customer/CakeDetails";
import OrderForm from "./pages/customer/OrderForm";
import Contact from "./pages/customer/Contact";
import About from "./pages/customer/About";


// Admin Pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminInquiries from "./pages/admin/Inquiries";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminCategories from "./pages/admin/Categories";
import AdminReviews from "./pages/admin/Reviews";


import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<Home />} />
            <Route path="cakes" element={<Cakes />} />
            <Route path="cakes/:id" element={<CakeDetails />} />
            <Route path="order" element={<OrderForm />} />
            <Route path="contact" element={<Contact />} />
            <Route path="about" element={<About />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
