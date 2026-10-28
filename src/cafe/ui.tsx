import { useEffect, useState, type ReactNode } from "react";
import { asset } from "@/lib/utils";
import { useCafe, type TabId } from "./store";
import { CATEGORIES, type CategoryId } from "./menu";

export function Photo({
  id,
  category,
  alt,
  className,
}: {
  id: string;
  category?: CategoryId;
  alt: string;
  className?: string;
}) {
  const { overrides } = useCafe();
  const cat = category ? CATEGORIES.find((c) => c.id === category)?.photo : "cat-espresso";
  const fallback = asset(`photos/${cat}.jpg`);
  const primary = overrides[id]?.photo || asset(`photos/${id}.jpg`);
  const [src, setSrc] = useState(primary);
  useEffect(() => setSrc(primary), [primary]);
  return (
    <img
      src={src}
      alt={alt}
      className={className ?? "photo"}
      onError={() => {
        if (src !== fallback) setSrc(fallback);
      }}
    />
  );
}

export function Logo({ className, light = true }: { className?: string; light?: boolean }) {
  return (
    <img
      src={asset(light ? "brand/logo-w.png" : "brand/logo.png")}
      alt="Forget Me Not Espresso"
      className={className}
    />
  );
}

export function Icon({ name, filled = false }: { name: string; filled?: boolean }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: filled ? "currentColor" : "none", stroke: "currentColor", strokeWidth: filled ? 0 : 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "home":
      return <svg {...common}><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" fill={filled ? "currentColor" : "none"} /></svg>;
    case "cup":
      return <svg {...common}><path d="M6 8h10v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8h2z" /><path d="M16 9h2.2A2.8 2.8 0 0 1 21 11.8 2.8 2.8 0 0 1 18.2 14.5H16" /><path d="M8 3.5c.4 1 .2 1.8-.2 2.6M12 3.5c.4 1 .2 1.8-.2 2.6" /></svg>;
    case "receipt":
      return <svg {...common}><path d="M6 3h12v18l-2-1.2L14 21l-2-1.2L10 21l-2-1.2L6 21z" fill={filled ? "currentColor" : "none"} /><path d="M9 8h6M9 12h6M9 16h3" stroke={filled ? "var(--background)" : "currentColor"} /></svg>;
    case "gift":
      return <svg {...common}><rect x="4" y="10" width="16" height="9" rx="1.4" /><path d="M4 10h16V8H4zM12 8v11" /><path d="M12 8c-2 0-3.5-2.2-2.2-3.4C11 3.4 12 5.2 12 8zM12 8c2 0 3.5-2.2 2.2-3.4C13 3.4 12 5.2 12 8z" /></svg>;
    case "person":
      return <svg {...common}><circle cx="12" cy="8" r="3.2" fill={filled ? "currentColor" : "none"} /><path d="M5.5 19.2c1.2-3 3.4-4.4 6.5-4.4s5.3 1.4 6.5 4.4" /></svg>;
    case "bell":
      return <svg {...common}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.2 1.6H4.8z" /><path d="M10 18.5a2 2 0 0 0 4 0" /></svg>;
    case "search":
      return <svg {...common}><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>;
    case "back":
      return <svg width="14" height="22" viewBox="0 0 14 22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M11 3 3 11l8 8" /></svg>;
    case "heart":
      return <svg {...common}><path d="M12 19s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" fill={filled ? "currentColor" : "none"} /></svg>;
    case "plus":
      return <svg {...common}><path d="M12 6v12M6 12h12" /></svg>;
    case "bag":
      return <svg {...common}><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8V7a3 3 0 0 1 6 0v1" /></svg>;
    case "star":
      return <svg {...common}><path d="m12 3 2.4 5.2L20 9.2l-4 3.8.9 5.5L12 16.8 7.1 18.5 8 13 4 9.2l5.6-1z" fill={filled ? "currentColor" : "none"} /></svg>;
    case "close":
      return <svg {...common}><path d="m7 7 10 10M17 7 7 17" /></svg>;
    case "check":
      return <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round"><path d="M8 18.5 15 25l13-14" /></svg>;
    case "sliders":
      return <svg {...common}><path d="M4 8h16M4 16h10" /><circle cx="16" cy="16" r="2" /><circle cx="8" cy="8" r="2" /></svg>;
    default:
      return null;
  }
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "menu", label: "Menu", icon: "cup" },
  { id: "orders", label: "Orders", icon: "receipt" },
  { id: "rewards", label: "Rewards", icon: "gift" },
  { id: "profile", label: "Profile", icon: "person" },
];

export function StatusBar() {
  const cafe = useCafe();
  const [time, setTime] = useState("9:41");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);
  const active = cafe.activeOrder;
  const label = active ? (active.status === "ready" ? "Ready" : active.status === "preparing" ? "Preparing" : "Received") : "";
  return (
    <div className="status">
      <div className="status-time">{time}</div>
      <button
        className={`island ${active ? "live" : ""}`}
        aria-label={active ? `${label}. Open live tracking` : "Dynamic Island"}
        onClick={() => active && cafe.push({ name: "track", orderId: active.id })}
      >
        {active ? (
          <span className="island-live">
            <i className="dot" />
            {label}
          </span>
        ) : null}
      </button>
      <div className="status-icons" aria-hidden>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="0.6" opacity="0.45" /><rect x="4.5" y="5" width="3" height="7" rx="0.6" opacity="0.7" /><rect x="9" y="2.5" width="3" height="9.5" rx="0.6" /><rect x="13.5" y="0" width="3" height="12" rx="0.6" /></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 4.5c4-3.5 10-3.5 14 0" /><path d="M3.5 7c2.6-2 6.4-2 9 0" /><path d="M6.2 9.4c1.2-.9 2.4-.9 3.6 0" /></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" fill="none" /><rect x="2" y="2" width="14" height="8" rx="1" fill="currentColor" /><rect x="22.5" y="3.5" width="1.6" height="5" rx="0.5" fill="currentColor" /></svg>
      </div>
    </div>
  );
}

export function TabBar() {
  const cafe = useCafe();
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((tab) => (
        <button key={tab.id} className={`tab ${cafe.tab === tab.id ? "on" : ""}`} onClick={() => cafe.setTab(tab.id)} aria-current={cafe.tab === tab.id ? "page" : undefined}>
          <Icon name={tab.icon} filled={cafe.tab === tab.id} />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export function NavBar({
  title,
  showTitle = true,
  solid = true,
  onBack,
  trailing,
}: {
  title: string;
  showTitle?: boolean;
  solid?: boolean;
  onBack?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <header className={`nav-sticky ${solid ? "solid" : ""}`}>
      <div className="nav-row">
        {onBack ? (
          <button className="back-btn" onClick={onBack} aria-label="Back">
            <Icon name="back" />
          </button>
        ) : (
          <span className="nav-side" />
        )}
        <div className={`nav-title ${showTitle ? "show" : ""}`}>{title}</div>
        <div className="nav-side">{trailing}</div>
      </div>
    </header>
  );
}

export function Page({
  title,
  large,
  trailing,
  children,
  onRefresh,
}: {
  title: string;
  large?: boolean;
  trailing?: ReactNode;
  children: ReactNode;
  onRefresh?: () => void;
}) {
  const cafe = useCafe();
  const [compact, setCompact] = useState(false);
  const [pull, setPull] = useState(0);
  const canBack = cafe.stacks[cafe.tab].length > 1;
  const showTabs = cafe.route.name === "root";
  return (
    <div
      className="page"
      onScroll={(e) => setCompact(e.currentTarget.scrollTop > 28)}
      onTouchStart={(e) => {
        if (e.currentTarget.scrollTop <= 0) setPull(0);
      }}
      onTouchEnd={() => {
        if (pull > 64 && onRefresh) onRefresh();
        setPull(0);
      }}
      onTouchMove={(e) => {
        const top = e.currentTarget.scrollTop;
        if (top <= 0) setPull((n) => Math.min(80, n + 8));
      }}
    >
      <NavBar
        title={title}
        solid={compact || !large}
        showTitle={compact || !large}
        onBack={canBack ? () => cafe.pop() : undefined}
        trailing={trailing}
      />
      {large && <h1 className="large-title">{title}</h1>}
      {cafe.loading && <div className="skel" style={{ height: 88, margin: "0 20px 12px" }} />}
      {children}
      <div style={{ height: showTabs ? 110 : 48 }} />
    </div>
  );
}

export function Empty({ title, body, action, onAction }: { title: string; body: string; action?: string; onAction?: () => void }) {
  const { resolvedTheme } = useCafe();
  return (
    <div style={{ textAlign: "center", padding: "28px 28px 8px" }}>
      <img src={asset(resolvedTheme === "dark" ? "brand/logo-w.png" : "brand/logo.png")} alt="" style={{ width: 92, height: 92, objectFit: "cover", borderRadius: "50%", margin: "0 auto 12px" }} />
      <h2 className="h-display" style={{ fontSize: 22, margin: "0 0 6px" }}>{title}</h2>
      <p style={{ color: "var(--muted-foreground)", margin: 0, fontSize: 15, lineHeight: 1.45 }}>{body}</p>
      {action && (
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

export function Overlay() {
  const cafe = useCafe();
  return (
    <>
      {cafe.offline && <div className="offline">Offline · menu is saved on this phone</div>}
      <div className="toast-wrap">
        {cafe.toasts.map((t) => (
          <div key={t.id} className="toast" role="status">
            <strong style={{ display: "block", fontSize: 15 }}>{t.title}</strong>
            {t.body && <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>{t.body}</span>}
          </div>
        ))}
      </div>
      {cafe.alert && (
        <div className="alert-backdrop" onClick={() => cafe.closeAlert()}>
          <div className="alert" role="alertdialog" aria-label={cafe.alert.title} onClick={(e) => e.stopPropagation()}>
            <h3>{cafe.alert.title}</h3>
            {cafe.alert.message && <p>{cafe.alert.message}</p>}
            <div className="alert-actions">
              {cafe.alert.actions.map((a) => (
                <button
                  key={a.label}
                  className={a.tone === "danger" ? "danger" : a.tone === "bold" ? "bold" : ""}
                  onClick={() => {
                    cafe.closeAlert();
                    a.run?.();
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {cafe.contextItem && (
        <button className="sheet-backdrop" aria-label="Dismiss" onClick={() => cafe.setContextItem(null)} style={{ background: "transparent" }} />
      )}
    </>
  );
}

export function Switch({ on, label, onToggle }: { on: boolean; label: string; onToggle: () => void }) {
  return (
    <button className={`switch ${on ? "on" : ""}`} role="switch" aria-checked={on} aria-label={label} onClick={onToggle}>
      <i />
    </button>
  );
}

export function Seg({ value, options, onChange, label }: { value: string; options: string[]; onChange: (v: string) => void; label: string }) {
  return (
    <div className="seg" role="tablist" aria-label={label}>
      {options.map((opt) => (
        <button key={opt} role="tab" aria-selected={value === opt} className={value === opt ? "on" : ""} onClick={() => onChange(opt)}>
          {opt}
        </button>
      ))}
    </div>
  );
}

export function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 4 }} role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => onChange?.(n)} style={{ border: 0, background: "transparent", color: n <= value ? "#e6b15a" : "var(--dim)", minWidth: 44, minHeight: 44 }}>
          <Icon name="star" filled={n <= value} />
        </button>
      ))}
    </div>
  );
}
