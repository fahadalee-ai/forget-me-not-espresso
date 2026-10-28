import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  CAFE,
  DEFAULT_CONFIG,
  MENU,
  defaultSelection,
  getItem,
  greeting,
  isBirthdayWeek,
  isOpen,
  itemWindow,
  quote,
  summarize,
  type AddonConfig,
  type CategoryId,
  type ItemOverride,
  type MenuItem,
  type Selection,
} from "./menu";

export type Phase =
  | "splash"
  | "onboarding"
  | "welcome"
  | "login"
  | "register"
  | "forgot"
  | "otp"
  | "reset"
  | "permissions"
  | "app";

export type TabId = "home" | "menu" | "orders" | "rewards" | "profile";

export type Route =
  | { name: "root" }
  | { name: "category"; categoryId: CategoryId }
  | { name: "search" }
  | { name: "product"; itemId: string; lineId?: string }
  | { name: "favorites" }
  | { name: "checkout" }
  | { name: "add-card" }
  | { name: "confirm"; orderId: string }
  | { name: "track"; orderId: string }
  | { name: "receipt"; orderId: string }
  | { name: "deals" }
  | { name: "birthday" }
  | { name: "notifications" }
  | { name: "notif-settings" }
  | { name: "edit-profile" }
  | { name: "dietary" }
  | { name: "payments" }
  | { name: "reviews" }
  | { name: "settings" }
  | { name: "help" }
  | { name: "store" }
  | { name: "about" }
  | { name: "terms" };

export type CartLine = {
  lineId: string;
  itemId: string;
  name: string;
  category: CategoryId;
  summary: string;
  unit: number;
  pending: boolean;
  qty: number;
  selection: Selection;
};

export type OrderStatus = "received" | "preparing" | "ready" | "picked-up" | "cancelled";

export type CafeOrder = {
  id: string;
  number: string;
  email: string;
  name: string;
  phone: string;
  createdAt: number;
  pickupLabel: string;
  status: OrderStatus;
  lines: CartLine[];
  subtotal: number;
  discount: number;
  tax: number;
  tip: number;
  total: number;
  pointsEarned: number;
  pointsUsed: number;
  payment: string;
  rating?: number;
  review?: string;
};

export type Profile = {
  name: string;
  email: string;
  phone: string;
  birthday: string;
  password: string;
  guest: boolean;
  dietary: string[];
  faceId: boolean;
  points: number;
  birthdayRedeemed: boolean;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  at: string;
  group: "Today" | "Earlier";
  kind: "order" | "offer" | "new" | "loyalty" | "birthday";
  read: boolean;
};

export type Card = { id: string; brand: string; last4: string; exp: string; name: string; zip: string; isDefault: boolean };
export type Promo = {
  id: string;
  code: string;
  label: string;
  detail: string;
  type: "percent" | "amount";
  value: number;
  category?: CategoryId;
  active: boolean;
  ends: string;
};
export type Favorite = { itemId: string; selection: Selection };
export type Filters = { caffeineFree: boolean; dairyFree: boolean; hot: boolean; iced: boolean; sort: "popular" | "price" | "name" };
export type TipMode = "none" | "10" | "15" | "20" | "custom";
export type CheckoutDraft = {
  pickup: "asap" | "schedule";
  whenLabel: string;
  tipMode: TipMode;
  customTip: number;
  promoCode: string;
  promoId?: string;
  usePoints: number;
  useFreeDrink: boolean;
  useBirthday: boolean;
  payment: "apple" | "card" | "store";
  name: string;
  phone: string;
};
export type Toast = { id: number; title: string; body?: string };
export type AlertModel = {
  title: string;
  message?: string;
  actions: { label: string; tone?: "danger" | "bold" | "cancel"; run?: () => void }[];
};
export type Dir = "push" | "pop" | "fade";

const KEY = "fmn-espresso-v1";

const ALEX: Profile = {
  name: "Alex Morgan",
  email: "alex@forgetmenot.cafe",
  phone: "(907) 555-0142",
  birthday: "1996-10-30",
  password: "latte123",
  guest: false,
  dietary: ["Oat milk"],
  faceId: true,
  points: 340,
  birthdayRedeemed: false,
};

function lineFrom(item: MenuItem, sel: Selection, qty: number, cfg = DEFAULT_CONFIG): CartLine {
  const q = quote(item, sel, cfg);
  return {
    lineId: `l${Math.random().toString(36).slice(2, 9)}`,
    itemId: item.id,
    name: item.name,
    category: item.category,
    summary: summarize(item, sel),
    unit: q.unit,
    pending: q.pending,
    qty,
    selection: sel,
  };
}

function seedLine(id: string, patch: Partial<Selection>, qty = 1) {
  const item = getItem(id)!;
  return lineFrom(item, { ...defaultSelection(item), ...patch }, qty);
}

const seedOrders = (): CafeOrder[] => [
  {
    id: "o-live",
    number: "FMN-1048",
    email: ALEX.email,
    name: "Alex",
    phone: ALEX.phone,
    createdAt: Date.now() - 8 * 60 * 1000,
    pickupLabel: "ASAP · about 10–15 min",
    status: "preparing",
    lines: [seedLine("forget-me-not-latte", { temp: "iced", size: 16, milk: "Oat", sweetness: 50 })],
    subtotal: 7.75,
    discount: 0,
    tax: 0.43,
    tip: 1.16,
    total: 9.34,
    pointsEarned: 78,
    pointsUsed: 0,
    payment: "Apple Pay",
  },
  {
    id: "o-past-1",
    number: "FMN-1033",
    email: ALEX.email,
    name: "Alex",
    phone: ALEX.phone,
    createdAt: Date.now() - 26 * 60 * 60 * 1000,
    pickupLabel: "Yesterday · 8:10 AM",
    status: "picked-up",
    lines: [
      seedLine("cold-brew", { temp: "iced", size: 16, milk: "Oat", sweetness: 0 }),
      seedLine("breakfast-burrito", { variations: { meat: "Bacon" } }),
    ],
    subtotal: 14.5,
    discount: 0,
    tax: 0.8,
    tip: 2,
    total: 17.3,
    pointsEarned: 145,
    pointsUsed: 0,
    payment: "Visa ••4242",
    rating: 5,
    review: "Burrito was packed, cold brew was smooth. Lane 2 was empty.",
  },
  {
    id: "o-past-2",
    number: "FMN-1021",
    email: ALEX.email,
    name: "Alex",
    phone: ALEX.phone,
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    pickupLabel: "Mon · 7:40 AM",
    status: "picked-up",
    lines: [seedLine("latte", { temp: "hot", size: 12, milk: "Oat" })],
    subtotal: 3,
    discount: 0,
    tax: 0.17,
    tip: 0,
    total: 3.17,
    pointsEarned: 30,
    pointsUsed: 0,
    payment: "Apple Pay",
  },
];

const seedNotes = (): Note[] => [
  { id: "n1", title: "Your order is being made", body: "FMN-1048 · Forget Me Not Latte is on the bar.", at: "8 min ago", group: "Today", kind: "order", read: false },
  { id: "n2", title: "A birthday cup is waiting", body: "It’s your week. A free 12 oz latte is on the house.", at: "Today", group: "Today", kind: "birthday", read: false },
  { id: "n3", title: "New on the board", body: "Pink Rose Lotus and Pretty in Pink just landed.", at: "Today", group: "Today", kind: "new", read: false },
  { id: "n4", title: "You earned 145 points", body: "Yesterday’s pickup put you at 340. 60 to a free drink.", at: "Yesterday", group: "Earlier", kind: "loyalty", read: true },
  { id: "n5", title: "Morning 10% is live", body: "Use MORNING10 at checkout. Good through Sunday.", at: "Mon", group: "Earlier", kind: "offer", read: true },
  { id: "n6", title: "Order ready", body: "FMN-1033 was ready at the window. Thanks for pulling up.", at: "Yesterday", group: "Earlier", kind: "order", read: true },
];

const seedPromos = (): Promo[] => [
  { id: "p1", code: "MORNING10", label: "Morning 10%", detail: "10% off any order", type: "percent", value: 10, active: true, ends: "Sunday" },
  { id: "p2", code: "LOTUS2", label: "$2 off energy", detail: "$2 off when an energy drink is in the cart", type: "amount", value: 2, category: "energy", active: true, ends: "3 days" },
];

const emptyDraft = (profile?: Profile | null): CheckoutDraft => ({
  pickup: "asap",
  whenLabel: "ASAP · about 10–15 min",
  tipMode: "15",
  customTip: 0,
  promoCode: "",
  usePoints: 0,
  useFreeDrink: false,
  useBirthday: false,
  payment: "apple",
  name: profile && !profile.guest ? profile.name.split(" ")[0] ?? "" : "",
  phone: profile && !profile.guest ? profile.phone : "",
});

type Stacks = Record<TabId, Route[]>;
const rootStacks = (): Stacks => ({
  home: [{ name: "root" }],
  menu: [{ name: "root" }],
  orders: [{ name: "root" }],
  rewards: [{ name: "root" }],
  profile: [{ name: "root" }],
});

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export function cartMath(
  lines: CartLine[],
  draft: CheckoutDraft,
  cfg: AddonConfig,
  promos: Promo[],
  points: number,
) {
  const subtotal = round(lines.reduce((s, l) => s + (l.pending ? 0 : l.unit * l.qty), 0));
  const pending = lines.some((l) => l.pending);
  const promo = promos.find((p) => p.id === draft.promoId && p.active);
  let promoOff = 0;
  if (promo) {
    if (promo.category) {
      const base = lines.filter((l) => l.category === promo.category && !l.pending).reduce((s, l) => s + l.unit * l.qty, 0);
      promoOff = promo.type === "percent" ? base * (promo.value / 100) : Math.min(promo.value, base);
    } else {
      promoOff = promo.type === "percent" ? subtotal * (promo.value / 100) : Math.min(promo.value, subtotal);
    }
  }
  const drinkLines = lines.filter((l) => !l.pending && getItem(l.itemId)?.kind === "drink");
  let freeOff = 0;
  let pointsUsed = draft.usePoints;
  if (draft.useFreeDrink && points >= cfg.rewardPoints) {
    const eligible = [...drinkLines].sort((a, b) => b.unit - a.unit).find((l) => l.unit <= cfg.freeDrinkCap) ?? drinkLines[0];
    if (eligible) freeOff = Math.min(eligible.unit, cfg.freeDrinkCap);
    pointsUsed = cfg.rewardPoints;
  }
  const pointDollars = draft.useFreeDrink ? 0 : draft.usePoints / cfg.pointsPerDollarOff;
  let birthdayOff = 0;
  if (draft.useBirthday && drinkLines[0]) birthdayOff = Math.min(drinkLines[0].unit, 8);
  let discount = round(promoOff + freeOff + pointDollars + birthdayOff);
  if (discount > subtotal) discount = subtotal;
  const taxable = Math.max(0, round(subtotal - discount));
  const tax = round(taxable * cfg.taxRate);
  const rate = draft.tipMode === "10" ? 0.1 : draft.tipMode === "15" ? 0.15 : draft.tipMode === "20" ? 0.2 : 0;
  const tip = round(draft.tipMode === "custom" ? draft.customTip : taxable * rate);
  const total = round(taxable + tax + tip);
  const earned = Math.round(taxable * cfg.pointsPerDollar);
  return { subtotal, discount, tax, tip, total, earned, pending, promoOff: round(promoOff), freeOff, birthdayOff, pointDollars: round(pointDollars), pointsUsed: draft.useFreeDrink ? cfg.rewardPoints : draft.usePoints };
}

type Store = ReturnType<typeof useCafeState>;

const Ctx = createContext<Store | null>(null);

function useCafeState() {
  const [phase, setPhase] = useState<Phase>("splash");
  const [onboarded, setOnboarded] = useState(false);
  const [permsDone, setPermsDone] = useState(false);
  const [users, setUsers] = useState<Profile[]>([ALEX]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTabState] = useState<TabId>("home");
  const [stacks, setStacks] = useState<Stacks>(rootStacks);
  const [dir, setDir] = useState<Dir>("fade");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<CafeOrder[]>(seedOrders);
  const [favorites, setFavorites] = useState<Favorite[]>([
    { itemId: "forget-me-not-latte", selection: { ...defaultSelection(getItem("forget-me-not-latte")!), temp: "iced", size: 16, milk: "Oat" } },
    { itemId: "cold-brew", selection: { ...defaultSelection(getItem("cold-brew")!), milk: "Oat" } },
    { itemId: "blue-moon-latte", selection: defaultSelection(getItem("blue-moon-latte")!) },
  ]);
  const [notes, setNotes] = useState<Note[]>(seedNotes);
  const [cards, setCards] = useState<Card[]>([
    { id: "c1", brand: "Visa", last4: "4242", exp: "08/28", name: "Alex Morgan", zip: "99701", isDefault: true },
  ]);
  const [promos, setPromos] = useState<Promo[]>(seedPromos);
  const [config, setConfig] = useState<AddonConfig>(DEFAULT_CONFIG);
  const [overrides, setOverrides] = useState<Record<string, ItemOverride>>({
    "danish-cherry": { stock: 3 },
    "muffin-blueberry": { stock: 6 },
    "cinnamon-roll": { stock: 8 },
  });
  const [filters, setFilters] = useState<Filters>({ caffeineFree: false, dairyFree: false, hot: false, iced: false, sort: "popular" });
  const [draft, setDraft] = useState<CheckoutDraft>(emptyDraft());
  const [recent, setRecent] = useState<string[]>(["Cold brew", "Lotus"]);
  const [sheet, setSheet] = useState<null | "cart" | "filters" | "time" | "share" | "context">(null);
  const [contextItem, setContextItem] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertModel | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [appearance, setAppearance] = useState<"light" | "dark" | "system">("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [textScale, setTextScale] = useState(1);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<"orders" | "menu" | "inventory" | "promos" | "analytics" | "loyalty">("orders");
  const [notifPrefs, setNotifPrefs] = useState({ orders: true, promos: true, news: true, loyalty: true, email: false, sms: true });
  const [feedback, setFeedback] = useState<{ id: string; stars: number; text: string; at: string }[]>([
    { id: "f1", stars: 5, text: "Fast window, kind people, serious espresso.", at: "Last month" },
  ]);
  const [resetEmail, setResetEmail] = useState("");
  const hydrated = useRef(false);
  const onboardedRef = useRef(false);
  const profileRef = useRef<Profile | null>(null);
  const permsRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw) as {
          onboarded?: boolean;
          permsDone?: boolean;
          profile?: Profile | null;
          users?: Profile[];
          appearance?: "light" | "dark" | "system";
          textScale?: number;
          lines?: CartLine[];
          favorites?: Favorite[];
        };
        if (data.onboarded) {
          setOnboarded(true);
          onboardedRef.current = true;
        }
        if (data.permsDone) {
          setPermsDone(true);
          permsRef.current = true;
        }
        if (data.users?.length) setUsers(data.users);
        if (data.profile) {
          setProfile(data.profile);
          profileRef.current = data.profile;
          setDraft(emptyDraft(data.profile));
        }
        if (data.appearance) setAppearance(data.appearance);
        if (data.textScale) setTextScale(data.textScale);
        if (data.lines) setLines(data.lines);
        if (data.favorites) setFavorites(data.favorites);
      }
    } catch {
      /* keep seed */
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(
      KEY,
      JSON.stringify({ onboarded, permsDone, profile, users, appearance, textScale, lines, favorites }),
    );
  }, [onboarded, permsDone, profile, users, appearance, textScale, lines, favorites]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => {
      setPhase("onboarding");
    }, reduce ? 700 : 2600);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const apply = () => {
      if (appearance === "system") {
        setResolvedTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      } else setResolvedTheme(appearance);
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [appearance]);

  useEffect(() => {
    const live = orders.find((o) => o.status === "preparing" && o.id === "o-live");
    if (!live) return;
    const t = window.setTimeout(() => {
      setOrders((list) => list.map((o) => (o.id === "o-live" && o.status === "preparing" ? { ...o, status: "ready" } : o)));
      setNotes((list) => [
        { id: `n${Date.now()}`, title: "Your order is ready!", body: "FMN-1048 is at the window. Pull up to Lane 2.", at: "Now", group: "Today", kind: "order", read: false },
        ...list,
      ]);
      pushToast("Your order is ready!", "Pull up to Lane 2 — FMN-1048");
    }, 18000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushToast = (title: string, body?: string) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, title, body }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200);
  };

  const enterApp = (next: Profile) => {
    profileRef.current = next;
    setProfile(next);
    setDraft(emptyDraft(next));
    if (!permsRef.current && !next.guest) setPhase("permissions");
    else setPhase("app");
  };

  const route = stacks[tab][stacks[tab].length - 1] ?? { name: "root" as const };
  const myOrders = profile && !profile.guest ? orders.filter((o) => o.email === profile.email) : [];
  const activeOrder = myOrders.find((o) => o.status === "received" || o.status === "preparing" || o.status === "ready");
  const visibleMenu = MENU.filter((item) => !overrides[item.id]?.hidden);

  const api = useMemo(() => {
    const showAlert = (model: AlertModel) => setAlert(model);
    const haptic = (kind: "light" | "success") => {
      if (navigator.vibrate) navigator.vibrate(kind === "success" ? [12, 40, 16] : 10);
    };

    const push = (next: Route) => {
      setDir("push");
      setStacks((s) => ({ ...s, [tab]: [...s[tab], next] }));
    };
    const pop = () => {
      setDir("pop");
      setStacks((s) => ({ ...s, [tab]: s[tab].length > 1 ? s[tab].slice(0, -1) : s[tab] }));
    };
    const setTab = (next: TabId) => {
      setDir("fade");
      setTabState(next);
    };

    const addSelection = (item: MenuItem, sel: Selection, qty = 1, lineId?: string) => {
      if (overrides[item.id]?.soldOut) {
        pushToast("Sold out today", item.name);
        return;
      }
      if (!itemWindow(item).open) {
        pushToast("Not on the menu right now", itemWindow(item).label);
        return;
      }
      const built = lineFrom(item, sel, qty, config);
      if (overrides[item.id]?.priceDelta || overrides[item.id]?.flatPrice != null) {
        const q = quote(item, sel, config, overrides[item.id]);
        built.unit = q.unit;
        built.pending = q.pending;
      }
      setLines((list) => {
        if (lineId) return list.map((l) => (l.lineId === lineId ? { ...built, lineId } : l));
        return [...list, built];
      });
      haptic("light");
      pushToast(lineId ? "Order updated" : "Added to order", item.name);
    };

    const applyPromo = (code: string) => {
      const found = promos.find((p) => p.active && p.code.toLowerCase() === code.trim().toLowerCase());
      if (!found) {
        setDraft((d) => ({ ...d, promoCode: code, promoId: undefined }));
        return "That code isn’t active.";
      }
      if (found.category && !lines.some((l) => l.category === found.category)) {
        return `Add an ${found.category} item to use ${found.code}.`;
      }
      setDraft((d) => ({ ...d, promoCode: found.code, promoId: found.id }));
      pushToast("Promo applied", found.label);
      return null;
    };

    const placeOrder = () => {
      if (offline) return "You’re offline. Reconnect and try again.";
      if (!lines.length) return "Your cart is empty.";
      if (!draft.name.trim()) return "Add a name for the order.";
      if (draft.phone.replace(/\D/g, "").length < 10) return "Add a phone number so we can reach you.";
      if (!isOpen() && draft.pickup === "asap") return "We’re closed for ASAP. Schedule a pickup instead.";
      const math = cartMath(lines, draft, config, promos, profile?.points ?? 0);
      if ((draft.usePoints > 0 || draft.useFreeDrink) && (profile?.points ?? 0) < math.pointsUsed) return "Not enough points for that reward.";
      const order: CafeOrder = {
        id: `o${Date.now()}`,
        number: `FMN-${Math.floor(1000 + Math.random() * 9000)}`,
        email: profile?.email ?? "guest",
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        createdAt: Date.now(),
        pickupLabel: draft.whenLabel,
        status: "received",
        lines,
        subtotal: math.subtotal,
        discount: math.discount,
        tax: math.tax,
        tip: math.tip,
        total: math.total,
        pointsEarned: math.earned,
        pointsUsed: math.pointsUsed,
        payment: draft.payment === "apple" ? "Apple Pay" : draft.payment === "store" ? "Pay at store" : `Card ••${cards.find((c) => c.isDefault)?.last4 ?? "4242"}`,
      };
      setOrders((list) => [order, ...list]);
      setLines([]);
      if (profile && !profile.guest) {
        const nextPoints = profile.points - (draft.useFreeDrink ? config.rewardPoints : draft.usePoints) + math.earned;
        const next = { ...profile, points: Math.max(0, nextPoints), birthdayRedeemed: profile.birthdayRedeemed || draft.useBirthday };
        setProfile(next);
        setUsers((list) => list.map((u) => (u.email === next.email ? next : u)));
      }
      setDraft(emptyDraft(profile));
      setSheet(null);
      setTabState("home");
      setDir("fade");
      setStacks((s) => ({ ...s, home: [{ name: "root" }, { name: "confirm", orderId: order.id }] }));
      haptic("success");
      window.setTimeout(() => {
        setOrders((list) => list.map((o) => (o.id === order.id && o.status === "received" ? { ...o, status: "preparing" } : o)));
      }, 7000);
      window.setTimeout(() => {
        setOrders((list) => list.map((o) => (o.id === order.id && (o.status === "preparing" || o.status === "received") ? { ...o, status: "ready" } : o)));
        setNotes((list) => [
          { id: `n${Date.now()}`, title: "Your order is ready!", body: `${order.number} is at the window.`, at: "Now", group: "Today", kind: "order", read: false },
          ...list,
        ]);
        pushToast("Your order is ready!", order.number);
      }, 20000);
      return null;
    };

    return {
      phase,
      setPhase,
      onboarded,
      finishOnboarding: () => {
        setOnboarded(true);
        onboardedRef.current = true;
        if (!profileRef.current) setPhase("welcome");
        else if (!permsRef.current && !profileRef.current.guest) setPhase("permissions");
        else setPhase("app");
      },
      profile,
      users,
      login: (email: string, _password: string) => {
        const typed = email.trim().toLowerCase();
        const found = users.find((u) => u.email.toLowerCase() === typed) ?? users.find((u) => u.email === ALEX.email) ?? ALEX;
        enterApp({ ...found, guest: false });
      },
      loginApple: () => enterApp({ ...ALEX, ...users.find((u) => u.email === ALEX.email), guest: false }),
      continueGuest: () => enterApp({ ...ALEX, name: "Guest", guest: true, points: 0, email: "guest@local", dietary: [] }),
      register: (input: { name: string; email: string; phone: string; password: string; birthday: string; dietary: string[] }) => {
        const email = input.email.trim().toLowerCase() || `member${Date.now()}@forgetmenot.cafe`;
        const created: Profile = {
          name: input.name.trim() || "New member",
          email,
          phone: input.phone.trim(),
          password: input.password,
          birthday: input.birthday,
          guest: false,
          dietary: input.dietary,
          faceId: false,
          points: 25,
          birthdayRedeemed: false,
        };
        setUsers((list) => [...list.filter((u) => u.email.toLowerCase() !== email), created]);
        enterApp(created);
        pushToast("Welcome in", "25 points for joining.");
      },
      logout: () => {
        setProfile(null);
        profileRef.current = null;
        setPhase("welcome");
        setStacks(rootStacks());
        setAdminOpen(false);
      },
      updateProfile: (patch: Partial<Profile>) => {
        if (!profile) return;
        const next = { ...profile, ...patch };
        setProfile(next);
        setUsers((list) => list.map((u) => (u.email === profile.email ? next : u)));
      },
      resetEmail,
      sendReset: (email: string) => {
        setResetEmail(email.trim().toLowerCase());
        setPhase("otp");
      },
      verifyOtp: (_code: string) => {
        setPhase("reset");
      },
      setPassword: (password: string) => {
        setUsers((list) => list.map((u) => (u.email === resetEmail ? { ...u, password } : u)));
        pushToast("Password updated");
        setPhase("login");
      },
      permsDone,
      finishPerms: () => {
        setPermsDone(true);
        permsRef.current = true;
        setPhase("app");
      },
      tab,
      setTab,
      stacks,
      route,
      dir,
      push,
      pop,
      lines,
      addSelection,
      setQty: (lineId: string, qty: number) => setLines((list) => list.flatMap((l) => (l.lineId === lineId ? (qty <= 0 ? [] : [{ ...l, qty }]) : [l]))),
      removeLine: (lineId: string) => setLines((list) => list.filter((l) => l.lineId !== lineId)),
      orders,
      myOrders,
      activeOrder,
      cancelOrder: (id: string) => {
        setOrders((list) => list.map((o) => (o.id === id && (o.status === "received" || o.status === "preparing") ? { ...o, status: "cancelled" } : o)));
        pushToast("Order cancelled");
      },
      setOrderStatus: (id: string, status: OrderStatus) => setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o))),
      reorder: (order: CafeOrder) => {
        setLines((list) => [...list, ...order.lines.map((l) => ({ ...l, lineId: `l${Math.random().toString(36).slice(2, 9)}` }))]);
        pushToast("Added to your cart", order.number);
        if (!order.rating) {
          showAlert({
            title: "How was that visit?",
            message: "A few words help the bar. You can also skip it.",
            actions: [
              { label: "Not now", tone: "cancel" },
              { label: "Rate order", tone: "bold", run: () => { setTabState("orders"); setDir("push"); setStacks((s) => ({ ...s, orders: [{ name: "root" }, { name: "receipt", orderId: order.id }] })); } },
            ],
          });
        }
        setSheet("cart");
      },
      rateOrder: (id: string, rating: number, review: string) => {
        setOrders((list) => list.map((o) => (o.id === id ? { ...o, rating, review } : o)));
        pushToast("Thanks for the note");
      },
      favorites,
      isFavorite: (itemId: string) => favorites.some((f) => f.itemId === itemId),
      toggleFavorite: (itemId: string, sel?: Selection) => {
        setFavorites((list) => {
          const has = list.some((f) => f.itemId === itemId);
          if (has) return list.filter((f) => f.itemId !== itemId);
          const item = getItem(itemId);
          if (!item) return list;
          return [...list, { itemId, selection: sel ?? defaultSelection(item) }];
        });
        haptic("light");
      },
      notes,
      unread: notes.filter((n) => !n.read).length,
      markAll: () => setNotes((list) => list.map((n) => ({ ...n, read: true }))),
      markOne: (id: string) => setNotes((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n))),
      removeNote: (id: string) => setNotes((list) => list.filter((n) => n.id !== id)),
      notifPrefs,
      togglePref: (key: keyof typeof notifPrefs) => setNotifPrefs((p) => ({ ...p, [key]: !p[key] })),
      cards,
      addCard: (card: Omit<Card, "id" | "isDefault">) => {
        const id = `c${Date.now()}`;
        setCards((list) => [...list.map((c) => ({ ...c, isDefault: false })), { ...card, id, isDefault: true }]);
        pushToast("Card saved");
        pop();
      },
      removeCard: (id: string) => setCards((list) => list.filter((c) => c.id !== id)),
      config,
      setConfig,
      overrides,
      setOverride: (id: string, patch: ItemOverride) => setOverrides((map) => ({ ...map, [id]: { ...map[id], ...patch } })),
      promos,
      setPromos,
      filters,
      setFilters,
      draft,
      setDraft,
      applyPromo,
      placeOrder,
      recent,
      remember: (q: string) => setRecent((list) => [q, ...list.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6)),
      sheet,
      setSheet,
      contextItem,
      setContextItem,
      alert,
      showAlert,
      closeAlert: () => setAlert(null),
      toasts,
      pushToast,
      appearance,
      setAppearance,
      resolvedTheme,
      textScale,
      setTextScale,
      offline,
      setOffline,
      loading,
      refresh: () => {
        setLoading(true);
        window.setTimeout(() => {
          setLoading(false);
          if (offline) pushToast("Still offline", "We’ll keep your menu cached.");
          else pushToast("Menu updated");
        }, 800);
      },
      adminOpen,
      setAdminOpen,
      adminTab,
      setAdminTab,
      feedback,
      addFeedback: (stars: number, text: string) => setFeedback((list) => [{ id: `f${Date.now()}`, stars, text, at: "Just now" }, ...list]),
      visibleMenu,
      math: cartMath(lines, draft, config, promos, profile?.guest ? 0 : profile?.points ?? 0),
      openNow: isOpen(),
      hello: greeting(),
      birthdayWeek: Boolean(profile && !profile.guest && isBirthdayWeek(profile.birthday) && !profile.birthdayRedeemed),
      cafe: CAFE,
      adjustPoints: (delta: number) => {
        if (!profile || profile.guest) return;
        const next = { ...profile, points: Math.max(0, profile.points + delta) };
        setProfile(next);
        setUsers((list) => list.map((u) => (u.email === next.email ? next : u)));
      },
    };
  }, [
    phase, onboarded, profile, users, resetEmail, permsDone, tab, stacks, dir, lines, orders, myOrders, activeOrder,
    favorites, notes, notifPrefs, cards, config, overrides, promos, filters, draft, recent, sheet, contextItem, alert,
    toasts, appearance, resolvedTheme, textScale, offline, loading, adminOpen, adminTab, feedback, visibleMenu,
  ]);

  return api;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const value = useCafeState();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCafe() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCafe outside provider");
  return ctx;
}

export type Cafe = ReturnType<typeof useCafe>;
