import { useState, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const sections = [
  { key: "assessment-tools", label: "Assessment Tools" },
  { key: "student-assessments", label: "Student Assessments" },
  { key: "regulatory-docs", label: "Regulatory Docs" },
  { key: "rto-policies", label: "RTO Policies" },
];

const MAX_SIZE_MB = 25;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function UploadPage() {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadingSections, setUploadingSections] = useState([]);
  const fileInputs = useRef({});

  const handleFileChange = (file, section) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("❌ Only PDF and DOCX files are allowed.");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error("❌ File size exceeds 25 MB limit.");
      return;
    }

    setSelectedFiles((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), file],
    }));
  };

  const handleDrop = (e, section) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file, section);
  };

  const handleUpload = async (section) => {
    const files = selectedFiles[section];
    if (!files || files.length === 0) return;

    setUploadingSections((prev) => [...prev, section]);

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("section", section);

      try {
        await axios.post("http://localhost:8000/upload", formData);
        toast.success(`✅ ${file.name} uploaded to ${section.replace(/-/g, " ")}`);
      } catch {
        toast.error(`❌ Upload failed for ${file.name}`);
      }
    }

    setSelectedFiles((prev) => ({ ...prev, [section]: [] }));
    setUploadingSections((prev) => prev.filter((s) => s !== section));
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div style={styles.inner}>
        <h2 style={styles.heading}>Upload Documents</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Data Type</th>
              <th style={styles.th}>Upload</th>
              <th style={styles.th}>File Size</th>
              <th style={styles.th}>File Type</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sections.map(({ key, label }) => (
              <tr key={key}>
                <td style={styles.td}>{label}</td>
                <td
                  style={{ ...styles.td, textAlign: "center", padding: "1rem" }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, key)}
                  onClick={() => fileInputs.current[key]?.click()}
                >
                  <div style={styles.dropBox}>
                    {selectedFiles[key]?.length > 0
                      ? selectedFiles[key].map((f) => f.name).join(", ")
                      : "Click or Drag & Drop file(s)"}
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.docx"
                      style={{ display: "none" }}
                      ref={(el) => (fileInputs.current[key] = el)}
                      onChange={(e) =>
                        Array.from(e.target.files).forEach((file) =>
                          handleFileChange(file, key)
                        )
                      }
                    />
                  </div>
                </td>
                <td style={styles.td}>Max 25 MB</td>
                <td style={styles.td}>PDF, DOCX</td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleUpload(key)}
                    disabled={uploadingSections.includes(key)}
                    style={styles.button(uploadingSections.includes(key))}
                  >
                    {uploadingSections.includes(key) ? "Uploading..." : "Upload"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: "2rem",
  },
  inner: {
    width: "100%",
    maxWidth: "900px",
    backgroundColor: "#fff",
    padding: "2rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    borderRadius: "12px",
  },
  heading: {
    fontSize: "1.8rem",
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
  },
  th: {
    padding: "1rem",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#f1f1f1",
    textAlign: "left",
  },
  td: {
    padding: "1rem",
    borderBottom: "1px solid #eee",
    verticalAlign: "middle",
  },
  dropBox: {
    border: "2px dashed #ccc",
    padding: "0.75rem",
    cursor: "pointer",
    borderRadius: "8px",
    color: "#555",
    backgroundColor: "#fafafa",
    fontSize: "0.9rem",
  },
  button: (disabled) => ({
    backgroundColor: disabled ? "#aaa" : "#007bff",
    color: "#fff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "4px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.9rem",
  }),
};
