/** Support handoff (Telegram) + desk notifications. */

export function telegramSupportUrl(contact, message) {
  if (!contact?.trim()) return null;
  const c = contact.trim();
  let base = "";
  if (c.startsWith("telegram:")) {
    const handle = c.replace(/^telegram:/i, "").replace(/^@/, "");
    base = `https://t.me/${encodeURIComponent(handle)}`;
  } else if (c.startsWith("https://t.me/")) {
    base = c.split("?")[0];
  } else if (c.startsWith("@")) {
    base = `https://t.me/${encodeURIComponent(c.slice(1))}`;
  } else if (/^t\.me\//i.test(c)) {
    base = `https://${c.replace(/^https?:\/\//i, "").split("?")[0]}`;
  } else {
    return null;
  }
  const q = message ? `?text=${encodeURIComponent(message)}` : "";
  return base + q;
}

export function initSupport({ supportContact, appName }) {
  const toggle = document.getElementById("supportToggle");
  const panel = document.getElementById("supportPanel");
  const textarea = document.getElementById("supportMsg");
  const sendBtn = document.getElementById("supportSend");
  const closeBtn = document.getElementById("supportClose");
  const navSupport = document.getElementById("navSupport");
  if (!toggle || !panel) return;

  const defaultMsg = `Hi ${appName} support. I need help with my bridge request.`;
  if (textarea) textarea.value = defaultMsg;

  const openTelegram = () => {
    const msg = textarea?.value.trim() || defaultMsg;
    const url = telegramSupportUrl(supportContact, msg);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!telegramSupportUrl(supportContact, "")) {
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.textContent = "Support not configured";
    }
  }

  function setOpen(open) {
    panel.classList.toggle("hidden", !open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  toggle.onclick = () => setOpen(panel.classList.contains("hidden"));
  closeBtn?.addEventListener("click", () => setOpen(false));
  sendBtn?.addEventListener("click", openTelegram);
  navSupport?.addEventListener("click", (e) => {
    e.preventDefault();
    setOpen(true);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

export async function notifyDesk(payload) {
  try {
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    /* non-blocking */
  }
}

