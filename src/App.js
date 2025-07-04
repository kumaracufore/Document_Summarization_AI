import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import Login from "./pages/Login";
import RTODashboard from "./pages/RTODashboard";

function App() {
  const isAuthenticated = localStorage.getItem("rto-auth") === "true";

  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/rto-login" element={<Login />} />
        <Route path="/rto-dashboard" element={<RTODashboard />} />
      </Routes>
    </Router>
  );
}


export default App;
