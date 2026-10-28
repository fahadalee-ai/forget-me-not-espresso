import { useState } from "react";
import { CAFE, dayName, hoursFor, isBirthdayWeek, money } from "./menu";
import { useCafe } from "./store";
import { Empty, Icon, Page, Seg, Stars, Switch } from "./ui";
import { MapCard } from "./checkout";

export function RewardsScreen() {
  const cafe = useCafe();
  const points = cafe.profile && !cafe.profile.guest ? cafe.profile.points : 0;
  const goal = cafe.config.rewardPoints;
  const tier = points >= 500 ? "Garden" : points >= 250 ? "Bloom" : "Seed";
  return (
    <Page title="Rewards" large trailing={<button className="linkish" onClick={() => cafe.push({ name: "deals" })}>Deals</button>}>
      {!cafe.profile || cafe.profile.guest ? (
        <Empty title="Points start with a name" body="Create an account or log in to keep stamps, birthday treats, and member deals." action="Log In" onAction={() => cafe.setPhase("login")} />
      ) : (
        <div style={{ padding: "0 16px 20px" }}>
          <div style={{ borderRadius: 8, padding: 18, background: "linear-gradient(145deg, #2463eb, #1c1917 58%)", color: "white", minHeight: 180 }}>
            <img src={`${import.meta.env.BASE_URL}brand/logo-w.png`} alt="" style={{ width: 54, height: 54, borderRadius: "50%", objectFit: "cover" }} />
            <div style={{ opacity: 0.8, marginTop: 8 }}>{cafe.profile.name}</div>
            <div className="h-display" style={{ fontSize: 40 }}>{points} pts</div>
            <div style={{ fontSize: 13 }}>{tier} member · {Math.max(0, goal - points)} to a free drink</div>
            <div className="progress" style={{ marginTop: 10, background: "rgba(255,255,255,.2)" }}><i style={{ width: `${Math.min(100, (points / goal) * 100)}%`, background: "white" }} /></div>
          </div>
          <button className="btn btn-plain" onClick={() => cafe.showAlert({ title: "How it works", message: `Earn ${cafe.config.pointsPerDollar} points per dollar. ${goal} points becomes a drink up to ${money(cafe.config.freeDrinkCap)}. Birthday week includes a free 12 oz latte.`, actions: [{ label: "OK", tone: "bold" }] })}>How it works</button>
          <h2 className="h-display" style={{ fontSize: 22 }}>Available rewards</h2>
          <div className="card" style={{ padding: 14, marginBottom: 10 }}>
            <strong>Free drink</strong>
            <p style={{ color: "var(--dim)", margin: "4px 0 8px" }}>{goal} points · up to {money(cafe.config.freeDrinkCap)}</p>
            <button className="btn btn-primary" disabled={points < goal} onClick={() => { cafe.setDraft({ ...cafe.draft, useFreeDrink: true, usePoints: 0 }); cafe.setSheet("cart"); }}>Redeem</button>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <strong>$1 off</strong>
            <p style={{ color: "var(--dim)", margin: "4px 0 8px" }}>100 points</p>
            <button className="btn btn-secondary" disabled={points < 100} onClick={() => { cafe.setDraft({ ...cafe.draft, usePoints: 100, useFreeDrink: false }); cafe.push({ name: "checkout" }); }}>Redeem</button>
          </div>
          <h2 className="h-display" style={{ fontSize: 22 }}>History</h2>
          {cafe.myOrders.map((o) => (
            <div key={o.id} className="row" style={{ paddingLeft: 0 }}>
              <div style={{ flex: 1 }}><strong>{o.number}</strong><div style={{ color: "var(--dim)", fontSize: 13 }}>{o.pointsUsed ? `Redeemed ${o.pointsUsed}` : `Earned ${o.pointsEarned}`}</div></div>
              <span style={{ color: o.pointsUsed ? "var(--danger)" : "var(--success)" }}>{o.pointsUsed ? `−${o.pointsUsed}` : `+${o.pointsEarned}`}</span>
            </div>
          ))}
          <button className="btn btn-secondary" onClick={() => cafe.push({ name: "birthday" })}>Birthday treat</button>
        </div>
      )}
    </Page>
  );
}

export function DealsScreen() {
  const cafe = useCafe();
  return (
    <Page title="Member Deals">
      <div style={{ padding: "8px 20px 28px", display: "grid", gap: 12 }}>
        <h2 className="h-display" style={{ fontSize: 22, margin: 0 }}>Personalized for you</h2>
        <p style={{ color: "var(--muted-foreground)", margin: 0 }}>{cafe.profile?.dietary?.[0] ? `Because you like ${cafe.profile.dietary[0].toLowerCase()}.` : "Based on what you order before the base."}</p>
        {cafe.promos.map((p) => (
          <article key={p.id} className="card" style={{ padding: 14, opacity: p.active ? 1 : 0.5 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><strong style={{ color: "var(--accent-text)" }}>{p.code}</strong><span style={{ fontSize: 13 }}>Ends {p.ends}</span></div>
            <div className="h-display" style={{ fontSize: 24 }}>{p.label}</div>
            <p style={{ color: "var(--dim)" }}>{p.detail}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary" style={{ width: "auto" }} onClick={() => { navigator.clipboard?.writeText(p.code); cafe.pushToast("Code copied", p.code); }}>Copy code</button>
              <button className="btn btn-primary" onClick={() => { cafe.applyPromo(p.code); cafe.setSheet("cart"); }}>Apply to cart</button>
            </div>
          </article>
        ))}
      </div>
    </Page>
  );
}

export function BirthdayScreen() {
  const cafe = useCafe();
  const open = Boolean(cafe.profile && !cafe.profile.guest && isBirthdayWeek(cafe.profile.birthday) && !cafe.profile.birthdayRedeemed);
  return (
    <Page title="Birthday Treat">
      <div style={{ padding: "8px 20px 28px" }}>
        <div className="card" style={{ padding: 18, background: open ? "linear-gradient(180deg, rgba(36,99,235,.35), var(--card))" : undefined }}>
          <img src={`${import.meta.env.BASE_URL}photos/onboard-reward.jpg`} alt="A latte handed across the counter" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 10 }} />
          <h1 className="h-display" style={{ fontSize: 30 }}>{open ? "This week, it’s on us" : "Your week is on the calendar"}</h1>
          <p style={{ color: "var(--muted-foreground)" }}>{open ? "A free 12 oz latte is unlocked. Apply it at checkout any day this week." : "The free latte opens the week of your birthday. We’ll leave a note when it’s time."}</p>
          <button className="btn btn-primary" disabled={!open} onClick={() => { cafe.setDraft({ ...cafe.draft, useBirthday: true }); cafe.pushToast("Birthday latte ready at checkout"); cafe.setTab("menu"); }}>Redeem free coffee</button>
        </div>
      </div>
    </Page>
  );
}

export function OrdersScreen() {
  const cafe = useCafe();
  const [tab, setTab] = useState("Active");
  const active = cafe.myOrders.filter((o) => o.status === "received" || o.status === "preparing" || o.status === "ready");
  const past = cafe.myOrders.filter((o) => o.status === "picked-up" || o.status === "cancelled");
  const list = tab === "Active" ? active : past;
  return (
    <Page title="Orders" large onRefresh={cafe.refresh}>
      <div style={{ padding: "0 16px 12px" }}><Seg label="Orders" value={tab} options={["Active", "Past"]} onChange={setTab} /></div>
      {(!cafe.profile || cafe.profile.guest) && <Empty title="No orders yet" body="Your first cup is the start of a good habit. Order ahead and it will live here." action="Start an order" onAction={() => cafe.setTab("menu")} />}
      {cafe.profile && !cafe.profile.guest && list.length === 0 && <Empty title={tab === "Active" ? "Nothing in progress" : "No past orders"} body={tab === "Active" ? "When you place a pickup, the live status shows here." : "Reorder from here after your first visit."} />}
      <div style={{ display: "grid", gap: 10, padding: "0 16px" }}>
        {cafe.profile && !cafe.profile.guest && list.map((o) => (
          <article key={o.id} className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><strong>{new Date(o.createdAt).toLocaleDateString()}</strong><span style={{ textTransform: "capitalize", color: "var(--accent-text)" }}>{o.status.replace("-", " ")}</span></div>
            <div style={{ color: "var(--dim)", fontSize: 14, margin: "6px 0" }}>{o.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{money(o.total)}</strong>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-secondary" style={{ width: "auto", minHeight: 40 }} onClick={() => cafe.push({ name: "receipt", orderId: o.id })}>Details</button>
                <button className="btn btn-primary" style={{ width: "auto", minHeight: 40 }} onClick={() => cafe.reorder(o)}>Reorder</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Page>
  );
}

export function NotificationsScreen() {
  const cafe = useCafe();
  const groups = ["Today", "Earlier"] as const;
  return (
    <Page title="Notifications" trailing={<button className="linkish" onClick={() => cafe.markAll()}>Read all</button>}>
      {cafe.notes.length === 0 && <Empty title="You’re caught up" body="Order updates, deals, and new drinks will land here." />}
      {groups.map((g) => {
        const list = cafe.notes.filter((n) => n.group === g);
        if (!list.length) return null;
        return (
          <section key={g}>
            <div className="section-label" style={{ fontSize: 20 }}>{g}</div>
            {list.map((n) => (
              <div key={n.id} className="row" style={{ alignItems: "flex-start" }} onClick={() => cafe.markOne(n.id)}>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontWeight: n.read ? 600 : 800 }}>{n.title}</strong>
                  <div style={{ color: "var(--dim)", fontSize: 14 }}>{n.body}</div>
                  <div style={{ fontSize: 12, color: "var(--dim)" }}>{n.at} · {n.kind}</div>
                </div>
                <button className="icon-btn" aria-label="Delete notification" onClick={(e) => { e.stopPropagation(); cafe.removeNote(n.id); }}><Icon name="close" /></button>
              </div>
            ))}
          </section>
        );
      })}
      <button className="btn btn-plain" onClick={() => cafe.push({ name: "notif-settings" })}>Notification settings</button>
    </Page>
  );
}

export function NotifSettings() {
  const cafe = useCafe();
  const rows: { key: keyof typeof cafe.notifPrefs; label: string; detail: string }[] = [
    { key: "orders", label: "Order status", detail: "Received, preparing, ready" },
    { key: "promos", label: "Promotions", detail: "Deals and coupons" },
    { key: "news", label: "New items", detail: "Seasonal specials and arrivals" },
    { key: "loyalty", label: "Loyalty", detail: "Points and rewards" },
    { key: "email", label: "Email", detail: "Notes from the café" },
    { key: "sms", label: "SMS", detail: "Texts when the window is ready" },
  ];
  return (
    <Page title="Notifications">
      <div className="inset" style={{ margin: 20 }}>
        {rows.map((r) => (
          <div key={r.key} className="row">
            <div style={{ flex: 1 }}><strong>{r.label}</strong><div style={{ color: "var(--dim)", fontSize: 13 }}>{r.detail}</div></div>
            <Switch on={cafe.notifPrefs[r.key]} label={r.label} onToggle={() => cafe.togglePref(r.key)} />
          </div>
        ))}
      </div>
    </Page>
  );
}

function Chevron() {
  return (
    <svg className="chev" width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m1 1 6 6-6 6" />
    </svg>
  );
}

export function ProfileScreen() {
  const cafe = useCafe();
  const p = cafe.profile;
  const member = Boolean(p && !p.guest);
  const goal = cafe.config.rewardPoints;
  const points = member ? p!.points : 0;
  const groups: { title: string; rows: { label: string; detail?: string; go: () => void }[] }[] = [
    {
      title: "Account",
      rows: [
        { label: member ? "Edit Profile" : "Log In", detail: member ? p!.email : "Save points and orders", go: () => (member ? cafe.push({ name: "edit-profile" }) : cafe.setPhase("login")) },
        { label: "Dietary Preferences", go: () => cafe.push({ name: "dietary" }) },
        { label: "Saved Payments", go: () => cafe.push({ name: "payments" }) },
        { label: "Notifications", go: () => cafe.push({ name: "notif-settings" }) },
        { label: "Settings", go: () => cafe.push({ name: "settings" }) },
      ],
    },
    {
      title: "Orders",
      rows: [
        { label: "Order History", go: () => cafe.setTab("orders") },
        { label: "Favorites", go: () => cafe.push({ name: "favorites" }) },
        { label: "Feedback and Reviews", go: () => cafe.push({ name: "reviews" }) },
      ],
    },
    {
      title: "The café",
      rows: [
        { label: "Pickup & the café", go: () => cafe.push({ name: "store" }) },
        { label: "Help and Support", go: () => cafe.push({ name: "help" }) },
        { label: "About", go: () => cafe.push({ name: "about" }) },
        { label: "Café Admin", go: () => cafe.setAdminOpen(true) },
      ],
    },
  ];
  return (
    <Page title="Profile" large>
      <div className="stack" style={{ paddingTop: 4 }}>
        <button className="card pad profile-hero" onClick={() => (member ? cafe.push({ name: "edit-profile" }) : cafe.setPhase("login"))}>
          <div className="avatar" aria-hidden>{(p?.name ?? "G").slice(0, 1)}</div>
          <div className="block" style={{ gap: 6 }}>
            <div>
              <div className="h-display" style={{ fontSize: 24, margin: 0 }}>{p?.name ?? "Guest"}</div>
              <p className="hint">{member ? p!.email : "Browsing as a guest"}</p>
            </div>
            {member ? (
              <div>
                <div className="progress"><i style={{ width: `${Math.min(100, (points / goal) * 100)}%` }} /></div>
                <p className="hint" style={{ marginTop: 6 }}>{points} pts · {Math.max(0, goal - points)} to a free drink</p>
              </div>
            ) : (
              <p className="hint">Sign in to keep points and pickup orders.</p>
            )}
          </div>
        </button>
        {groups.map((group) => (
          <section key={group.title} className="profile-group">
            <div className="kicker">{group.title}</div>
            <div className="inset">
              {group.rows.map((row) => (
                <button key={row.label} className="row" onClick={row.go}>
                  <span style={{ flex: 1 }}>
                    {row.label}
                    {row.detail && <span className="hint" style={{ display: "block", fontSize: 13 }}>{row.detail}</span>}
                  </span>
                  <Chevron />
                </button>
              ))}
            </div>
          </section>
        ))}
        <button className="btn btn-plain" style={{ color: "var(--danger)" }} onClick={() => cafe.showAlert({ title: "Log out?", message: "You can sign back in with your password.", actions: [{ label: "Cancel", tone: "cancel" }, { label: "Log Out", tone: "danger", run: () => cafe.logout() }] })}>Log Out</button>
      </div>
    </Page>
  );
}

export function EditProfile() {
  const cafe = useCafe();
  const p = cafe.profile;
  const [form, setForm] = useState({ name: p?.name ?? "", email: p?.email ?? "", phone: p?.phone ?? "", birthday: p?.birthday ?? "1998-01-01" });
  if (!p || p.guest) return <Page title="Edit Profile"><Empty title="Sign in to edit" body="Guest visits don’t keep a profile." action="Log In" onAction={() => cafe.setPhase("login")} /></Page>;
  return (
    <Page title="Edit Profile">
      <div style={{ padding: "8px 20px 28px" }}>
        <div className="inset">
          <label className="field"><span>Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="field"><span>Email</span><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="field"><span>Phone</span><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label className="field"><span>Birthday</span><input type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} /></label>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => { cafe.updateProfile(form); cafe.pushToast("Profile saved"); cafe.pop(); }}>Save</button>
      </div>
    </Page>
  );
}

export function DietaryScreen() {
  const cafe = useCafe();
  const options = ["Dairy-free options", "Caffeine-free", "Oat milk", "Almond milk", "Coconut milk", "Vegetarian"];
  const selected = cafe.profile?.dietary ?? [];
  return (
    <Page title="Dietary Preferences">
      <p className="lead" style={{ padding: "4px 20px 0" }}>These shape filters and the deals we show. The menu still lists everything.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 20px 28px" }}>
        {options.map((opt) => (
          <button key={opt} className={`chip ${selected.includes(opt) ? "on" : ""}`} onClick={() => cafe.updateProfile({ dietary: selected.includes(opt) ? selected.filter((d) => d !== opt) : [...selected, opt] })}>{opt}</button>
        ))}
      </div>
    </Page>
  );
}

export function PaymentsScreen() {
  const cafe = useCafe();
  return (
    <Page title="Saved Payments">
      <div className="inset" style={{ margin: 20 }}>
        {cafe.cards.map((c) => (
          <div key={c.id} className="row">
            <div style={{ flex: 1 }}><strong>{c.brand} ••{c.last4}</strong><div style={{ color: "var(--dim)", fontSize: 13 }}>Exp {c.exp}{c.isDefault ? " · Default" : ""}</div></div>
            <button className="btn-plain" style={{ width: "auto", color: "var(--danger)" }} onClick={() => cafe.removeCard(c.id)}>Remove</button>
          </div>
        ))}
        {cafe.cards.length === 0 && <Empty title="No cards yet" body="Apple Pay is still available at checkout." />}
      </div>
      <button className="btn btn-primary" style={{ margin: "20px 20px 0", width: "calc(100% - 40px)" }} onClick={() => cafe.push({ name: "add-card" })}>Add Card</button>
    </Page>
  );
}

export function ReviewsScreen() {
  const cafe = useCafe();
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  return (
    <Page title="Feedback">
      <div style={{ padding: "8px 20px 28px" }}>
        <h2 className="h-display" style={{ fontSize: 22 }}>Tell the café</h2>
        <Stars value={stars} onChange={setStars} />
        <textarea value={text} onChange={(e) => setText(e.target.value)} aria-label="Feedback" placeholder="A drink, a morning, a suggestion." style={{ width: "100%", minHeight: 90, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "inherit", padding: 12 }} />
        <button className="btn btn-primary" disabled={!stars || text.trim().length < 3} onClick={() => { cafe.addFeedback(stars, text); setText(""); setStars(0); }}>Send Feedback</button>
        <h2 className="h-display" style={{ fontSize: 22 }}>My reviews</h2>
        {cafe.myOrders.filter((o) => o.review).map((o) => (
          <article key={o.id} className="card" style={{ padding: 12, marginBottom: 8 }}>
            <Stars value={o.rating ?? 0} />
            <p>{o.review}</p>
            <div style={{ color: "var(--dim)", fontSize: 13 }}>{o.number}</div>
          </article>
        ))}
        {cafe.feedback.map((f) => (
          <article key={f.id} className="card" style={{ padding: 12, marginBottom: 8 }}>
            <Stars value={f.stars} />
            <p>{f.text}</p>
            <div style={{ color: "var(--dim)", fontSize: 13 }}>{f.at}</div>
          </article>
        ))}
      </div>
    </Page>
  );
}

export function SettingsScreen() {
  const cafe = useCafe();
  return (
    <Page title="Settings">
      <div style={{ padding: "8px 20px 28px", display: "grid", gap: 12 }}>
        <h2 className="h-display" style={{ fontSize: 20, margin: 0 }}>Appearance</h2>
        <Seg label="Appearance" value={cafe.appearance === "system" ? "System" : cafe.appearance === "light" ? "Light" : "Dark"} options={["Light", "Dark", "System"]} onChange={(v) => cafe.setAppearance(v === "Light" ? "light" : v === "System" ? "system" : "dark")} />
        <h2 className="h-display" style={{ fontSize: 20, margin: 0 }}>Text size</h2>
        <Seg label="Text size" value={cafe.textScale > 1.2 ? "Extra Large" : cafe.textScale > 1 ? "Large" : "Default"} options={["Default", "Large", "Extra Large"]} onChange={(v) => cafe.setTextScale(v === "Large" ? 1.12 : v === "Extra Large" ? 1.28 : 1)} />
        <div className="inset">
          <div className="row"><div style={{ flex: 1 }}><strong>Face ID</strong><div style={{ color: "var(--dim)", fontSize: 13 }}>Unlock sign-in on this phone</div></div><Switch on={Boolean(cafe.profile?.faceId)} label="Face ID" onToggle={() => cafe.updateProfile({ faceId: !cafe.profile?.faceId })} /></div>
          <div className="row"><div style={{ flex: 1 }}><strong>Simulate offline</strong></div><Switch on={cafe.offline} label="Offline" onToggle={() => cafe.setOffline(!cafe.offline)} /></div>
        </div>
        <button className="row" onClick={() => cafe.push({ name: "notif-settings" })}>Notifications</button>
        <button className="row" onClick={() => cafe.push({ name: "terms" })}>Terms and Privacy</button>
        <button className="btn btn-plain" style={{ color: "var(--danger)" }} onClick={() => cafe.showAlert({ title: "Delete account?", message: "This clears the profile on this phone.", actions: [{ label: "Cancel", tone: "cancel" }, { label: "Delete", tone: "danger", run: () => cafe.logout() }] })}>Delete Account</button>
        <p style={{ color: "var(--dim)", textAlign: "center" }}>Forget Me Not Espresso · Version 1.0</p>
        <button className="btn btn-plain" onClick={() => { localStorage.removeItem("fmn-espresso-v1"); cafe.logout(); cafe.pushToast("Welcome reset"); }}>Replay welcome</button>
      </div>
    </Page>
  );
}

export function HelpScreen() {
  const cafe = useCafe();
  const [msg, setMsg] = useState("");
  const faqs = [
    ["How does pickup work?", "Place the order, pull up to Lane 2 on Noble Street, and tell us the name. We’ll hand it out the window."],
    ["When is the breakfast box?", "7:30 AM to 12:30 PM. The lunch box runs 12:30 PM to 5:30 PM."],
    ["Can I change milk?", "Yes. 1%, half-and-half, oat, almond, and coconut are on every milk drink. Upcharges are set in Admin."],
    ["What if something’s wrong?", "Call or text (907) 457-8777 and we’ll remake it."],
  ];
  return (
    <Page title="Help">
      <div style={{ padding: "8px 20px 28px" }}>
        {faqs.map(([q, a]) => (
          <details key={q} className="card" style={{ padding: 12, marginBottom: 8 }}>
            <summary style={{ fontWeight: 700, minHeight: 44 }}>{q}</summary>
            <p style={{ color: "var(--muted-foreground)" }}>{a}</p>
          </details>
        ))}
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} aria-label="Message the café" placeholder="Question or special request" style={{ width: "100%", minHeight: 90, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "inherit", padding: 12 }} />
        <button className="btn btn-primary" disabled={msg.trim().length < 3} onClick={() => { cafe.pushToast("Message sent", "We’ll reply from the café email."); setMsg(""); }}>Send</button>
        <a className="btn btn-secondary" href={CAFE.phoneHref} style={{ marginTop: 8 }}>Call {CAFE.phone}</a>
        <a className="btn btn-plain" href={`mailto:${CAFE.email}`}>Email {CAFE.email}</a>
      </div>
    </Page>
  );
}

export function AboutScreen() {
  const cafe = useCafe();
  return (
    <Page title="About">
      <div style={{ padding: "8px 20px 28px" }}>
        <img src={`${import.meta.env.BASE_URL}brand/logo-w.png`} alt="Forget Me Not Espresso" style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover" }} />
        <h1 className="h-display" style={{ fontSize: 30 }}>A little stop, a lasting impression.</h1>
        <p style={{ color: "var(--muted-foreground)", lineHeight: 1.5 }}>{cafe.cafe.about}</p>
        <p>Veteran operated since April Painter took the window in 2022. Beans are Kaladi Brothers, shipped in for every cup.</p>
      </div>
    </Page>
  );
}

export function TermsScreen() {
  return (
    <Page title="Terms & Privacy">
      <div style={{ padding: "8px 20px 28px", color: "var(--muted-foreground)", lineHeight: 1.5 }}>
        <p>Orders are a request for pickup at 1246 Noble Street. Prices for sized drinks match the café menu. Items marked “Ask at café” or “Ask our barista” are confirmed before you pay if a price isn’t set.</p>
        <p>Points are a café reward, not cash. We store your name, mobile number, birthday, and order history on this device for the preview. Payment fields are not sent to a processor in this demo.</p>
        <p>You can delete the on-device profile from Settings.</p>
      </div>
    </Page>
  );
}

export function StoreScreen() {
  const cafe = useCafe();
  const [msg, setMsg] = useState("");
  const today = new Date().getDay();
  return (
    <Page title="The Café">
      <div style={{ padding: "8px 20px 28px" }}>
        <MapCard />
        <h1 className="h-display" style={{ fontSize: 28, marginBottom: 4 }}>{cafe.cafe.name}</h1>
        <p style={{ marginTop: 0 }}>{cafe.cafe.address}<br />{cafe.cafe.city}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <a className="btn btn-primary" href={cafe.cafe.maps}>Get Directions</a>
          <a className="btn btn-secondary" href={cafe.cafe.phoneHref}>Call</a>
        </div>
        <a className="btn btn-plain" href={`mailto:${cafe.cafe.email}`}>Email</a>
        <h2 className="h-display" style={{ fontSize: 22 }}>Hours</h2>
        <div className="inset">
          {[1, 2, 3, 4, 5, 6, 0].map((d) => (
            <div key={d} className="row" style={{ background: d === today ? "var(--accent-soft)" : "transparent" }}>
              <span style={{ flex: 1 }}>{dayName(d)}{d === today ? " · Today" : ""}</span>
              <span>{hoursFor(d)}</span>
            </div>
          ))}
        </div>
        <p style={{ color: cafe.openNow ? "var(--success)" : "var(--warning)", fontWeight: 700 }}>{cafe.openNow ? "Open now" : "Closed now"}</p>
        <h2 className="h-display" style={{ fontSize: 22 }}>Pickup</h2>
        <p style={{ color: "var(--muted-foreground)" }}>{cafe.cafe.pickup}</p>
        <div className="hscroll" style={{ paddingLeft: 0 }}>
          {["hero-latte.jpg", "cat-espresso.jpg", "cat-food.jpg", "cat-baked.jpg"].map((src) => (
            <img key={src} src={`${import.meta.env.BASE_URL}photos/${src}`} alt="Café" style={{ width: 200, height: 130, objectFit: "cover", borderRadius: 10 }} />
          ))}
        </div>
        <h2 className="h-display" style={{ fontSize: 22 }}>Contact the café</h2>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} aria-label="Question or special request" placeholder="Questions and special requests" style={{ width: "100%", minHeight: 90, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "inherit", padding: 12 }} />
        <button className="btn btn-primary" disabled={msg.trim().length < 3} onClick={() => { cafe.pushToast("Sent to the café"); setMsg(""); }}>Send</button>
      </div>
    </Page>
  );
}

