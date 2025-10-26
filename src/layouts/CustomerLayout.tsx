import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";

const CustomerLayout = () => {
  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;