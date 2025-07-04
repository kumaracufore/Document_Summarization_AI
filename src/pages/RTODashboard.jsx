import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const sections = [
  { key: "assessment-tools", label: "Assessment Tools" },
  { key: "student-assessments", label: "Student Assessments" },
  { key: "regulatory-docs", label: "Regulatory Docs (System Input)" },
  { key: "rto-policies", label: "RTO Policies" },
];

export default function RTODashboard() {
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedView, setSelectedView] = useState("pending");
  const [expandedSummaries, setExpandedSummaries] = useState({});
  const [selectedSection, setSelectedSection] = useState(sections[0].key);

  const fetchFiles = async () => {
    setLoading(true);
    const updatedFiles = {};

    for (const { key } of sections) {
      try {
        const res = await axios.get("http://localhost:8000/files", {
          params: { section: key, view: selectedView },
        });
        updatedFiles[key] = res.data.files;
      } catch (err) {
        toast.error("❌ Failed to fetch files.");
      }
    }

    setFiles(updatedFiles);
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedView]);

  const handleAction = async (action, section, filename) => {
    try {
      await axios.post(`http://localhost:8000/${action}`, new URLSearchParams({ section, filename }));
      toast.success(`✅ ${filename} ${action}ed`);
      setFiles((prev) => ({
        ...prev,
        [section]: prev[section].filter((f) => f.filename !== filename),
      }));
    } catch (err) {
      toast.error(`❌ Failed to ${action} ${filename}`);
    }
  };

  const toggleSummary = (section, filename) => {
    setExpandedSummaries((prev) => ({
      ...prev,
      [`${section}-${filename}`]: !prev[`${section}-${filename}`],
    }));
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 style={styles.heading}>📂 RTO Document Dashboard</h2>

      <div style={styles.viewButtons}>
        {["pending", "accepted", "rejected"].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            style={{
              ...styles.viewBtn,
              backgroundColor: selectedView === view ? "#444" : "#ccc",
              color: selectedView === view ? "white" : "#000",
            }}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.controls}>
        <label style={styles.label}>Select Section: </label>
        <select
          style={styles.select}
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
        >
          {sections.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", marginTop: "1rem" }}>Loading...</p>
      ) : (
        <div style={styles.sectionBox}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Filename</th>
                <th style={styles.th}>Summary</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(files[selectedSection] || []).map(({ filename, summary }) => (
                <tr key={filename}>
                  <td style={styles.td}>{filename}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => toggleSummary(selectedSection, filename)}
                      style={styles.summaryBtn}
                    >
                      {expandedSummaries[`${selectedSection}-${filename}`] ? "Hide" : "View"} Summary
                    </button>
                    {expandedSummaries[`${selectedSection}-${filename}`] && (
                      <p style={styles.summaryText}>{summary}</p>
                    )}
                  </td>
                  <td style={styles.td}>
                    {selectedView === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction("accept", selectedSection, filename)}
                          style={styles.accept}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleAction("reject", selectedSection, filename)}
                          style={styles.reject}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "auto",
    padding: "2rem",
    backgroundColor: "#fff",
  },
  heading: {
    textAlign: "left",
    fontSize: "1.6rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  viewButtons: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  viewBtn: {
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  label: {
    fontWeight: "bold",
  },
  select: {
    padding: "0.4rem",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    minWidth: "250px",
  },
  sectionBox: {
    marginTop: "1rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    background: "#f8f8f8",
    padding: "0.75rem",
    border: "1px solid #ddd",
    textAlign: "left",
  },
  td: {
    padding: "0.75rem",
    border: "1px solid #eee",
    verticalAlign: "top",
  },
  summaryBtn: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    marginBottom: "0.5rem",
  },
  summaryText: {
    fontSize: "0.9rem",
    color: "#333",
    marginTop: "0.5rem",
  },
  accept: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    marginRight: "0.5rem",
    cursor: "pointer",
  },
  reject: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
