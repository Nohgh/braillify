export type HistoryItem = {
  id: string;
  input: string;
  output: string;
  createAt: number;
  favorite: boolean;
};

// Storage Strategy Interface
interface HistoryStorage {
  get(): Promise<HistoryItem[]>;
  set(history: HistoryItem[]): Promise<void>;
}

class WebHistoryStorage implements HistoryStorage {
  private readonly key = "braillify_history";

  async get(): Promise<HistoryItem[]> {
    try {
      return JSON.parse(localStorage.getItem(this.key) ?? "[]");
    } catch {
      return [];
    }
  }

  async set(history: HistoryItem[]): Promise<void> {
    localStorage.setItem(this.key, JSON.stringify(history));
  }
}

class AppHistoryStorage implements HistoryStorage {
  private store: import("@tauri-apps/plugin-store").LazyStore;

  constructor(store: import("@tauri-apps/plugin-store").LazyStore) {
    this.store = store;
  }

  async get(): Promise<HistoryItem[]> {
    return (await this.store.get<HistoryItem[]>("history")) ?? [];
  }

  async set(history: HistoryItem[]): Promise<void> {
    await this.store.set("history", history);
    await this.store.save();
  }
}

async function createStorage(): Promise<HistoryStorage> {
  const { isTauri } = await import("@tauri-apps/api/core");
  if (await isTauri()) {
    const { LazyStore } = await import("@tauri-apps/plugin-store");
    return new AppHistoryStorage(new LazyStore("app.json"));
  }
  return new WebHistoryStorage();
}

const storagePromise: Promise<HistoryStorage> = createStorage();

async function getStorage(): Promise<HistoryStorage> {
  return storagePromise;
}

export async function getHistory(): Promise<HistoryItem[]> {
  return (await getStorage()).get();
}

export async function addHistory(input: string, output: string): Promise<void> {
  const storage = await getStorage();
  const history = await storage.get();
  await storage.set([
    { id: crypto.randomUUID(), input, output, createAt: Date.now(), favorite: false },
    ...history,
  ]);
}

export async function removeHistory(id: string): Promise<void> {
  const storage = await getStorage();
  const history = await storage.get();
  await storage.set(history.filter(it => it.id !== id));
}

export async function toggleFavorite(id: string): Promise<void> {
  const storage = await getStorage();
  const history = await storage.get();
  await storage.set(history.map(it => (it.id === id ? { ...it, favorite: !it.favorite } : it)));
}
