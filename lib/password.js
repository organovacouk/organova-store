// Password hashing with PBKDF2-SHA256 (built into the Cloudflare runtime, so it is free and needs no packages).
const enc = new TextEncoder(); const ITER = 100000; // 100,000 is the maximum the Workers runtime allows
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const unhex = (h) => Uint8Array.from(h.match(/.{2}/g).map((x) => parseInt(x, 16)));
async function derive(pw, salt, iter) {
  const k = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" }, k, 256));
}
export async function hashPassword(pw) { const salt = crypto.getRandomValues(new Uint8Array(16)); return { hash: await derive(pw, salt, ITER), salt: ITER + ":" + hex(salt) }; }
export async function verifyPassword(pw, hash, saltField) {
  if (!hash || !saltField) { await derive(pw, new Uint8Array(16), ITER); return false; } // same work for unknown accounts, so timing does not reveal who exists
  const [it, s] = saltField.split(":"); const h = await derive(pw, unhex(s), parseInt(it) || ITER);
  let d = h.length ^ hash.length; for (let i = 0; i < h.length; i++) d |= h.charCodeAt(i) ^ (hash.charCodeAt(i) || 0); return d === 0;
}
const COMMON = new Set(["password", "password1", "password123", "passw0rd123", "1234567890", "12345678910", "qwertyuiop", "iloveyou123", "letmein1234", "welcome1234", "admin12345", "administrator", "organova123", "organova1234", "organovastore"]);
// Returns a message if the password is not acceptable, otherwise null.
export async function checkPassword(pw, email) {
  if (typeof pw !== "string" || pw.length < 10) return "Please use at least 10 characters.";
  if (pw.length > 128) return "That password is too long (128 characters at most).";
  const l = pw.toLowerCase(), local = String(email || "").split("@")[0].toLowerCase();
  if (COMMON.has(l) || /^(.)\1+$/.test(pw)) return "That password is too easy to guess.";
  if (local.length >= 4 && l.includes(local)) return "Your password should not contain your email name.";
  try { // Have I Been Pwned check: only the first 5 characters of a hash leave the server, never the password
    const sha1 = hex(await crypto.subtle.digest("SHA-1", enc.encode(pw))).toUpperCase(); const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 1500);
    const r = await fetch("https://api.pwnedpasswords.com/range/" + sha1.slice(0, 5), { headers: { "Add-Padding": "true" }, signal: ctl.signal }); clearTimeout(t);
    if (r.ok) for (const line of (await r.text()).split("\n")) { const [s, c] = line.trim().split(":"); if (s === sha1.slice(5) && parseInt(c) > 0) return "That password appears in known data breaches. Please choose a different one."; }
  } catch {}
  return null;
}
