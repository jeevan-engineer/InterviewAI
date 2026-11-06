import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <>
      <Navbar />
            <main className="page">
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;
