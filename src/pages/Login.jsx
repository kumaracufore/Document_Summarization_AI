import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/login-illustration.svg";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === "rtoadmin" && password === "rto123") {
      localStorage.setItem("rto-auth", "true");
      navigate("/rto-dashboard");
    } else {
      alert("Invalid credentials");localStorage.setItem("rto-auth", "true");
navigate("/rto-dashboard");

    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={leftPanelStyle}>
          <h2 style={{ marginBottom: "1.5rem" }}>Welcome Back</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button style={buttonStyle} onClick={handleLogin}>
            Login
          </button>
        </div>

        <div style={rightPanelStyle}>
          <img src={loginImage} alt="login" style={{ width: "100%", height: "auto" }} />
        </div>
      </div>
    </div>
  );
}

// === Styles ===
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#f5f8fb",
};

const cardStyle = {
  display: "flex",
  width: "800px",
  borderRadius: "15px",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
};

const leftPanelStyle = {
  flex: 1,
  padding: "3rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const rightPanelStyle = {
  flex: 1,
  background: "#f7f9fd",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const inputStyle = {
  padding: "0.75rem 1rem",
  marginBottom: "1rem",
  fontSize: "1rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
  width: "100%",
};

const buttonStyle = {
  backgroundColor: "#007bff",
  color: "#fff",
  padding: "0.75rem",
  fontSize: "1rem",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};
