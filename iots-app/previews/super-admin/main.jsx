import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../../authentication-system/frontend/src/features/employee-workspace/styles/workspace.css";
import "../../authentication-system/frontend/src/shared/ui/ui.css";
import "./preview.css";
import logo from "../../authentication-system/frontend/src/assets/logo.png";
import { navigation } from "./catalog";
import {
  loadDraft,
  emptyDraft,
  parseRoute,
  setupSteps,
  newId,
  STORAGE_KEY,
} from "./model";
import {
  PreviewContext,
  Button,
  Icon,
  Progress,
  Avatar,
  ThemeToggle,
  Popover,
  Dialog,
} from "./components";
import { Home, Company, Directory, Roles, WorkRules } from "./setup-pages";
import {
  Business,
  Systems,
  SystemDetail,
  Connection,
  History,
} from "./management-pages";

function App() {
  const [draft, setDraft] = useState(loadDraft),
    [route, setRoute] = useState(parseRoute),
    [mobile, setMobile] = useState(false),
    [reset, setReset] = useState(false),
    [notice, setNotice] = useState(""),
    [storageError, setStorageError] = useState(false);
  useEffect(() => {
    const changed = () => {
      setRoute(parseRoute());
      setMobile(false);
    };
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [draft]);
  useEffect(() => {
    document.querySelector("main h1")?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [route]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  function navigate(to) {
    location.hash = to;
  }
  function commit(update, message) {
    setDraft((current) => {
      const next = update(current);
      return {
        ...next,
        activity: [
          { id: newId(), at: new Date().toISOString(), message },
          ...current.activity,
        ].slice(0, 300),
      };
    });
    setNotice(message);
  }
  function exportDraft() {
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `ciril-company-setup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Draft exported");
  }
  const steps = setupSteps(draft),
    count = steps.filter((s) => s.done).length;
  let page;
  if (route.startsWith("systems/"))
    page = <SystemDetail key={route} id={route.split("/")[1]} />;
  else
    switch (route) {
      case "company":
        page = <Company />;
        break;
      case "offices":
      case "departments":
      case "people":
        page = <Directory key={route} kind={route} />;
        break;
      case "roles":
        page = <Roles />;
        break;
      case "work-rules":
        page = <WorkRules />;
        break;
      case "business":
        page = <Business />;
        break;
      case "systems":
        page = <Systems />;
        break;
      case "connection":
        page = <Connection />;
        break;
      case "activity":
        page = <History />;
        break;
      default:
        page = <Home />;
    }
  return (
    <PreviewContext.Provider value={{ draft, commit, navigate, exportDraft }}>
      <div className="employee-workspace super-admin-preview">
        <a
          href="#main-content"
          className="sa-skip"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("main-content").focus();
          }}
        >
          Skip to content
        </a>
        <aside className={`sa-sidebar ${mobile ? "is-open" : ""}`}>
          <a className="sa-brand" href="#home">
            <img src={logo} alt="CIRIL" />
            <span>Internal Operations</span>
          </a>
          <nav aria-label="Company management">
            {navigation.map((item, i) => (
              <div key={item.id}>
                {navigation[i - 1]?.group !== item.group && (
                  <p className="sa-nav-group">{item.group}</p>
                )}
                <a
                  href={`#${item.id}`}
                  aria-current={
                    route.split("/")[0] === item.id ? "page" : undefined
                  }
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </a>
              </div>
            ))}
          </nav>
          <div className="sa-sidebar-progress">
            <div>
              <span>Company setup</span>
              <strong>{count}/6</strong>
            </div>
            <Progress value={(count / 6) * 100} />
            <small>Build it one step at a time.</small>
          </div>
        </aside>
        {mobile && (
          <button
            className="sa-scrim"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          />
        )}
        <div className="sa-workspace">
          <header className="sa-header">
            <div className="sa-header-context">
              <button
                className="sa-menu"
                aria-label="Toggle navigation"
                aria-expanded={mobile}
                onClick={() => setMobile(!mobile)}
              >
                <Icon name="menu" />
              </button>
              <span>Company workspace</span>
              <span className="sa-preview-tag">Local preview</span>
            </div>
            <div className="sa-header-tools">
              <ThemeToggle inline />
              <Popover
                label="Preview account actions"
                trigger={
                  <button
                    className="sa-avatar-button"
                    aria-label="Open account menu"
                  >
                    <Avatar name="Super Admin" />
                  </button>
                }
              >
                {(close) => (
                  <div className="sa-account-menu">
                    <strong>Super Admin</strong>
                    <small>Company setup preview</small>
                    <button
                      onClick={() => {
                        exportDraft();
                        close();
                      }}
                    >
                      Export setup
                    </button>
                    <button
                      onClick={() => {
                        setReset(true);
                        close();
                      }}
                    >
                      Reset local draft
                    </button>
                  </div>
                )}
              </Popover>
            </div>
          </header>
          <main id="main-content" tabIndex={-1}>
            <div className="sa-preview-banner">
              <Icon name="lock" size={14} />
              <span>
                Preview only. Your changes stay in this browser and do not
                change live accounts or CRM records.
              </span>
            </div>
            {storageError && (
              <p className="sa-error" role="alert">
                Browser storage is unavailable. Export your draft before closing
                this page.
              </p>
            )}
            <div className="sa-page" key={route}>
              {page}
            </div>
            <footer>
              Company setup · India Standard Time · {new Date().getFullYear()}{" "}
              CIRIL
            </footer>
          </main>
        </div>
        {notice && (
          <div className="sa-toast" role="status">
            <Icon name="check" size={16} />
            {notice}
          </div>
        )}
        {reset && (
          <Dialog title="Reset this draft?" onClose={() => setReset(false)}>
            <p>
              This removes company setup data saved by this preview in this
              browser. Export a copy first if you need it.
            </p>
            <div className="sa-form-actions">
              <Button secondary onClick={() => setReset(false)}>
                Keep draft
              </Button>
              <Button
                onClick={() => {
                  setDraft(emptyDraft());
                  setReset(false);
                  navigate("home");
                  setNotice("Local draft reset");
                }}
              >
                Reset draft
              </Button>
            </div>
          </Dialog>
        )}
      </div>
    </PreviewContext.Provider>
  );
}
createRoot(document.getElementById("root")).render(<App />);
