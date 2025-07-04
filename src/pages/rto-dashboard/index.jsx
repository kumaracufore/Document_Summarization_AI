// pages/rto-dashboard/index.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const RtoLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect if already logged in
    const isAuth = localStorage.getItem("rtoAuth");
    if (isAuth === "true") {
      router.push("/rto-dashboard/view");
    }
  }, []);

  const handleLogin = () => {
    if (username === "rtoadmin" && password === "rto123") {
      localStorage.setItem("rtoAuth", "true");
      router.push("/rto-dashboard/view");
    } else {
      alert("Invalid credentials. Try rtoadmin / rto123");
    }
  };

  return (
    <div style={{ padding: "3rem", maxWidth: 400, margin: "auto", textAlign: "center" }}>
      <h2>RTO Admin Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "1rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "1.5rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />
      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Login
      </button>
    </div>
  );
};

export default RtoLogin;
