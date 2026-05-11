import { Outlet } from "react-router";
import Header from "./header";
import Footer from "./footer";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-[#5b1aa0] to-[#a64bf4] text-white">
      <Header />

      <main className="flex-1 p-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
