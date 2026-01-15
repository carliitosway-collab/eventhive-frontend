import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/auth.service";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSignupSubmit = (e) => {
    e.preventDefault();

    const requestBody = { email, password, name };

    authService
      .signup(requestBody)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        const msg = error?.response?.data?.message || "Signup failed";
        setErrorMessage(msg);
      });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Sign Up</h1>

      <form onSubmit={handleSignupSubmit} style={{ display: "grid", gap: 10, maxWidth: 360 }}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />

        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />

        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} type="text" />

        <button type="submit">Create account</button>
      </form>

      {errorMessage && <p style={{ color: "crimson" }}>{errorMessage}</p>}

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
