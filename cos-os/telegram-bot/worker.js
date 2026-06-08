const ALLOWED_USER_IDS = [/* PASTE YOUR TELEGRAM_USER_ID HERE e.g. 123456789 */];
const SIZE_THRESHOLD = 2048;
const BASE = "cos-os";

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("OK");

    let body;
    try { body = await request.json(); } catch { return new Response("OK"); }

    const msg = body.message || body.edited_message;
    if (!msg || !msg.text) return new Response("OK");

    const userId = msg.from?.id;
    if (!ALLOWED_USER_IDS.includes(userId)) return new Response("OK");

    const chatId = msg.chat.id;
    const text = msg.text.trim();
    const [cmd, ...rest] = text.split(/\s+/);
    const arg = rest.join(" ");

    const send = (t) => sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, t);

    try {
      if (cmd === "/log") {
        if (!arg) return send("Usage: /log DOMAIN your text");
        await writeInbox(env, arg);
        return send("Logged to inbox.");
      }
      if (cmd === "/status")     return send(await readSection(env, `${BASE}/dashboard.md`, null));
      if (cmd === "/priorities") return send(await readSection(env, `${BASE}/dashboard.md`, "TOP_PRIORITIES"));
      if (cmd === "/projects")   return send(await readSection(env, `${BASE}/dashboard.md`, "ACTIVE_PROJECTS"));
      if (cmd === "/inbox")      return send(await readInbox(env));
      if (cmd === "/daily")      return send(await readLatestExport(env, "daily"));
      if (cmd === "/weekly")     return send(await readLatestExport(env, "weekly"));
      return send("Commands: /log /status /priorities /projects /inbox /daily /weekly");
    } catch (e) {
      if (e.message === "WRITE_FAILED") return send("Write failed after retry. Please resend.");
      return send("Error: " + e.message);
    }
  }
};

// ── GitHub helpers ──────────────────────────────────────────────────────────

async function ghGet(token, repo, path) {
  const r = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    headers: { Authorization: `token ${token}`, "User-Agent": "cos-bot" }
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
  return r.json();
}

async function ghPut(token, repo, path, message, content, sha) {
  const body = { message, content: btoa(unescape(encodeURIComponent(content))), ...(sha && { sha }) };
  const r = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "cos-bot"
    },
    body: JSON.stringify(body)
  });
  return r;
}

// ── Inbox routing ───────────────────────────────────────────────────────────

async function resolveInboxTarget(env) {
  const { GITHUB_TOKEN: token, GITHUB_REPO: repo } = env;
  const dir = await ghGet(token, repo, BASE);
  const inboxFiles = (dir || [])
    .filter(f => /^inbox(_overflow_\d+)?\.md$/.test(f.name))
    .map(f => ({ name: f.name, size: f.size, suffix: suffixOf(f.name) }))
    .sort((a, b) => b.suffix - a.suffix);

  if (!inboxFiles.length) return `${BASE}/inbox.md`;
  const top = inboxFiles[0];
  if (top.size < SIZE_THRESHOLD) return `${BASE}/${top.name}`;
  const next = top.suffix + 1;
  return next === 1 ? `${BASE}/inbox_overflow_1.md` : `${BASE}/inbox_overflow_${next}.md`;
}

function suffixOf(name) {
  const m = name.match(/_overflow_(\d+)\.md$/);
  return m ? parseInt(m[1]) : 0;
}

// ── Write ───────────────────────────────────────────────────────────────────

async function writeInbox(env, text) {
  const { GITHUB_TOKEN: token, GITHUB_REPO: repo } = env;
  const path = await resolveInboxTarget(env);
  const ts = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const line = `- [${ts}] ${text}\n`;

  const existing = await ghGet(token, repo, path);
  const currentContent = existing ? decodeURIComponent(escape(atob(existing.content.replace(/\n/g, "")))) : "";
  const merged = currentContent + line;
  const sha = existing?.sha;

  let r = await ghPut(token, repo, path, `log: inbox entry`, merged, sha);
  if (r.status === 409) {
    await sleep(500);
    const fresh = await ghGet(token, repo, path);
    const freshContent = fresh ? decodeURIComponent(escape(atob(fresh.content.replace(/\n/g, "")))) : "";
    r = await ghPut(token, repo, path, `log: inbox entry`, freshContent + line, fresh?.sha);
    if (r.status === 409) throw new Error("WRITE_FAILED");
  }
  if (!r.ok) throw new Error(`PUT ${path} → ${r.status}`);
}

// ── Reads ───────────────────────────────────────────────────────────────────

const DASHBOARD_HDRS = [
  "LAST_SYNC", "TOP_PRIORITIES", "CRITICAL_RISKS", "ACTIVE_PROJECTS",
  "WAITING", "DECISIONS_PENDING", "INBOX_COUNT", "INBOX_OVERFLOW_FILES"
];

async function readSection(env, file, section) {
  const { GITHUB_TOKEN: token, GITHUB_REPO: repo } = env;
  const data = await ghGet(token, repo, file);
  if (!data) return `${file} not found.`;
  const content = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ""))));

  if (!section) return truncate(content);

  const terminators = DASHBOARD_HDRS.map(h => `^${h}:`).join("|");
  const re = new RegExp(`(^${section}:[\\s\\S]*?)(?=${terminators}|$)`, "m");
  const m = content.match(re);
  return m ? truncate(m[1].trim()) : `Section ${section} not found.`;
}

async function readInbox(env) {
  const { GITHUB_TOKEN: token, GITHUB_REPO: repo } = env;
  const dir = await ghGet(token, repo, BASE) || [];
  const files = dir
    .filter(f => /^inbox(_overflow_\d+)?\.md$/.test(f.name))
    .sort((a, b) => suffixOf(a.name) - suffixOf(b.name));

  if (!files.length) return "Inbox is empty.";
  let out = "";
  for (const f of files) {
    const data = await ghGet(token, repo, `${BASE}/${f.name}`);
    if (!data) continue;
    const content = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ""))));
    const lines = content.split("\n").filter(l => l.startsWith("- ["));
    if (lines.length) out += `**${f.name}**\n${lines.join("\n")}\n\n`;
  }
  return truncate(out.trim() || "Inbox is empty.");
}

async function readLatestExport(env, type) {
  const { GITHUB_TOKEN: token, GITHUB_REPO: repo } = env;
  const dir = await ghGet(token, repo, `${BASE}/exports`) || [];
  const files = dir
    .filter(f => f.name.startsWith(`${type}-`) && f.name.endsWith(".md"))
    .sort((a, b) => b.name.localeCompare(a.name));
  if (!files.length) return `No ${type} export found.`;
  const data = await ghGet(token, repo, `${BASE}/exports/${files[0].name}`);
  if (!data) return "Export unreadable.";
  const content = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ""))));
  return truncate(content);
}

// ── Utils ───────────────────────────────────────────────────────────────────

function truncate(s, limit = 4096) {
  return s.length <= limit ? s : s.slice(0, limit - 20) + "\n…[truncated]";
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function sendMessage(token, chatId, text) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" })
  });
  return new Response("OK");
}
