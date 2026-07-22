import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div>
      <header>
        <h2>Real Estate DApp</h2>
      </header>

      <nav>
        <p>Navigation</p>
      </nav>

      <main>
        <Outlet />
      </main>

      <footer>
        <p>TRON Blockchain Real Estate System</p>
      </footer>
    </div>
  );
}

export default MainLayout;