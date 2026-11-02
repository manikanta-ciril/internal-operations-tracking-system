import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import FileUpload from "../../src/components/ui/file-upload.tsx";
import EmployeeGreeting from "../../src/shared/workspace/EmployeeGreeting.jsx";
import "../../src/features/employee-workspace/styles/employee-work.css";
const fixtureTime = new Date();
export default function Fixture() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  return <div className="native-workspace"><EmployeeGreeting employee={{ id: "greeting-test", name: "Sai Deepthi" }} now={fixtureTime} /><FileUpload files={files} accept=".pdf,image/*" onFiles={selected => { setFiles([...files, ...selected]); setError(""); }} onRemove={index => setFiles(files.filter((_, i) => i !== index))} onError={setError} /><p role="alert">{error}</p></div>;
}
createRoot(document.getElementById("root")).render(<StrictMode><Fixture /></StrictMode>);
