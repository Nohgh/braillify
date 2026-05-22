import "./App.css";
import { EditorPage } from "./components/Editor";
import { TranslatePage } from "./components/Translate";
import { HistoryPage } from "./components/History";
import { Footer } from "./components/Footer";
import { TabProvider, useTab } from "./context/useTab.tsx";

function AppContent() {
  const { tab } = useTab();

  return (
    <main className="app-layout">
      <div className="app-content">
        {tab === "translate" && <TranslatePage />}
        {tab === "editor" && <EditorPage />}
        {tab === "history" && <HistoryPage />}
      </div>

      <Footer />
    </main>
  );
}

function App() {
  return (
    <TabProvider>
      <AppContent />
    </TabProvider>
  );
}

export default App;
