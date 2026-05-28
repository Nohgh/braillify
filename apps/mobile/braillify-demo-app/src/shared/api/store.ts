import { LazyStore } from "@tauri-apps/plugin-store";

export const store = new LazyStore("app.json");

export type HistoryItem = {
  id: string;
  input: string;
  output: string;
  createAt: number;
  favorite: boolean;
};

export async function getHistory(): Promise<HistoryItem[]> {
  return (await store.get<HistoryItem[]>("history")) ?? [];
}

export async function addHistory(input: string, output: string): Promise<void> {
  const history = await getHistory();
  await store.set("history", [
    { id: crypto.randomUUID(), input, output, createAt: Date.now(), favorite: false },
    ...history,
  ]);
  await store.save();
}

export async function removeHistory(id: string): Promise<void> {
  const history = await getHistory();
  await store.set(
    "history",
    history.filter(it => it.id !== id),
  );
  await store.save();
}

export async function toggleFavorite(id: string): Promise<void> {
  const history = await getHistory();
  await store.set(
    "history",
    history.map(it => (it.id === id ? { ...it, favorite: !it.favorite } : it)),
  );
  await store.save();
}
