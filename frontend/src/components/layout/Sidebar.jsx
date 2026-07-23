import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";

function Sidebar() {
  const user = useAuthStore((state) => state.user);

  return (
    <aside>
      <nav>
        <Link to="/dashboard">
          Dashboard
        </Link>

        <Link to="/properties">
          Properties
        </Link>

        <Link to="/documents">
          Documents
        </Link>

        <Link to="/transfers">
          Transfers
        </Link>

        {user?.role === "admin" && (
          <Link to="/admin">
            Admin
          </Link>
        )}

        <Link to="/logs">
          Logs
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;