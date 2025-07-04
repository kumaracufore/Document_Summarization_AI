import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const RtoDashboardView = () => {
  const router = useRouter();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const auth = localStorage.getItem("rtoAuth");
    if (auth !== "true") router.push("/rto-dashboard");
    else fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await axios.get("http://localhost:8000/files");
      setFiles(res.data.files || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (section, filename) => {
    try {
      await axios.post("http://localhost:8000/accept", { section, filename });
      alert("Accepted and moved to final folder");
      fetchFiles();
    } catch (err) {
      alert("Failed to move file.");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>📂 RTO Dashboard</h2>
      {files.length === 0 ? (
        <p>No documents found.</p>
      ) : (
        files.map((section, idx) => (
          <div key={idx} style={{ marginTop: 30 }}>
            <h3>{section.section}</h3>
            <table style={{ width: "100%", border: "1px solid #ddd", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: 8 }}>Filename</th>
                  <th style={{ border: "1px solid #ddd", padding: 8 }}>Summary</th>
                  <th style={{ border: "1px solid #ddd", padding: 8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {section.files.map((file, fi) => (
                  <tr key={fi}>
                    <td style={{ border: "1px solid #ddd", padding: 8 }}>{file.name}</td>
                    <td style={{ border: "1px solid #ddd", padding: 8, whiteSpace: "pre-wrap" }}>{file.summary}</td>
                    <td style={{ border: "1px solid #ddd", padding: 8 }}>
                      <button onClick={() => handleAccept(section.section, file.name)}>
                        ✅ Accept
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default RtoDashboardView;
