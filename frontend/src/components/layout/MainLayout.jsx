import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function MainLayout() {
  return (
    <div>
      <Navbar />

      <div>
        <Sidebar />

        <main>
          <Outlet />
        </main>
      </div>

      <footer>
        <p>
          TRON Blockchain Real Estate System
        </p>
      </footer>
    </div>
  );
}

export default MainLayout;