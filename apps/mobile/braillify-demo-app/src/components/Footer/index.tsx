import { useTab, tabs } from "../../context/useTab.tsx";

export function Footer() {
  const { tab, setTab } = useTab();

  return (
    <nav className="footer-nav">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`nav-item ${tab === t.id ? "active" : ""}`}
          onClick={() => setTab(t.id)}
        >
          <div className="nav-icon-wrap">
            {tab === t.id && <span className="nav-dot" />}
            <span className="nav-icon">{t.icon}</span>
          </div>
          <span className="nav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
