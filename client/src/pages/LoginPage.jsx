import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import authService from "../services/auth.service";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { storeToken, authenticateUser } = useContext(AuthContext);

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    const requestBody = { email, password };

    authService
      .login(requestBody)
      .then((response) => {
        storeToken(response.data.authToken);
        authenticateUser();
        navigate("/");
      })
      .catch((error) => {
        const msg = error?.response?.data?.message || "Login failed";
        setErrorMessage(msg);
      });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Login</h1>

      <form onSubmit={handleLoginSubmit} style={{ display: "grid", gap: 10, maxWidth: 360 }}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />

        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />

        <button type="submit">Login</button>
      </form>

      {errorMessage && <p style={{ color: "crimson" }}>{errorMessage}</p>}

      <p>
        No account yet? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
