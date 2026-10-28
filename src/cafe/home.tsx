import { useState } from "react";
import { asset } from "@/lib/utils";
import { CATEGORIES, MENU, defaultSelection, money, priceLabel, type MenuItem } from "./menu";
import { useCafe } from "./store";
import { Icon, Page, Photo } from "./ui";

const HEROES = [
  { id: "forget-me-not-latte", photo: "hero-latte.jpg", kicker: "Signature", title: "Forget Me Not Latte", text: "Dark chocolate, vanilla, amaretto." },
  { id: "lotus-energy", photo: "hero-energy.jpg", kicker: "Energy", title: "Lotus, your way", text: "Blue, pink, gold — over ice." },
  { id: "breakfast-burrito", photo: "hero-breakfast.jpg", kicker: "From the window", title: "Breakfast, packed", text: "Burritos until the lunch box takes over." },
];

export function HomeScreen() {
  const cafe = useCafe();
  const [hero, setHero] = useState(0);
  const name = cafe.profile?.guest ? "there" : cafe.profile?.name.split(" ")[0] ?? "there";
  const points = cafe.profile && !cafe.profile.guest ? cafe.profile.points : 0;
  const goal = cafe.config.rewardPoints;
  const open = cafe.openNow;
  const slide = HEROES[hero] ?? HEROES[0]!;

  return (
    <Page
      title={`${cafe.hello}, ${name}`}
      large
      onRefresh={cafe.refresh}
      trailing={
        <button className="icon-btn" aria-label={`Notifications${cafe.unread ? `, ${cafe.unread} unread` : ""}`} onClick={() => cafe.push({ name: "notifications" })}>
          <Icon name="bell" />
          {cafe.unread > 0 && <span className="badge">{cafe.unread}</span>}
        </button>
      }
    >
      <div style={{ padding: "0 20px 8px" }}>
        <button className="inset" style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, minHeight: 44, padding: "0 12px", color: "var(--dim)" }} onClick={() => cafe.push({ name: "search" })}>
          <Icon name="search" />
          Search drinks and food
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr .9fr", gap: 10, padding: "12px 20px" }}>
        <button className="card" style={{ textAlign: "left", padding: 14, color: "inherit" }} onClick={() => cafe.push({ name: "store" })}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--dim)" }}>PICKUP</div>
          <div className="h-display" style={{ fontSize: 18, marginTop: 4 }}>{cafe.cafe.name.replace(" Espresso", "")}</div>
          <div style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "4px 0 8px" }}>Today {open ? "until close" : "· closed"}</div>
          <span className="chip on" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <i style={{ width: 8, height: 8, borderRadius: 99, background: open ? "#34c759" : "#ff9f0a" }} />
            {open ? "Open" : "Closed"}
          </span>
          <div className="btn btn-primary" style={{ marginTop: 12, minHeight: 40, fontSize: 15 }} onClick={(e) => { e.stopPropagation(); cafe.setTab("menu"); }}>Order for pickup</div>
        </button>
        <button className="card" style={{ textAlign: "left", padding: 14, color: "inherit" }} onClick={() => cafe.setTab("rewards")}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--dim)" }}>POINTS</div>
          <div className="h-display" style={{ fontSize: 28, color: "var(--accent-text)" }}>{points}</div>
          <div className="progress" style={{ margin: "8px 0" }}><i style={{ width: `${Math.min(100, (points / goal) * 100)}%` }} /></div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{Math.max(0, goal - points)} to a free drink</div>
        </button>
      </div>

      {cafe.activeOrder && (
        <button className="card" style={{ margin: "0 20px 8px", padding: 14, textAlign: "left", color: "inherit", width: "calc(100% - 40px)" }} onClick={() => cafe.push({ name: "track", orderId: cafe.activeOrder!.id })}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <strong>Order {cafe.activeOrder.number}</strong>
            <span style={{ color: "var(--accent-text)", fontWeight: 700, textTransform: "capitalize" }}>{cafe.activeOrder.status.replace("-", " ")}</span>
          </div>
          <div style={{ color: "var(--muted-foreground)", fontSize: 14, marginTop: 4 }}>{cafe.activeOrder.lines.map((l) => l.name).join(", ")}</div>
          <div style={{ marginTop: 8, fontSize: 13 }}>Track live pickup</div>
        </button>
      )}

      <div style={{ padding: "8px 20px" }}>
        <button className="card" style={{ padding: 0, overflow: "hidden", width: "100%", color: "inherit", textAlign: "left" }} onClick={() => cafe.push({ name: "product", itemId: slide.id })}>
          <div style={{ position: "relative", height: 180 }}>
            <img src={asset(`photos/${slide.photo}`)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,16,14,.82), transparent 60%)" }} />
            <div style={{ position: "absolute", left: 14, bottom: 12, color: "white" }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4 }}>{slide.kicker.toUpperCase()}</div>
              <div className="h-display" style={{ fontSize: 26 }}>{slide.title}</div>
              <div style={{ opacity: 0.85 }}>{slide.text}</div>
            </div>
          </div>
        </button>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>
          {HEROES.map((_, n) => (
            <button key={n} aria-label={`Special ${n + 1}`} onClick={() => setHero(n)} style={{ width: n === hero ? 16 : 7, height: 7, borderRadius: 99, border: 0, background: n === hero ? "var(--accent)" : "var(--fill)" }} />
          ))}
        </div>
      </div>

      <div className="hscroll" style={{ paddingTop: 8 }}>
        {CATEGORIES.map((c) => (
          <button key={c.id} className="chip" onClick={() => { cafe.setTab("menu"); cafe.push({ name: "category", categoryId: c.id }); }}>{c.name.replace(" Drinks", "").replace(" & Lunch", "")}</button>
        ))}
      </div>

      <Rail title="Featured Drinks" items={MENU.filter((i) => i.featured && i.kind === "drink")} />
      <Rail title="Bestsellers" items={MENU.filter((i) => i.bestseller)} />
      <Rail title="New Arrivals" items={MENU.filter((i) => i.newer)} />
      <OrderAgain />
      <Rail title="Your Favorites" items={cafe.favorites.map((f) => MENU.find((i) => i.id === f.itemId)).filter((i): i is MenuItem => Boolean(i))} empty="Save a drink with the heart and it lives here." />
      <Deals />
      <Rail title="Energy & Lotus" items={MENU.filter((i) => i.category === "energy" && (i.featured || i.bestseller || i.newer)).slice(0, 8)} />
      <Rail title="Breakfast & Lunch" items={MENU.filter((i) => i.category === "food").slice(0, 8)} />
    </Page>
  );
}

function Rail({ title, items, empty }: { title: string; items: MenuItem[]; empty?: string }) {
  const cafe = useCafe();
  if (!items.length) {
    return (
      <section>
        <div className="section-label">{title}</div>
        <p style={{ margin: "0 20px", color: "var(--dim)" }}>{empty}</p>
      </section>
    );
  }
  return (
    <section>
      <div className="section-label">
        {title}
        <button className="linkish" onClick={() => cafe.setTab("menu")}>See all</button>
      </div>
      <div className="hscroll">
        {items.map((item) => (
          <DrinkCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export function DrinkCard({ item, wide = false }: { item: MenuItem; wide?: boolean }) {
  const cafe = useCafe();
  const fav = cafe.isFavorite(item.id);
  return (
    <article style={{ width: wide ? "100%" : 168, flex: "none" }}>
      <div style={{ position: "relative", height: wide ? 180 : 148, borderRadius: 10, overflow: "hidden" }}>
        <button onClick={() => cafe.push({ name: "product", itemId: item.id })} style={{ border: 0, padding: 0, background: "transparent", width: "100%", height: "100%" }} aria-label={item.name}>
          <Photo id={item.id} category={item.category} alt={item.name} className="photo" />
        </button>
        <button className="icon-btn" aria-label={fav ? `Remove ${item.name} from favorites` : `Favorite ${item.name}`} style={{ position: "absolute", top: 2, right: 2, color: fav ? "#ff6b81" : "white", background: "rgba(0,0,0,.28)", borderRadius: 8 }} onClick={() => cafe.toggleFavorite(item.id)}>
          <Icon name="heart" filled={fav} />
        </button>
        <button className="icon-btn" aria-label={`Add ${item.name}`} style={{ position: "absolute", right: 6, bottom: 6, background: "var(--accent)", color: "white", borderRadius: 8 }} onClick={() => {
          const saved = cafe.favorites.find((f) => f.itemId === item.id)?.selection;
          cafe.addSelection(item, saved ?? defaultSelection(item));
        }}>
          <Icon name="plus" />
        </button>
      </div>
      <button onClick={() => cafe.push({ name: "product", itemId: item.id })} style={{ border: 0, background: "transparent", color: "inherit", textAlign: "left", padding: "8px 2px 0", width: "100%" }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</div>
        <div style={{ color: "var(--dim)", fontSize: 13, lineHeight: 1.3, minHeight: 34 }}>{item.short}</div>
        <div style={{ color: "var(--accent-text)", fontWeight: 700, marginTop: 2 }}>{priceLabel(item, cafe.overrides[item.id])}</div>
      </button>
    </article>
  );
}

function OrderAgain() {
  const cafe = useCafe();
  const past = cafe.myOrders.filter((o) => o.status === "picked-up");
  if (!cafe.profile || cafe.profile.guest || !past.length) return null;
  return (
    <section>
      <div className="section-label">Order Again</div>
      <div className="hscroll">
        {past.map((order) => (
          <button key={order.id} className="card" style={{ width: 220, padding: 12, textAlign: "left", color: "inherit", flex: "none" }} onClick={() => cafe.reorder(order)}>
            <strong>{order.lines.map((l) => l.name).join(" + ")}</strong>
            <div style={{ color: "var(--dim)", fontSize: 13, margin: "4px 0 8px" }}>{money(order.total)}</div>
            <span style={{ color: "var(--accent-text)", fontWeight: 700 }}>Reorder</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Deals() {
  const cafe = useCafe();
  return (
    <section>
      <div className="section-label">
        Member Deals
        <button className="linkish" onClick={() => cafe.push({ name: "deals" })}>See all</button>
      </div>
      <div className="hscroll">
        {cafe.promos.filter((p) => p.active).map((p) => (
          <button key={p.id} className="card" style={{ width: 240, padding: 14, textAlign: "left", color: "inherit", flex: "none" }} onClick={() => cafe.push({ name: "deals" })}>
            <div style={{ color: "var(--accent-text)", fontWeight: 800 }}>{p.code}</div>
            <div className="h-display" style={{ fontSize: 20 }}>{p.label}</div>
            <div style={{ color: "var(--dim)", fontSize: 13 }}>{p.detail} · ends {p.ends}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
