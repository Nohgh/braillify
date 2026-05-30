import { isTauri } from "@tauri-apps/api/core";

export type HistoryItem = {
  id: string;
  input: string;
  output: string;
  createAt: number;
  favorite: boolean;
};

const STORAGE_KEY = "braillify_history";

function getLocalHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function setLocalHistory(history: HistoryItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

async function getTauriStore() {
  const { LazyStore } = await import("@tauri-apps/plugin-store");
  return new LazyStore("app.json");
}

export async function getHistory(): Promise<HistoryItem[]> {
  if (await isTauri()) {
    const store = await getTauriStore();
    return (await store.get<HistoryItem[]>("history")) ?? [];
  }
  return getLocalHistory();
}

export async function addHistory(input: string, output: string): Promise<void> {
  const newItem: HistoryItem = {
    id: crypto.randomUUID(),
    input,
    output,
    createAt: Date.now(),
    favorite: false,
  };

  if (await isTauri()) {
    const store = await getTauriStore();
    const history = (await store.get<HistoryItem[]>("history")) ?? [];
    await store.set("history", [newItem, ...history]);
    await store.save();
    return;
  }

  setLocalHistory([newItem, ...getLocalHistory()]);
}

export async function removeHistory(id: string): Promise<void> {
  if (await isTauri()) {
    const store = await getTauriStore();
    const history = (await store.get<HistoryItem[]>("history")) ?? [];
    await store.set(
      "history",
      history.filter(it => it.id !== id),
    );
    await store.save();
    return;
  }

  setLocalHistory(getLocalHistory().filter(it => it.id !== id));
}

export async function toggleFavorite(id: string): Promise<void> {
  if (await isTauri()) {
    const store = await getTauriStore();
    const history = (await store.get<HistoryItem[]>("history")) ?? [];
    await store.set(
      "history",
      history.map(it => (it.id === id ? { ...it, favorite: !it.favorite } : it)),
    );
    await store.save();
    return;
  }

  setLocalHistory(
    getLocalHistory().map(it => (it.id === id ? { ...it, favorite: !it.favorite } : it)),
  );
}
