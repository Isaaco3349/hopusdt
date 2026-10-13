/** Vercel serverless — Telegram alerts (token stays server-side only). */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    return res.status(204).end();
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Invalid body" });
  }

  const appName = process.env.BRIDGE_APP_NAME?.trim() || "USDT Hop";
  const { type } = body;
  let text = "";

  if (type === "order") {
    const { id, send, receive, bscAddress } = body;
    if (!id || send == null) return res.status(400).json({ error: "Missing order fields" });
    text = [
      `New order: ${appName}`,
      `ID: ${id}`,
      `Send: ${send} USDT (TRC20)`,
      receive != null ? `Receive: ${receive} USDT (BEP20)` : null,
      bscAddress ? `BSC: ${bscAddress}` : null,
      "Check admin panel and match deposit.",
    ]
      .filter(Boolean)
      .join("\n");
  } else {
    return res.status(400).json({ error: "Unknown type" });
  }

  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    if (!tg.ok) {
      console.error("Telegram error", await tg.text());
      return res.status(502).json({ error: "Telegram failed" });
    }
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "Notify failed" });
  }

  return res.status(204).end();
}
