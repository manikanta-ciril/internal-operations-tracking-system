import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import DesignerWorkspace from "./designer-workspace";
import { Toaster } from "./components/ui/sonner";
function Preview() {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const update = () =>
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    update();
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <div className="visual-preview-note" role="note">
        Visual preview · Example data · No reports are sent · Changes reset on refresh
      </div>
      <DesignerWorkspace />
      <Toaster theme={theme} position="bottom-right" closeButton />
    </>
  );
}
createRoot(document.getElementById("root")).render(<Preview />);
