import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingCTAs } from "./FloatingCTAs";

export const MainLayout = () => (
    <>
        <Header />
        <main className="min-h-screen">
            <Outlet />
        </main>
        <Footer />
        <FloatingCTAs />
    </>
);
