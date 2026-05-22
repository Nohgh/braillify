import { LazyStore } from "@tauri-apps/plugin-store";

export const store = new LazyStore("app.json");

export type HistoryItem = {
  id: string;
  input: string;
  output: string;
  createAt: number;
};

export async function getHistory(): Promise<HistoryItem[]> {
  return (await store.get<HistoryItem[]>("history")) ?? [];
}

export async function addHistory(input: string, output: string): Promise<void> {
  const history = await getHistory();
  await store.set("history", [
    { id: crypto.randomUUID(), input, output, createdAt: Date.now() },
    ...history,
  ]);
  await store.save();
}
