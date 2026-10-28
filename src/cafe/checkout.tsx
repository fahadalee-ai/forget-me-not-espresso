import { useState } from "react";
import { MENU, money, pickupDays, pickupTimes } from "./menu";
import { useCafe, type CafeOrder, type OrderStatus } from "./store";
import { Empty, Icon, Page, Photo, Seg, Stars } from "./ui";
import { Stepper } from "./browse";

export function CartSheet() {
  const cafe = useCafe();
  const [code, setCode] = useState(cafe.draft.promoCode);
  const [err, setErr] = useState<string | null>(null);
  if (cafe.sheet !== "cart") return null;
  const baked = MENU.filter((i) => i.category === "baked").slice(0, 3);
  return (
    <>
      <button className="sheet-backdrop" aria-label="Close cart" onClick={() => cafe.setSheet(null)} />
      <div className="sheet" role="dialog" aria-label="Cart">
        <div className="grabber" />
        <div className="sheet-body">
          <h2 className="h-display" style={{ fontSize: 30, margin: "4px 0 12px" }}>Cart</h2>
          {cafe.lines.length === 0 ? (
            <Empty title="Your cart is quiet" body="Add a drink and it will wait here until you’re ready to check out." action="See the menu" onAction={() => { cafe.setSheet(null); cafe.setTab("menu"); }} />
          ) : (
            cafe.lines.map((line) => (
              <div key={line.lineId} className="row" style={{ alignItems: "flex-start", paddingLeft: 0 }}>
                <div style={{ width: 64, height: 64, borderRadius: 8, overflow: "hidden", flex: "none" }}>
                  <Photo id={line.itemId} category={line.category} alt={line.name} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong>{line.name}</strong>
                  <div style={{ color: "var(--dim)", fontSize: 13 }}>{line.summary}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                    <Stepper value={line.qty} onChange={(n) => cafe.setQty(line.lineId, n)} />
                    <span style={{ color: "var(--accent-text)", fontWeight: 700 }}>{line.pending ? "Ask at café" : money(line.unit * line.qty)}</span>
                  </div>
                  <button className="btn-plain" style={{ width: "auto", padding: 0, minHeight: 36 }} onClick={() => { cafe.setSheet(null); cafe.push({ name: "product", itemId: line.itemId, lineId: line.lineId }); }}>Edit</button>
                </div>
                <button className="icon-btn" aria-label={`Remove ${line.name}`} onClick={() => cafe.removeLine(line.lineId)}><Icon name="close" /></button>
              </div>
            ))
          )}
          {cafe.lines.length > 0 && (
            <>
              <h3 className="h-display" style={{ fontSize: 20 }}>Add a baked good</h3>
              <div className="hscroll" style={{ paddingLeft: 0 }}>
                {baked.map((item) => (
                  <button key={item.id} className="chip" onClick={() => cafe.addSelection(item, { temp: "iced", size: 16, milk: "None", sweetness: 0, syrups: [], shots: 0, addons: [], variations: {}, notes: "" })}>{item.name}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code" aria-label="Promo code" style={{ flex: 1, minHeight: 44, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "inherit", padding: "0 12px" }} />
                <button className="btn btn-secondary" style={{ width: "auto" }} onClick={() => setErr(cafe.applyPromo(code))}>Apply</button>
              </div>
              {err && <p style={{ color: "var(--danger)", fontSize: 13 }}>{err}</p>}
              <Totals />
              <button className="btn btn-primary" onClick={() => { cafe.setSheet(null); cafe.push({ name: "checkout" }); }}>Checkout</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Totals() {
  const { math } = useCafe();
  const rows: [string, string][] = [
    ["Subtotal", money(math.subtotal)],
    ["Discount", math.discount ? `−${money(math.discount)}` : money(0)],
    ["Tax", money(math.tax)],
    ["Tip", money(math.tip)],
  ];
  return (
    <div style={{ margin: "12px 0" }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "var(--muted-foreground)" }}><span>{k}</span><span>{v}</span></div>
      ))}
      {math.pending && <p style={{ fontSize: 13, color: "var(--dim)" }}>Some items are priced at the café and aren’t in this total yet.</p>}
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18 }}><span>Total</span><span>{money(math.total)}</span></div>
    </div>
  );
}

export function CheckoutScreen() {
  const cafe = useCafe();
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState(cafe.draft.promoCode);
  const points = cafe.profile && !cafe.profile.guest ? cafe.profile.points : 0;
  return (
    <Page title="Checkout">
      <div className="stack">
        <section className="card pad block">
          <div className="kicker">Store</div>
          <h2 className="h-display">{cafe.cafe.name}</h2>
          <div>{cafe.cafe.address}<br />{cafe.cafe.city}</div>
          <p className="hint">{cafe.cafe.pickup}</p>
        </section>
        <section className="block">
          <h2 className="h-display">Pickup time</h2>
          <Seg label="Pickup time" value={cafe.draft.pickup === "asap" ? "ASAP" : "Schedule"} options={["ASAP", "Schedule"]} onChange={(v) => cafe.setDraft({ ...cafe.draft, pickup: v === "ASAP" ? "asap" : "schedule", whenLabel: v === "ASAP" ? "ASAP · about 10–15 min" : cafe.draft.whenLabel })} />
          {cafe.draft.pickup === "asap" ? (
            <p className="hint" style={{ color: cafe.openNow ? "var(--muted-foreground)" : "var(--warning)" }}>{cafe.openNow ? "About 10–15 minutes once you place it." : "We’re closed for ASAP pickup. Schedule instead."}</p>
          ) : (
            <TimeWheels />
          )}
        </section>
        <section className="inset">
          <label className="field"><span>Name for the order</span><input value={cafe.draft.name} onChange={(e) => cafe.setDraft({ ...cafe.draft, name: e.target.value })} /></label>
          <label className="field"><span>Phone</span><input value={cafe.draft.phone} inputMode="tel" onChange={(e) => cafe.setDraft({ ...cafe.draft, phone: e.target.value })} /></label>
        </section>
        <section className="card pad block">
          <h2 className="h-display">Loyalty</h2>
          <p className="hint">{points} points · {cafe.config.pointsPerDollarOff} points = $1</p>
          <div className="row" style={{ paddingLeft: 0 }}>
            <span style={{ flex: 1 }}>Apply points</span>
            <Stepper value={cafe.draft.usePoints / 100} onChange={(n) => cafe.setDraft({ ...cafe.draft, usePoints: Math.max(0, Math.min(points, n * 100)), useFreeDrink: false })} />
          </div>
          <button className="btn btn-secondary" disabled={points < cafe.config.rewardPoints} onClick={() => cafe.setDraft({ ...cafe.draft, useFreeDrink: !cafe.draft.useFreeDrink, usePoints: 0 })}>
            {cafe.draft.useFreeDrink ? "Free drink applied" : `Apply free drink (${cafe.config.rewardPoints} pts)`}
          </button>
          <button className="btn btn-secondary" disabled={!cafe.birthdayWeek} onClick={() => cafe.setDraft({ ...cafe.draft, useBirthday: !cafe.draft.useBirthday })}>
            {cafe.draft.useBirthday ? "Birthday latte applied" : "Apply birthday treat"}
          </button>
        </section>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code" aria-label="Promo code" style={{ flex: 1, minHeight: 44, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "inherit", padding: "0 12px" }} />
          <button className="btn btn-secondary" style={{ width: "auto" }} onClick={() => setErr(cafe.applyPromo(code))}>Apply</button>
        </div>
        <section className="block">
          <h2 className="h-display">Payment</h2>
          <button className={`btn ${cafe.draft.payment === "apple" ? "btn-primary" : "btn-secondary"}`} onClick={() => cafe.setDraft({ ...cafe.draft, payment: "apple" })}>Apple Pay</button>
          {cafe.cards.map((c) => (
            <button key={c.id} className="row" onClick={() => cafe.setDraft({ ...cafe.draft, payment: "card" })}>
              <span style={{ flex: 1 }}>{c.brand} ••{c.last4}</span>
              {cafe.draft.payment === "card" && c.isDefault ? "Selected" : c.isDefault ? "Default" : ""}
            </button>
          ))}
          <button className="btn btn-plain" onClick={() => cafe.push({ name: "add-card" })}>Add new card</button>
          <button className={`btn ${cafe.draft.payment === "store" ? "btn-primary" : "btn-secondary"}`} onClick={() => cafe.setDraft({ ...cafe.draft, payment: "store" })}>Pay at store</button>
        </section>
        <section className="block">
          <h2 className="h-display">Tip</h2>
          <Seg label="Tip" value={cafe.draft.tipMode === "none" ? "None" : cafe.draft.tipMode === "custom" ? "Custom" : `${cafe.draft.tipMode}%`} options={["None", "10%", "15%", "20%", "Custom"]} onChange={(v) => cafe.setDraft({ ...cafe.draft, tipMode: v === "None" ? "none" : v === "Custom" ? "custom" : (v.replace("%", "") as "10" | "15" | "20") })} />
          {cafe.draft.tipMode === "custom" && (
            <input type="number" min={0} step="0.5" value={cafe.draft.customTip} aria-label="Custom tip" onChange={(e) => cafe.setDraft({ ...cafe.draft, customTip: Number(e.target.value) })} style={{ width: "100%", minHeight: 44, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "inherit", padding: "0 12px" }} />
          )}
        </section>
        <Totals />
        {err && <p style={{ color: "var(--danger)" }}>{err}</p>}
        <button className="btn btn-primary" onClick={() => setErr(cafe.placeOrder())}>Place Order · {money(cafe.math.total)}</button>
      </div>
    </Page>
  );
}

function TimeWheels() {
  const cafe = useCafe();
  const days = pickupDays();
  const [dayId, setDayId] = useState(days[0]?.id ?? "");
  const day = days.find((d) => d.id === dayId) ?? days[0];
  const slots = day ? pickupTimes(day.date) : [];
  return (
    <div className="block">
      <div className="hscroll" style={{ padding: 0 }}>
        {days.map((d) => (
          <button key={d.id} className={`chip ${d.id === dayId ? "on" : ""}`} onClick={() => setDayId(d.id)}>{d.label}</button>
        ))}
      </div>
      {slots.length === 0 ? <p className="hint">No more pickups that day.</p> : (
        <div className="inset" style={{ maxHeight: 180, overflow: "auto" }}>
          {slots.map((slot) => {
            const selected = cafe.draft.whenLabel === `${day?.label} · ${slot}`;
            return (
              <button key={slot} className="row" onClick={() => cafe.setDraft({ ...cafe.draft, whenLabel: `${day?.label} · ${slot}` })}>
                <span style={{ flex: 1, fontWeight: selected ? 700 : 500 }}>{slot}</span>
                <span style={{ color: "var(--accent-text)", fontWeight: 650 }}>{selected ? "Selected" : ""}</span>
              </button>
            );
          })}
        </div>
      )}
      <p className="hint">Times stay inside today’s hours. Selected: {cafe.draft.whenLabel}</p>
    </div>
  );
}

export function AddCardScreen() {
  const cafe = useCafe();
  const [form, setForm] = useState({ brand: "Visa", number: "", exp: "", cvc: "", name: cafe.profile?.name ?? "", zip: "99701", save: true });
  const [err, setErr] = useState<string | null>(null);
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <Page title="Add Card">
      <div style={{ padding: "8px 20px 28px" }}>
        <div className="inset">
          <label className="field"><span>Card number</span><input value={form.number} inputMode="numeric" onChange={(e) => set("number", e.target.value)} placeholder="4242 4242 4242 4242" /></label>
          <label className="field"><span>Expiry</span><input value={form.exp} onChange={(e) => set("exp", e.target.value)} placeholder="MM/YY" /></label>
          <label className="field"><span>CVC</span><input value={form.cvc} inputMode="numeric" onChange={(e) => set("cvc", e.target.value)} /></label>
          <label className="field"><span>Name on card</span><input value={form.name} onChange={(e) => set("name", e.target.value)} /></label>
          <label className="field"><span>Billing ZIP</span><input value={form.zip} onChange={(e) => set("zip", e.target.value)} /></label>
        </div>
        <label className="row"><input type="checkbox" checked={form.save} onChange={(e) => set("save", e.target.checked)} /> Save for future pickups</label>
        <p style={{ color: "var(--dim)", fontSize: 13 }}>Payments are shown as a secure preview. Card numbers stay on this phone only.</p>
        {err && <p style={{ color: "var(--danger)" }}>{err}</p>}
        <button className="btn btn-primary" onClick={() => {
          const digits = form.number.replace(/\D/g, "");
          if (digits.length < 13) return setErr("Enter a card number.");
          if (!/^\d{2}\/\d{2}$/.test(form.exp)) return setErr("Use MM/YY for expiry.");
          if (form.cvc.length < 3) return setErr("Enter the CVC.");
          cafe.addCard({ brand: form.brand, last4: digits.slice(-4), exp: form.exp, name: form.name, zip: form.zip });
        }}>Save Card</button>
      </div>
    </Page>
  );
}

export function ConfirmScreen({ orderId }: { orderId: string }) {
  const cafe = useCafe();
  const order = cafe.orders.find((o) => o.id === orderId);
  if (!order) return <Page title="Order"><Empty title="Order not found" body="Head home and check Orders." /></Page>;
  return (
    <Page title="Order">
    <div style={{ textAlign: "center" }} className="screen-pad">
      <div className="confetti" aria-hidden>
        {Array.from({ length: 18 }, (_, i) => (
          <i key={i} style={{ left: `${(i * 17) % 100}%`, background: i % 2 ? "#2463eb" : "#f4d35e", animationDelay: `${i * 0.05}s` }} />
        ))}
      </div>
      <div className="check-pop"><Icon name="check" /></div>
      <h1 className="h-display screen-title">You’re on the board</h1>
      <p className="lead">Order {order.number}<br />{order.pickupLabel}</p>
      <div className="card" style={{ textAlign: "left", padding: 14, marginTop: 8 }}>
        {order.lines.map((l) => <div key={l.lineId} style={{ marginBottom: 8 }}><strong>{l.qty}× {l.name}</strong><div style={{ color: "var(--dim)", fontSize: 13 }}>{l.summary}</div></div>)}
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Points earned</span><strong style={{ color: "var(--accent-text)" }}>+{order.pointsEarned}</strong></div>
      </div>
      <div className="actions">
        <button className="btn btn-primary" onClick={() => cafe.push({ name: "track", orderId: order.id })}>Track Order</button>
        <button className="btn btn-secondary" onClick={() => cafe.pushToast("Added to Calendar", `${order.number} · ${order.pickupLabel}`)}>Add to Calendar</button>
        <button className="btn btn-plain" onClick={() => { cafe.setTab("home"); cafe.pop(); }}>Back to Home</button>
      </div>
    </div>
    </Page>
  );
}

const STEPS: OrderStatus[] = ["received", "preparing", "ready", "picked-up"];
const STEP_LABEL = ["Order Received", "Preparing", "Ready for Pickup", "Picked Up"];

export function TrackScreen({ orderId }: { orderId: string }) {
  const cafe = useCafe();
  const order = cafe.orders.find((o) => o.id === orderId);
  if (!order) return <Page title="Tracking"><Empty title="No live order" body="Place a pickup and it will show up here." /></Page>;
  const idx = Math.max(0, STEPS.indexOf(order.status));
  return (
    <Page title="Live Order">
      <div style={{ padding: "8px 20px 28px" }}>
        <div className="card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: "var(--dim)" }}>{order.number}</div>
          <h1 className="h-display" style={{ fontSize: 28, margin: "4px 0" }}>{order.status === "ready" ? "It’s ready" : order.status === "cancelled" ? "Cancelled" : "We’re on it"}</h1>
          <p style={{ margin: 0, color: "var(--muted-foreground)" }}>{order.pickupLabel} · {cafe.cafe.address}</p>
        </div>
        <div className="timeline">
          {STEP_LABEL.map((label, i) => (
            <div key={label} className={`step ${i < idx ? "done" : ""} ${i === idx ? "now" : ""}`}>
              <i className="mark" />
              <strong>{label}</strong>
              {i === idx && order.status !== "cancelled" && <div style={{ color: "var(--dim)", fontSize: 13 }}>{order.status === "ready" ? "Pull up to Lane 2" : "Estimated soon"}</div>}
            </div>
          ))}
        </div>
        <MapCard />
        <div style={{ display: "grid", gap: 8 }}>
          <a className="btn btn-primary" href={cafe.cafe.maps}>Get Directions</a>
          <a className="btn btn-secondary" href={cafe.cafe.phoneHref}>Contact Café</a>
          {(order.status === "received" || order.status === "preparing") && (
            <button className="btn btn-plain" style={{ color: "var(--danger)" }} onClick={() => cafe.showAlert({ title: "Cancel this order?", message: "We’ll stop it if the bar hasn’t finished.", actions: [{ label: "Keep it", tone: "cancel" }, { label: "Cancel order", tone: "danger", run: () => cafe.cancelOrder(order.id) }] })}>Cancel order</button>
          )}
        </div>
      </div>
    </Page>
  );
}

export function MapCard() {
  const cafe = useCafe();
  return (
    <div className="card" style={{ overflow: "hidden", margin: "8px 0 14px" }}>
      <svg viewBox="0 0 360 150" role="img" aria-label="Map preview of Noble Street">
        <rect width="360" height="150" fill="#d9e2d2" />
        <path d="M0 80h360M40 0v150M180 0v150M300 20v110" stroke="#f7f4ee" strokeWidth="14" />
        <path d="M0 80h360M40 0v150" stroke="#c5beae" strokeWidth="2" />
        <circle cx="188" cy="78" r="8" fill="#2463eb" />
        <text x="200" y="74" fontSize="12" fill="#1c1917">Lane 2</text>
      </svg>
      <div style={{ padding: 12 }}>{cafe.cafe.address}, {cafe.cafe.city}</div>
    </div>
  );
}

export function ReceiptScreen({ orderId }: { orderId: string }) {
  const cafe = useCafe();
  const order = cafe.orders.find((o) => o.id === orderId);
  const [stars, setStars] = useState(order?.rating ?? 0);
  const [text, setText] = useState(order?.review ?? "");
  if (!order) return <Page title="Receipt"><Empty title="Missing receipt" body="That order isn’t on this phone." /></Page>;
  return (
    <Page title="Receipt">
      <div style={{ padding: "8px 20px 28px" }}>
        <img src={`${import.meta.env.BASE_URL}brand/logo-w.png`} alt="Forget Me Not Espresso" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover" }} />
        <h1 className="h-display" style={{ fontSize: 28, marginBottom: 0 }}>{order.number}</h1>
        <p style={{ color: "var(--dim)" }}>{new Date(order.createdAt).toLocaleString()} · {order.payment}</p>
        {order.lines.map((l) => (
          <div key={l.lineId} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <div><strong>{l.qty}× {l.name}</strong><div style={{ color: "var(--dim)", fontSize: 13 }}>{l.summary}</div></div>
            <span>{l.pending ? "Ask at café" : money(l.unit * l.qty)}</span>
          </div>
        ))}
        <TotalsLite order={order} />
        <button className="btn btn-primary" onClick={() => cafe.reorder(order)}>Reorder</button>
        <h2 className="h-display" style={{ fontSize: 22 }}>Rate this visit</h2>
        <Stars value={stars} onChange={setStars} />
        <textarea value={text} onChange={(e) => setText(e.target.value)} aria-label="Review" placeholder="How was the cup?" style={{ width: "100%", minHeight: 80, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "inherit", padding: 12 }} />
        <button className="btn btn-secondary" disabled={!stars} onClick={() => cafe.rateOrder(order.id, stars, text)}>Submit Review</button>
        <button className="btn btn-plain" onClick={() => cafe.push({ name: "help" })}>Help with this order</button>
      </div>
    </Page>
  );
}

function TotalsLite({ order }: { order: CafeOrder }) {
  return (
    <div style={{ margin: "12px 0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span>Discount</span><span>{money(order.discount)}</span></div>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span>Tax</span><span>{money(order.tax)}</span></div>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span>Tip</span><span>{money(order.tip)}</span></div>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}><span>Total</span><span>{money(order.total)}</span></div>
    </div>
  );
}
