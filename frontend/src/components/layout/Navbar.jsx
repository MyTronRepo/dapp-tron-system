import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
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
  );
}

export default Navbar;