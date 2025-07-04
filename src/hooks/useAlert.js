import { useState } from "react";
import Alert from "../components/Alert";

const useAlert = () => {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
  };

  const AlertComponent = () =>
    alert ? <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} /> : null;

  return { showAlert, AlertComponent };
};

export default useAlert;
