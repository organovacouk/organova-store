const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) => esc(s)
  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  .replace(/&lt;([^@\s]+@[^&\s]+)&gt;/g, '<a href="mailto:$1">$1</a>');
export function md(text) {
  const out = []; let list = false;
  for (const raw of text.split("\n")) {
    const l = raw.trim();
    if (list && !l.startsWith("- ")) { out.push("</ul>"); list = false; }
    if (!l) continue;
    if (l.startsWith("# ")) out.push("<h1>" + inline(l.slice(2)) + "</h1>");
    else if (l.startsWith("## ")) out.push("<h2>" + inline(l.slice(3)) + "</h2>");
    else if (l.startsWith("- ")) { if (!list) { out.push("<ul>"); list = true; } out.push("<li>" + inline(l.slice(2)) + "</li>"); }
    else out.push("<p>" + inline(l) + "</p>");
  }
  if (list) out.push("</ul>");
  return out.join("\n");
}
