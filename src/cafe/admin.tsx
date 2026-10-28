import { useMemo, useState } from "react";
import { asset } from "@/lib/utils";
import { CATEGORIES, MENU, money, priceLabel } from "./menu";
import { useCafe, type OrderStatus } from "./store";

const NAV = [
  ["orders", "Orders"],
  ["menu", "Menu"],
  ["inventory", "Inventory"],
  ["promos", "Promotions"],
  ["analytics", "Analytics"],
  ["loyalty", "Loyalty"],
] as const;

export function AdminApp() {
  const cafe = useCafe();
  return (
    <div className="admin">
      <div className="admin-grid">
        <aside className="side">
          <img src={asset("brand/logo-w.png")} alt="Forget Me Not Espresso" style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover" }} />
          <h1 className="h-display" style={{ fontSize: 26, color: "#faf7f2" }}>Café Admin</h1>
          <div style={{ display: "grid", gap: 4 }}>
            {NAV.map(([id, label]) => (
              <button key={id} className={cafe.adminTab === id ? "on" : ""} onClick={() => cafe.setAdminTab(id)}>{label}</button>
            ))}
          </div>
          <button style={{ marginTop: 16 }} onClick={() => cafe.setAdminOpen(false)}>Back to the app</button>
        </aside>
        <main>
          {cafe.adminTab === "orders" && <OrdersAdmin />}
          {cafe.adminTab === "menu" && <MenuAdmin />}
          {cafe.adminTab === "inventory" && <InventoryAdmin />}
          {cafe.adminTab === "promos" && <PromoAdmin />}
          {cafe.adminTab === "analytics" && <AnalyticsAdmin />}
          {cafe.adminTab === "loyalty" && <LoyaltyAdmin />}
        </main>
      </div>
    </div>
  );
}

function OrdersAdmin() {
  const cafe = useCafe();
  const statuses: OrderStatus[] = ["received", "preparing", "ready", "picked-up"];
  return (
    <section>
      <h2 className="h-display" style={{ fontSize: 32, marginTop: 0 }}>Order queue</h2>
      <div style={{ display: "grid", gap: 12 }}>
        {cafe.orders.filter((o) => o.status !== "cancelled").map((o) => (
          <article key={o.id} className="kpi">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <strong>{o.number}</strong>
              <span>{o.name} · {money(o.total)}</span>
            </div>
            <div style={{ color: "#c9c0b6", margin: "6px 0" }}>{o.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {statuses.map((s) => (
                <button key={s} className="chip" style={{ color: "#faf7f2", borderColor: o.status === s ? "#2463eb" : undefined, background: o.status === s ? "rgba(36,99,235,.3)" : "transparent" }} onClick={() => cafe.setOrderStatus(o.id, s)}>{s}</button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MenuAdmin() {
  const cafe = useCafe();
  const [q, setQ] = useState("");
  const items = MENU.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <section>
      <h2 className="h-display" style={{ fontSize: 32, marginTop: 0 }}>Menu</h2>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find an item" aria-label="Find an item" style={{ minHeight: 44, borderRadius: 8, border: "1px solid rgba(250,247,242,.15)", background: "#1c1917", color: "#faf7f2", padding: "0 12px", width: "min(320px, 100%)" }} />
      <div style={{ overflow: "auto" }}>
        <table className="table">
          <thead><tr><th>Item</th><th>Price</th><th>Ask price</th><th>Adjust</th><th>Available</th></tr></thead>
          <tbody>
            {items.map((item) => {
              const ov = cafe.overrides[item.id] ?? {};
              return (
                <tr key={item.id}>
                  <td>{item.name}<div style={{ color: "#a3988d", fontSize: 12 }}>{CATEGORIES.find((c) => c.id === item.category)?.name}</div></td>
                  <td>{priceLabel(item, ov)}</td>
                  <td>
                    {(item.ask || item.flat == null && item.kind !== "drink") && (
                      <input
                        type="number"
                        step="0.25"
                        placeholder="Set $"
                        value={ov.flatPrice ?? ""}
                        onChange={(e) => cafe.setOverride(item.id, { flatPrice: e.target.value === "" ? null : Number(e.target.value) })}
                      />
                    )}
                  </td>
                  <td>
                    {item.kind === "drink" && (
                      <input type="number" step="0.25" value={ov.priceDelta ?? 0} onChange={(e) => cafe.setOverride(item.id, { priceDelta: Number(e.target.value) })} />
                    )}
                  </td>
                  <td>
                    <input type="checkbox" checked={!ov.hidden && !ov.soldOut} aria-label={`${item.name} available`} onChange={(e) => cafe.setOverride(item.id, { soldOut: !e.target.checked, hidden: false })} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InventoryAdmin() {
  const cafe = useCafe();
  return (
    <section>
      <h2 className="h-display" style={{ fontSize: 32, marginTop: 0 }}>Inventory</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {MENU.map((item) => {
          const stock = cafe.overrides[item.id]?.stock ?? 40;
          const low = stock < 10;
          return (
            <div key={item.id} className="kpi" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <strong>{item.name}</strong>
                {low && <div style={{ color: "#f0c27a" }}>Low stock</div>}
              </div>
              <input type="number" value={stock} aria-label={`${item.name} stock`} onChange={(e) => cafe.setOverride(item.id, { stock: Number(e.target.value) })} />
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="checkbox" checked={!cafe.overrides[item.id]?.soldOut} onChange={(e) => cafe.setOverride(item.id, { soldOut: !e.target.checked })} />
                On menu
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PromoAdmin() {
  const cafe = useCafe();
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState(10);
  return (
    <section>
      <h2 className="h-display" style={{ fontSize: 32, marginTop: 0 }}>Promotions</h2>
      <div className="kpi" style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <strong>New coupon</strong>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code" aria-label="Code" style={{ minHeight: 40, borderRadius: 8, border: "1px solid rgba(250,247,242,.15)", background: "#1c1917", color: "#faf7f2", padding: "0 8px" }} />
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" aria-label="Label" style={{ minHeight: 40, borderRadius: 8, border: "1px solid rgba(250,247,242,.15)", background: "#1c1917", color: "#faf7f2", padding: "0 8px" }} />
        <label>Percent off <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} style={{ width: 80 }} /></label>
        <button className="btn btn-primary" onClick={() => {
          if (!code || !label) return;
          cafe.setPromos([...cafe.promos, { id: `p${Date.now()}`, code: code.toUpperCase(), label, detail: `${value}% off`, type: "percent", value, active: true, ends: "This month" }]);
          setCode(""); setLabel("");
        }}>Schedule promo</button>
      </div>
      {cafe.promos.map((p) => (
        <article key={p.id} className="kpi" style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", gap: 8 }}>
          <div><strong>{p.code}</strong><div style={{ color: "#c9c0b6" }}>{p.detail} · {p.ends}</div></div>
          <button className="chip" style={{ color: "#faf7f2" }} onClick={() => cafe.setPromos(cafe.promos.map((x) => x.id === p.id ? { ...x, active: !x.active } : x))}>{p.active ? "Pause" : "Activate"}</button>
        </article>
      ))}
    </section>
  );
}

function AnalyticsAdmin() {
  const cafe = useCafe();
  const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const bars = [8, 18, 22, 14, 9, 11, 16, 12, 7, 4];
  const top = useMemo(() => {
    const counts = new Map<string, number>();
    cafe.orders.forEach((o) => o.lines.forEach((l) => counts.set(l.name, (counts.get(l.name) ?? 0) + l.qty)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [cafe.orders]);
  const max = Math.max(...bars);
  return (
    <section>
      <h2 className="h-display" style={{ fontSize: 32, marginTop: 0 }}>Sales</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <div className="kpi"><div style={{ color: "#c9c0b6" }}>Orders</div><div className="h-display" style={{ fontSize: 28 }}>{cafe.orders.length}</div></div>
        <div className="kpi"><div style={{ color: "#c9c0b6" }}>Sales</div><div className="h-display" style={{ fontSize: 28 }}>{money(cafe.orders.reduce((s, o) => s + o.total, 0))}</div></div>
        <div className="kpi"><div style={{ color: "#c9c0b6" }}>Peak</div><div className="h-display" style={{ fontSize: 28 }}>8 AM</div></div>
      </div>
      <div className="kpi">
        <strong>Orders by hour</strong>
        <svg viewBox="0 0 320 120" role="img" aria-label="Orders by hour">
          {bars.map((n, i) => (
            <g key={hours[i]}>
              <rect x={i * 32 + 6} y={100 - (n / max) * 80} width="18" height={(n / max) * 80} rx="4" fill="#2463eb" />
              <text x={i * 32 + 8} y="116" fontSize="9" fill="#c9c0b6">{hours[i]}</text>
            </g>
          ))}
        </svg>
      </div>
      <h3 className="h-display">Bestsellers</h3>
      {top.map(([name, count]) => (
        <div key={name} style={{ display: "grid", gridTemplateColumns: "140px 1fr 24px", gap: 8, alignItems: "center", marginBottom: 6 }}>
          <span>{name}</span>
          <div className="progress"><i style={{ width: `${(count / (top[0]?.[1] ?? 1)) * 100}%` }} /></div>
          <span>{count}</span>
        </div>
      ))}
      <p style={{ color: "#c9c0b6" }}>Guests lean oat milk and iced specialty lattes before 9, then energy drinks late morning.</p>
    </section>
  );
}

function LoyaltyAdmin() {
  const cafe = useCafe();
  return (
    <section>
      <h2 className="h-display" style={{ fontSize: 32, marginTop: 0 }}>Loyalty rules</h2>
      <div className="kpi" style={{ display: "grid", gap: 10 }}>
        <label>Points per dollar <input type="number" value={cafe.config.pointsPerDollar} onChange={(e) => cafe.setConfig({ ...cafe.config, pointsPerDollar: Number(e.target.value) })} /></label>
        <label>Points for a free drink <input type="number" value={cafe.config.rewardPoints} onChange={(e) => cafe.setConfig({ ...cafe.config, rewardPoints: Number(e.target.value) })} /></label>
        <label>Free drink cap $ <input type="number" value={cafe.config.freeDrinkCap} onChange={(e) => cafe.setConfig({ ...cafe.config, freeDrinkCap: Number(e.target.value) })} /></label>
        <label>Tax rate <input type="number" step="0.005" value={cafe.config.taxRate} onChange={(e) => cafe.setConfig({ ...cafe.config, taxRate: Number(e.target.value) })} /></label>
        <label>Alt milk upcharge <input type="number" step="0.25" value={cafe.config.milkAlt} onChange={(e) => cafe.setConfig({ ...cafe.config, milkAlt: Number(e.target.value) })} /></label>
        <label>Syrup pump <input type="number" step="0.25" value={cafe.config.syrupPump} onChange={(e) => cafe.setConfig({ ...cafe.config, syrupPump: Number(e.target.value) })} /></label>
        <label>Extra shot <input type="number" step="0.25" value={cafe.config.extraShot} onChange={(e) => cafe.setConfig({ ...cafe.config, extraShot: Number(e.target.value) })} /></label>
      </div>
      <div className="kpi" style={{ marginTop: 12 }}>
        <strong>{cafe.profile?.name ?? "No member signed in"}</strong>
        <p>{cafe.profile?.points ?? 0} points · birthday reward {cafe.profile?.birthdayRedeemed ? "redeemed" : "available in their birthday week"}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => cafe.adjustPoints(50)}>+50 points</button>
          <button className="btn btn-secondary" onClick={() => cafe.adjustPoints(-50)}>−50 points</button>
        </div>
      </div>
    </section>
  );
}
