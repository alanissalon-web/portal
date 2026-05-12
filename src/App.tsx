import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AdminRoute } from "@/components/admin/AdminRoute";
import Index from "./pages/Index.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import ServicesPage from "./pages/ServicesPage.tsx";
import ExtensionsPage from "./pages/ExtensionsPage.tsx";
import HairLossPage from "./pages/HairLossPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import AcademyPage from "./pages/AcademyPage.tsx";
import CourseDetailPage from "./pages/CourseDetailPage.tsx";
import ShopPage from "./pages/ShopPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminCourses from "./pages/admin/AdminCourses.tsx";
import AdminProducts from "./pages/admin/AdminProducts.tsx";
import AdminContent from "./pages/admin/AdminContent.tsx";
import AdminWaitlist from "./pages/admin/AdminWaitlist.tsx";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import { CMSProvider } from "@/contexts/CMSContext";
import { VisualCMSBar } from "@/components/cms/VisualCMSBar";
import { VisualSidebar } from "@/components/cms/VisualSidebar";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <CustomCursor />
        <SmoothScroll />
        <AdminAuthProvider>
          <CMSProvider>
            <VisualCMSBar />
            <VisualSidebar />
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/extensions" element={<ExtensionsPage />} />
            <Route path="/hair-loss" element={<HairLossPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/academy" element={<AcademyPage />} />
            <Route path="/academy/:courseId" element={<CourseDetailPage />} />
            <Route path="/shop" element={<ShopPage />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="waitlist" element={<AdminWaitlist />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          </CMSProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
