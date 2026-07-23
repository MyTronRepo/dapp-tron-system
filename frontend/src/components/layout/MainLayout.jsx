import { Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

function MainLayout() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <header>
        <h2>Real Estate DApp</h2>

        {user && (
          <div>
            <span>{user.walletAddress}</span>
            <span>{user.role}</span>

            <button onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
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