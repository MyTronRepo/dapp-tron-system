import { useEffect, useState } from "react";
import { loginUser } from "../../services/authService";
import useAuthStore from "../../store/authStore";
import useTronStore from "../../store/tronStore";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);

  const walletAddressFromStore = useTronStore(
    (state) => state.walletAddress
  );

  const connected = useTronStore(
    (state) => state.connected
  );

  const connecting = useTronStore(
    (state) => state.connecting
  );

  const connectWallet = useTronStore(
    (state) => state.connectWallet
  );

  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletAddressFromStore) {
      setWalletAddress(walletAddressFromStore);
    }
  }, [walletAddressFromStore]);

  const handleConnect = async () => {
    try {
      const address = await connectWallet();

      setWalletAddress(address);
    } catch (error) {
      console.error("Wallet connection error:", error);

      alert(
        error?.message ||
          "Failed to connect TronLink."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("LOGIN BUTTON CLICKED");
    console.log(
      "Wallet from TronStore:",
      walletAddressFromStore
    );
    console.log(
      "State value:",
      walletAddress
    );

    if (!walletAddress) {
      alert(
        "Please connect your TronLink wallet first."
      );
      return;
    }

    setLoading(true);

    try {
      const loginData = {
        walletAddress: walletAddress,
      };

      console.log("Sending:", loginData);

      const response = await loginUser(loginData);

      console.log(
        "Login response:",
        JSON.stringify(
          response.data,
          null,
          2
        )
      );

      login(
        response.data.data.user,
        response.data.data.token
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      console.log(
        "Backend response:",
        JSON.stringify(
          error.response?.data,
          null,
          2
        )
      );

      alert(
        error.response?.data?.message ||
          "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>

      {!connected ? (
        <div>
          <p>
            Connect your TronLink wallet first.
          </p>

          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting
              ? "Connecting..."
              : "Connect TronLink"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Wallet Address
            </label>
          </div>

          <input
            name="walletAddress"
            value={walletAddress}
            readOnly
          />

          <button
            type="submit"
            disabled={
              loading || !walletAddress
            }
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>
      )}
    </div>
  );
}

export default Login;