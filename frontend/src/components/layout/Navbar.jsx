import useAuthStore from "../../store/authStore";
import useTronStore from "../../store/tronStore";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const walletAddress = useTronStore((state) => state.walletAddress);
  const connected = useTronStore((state) => state.connected);
  const connecting = useTronStore((state) => state.connecting);
  const network = useTronStore((state) => state.network);
const networkCorrect = useTronStore((state) => state.correctNetwork);
  const connectWallet = useTronStore((state) => state.connectWallet);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <header>
      <h2>Real Estate DApp</h2>

      <div>
        {connected ? (
          <>
            <div>
              <span>Wallet: {walletAddress}</span>
            </div>

            <div>
              <span>Network: {network}</span>
            </div>

            <div>
              <span>
                Status:{" "}
                {networkCorrect
                  ? "Connected to Nile"
                  : "Wrong Network"}
              </span>
            </div>
          </>
        ) : (
          <button onClick={handleConnect} disabled={connecting}>
            {connecting ? "Connecting..." : "Connect TronLink"}
          </button>
        )}

        {user && (
          <>
            <span>Role: {user.role}</span>

            <button onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
