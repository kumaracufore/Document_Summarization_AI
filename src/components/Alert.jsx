import { useEffect } from "react";
import "./Alert.css";

const Alert = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`alert ${type}`}>
      {message}
    </div>
  );
};

export default Alert;
