export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    console.error("clipboard error:", e);
    throw e;
  }
}
