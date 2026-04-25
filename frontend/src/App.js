import { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { MainLayout } from "./components/Layout/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import AboutDoctor from "./pages/AboutDoctor";
import Services from "./pages/Services";
import BookAppointment from "./pages/BookAppointment";
import Testimonials from "./pages/Testimonials";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [pathname]);
    return null;
};

function App() {
    return (
        <div className="App">
            <AuthProvider>
                <BrowserRouter>
                    <ScrollToTop />
                    <Toaster position="top-center" richColors closeButton />
                    <Routes>
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<AboutDoctor />} />
                            <Route path="/services" element={<Services />} />
                            <Route path="/book" element={<BookAppointment />} />
                            <Route path="/testimonials" element={<Testimonials />} />
                            <Route path="/faq" element={<FAQ />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/blog/:slug" element={<BlogDetail />} />
                            <Route path="/contact" element={<Contact />} />
                        </Route>
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin" element={
                            <ProtectedRoute><AdminDashboard /></ProtectedRoute>
                        } />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </div>
    );
}

export default App;
