import { useMemo, useRef, useState } from "react";
import {
  ADDONS,
  CATEGORIES,
  MENU,
  SYRUPS,
  TRENDING,
  canBeDairyFree,
  defaultSelection,
  itemWindow,
  milkChoices,
  money,
  priceLabel,
  quote,
  sizesFor,
  summarize,
  upchargeLabel,
  type MenuItem,
  type Selection,
  type Size,
  type Temp,
} from "./menu";
import { useCafe } from "./store";
import { DrinkCard } from "./home";
import { Empty, Icon, Page, Photo, Seg } from "./ui";

export function MenuScreen() {
  const cafe = useCafe();
  return (
    <Page
      title="Menu"
      large
      onRefresh={cafe.refresh}
      trailing={
        <button className="icon-btn" aria-label="Cart" onClick={() => cafe.setSheet("cart")}>
          <Icon name="bag" />
          {cafe.lines.length > 0 && <span className="badge">{cafe.lines.reduce((s, l) => s + l.qty, 0)}</span>}
        </button>
      }
    >
      <div style={{ padding: "0 20px 10px" }}>
        <button className="inset" style={{ width: "100%", display: "flex", gap: 8, alignItems: "center", minHeight: 44, padding: "0 12px", color: "var(--dim)" }} onClick={() => cafe.push({ name: "search" })}>
          <Icon name="search" /> Search the menu
        </button>
      </div>
      <div className="hscroll" style={{ position: "sticky", top: 98, zIndex: 15, background: "var(--background)", paddingTop: 6, paddingBottom: 8 }}>
        {CATEGORIES.map((c) => (
          <button key={c.id} className="chip" onClick={() => cafe.push({ name: "category", categoryId: c.id })}>{c.name}</button>
        ))}
        <button className="chip" onClick={() => cafe.setSheet("filters")}>Dietary filters</button>
      </div>
      <div style={{ display: "grid", gap: 12, padding: "8px 20px 20px" }}>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => cafe.push({ name: "category", categoryId: c.id })} style={{ border: 0, padding: 0, borderRadius: 10, overflow: "hidden", position: "relative", height: 128, textAlign: "left", color: "white" }}>
            <img src={`${import.meta.env.BASE_URL}photos/${c.photo}.jpg`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(16,12,10,.78), rgba(16,12,10,.05))" }} />
            <div style={{ position: "absolute", left: 14, bottom: 12 }}>
              <div className="h-display" style={{ fontSize: 26 }}>{c.name}</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>{c.blurb}</div>
            </div>
          </button>
        ))}
      </div>
    </Page>
  );
}

export function CategoryScreen({ categoryId }: { categoryId: MenuItem["category"] }) {
  const cafe = useCafe();
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  const items = useFiltered(cafe.visibleMenu.filter((i) => i.category === categoryId), cafe.filters, cafe.profile?.dietary ?? []);
  return (
    <Page
      title={cat?.name ?? "Menu"}
      trailing={<button className="icon-btn" aria-label="Sort and filter" onClick={() => cafe.setSheet("filters")}><Icon name="sliders" /></button>}
    >
      {categoryId === "baked" && (
        <div className="card" style={{ margin: "0 20px 16px", padding: 12, fontSize: 14, color: "var(--muted-foreground)" }}>
          Daily selection. Seasonal bakes rotate — prices are confirmed at the café and can be edited in Admin.
        </div>
      )}
      {cafe.loading ? (
        <div style={{ display: "grid", gap: 10, padding: "8px 20px 24px" }}>{[0, 1, 2].map((n) => <div key={n} className="skel" style={{ height: 92 }} />)}</div>
      ) : items.length === 0 ? (
        <Empty title="Nothing in this filter" body="Try clearing caffeine or dairy filters." action="Reset filters" onAction={() => cafe.setFilters({ caffeineFree: false, dairyFree: false, hot: false, iced: false, sort: "popular" })} />
      ) : (
        <div style={{ display: "grid", gap: 14, padding: "4px 20px 24px" }}>
          {items.map((item) => <MenuRow key={item.id} item={item} />)}
        </div>
      )}
    </Page>
  );
}

function MenuRow({ item }: { item: MenuItem }) {
  const cafe = useCafe();
  const windowed = itemWindow(item);
  const sold = cafe.overrides[item.id]?.soldOut;
  const fav = cafe.isFavorite(item.id);
  const hold = useRef<number | null>(null);
  const openMenu = () => {
    cafe.setContextItem(item.id);
    cafe.setSheet("context");
  };
  return (
    <article
      className="card"
      style={{ display: "grid", gridTemplateColumns: "104px 1fr", gap: 10, padding: 8, opacity: windowed.open && !sold ? 1 : 0.55 }}
      onContextMenu={(e) => { e.preventDefault(); openMenu(); }}
      onPointerDown={() => { hold.current = window.setTimeout(openMenu, 480); }}
      onPointerUp={() => { if (hold.current) window.clearTimeout(hold.current); }}
      onPointerLeave={() => { if (hold.current) window.clearTimeout(hold.current); }}
    >
      <button onClick={() => cafe.push({ name: "product", itemId: item.id })} style={{ border: 0, padding: 0, background: "transparent", borderRadius: 8, overflow: "hidden", height: 104 }}>
        <Photo id={item.id} category={item.category} alt={item.name} />
      </button>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
          <button onClick={() => cafe.push({ name: "product", itemId: item.id })} style={{ border: 0, background: "transparent", color: "inherit", textAlign: "left", fontWeight: 700, fontSize: 16, padding: 0 }}>{item.name}</button>
          <button className="icon-btn" aria-label="Favorite" onClick={() => cafe.toggleFavorite(item.id)} style={{ color: fav ? "#ff6b81" : "var(--dim)" }}><Icon name="heart" filled={fav} /></button>
        </div>
        <div style={{ color: "var(--dim)", fontSize: 13, lineHeight: 1.35 }}>{item.short}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <div>
            <strong style={{ color: "var(--accent-text)" }}>{priceLabel(item, cafe.overrides[item.id])}</strong>
            {item.caffeineFree && <div style={{ fontSize: 12, color: "var(--success)" }}>Caffeine-free</div>}
            {!windowed.open && <div style={{ fontSize: 12 }}>{windowed.label}</div>}
            {sold && <div style={{ fontSize: 12 }}>Sold out</div>}
          </div>
          <button className="icon-btn" aria-label={`Add ${item.name}`} disabled={!windowed.open || Boolean(sold)} style={{ background: "var(--accent)", color: "white", borderRadius: 8 }} onClick={() => cafe.addSelection(item, defaultSelection(item))}>
            <Icon name="plus" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function SearchScreen() {
  const cafe = useCafe();
  const [q, setQ] = useState("");
  const [scope, setScope] = useState("All");
  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return cafe.visibleMenu.filter((item) => {
      if (scope === "Drinks" && item.kind !== "drink") return false;
      if (scope === "Food" && item.kind === "drink") return false;
      if (!query) return false;
      return `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query);
    });
  }, [q, scope, cafe.visibleMenu]);
  return (
    <Page title="Search">
      <div style={{ padding: "4px 20px 12px" }}>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Drinks, food, syrups" aria-label="Search" style={{ width: "100%", minHeight: 44, borderRadius: 8, border: 0, background: "var(--fill)", color: "inherit", padding: "0 12px", fontSize: 17 }} />
        <div style={{ marginTop: 10 }}><Seg label="Scope" value={scope} options={["All", "Drinks", "Food"]} onChange={setScope} /></div>
      </div>
      {!q && (
        <div style={{ padding: "0 20px" }}>
          <div style={{ fontWeight: 700, margin: "8px 0" }}>Recent</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {cafe.recent.map((r) => <button key={r} className="chip" onClick={() => setQ(r)}>{r}</button>)}
          </div>
          <div style={{ fontWeight: 700, margin: "16px 0 8px" }}>Trending</div>
          {TRENDING.map((t) => (
            <button key={t} className="row" style={{ paddingLeft: 0 }} onClick={() => setQ(t)}>{t}</button>
          ))}
        </div>
      )}
      {q && results.length === 0 && <Empty title="No matches" body={`Nothing for “${q}”. Try latte, lotus, or burrito.`} />}
      <div style={{ display: "grid", gap: 12, padding: "8px 20px 24px" }}>
        {results.map((item) => <MenuRow key={item.id} item={item} />)}
      </div>
    </Page>
  );
}

export function ProductScreen({ itemId, lineId }: { itemId: string; lineId?: string }) {
  const cafe = useCafe();
  const item = MENU.find((i) => i.id === itemId);
  const existing = cafe.lines.find((l) => l.lineId === lineId);
  const [sel, setSel] = useState<Selection>(() => existing?.selection ?? (item ? defaultSelection(item) : defaultSelection(MENU[0]!)));
  const [qty, setQty] = useState(existing?.qty ?? 1);
  if (!item) return <Page title="Menu"><Empty title="Item unavailable" body="It may have been removed in Admin." /></Page>;
  const windowed = itemWindow(item);
  const sold = cafe.overrides[item.id]?.soldOut;
  const q = quote(item, sel, cafe.config, cafe.overrides[item.id]);
  const sizes = item.kind === "drink" ? sizesFor(item, sel.temp) : [];
  const fav = cafe.isFavorite(item.id);
  const set = (patch: Partial<Selection>) => setSel((s) => ({ ...s, ...patch }));

  const switchTemp = (temp: Temp) => {
    const nextSizes = sizesFor(item, temp);
    const size = (nextSizes.includes(sel.size) ? sel.size : nextSizes[0] ?? sel.size) as Size;
    set({ temp, size });
  };

  return (
    <>
    <Page
      title={item.name}
      trailing={<button className="icon-btn" aria-label="Favorite" onClick={() => cafe.toggleFavorite(item.id, sel)} style={{ color: fav ? "#ff6b81" : "var(--dim)" }}><Icon name="heart" filled={fav} /></button>}
    >
      <div style={{ height: 240 }}>
        <Photo id={item.id} category={item.category} alt={item.name} className="photo" />
      </div>
      <div className="screen-pad product-body">
        <h1 className="h-display" style={{ fontSize: 32, margin: "8px 0 12px" }}>{item.name}</h1>
        <p className="lead">{item.description}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          {item.caffeineFree && <span className="chip on">Caffeine Free</span>}
          {item.seasonal && <span className="chip">Seasonal</span>}
          {item.signature && <span className="chip on">Signature</span>}
          {!windowed.open && <span className="chip">{windowed.label}</span>}
        </div>

        {item.temps.length > 1 && (
          <Block title="Temperature">
            <Seg label="Temperature" value={sel.temp === "hot" ? "Hot" : "Iced"} options={["Hot", "Iced"]} onChange={(v) => switchTemp(v === "Hot" ? "hot" : "iced")} />
          </Block>
        )}
        {sizes.length > 0 && (
          <Block title="Size">
            {sizes.map((size) => {
              const amount = (sel.temp === "hot" ? item.hot : item.iced)?.[size];
              return (
                <label key={size} className="row" style={{ paddingLeft: 0 }}>
                  <input type="radio" name="size" checked={sel.size === size} onChange={() => set({ size })} />
                  <span style={{ flex: 1 }}>{size} oz</span>
                  <strong>{amount != null ? money(amount) : ""}</strong>
                </label>
              );
            })}
          </Block>
        )}
        {item.variations?.map((v) => (
          <Block key={v.id} title={v.label}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {v.options.map((opt) => (
                <button key={opt} className={`chip ${sel.variations[v.id] === opt ? "on" : ""}`} onClick={() => set({ variations: { ...sel.variations, [v.id]: opt } })}>{opt}</button>
              ))}
            </div>
          </Block>
        ))}
        {item.milks && (
          <Block title="Milk">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {milkChoices(item).map((milk) => (
                <button key={milk} className={`chip ${sel.milk === milk ? "on" : ""}`} onClick={() => set({ milk })}>{milk}</button>
              ))}
            </div>
            <p className="hint">{upchargeLabel(cafe.config.milkAlt)} for oat, almond, or coconut · half-and-half {upchargeLabel(cafe.config.halfAndHalf)}</p>
          </Block>
        )}
        {item.sweetness && (
          <Block title="Sweetness">
            <Seg label="Sweetness" value={`${sel.sweetness}%`} options={["0%", "25%", "50%", "75%", "100%"]} onChange={(v) => set({ sweetness: Number(v.replace("%", "")) })} />
          </Block>
        )}
        {item.syrups && (
          <Block title="Syrups">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 220, overflow: "auto" }}>
              {SYRUPS.map((name) => {
                const found = sel.syrups.find((s) => s.name === name);
                return (
                  <button key={name} className={`chip ${found ? "on" : ""}`} onClick={() => {
                    if (found) set({ syrups: sel.syrups.filter((s) => s.name !== name) });
                    else set({ syrups: [...sel.syrups, { name, pumps: 1 }] });
                  }}>{name}{found ? ` ×${found.pumps}` : ""}</button>
                );
              })}
            </div>
            {sel.syrups.map((s) => (
              <div key={s.name} className="row" style={{ paddingLeft: 0 }}>
                <span style={{ flex: 1 }}>{s.name}</span>
                <Stepper value={s.pumps} onChange={(pumps) => set({ syrups: pumps <= 0 ? sel.syrups.filter((x) => x.name !== s.name) : sel.syrups.map((x) => x.name === s.name ? { ...x, pumps } : x) })} />
              </div>
            ))}
            <p className="hint">Each pump {upchargeLabel(cafe.config.syrupPump)}</p>
          </Block>
        )}
        {item.shots && (
          <Block title="Extra espresso shots">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{upchargeLabel(cafe.config.extraShot)} each</span>
              <Stepper value={sel.shots} onChange={(shots) => set({ shots: Math.max(0, shots) })} />
            </div>
          </Block>
        )}
        {item.addonMode !== "none" && (
          <Block title="Add-ons">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ADDONS.filter((a) => a.mode === item.addonMode).map((a) => (
                <button key={a.id} className={`chip ${sel.addons.includes(a.id) ? "on" : ""}`} onClick={() => set({ addons: sel.addons.includes(a.id) ? sel.addons.filter((id) => id !== a.id) : [...sel.addons, a.id] })}>
                  {a.name}
                </button>
              ))}
            </div>
            <p className="hint">{upchargeLabel(0)} until a price is set in Admin</p>
          </Block>
        )}
        <Block title="Special instructions">
          <textarea value={sel.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Light ice, extra hot, sauce on the side…" aria-label="Special instructions" className="notes" />
        </Block>
        <p className="hint product-summary">{summarize(item, sel)}</p>
      </div>
    </Page>
    <div className="dock">
      <div className="dock-row">
        <Stepper value={qty} onChange={(n) => setQty(Math.max(1, n))} />
        <button
          className="btn btn-primary"
          style={{ flex: 1, width: "auto" }}
          disabled={!windowed.open || Boolean(sold)}
          onClick={() => {
            cafe.addSelection(item, sel, qty, lineId);
            cafe.pop();
          }}
        >
          {sold ? "Sold out" : !windowed.open ? "Unavailable" : `${lineId ? "Update Order" : "Add to Order"} — ${q.pending ? "Ask at café" : money(q.unit * qty)}`}
        </button>
      </div>
    </div>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="option">
      <h2 className="h-display">{title}</h2>
      {children}
    </section>
  );
}

export function Stepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="stepper" aria-label="Quantity">
      <button aria-label="Decrease" onClick={() => onChange(value - 1)}>−</button>
      <strong style={{ minWidth: 16, textAlign: "center" }}>{value}</strong>
      <button aria-label="Increase" onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

export function FavoritesScreen() {
  const cafe = useCafe();
  const items = cafe.favorites.map((f) => ({ fav: f, item: MENU.find((i) => i.id === f.itemId) })).filter((x) => x.item);
  return (
    <Page title="Favorites" large>
      {items.length === 0 ? (
        <Empty title="No saved drinks yet" body="Tap the heart on anything you want waiting here, customizations included." action="Browse the menu" onAction={() => cafe.setTab("menu")} />
      ) : (
        <div style={{ display: "grid", gap: 12, padding: "8px 20px 24px" }}>
          {items.map(({ fav, item }) => item && (
            <article key={item.id} className="card" style={{ padding: 10, display: "grid", gridTemplateColumns: "84px 1fr", gap: 10 }}>
              <Photo id={item.id} category={item.category} alt={item.name} />
              <div>
                <strong>{item.name}</strong>
                <div style={{ color: "var(--dim)", fontSize: 13 }}>{summarize(item, fav.selection)}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button className="btn btn-primary" style={{ minHeight: 40, width: "auto", padding: "0 14px" }} onClick={() => cafe.addSelection(item, fav.selection)}>Order this</button>
                  <button className="btn btn-plain" style={{ width: "auto" }} onClick={() => cafe.toggleFavorite(item.id)}>Remove</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Page>
  );
}

export function FilterSheet() {
  const cafe = useCafe();
  if (cafe.sheet !== "filters") return null;
  const f = cafe.filters;
  const set = (patch: Partial<typeof f>) => cafe.setFilters({ ...f, ...patch });
  return (
    <>
      <button className="sheet-backdrop" aria-label="Close filters" onClick={() => cafe.setSheet(null)} />
      <div className="sheet medium" role="dialog" aria-label="Filters">
        <div className="grabber" />
        <div className="sheet-body">
          <h2 className="h-display" style={{ fontSize: 28, marginTop: 0 }}>Filters</h2>
          <Seg label="Sort" value={f.sort === "popular" ? "Popular" : f.sort === "price" ? "Price" : "Name"} options={["Popular", "Price", "Name"]} onChange={(v) => set({ sort: v === "Price" ? "price" : v === "Name" ? "name" : "popular" })} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            <button className={`chip ${f.caffeineFree ? "on" : ""}`} onClick={() => set({ caffeineFree: !f.caffeineFree })}>Caffeine-free</button>
            <button className={`chip ${f.dairyFree ? "on" : ""}`} onClick={() => set({ dairyFree: !f.dairyFree })}>Dairy-free options</button>
            <button className={`chip ${f.hot ? "on" : ""}`} onClick={() => set({ hot: !f.hot, iced: false })}>Hot</button>
            <button className={`chip ${f.iced ? "on" : ""}`} onClick={() => set({ iced: !f.iced, hot: false })}>Iced</button>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => cafe.setSheet(null)}>Show menu</button>
        </div>
      </div>
    </>
  );
}

function useFiltered(items: MenuItem[], filters: { caffeineFree: boolean; dairyFree: boolean; hot: boolean; iced: boolean; sort: "popular" | "price" | "name" }, dietary: string[]) {
  return useMemo(() => {
    let list = items.filter((item) => {
      if (filters.caffeineFree && !item.caffeineFree) return false;
      if (filters.dairyFree && !canBeDairyFree(item)) return false;
      if (filters.hot && !item.temps.includes("hot")) return false;
      if (filters.iced && !item.temps.includes("iced")) return false;
      if (dietary.includes("Caffeine-free") && item.kind === "drink" && !item.caffeineFree && filters.caffeineFree) return false;
      return true;
    });
    if (filters.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (filters.sort === "price") list = [...list].sort((a, b) => minPrice(a) - minPrice(b));
    if (filters.sort === "popular") list = [...list].sort((a, b) => score(b) - score(a));
    return list;
  }, [items, filters, dietary]);
}

function score(item: MenuItem) {
  return (item.signature ? 4 : 0) + (item.bestseller ? 2 : 0) + (item.featured ? 1 : 0);
}
function minPrice(item: MenuItem) {
  if (item.flat != null) return item.flat;
  const nums = [...Object.values(item.hot ?? {}), ...Object.values(item.iced ?? {})];
  return nums.length ? Math.min(...nums) : 999;
}

export function ShareSheet() {
  const cafe = useCafe();
  if (cafe.sheet !== "share" || !cafe.contextItem) return null;
  const item = MENU.find((i) => i.id === cafe.contextItem);
  if (!item) return null;
  const close = () => { cafe.setSheet(null); cafe.setContextItem(null); };
  const text = `${item.name} at Forget Me Not Espresso — ${item.short}`;
  return (
    <>
      <button className="sheet-backdrop" aria-label="Dismiss share" onClick={close} />
      <div className="sheet medium" role="dialog" aria-label="Share">
        <div className="grabber" />
        <div className="sheet-body">
          <h2 className="h-display" style={{ fontSize: 24, marginTop: 0 }}>Share {item.name}</h2>
          <button className="row" onClick={() => { navigator.clipboard?.writeText(text); cafe.pushToast("Copied"); close(); }}>Copy</button>
          <button className="row" onClick={() => { cafe.pushToast("Ready for Messages", text); close(); }}>Messages</button>
          <button className="row" onClick={() => { cafe.pushToast("Share sheet opened"); close(); }}>More</button>
          <button className="row" onClick={close}>Cancel</button>
        </div>
      </div>
    </>
  );
}

export function ContextSheet() {
  const cafe = useCafe();
  if (cafe.sheet !== "context" || !cafe.contextItem) return null;
  const item = MENU.find((i) => i.id === cafe.contextItem);
  if (!item) return null;
  const close = () => { cafe.setSheet(null); cafe.setContextItem(null); };
  return (
    <>
      <button className="sheet-backdrop" aria-label="Dismiss" onClick={close} />
      <div className="sheet medium" role="menu" aria-label={item.name}>
        <div className="grabber" />
        <div className="sheet-body">
          <h2 className="h-display" style={{ fontSize: 24, marginTop: 0 }}>{item.name}</h2>
          <button className="row" onClick={() => { cafe.toggleFavorite(item.id); close(); }}>Favorite</button>
          <button className="row" onClick={() => { cafe.addSelection(item, defaultSelection(item)); close(); }}>Add to Order</button>
          <button className="row" onClick={() => { cafe.setSheet("share"); }}>Share</button>
          <button className="row" onClick={close}>Cancel</button>
        </div>
      </div>
    </>
  );
}
