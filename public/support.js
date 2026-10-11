/** Floating support panel (WhatsApp handoff for manual desk). */

function whatsappUrl(contact, message) {
  const c = contact.trim();
  let phone = "";
  if (c.startsWith("whatsapp:")) phone = c.replace(/^whatsapp:/i, "").replace(/\D/g, "");
  else if (/^\+?\d{10,15}$/.test(c.replace(/\s/g, ""))) phone = c.replace(/\D/g, "");
  if (!phone) return null;
  const q = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${phone}${q}`;
}

export function initSupport({ supportContact, appName }) {
  const root = document.getElementById("supportRoot");
  const toggle = document.getElementById("supportToggle");
  const panel = document.getElementById("supportPanel");
  const textarea = document.getElementById("supportMsg");
  const sendBtn = document.getElementById("supportSend");
  const closeBtn = document.getElementById("supportClose");
  if (!root || !toggle || !panel) return;

  const defaultMsg = `Hi ${appName} support — I need help with my bridge request.`;
  textarea.value = defaultMsg;

  const wa = supportContact ? whatsappUrl(supportContact, defaultMsg) : null;
  if (!wa) {
    sendBtn.disabled = true;
    sendBtn.textContent = "Support not configured";
    return;
  }

  function setOpen(open) {
    panel.classList.toggle("hidden", !open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  toggle.onclick = () => setOpen(panel.classList.contains("hidden"));
  closeBtn.onclick = () => setOpen(false);

  sendBtn.onclick = () => {
    const msg = textarea.value.trim() || defaultMsg;
    const url = whatsappUrl(supportContact, msg);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

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

export function notifyVisitOnce() {
  if (sessionStorage.getItem("deskVisitNotified")) return;
  sessionStorage.setItem("deskVisitNotified", "1");
  notifyDesk({ type: "visit" });
}
