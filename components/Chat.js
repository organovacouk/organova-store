"use client";
import { useEffect, useRef, useState } from "react";
const gbp = (p) => "£" + (p / 100).toFixed(2);
const HELLO = { role: "assistant", content: "Hi! I'm Organova's AI assistant. I can help you find storage for any room, or answer questions about delivery and returns." };
const IDEAS = ["Help me organise a small kitchen", "Ideas for a messy hallway", "How long does delivery take?", "What is your returns policy?"];
function fmt(text) {
  return text.split("\n").map((line, i) => {
    const parts = []; const re = /\[([^\]]+)\]\((\/[^)\s]*)\)|\*\*([^*]+)\*\*/g; let last = 0, m, k = 0;
    while ((m = re.exec(line))) { if (m.index > last) parts.push(line.slice(last, m.index)); parts.push(m[1] ? <a key={k++} href={m[2]}>{m[1]}</a> : <b key={k++}>{m[3]}</b>); last = m.index + m[0].length; }
    if (last < line.length) parts.push(line.slice(last));
    return <p key={i}>{parts}</p>;
  });
}
export default function Chat() {
  const [on, setOn] = useState(false), [open, setOpen] = useState(false), [msgs, setMsgs] = useState([HELLO]), [text, setText] = useState(""), [busy, setBusy] = useState(false);
  const end = useRef(null);
  useEffect(() => { fetch("/api/config").then((r) => r.json()).then((c) => setOn(!!c.chat)).catch(() => {}); try { const s = JSON.parse(sessionStorage.getItem("chat") || "null"); if (s?.length) setMsgs(s); } catch {} }, []);
  useEffect(() => { try { sessionStorage.setItem("chat", JSON.stringify(msgs.slice(-20))); } catch {} end.current?.scrollIntoView({ block: "end" }); }, [msgs, open]);
  async function send(t) {
    t = (t ?? text).trim(); if (!t || busy) return; setText(""); const next = [...msgs, { role: "user", content: t }]; setMsgs(next); setBusy(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ messages: next.filter((m) => m !== HELLO).map(({ role, content }) => ({ role, content })) }) }); const j = await r.json();
      setMsgs([...next, { role: "assistant", content: j.reply || j.error || "Sorry, something went wrong.", cards: j.cards }]);
    } catch { setMsgs([...next, { role: "assistant", content: "Sorry, I could not connect. Please try again." }]); }
    setBusy(false);
  }
  if (!on) return null;
  return (
    <>
      {!open && <button className="chat-fab" onClick={() => setOpen(true)} aria-label="Open chat assistant"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg><span>Ask us</span></button>}
      {open && (
        <section className="chat" role="dialog" aria-label="Organova assistant" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
          <header><div><b>Organova assistant</b><small>AI assistant · can make mistakes</small></div><button onClick={() => setOpen(false)} aria-label="Close chat">✕</button></header>
          <div className="cm" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={"msg " + m.role}>{fmt(m.content)}
                {m.cards?.length > 0 && <div className="cc">{m.cards.map((c) => <a key={c.handle} href={"/products/" + c.handle}><img src={c.image} alt="" /><span>{c.title.slice(0, 44)}</span><b>{c.from ? "from " : ""}{gbp(c.price)}</b></a>)}</div>}</div>))}
            {busy && <div className="msg assistant"><p>Typing…</p></div>}
            {msgs.length === 1 && <div className="ideas">{IDEAS.map((i) => <button key={i} onClick={() => send(i)}>{i}</button>)}</div>}
            <div ref={end} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }}><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about products, delivery, returns…" maxLength="600" aria-label="Your message" /><button disabled={busy || !text.trim()}>Send</button></form>
          <p className="cf">Please don't share personal details. For orders, <a href="/account">sign in</a> or <a href="/pages/contact">contact us</a>.</p>
        </section>)}
    </>
  );
}
