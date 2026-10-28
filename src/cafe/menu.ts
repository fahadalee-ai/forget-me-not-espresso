export type CategoryId =
  | "espresso"
  | "specialty"
  | "hot"
  | "cold"
  | "soda"
  | "energy"
  | "food"
  | "baked";

export type Size = 8 | 12 | 16 | 20 | 24 | 32;
export type Temp = "hot" | "iced";

export type Variation = { id: string; label: string; options: string[] };

export type MenuItem = {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  short: string;
  hot?: Partial<Record<Size, number>>;
  iced?: Partial<Record<Size, number>>;
  flat?: number | null;
  ask?: "cafe" | "barista";
  temps: Temp[];
  defaultTemp?: Temp;
  caffeineFree?: boolean;
  dairyFree?: boolean;
  signature?: boolean;
  featured?: boolean;
  bestseller?: boolean;
  newer?: boolean;
  seasonal?: boolean;
  milks: boolean;
  milkOptional?: boolean;
  defaultMilk?: string;
  sweetness: boolean;
  syrups: boolean;
  shots: boolean;
  addonMode: "drink" | "food" | "none";
  variations?: Variation[];
  window?: { start: string; end: string; label: string };
  kind: "drink" | "food" | "baked";
};

export type Selection = {
  temp: Temp;
  size: Size;
  milk: string;
  sweetness: number;
  syrups: { name: string; pumps: number }[];
  shots: number;
  addons: string[];
  variations: Record<string, string>;
  notes: string;
};

export type AddonConfig = {
  milkAlt: number;
  halfAndHalf: number;
  syrupPump: number;
  extraShot: number;
  addons: Record<string, number>;
  taxRate: number;
  pointsPerDollar: number;
  pointsPerDollarOff: number;
  rewardPoints: number;
  freeDrinkCap: number;
};

export type ItemOverride = {
  hidden?: boolean;
  soldOut?: boolean;
  flatPrice?: number | null;
  priceDelta?: number;
  stock?: number;
  photo?: string;
};

const HOT = (a: number, b: number, c: number, d: number) =>
  ({ 8: a, 12: b, 16: c, 20: d }) as Partial<Record<Size, number>>;
const ICED = (a: number, b: number, c: number, d: number) =>
  ({ 16: a, 20: b, 24: c, 32: d }) as Partial<Record<Size, number>>;

export const MILKS = ["1%", "Half and Half", "Oat", "Almond", "Coconut"] as const;
export const SWEETNESS = [0, 25, 50, 75, 100] as const;

export const SYRUPS = [
  "Vanilla",
  "French Vanilla",
  "Caramel",
  "Salted Caramel",
  "Hazelnut",
  "Peanut Butter",
  "Macadamia Nut",
  "Amaretto",
  "Irish Cream",
  "Peppermint",
  "Lavender",
  "Cherry",
  "Raspberry",
  "Strawberry",
  "Coconut",
  "Blueberry",
  "Blue Raspberry",
  "Watermelon",
  "Toasted Marshmallow",
  "Peach",
  "White Peach",
  "Pineapple",
  "Mango",
  "Orange",
  "Lemon",
  "Lime",
  "Huckleberry",
  "Green Apple",
  "Kiwi",
  "Passion Fruit",
  "Guava",
  "Honey",
];

export const ADDONS: { id: string; name: string; mode: "drink" | "food" }[] = [
  { id: "cold-foam", name: "Cold foam", mode: "drink" },
  { id: "drizzle-chocolate", name: "Chocolate drizzle", mode: "drink" },
  { id: "drizzle-white", name: "White chocolate drizzle", mode: "drink" },
  { id: "drizzle-caramel", name: "Caramel drizzle", mode: "drink" },
  { id: "sprinkles", name: "Sprinkles", mode: "drink" },
  { id: "whipped-cream", name: "Whipped cream", mode: "drink" },
  { id: "edible-glitter", name: "Edible glitter", mode: "drink" },
  { id: "cinnamon", name: "Cinnamon powder", mode: "drink" },
  { id: "honey", name: "Honey", mode: "drink" },
  { id: "guacamole", name: "Guacamole", mode: "food" },
];

export const DEFAULT_CONFIG: AddonConfig = {
  milkAlt: 0,
  halfAndHalf: 0,
  syrupPump: 0,
  extraShot: 0,
  addons: Object.fromEntries(ADDONS.map((a) => [a.id, 0])),
  taxRate: 0.055,
  pointsPerDollar: 10,
  pointsPerDollarOff: 100,
  rewardPoints: 400,
  freeDrinkCap: 8,
};

const chai: Variation[] = [{ id: "chai", label: "Chai", options: ["Spiced", "Vanilla", "Raspberry"] }];
const tea: Variation[] = [
  { id: "tea", label: "Tea", options: ["Earl Grey", "Vanilla Bean", "Green Tea", "Raspberry Hibiscus", "Chamomile"] },
];
const mocha: Variation[] = [{ id: "chocolate", label: "Chocolate", options: ["Dark", "White"] }];
const meat: Variation[] = [{ id: "meat", label: "Protein", options: ["Sausage", "Bacon", "Turkey", "Ham"] }];
const bagel: Variation[] = [
  { id: "bagel", label: "Bagel", options: ["Plain", "Wheat", "Cheddar", "Jalapeño Cheddar", "Cinnamon Raisin"] },
];
const bread: Variation[] = [{ id: "bread", label: "Bread", options: ["Bagel", "English Muffin"] }];
const sauce: Variation[] = [{ id: "sauce", label: "Sauce", options: ["Hollandaise", "Basil Pesto"] }];
const fruit: Variation[] = [
  { id: "fruit", label: "Fruit", options: ["Strawberry", "Blueberry", "Banana", "Mixed berry", "Tropical"] },
];

type Seed = Omit<MenuItem, "milks" | "sweetness" | "syrups" | "shots" | "addonMode" | "kind" | "temps"> &
  Partial<Pick<MenuItem, "milks" | "sweetness" | "syrups" | "shots" | "addonMode" | "kind" | "temps">>;

function drink(seed: Seed): MenuItem {
  return {
    milks: true,
    sweetness: true,
    syrups: true,
    shots: true,
    addonMode: "drink",
    kind: "drink",
    temps: ["hot", "iced"],
    ...seed,
  };
}

function food(seed: Seed & { flat?: number | null }): MenuItem {
  return {
    milks: false,
    sweetness: false,
    syrups: false,
    shots: false,
    addonMode: "food",
    kind: "food",
    temps: [],
    flat: seed.flat ?? null,
    ...seed,
  };
}

const SPEC_HOT = HOT(2.5, 5.25, 6.25, 8);
const SPEC_ICED = ICED(7.75, 9.25, 13.5, 15);
const BREVE_HOT = HOT(3.5, 5.25, 6.25, 8);
const SODA = ICED(5, 6, 7, 9.5);
const LOTUS = ICED(6.5, 8.5, 10.5, 13.5);
const KICKER = ICED(8.5, 9.5, 10.5, 13.5);

export const MENU: MenuItem[] = [
  drink({
    id: "americano",
    name: "Americano",
    category: "espresso",
    short: "Espresso and hot water, clean and bold.",
    description:
      "Bold, rich espresso blended with hot water for a smooth, full-bodied coffee with a clean finish and deep, satisfying flavor.",
    hot: HOT(2.5, 4.5, 6, 7.5),
    iced: ICED(7, 8.5, 9.75, 10.5),
    milkOptional: true,
    defaultMilk: "None",
    dairyFree: true,
    bestseller: true,
  }),
  drink({
    id: "latte",
    name: "Latte",
    category: "espresso",
    short: "Espresso, steamed milk, and a cap of foam.",
    description:
      "A smooth, rich espresso drink made with freshly pulled espresso shots blended with steamed milk and topped with a light layer of creamy milk foam.",
    hot: HOT(2.25, 3, 5, 5.75),
    iced: ICED(6, 6.5, 8, 10),
    featured: true,
    bestseller: true,
  }),
  drink({
    id: "breve",
    name: "Breve",
    category: "espresso",
    short: "Espresso with velvety steamed half-and-half.",
    description:
      "Bold espresso meets velvety steamed Half-and-Half for a luxuriously creamy coffee experience.",
    hot: HOT(2.5, 3.5, 6.5, 7.25),
    iced: ICED(7.5, 7.75, 8.5, 10.5),
    defaultMilk: "Half and Half",
  }),
  drink({
    id: "mocha-latte",
    name: "Mocha Latte",
    category: "espresso",
    short: "Espresso, milk, and Ghirardelli chocolate.",
    description:
      "Rich espresso, smooth steamed milk, and Ghirardelli Dark chocolate (or White chocolate variation), topped with a creamy layer of foam.",
    hot: HOT(2.75, 5.25, 6, 7.5),
    iced: ICED(7.25, 8.75, 13, 15),
    variations: mocha,
    featured: true,
  }),
  drink({
    id: "white-chocolate-mocha",
    name: "White Chocolate Mocha Latte",
    category: "espresso",
    short: "Espresso, milk, and Ghirardelli white chocolate.",
    description:
      "Rich espresso, smooth steamed milk, and Ghirardelli White chocolate, topped with a creamy layer of foam.",
    hot: HOT(2.75, 5.25, 6, 7.5),
    iced: ICED(7.25, 8.75, 13, 15),
  }),
  drink({
    id: "mocha-breve",
    name: "Mocha Breve",
    category: "espresso",
    short: "Dark chocolate, espresso, and half-and-half.",
    description:
      "Rich espresso blended with decadent Ghirardelli Dark chocolate and velvety steamed half-and-half for an irresistibly creamy, smooth, and indulgent coffee experience.",
    hot: HOT(3.25, 5.5, 7.25, 8.5),
    iced: ICED(7.75, 9.5, 14, 16),
    defaultMilk: "Half and Half",
  }),
  drink({
    id: "white-chocolate-breve",
    name: "White Chocolate Breve",
    category: "espresso",
    short: "White chocolate, espresso, and half-and-half.",
    description:
      "Bold espresso blended with sweet, creamy Ghirardelli White Chocolate and rich steamed half-and-half for a smooth, velvety, and delightfully indulgent treat.",
    hot: HOT(3.25, 5.5, 7.25, 8.5),
    iced: ICED(7.75, 9.5, 14, 16),
    defaultMilk: "Half and Half",
  }),
  drink({
    id: "creamy-caramel-latte",
    name: "Creamy Caramel Latte",
    category: "espresso",
    short: "Caramel, French vanilla, and caramel drizzle.",
    description:
      "Rich espresso blended with smooth steamed milk and buttery Caramel syrup and French Vanilla for a perfectly sweet, velvety-smooth latte topped with sweet Caramel drizzle.",
    hot: HOT(2.5, 5.25, 6.25, 8),
    iced: ICED(7.75, 9.25, 13.5, 15),
    featured: true,
  }),
  drink({
    id: "cafe-miel",
    name: "Café Miel",
    category: "espresso",
    short: "Espresso, honey, and a dust of cinnamon.",
    description:
      "A cozy blend of rich espresso, steamed milk, sweet honey, and a light dust of cinnamon powder on top. Smooth, lightly spiced, and naturally sweet.",
    hot: HOT(2, 2.5, 3, 3.75),
    iced: ICED(3.5, 4.25, 6.25, 7.5),
  }),
  drink({
    id: "mayan-mocha",
    name: "Mayan Mocha",
    category: "espresso",
    short: "Mexican chocolate, cinnamon, and a hint of chili.",
    description:
      "Rich, velvety Mexican chocolate meets bold espresso, warm cinnamon, and a hint of spicy chili, blended with creamy steamed milk for a sweet, warming kick.",
    hot: HOT(2.75, 4.5, 6, 7.75),
    iced: ICED(7.5, 8.75, 13, 15.5),
    seasonal: true,
  }),
  drink({
    id: "sludge-cup",
    name: "Sludge Cup",
    category: "espresso",
    short: "Espresso plus Kaladi Brothers Sumatra.",
    description:
      "A bold, decadent blend of strong espresso mixed with Kaladi Brothers Sumatra coffee for a smooth, satisfying cup with an extra kick.",
    hot: HOT(3, 4.5, 6, 7.5),
    iced: ICED(7, 8.5, 9.75, 10.5),
    milkOptional: true,
    defaultMilk: "None",
    dairyFree: true,
  }),

  drink({
    id: "blue-moon-latte",
    name: "Blue Moon Latte",
    category: "specialty",
    short: "White chocolate, blueberry, and frothed milk.",
    description: "Ghirardelli White Chocolate, espresso, blueberry syrup, and frothed milk.",
    hot: SPEC_HOT,
    iced: SPEC_ICED,
    newer: true,
    featured: true,
  }),
  drink({
    id: "captain-crunch-latte",
    name: "Captain Crunch Latte",
    category: "specialty",
    short: "Strawberry, hazelnut, and frothed milk.",
    description: "Espresso, strawberry syrup, hazelnut syrup, and frothed milk.",
    hot: SPEC_HOT,
    iced: SPEC_ICED,
  }),
  drink({
    id: "forget-me-not-latte",
    name: "Forget Me Not Latte",
    category: "specialty",
    short: "Dark chocolate, vanilla, and amaretto. Our signature.",
    description: "Ghirardelli Dark Chocolate, espresso, French vanilla syrup, amaretto syrup, and frothed milk.",
    hot: SPEC_HOT,
    iced: SPEC_ICED,
    signature: true,
    featured: true,
    bestseller: true,
  }),
  drink({
    id: "mudslide-latte",
    name: "Mudslide Latte",
    category: "specialty",
    short: "Dark chocolate, Irish cream, and vanilla.",
    description: "Ghirardelli Dark Chocolate, espresso, Irish cream syrup, vanilla syrup, and frothed milk.",
    hot: SPEC_HOT,
    iced: SPEC_ICED,
  }),
  drink({
    id: "snickers-latte",
    name: "Snickers Latte",
    category: "specialty",
    short: "Salted caramel, peanut butter, and chocolate.",
    description: "Ghirardelli Dark Chocolate, espresso, salted caramel syrup, peanut butter syrup, and frothed milk.",
    hot: SPEC_HOT,
    iced: SPEC_ICED,
    bestseller: true,
  }),
  drink({
    id: "samoan-chocolate-latte",
    name: "Samoan Chocolate Latte",
    category: "specialty",
    short: "Dark chocolate, salted caramel, and coconut milk.",
    description: "Ghirardelli Dark Chocolate, espresso, salted caramel, and steamed coconut milk.",
    hot: SPEC_HOT,
    iced: SPEC_ICED,
    defaultMilk: "Coconut",
  }),
  drink({
    id: "crazy-ex-latte",
    name: "The Crazy Ex Latte",
    category: "specialty",
    short: "Hazelnut, macadamia nut, and frothed milk.",
    description: "Espresso, hazelnut syrup, macadamia nut syrup, and frothed milk.",
    hot: SPEC_HOT,
    iced: SPEC_ICED,
  }),
  drink({
    id: "vanilla-bean-latte",
    name: "Vanilla Bean Latte",
    category: "specialty",
    short: "Vanilla, caramel, and frothed milk.",
    description: "Espresso, vanilla syrup, caramel syrup, and frothed milk.",
    hot: SPEC_HOT,
    iced: SPEC_ICED,
  }),
  drink({
    id: "lavender-mist-breve",
    name: "Lavender Mist Breve",
    category: "specialty",
    short: "White chocolate, lavender, and half-and-half.",
    description: "Ghirardelli White Chocolate, lavender syrup, and steamed Half and Half.",
    hot: BREVE_HOT,
    iced: SPEC_ICED,
    defaultMilk: "Half and Half",
  }),
  drink({
    id: "sweet-pucker-breve",
    name: "Sweet Pucker Breve",
    category: "specialty",
    short: "Cherry, vanilla, and steamed half-and-half.",
    description: "Espresso with cherry and vanilla syrups, topped with steamed Half and Half.",
    hot: BREVE_HOT,
    iced: SPEC_ICED,
    defaultMilk: "Half and Half",
  }),
  drink({
    id: "thin-mint-breve",
    name: "Thin Mint Breve",
    category: "specialty",
    short: "Dark chocolate, peppermint, and half-and-half.",
    description: "Ghirardelli Dark Chocolate, peppermint syrup, and steamed Half and Half.",
    hot: BREVE_HOT,
    iced: SPEC_ICED,
    defaultMilk: "Half and Half",
    seasonal: true,
  }),

  drink({
    id: "london-fog",
    name: "London Fog",
    category: "hot",
    short: "Earl Grey, vanilla, honey, and steamed milk.",
    description:
      "A soothing blend of fragrant Earl Grey tea, velvety steamed milk, and sweet vanilla and honey. Delicately floral, creamy, and comforting.",
    hot: HOT(2.5, 4.5, 6, 7.5),
    iced: ICED(7, 8.5, 9.75, 12),
    shots: false,
  }),
  drink({
    id: "fairbanks-ice-fog",
    name: "Fairbanks Ice Fog",
    category: "hot",
    short: "Vanilla bean tea, honey, and creamy milk.",
    description:
      "A fragrant Vanilla Bean tea, sweet honey, and creamy milk. Smooth and lightly sweet, a cool Alaska-inspired escape in every sip.",
    hot: HOT(2.75, 4.75, 6.25, 7.75),
    iced: ICED(7.25, 8.75, 10, 12.5),
    shots: false,
    featured: true,
  }),
  drink({
    id: "chai-latte",
    name: "Chai Latte",
    category: "hot",
    short: "Spiced, vanilla, or raspberry chai with milk.",
    description:
      "Aromatic chai combined with creamy steamed milk for a smooth, cozy, and perfectly sweet sip of pure bliss.",
    hot: HOT(2.5, 4.5, 6, 7.5),
    iced: ICED(7, 8.5, 9.75, 12),
    shots: false,
    variations: chai,
  }),
  drink({
    id: "drip-coffee",
    name: "Daily Organic Drip Coffee",
    category: "hot",
    short: "Kaladi Brothers Sumatra, dark and robust.",
    description:
      "A satisfying cup of Kaladi Brothers Sumatra coffee with a distinctive, robust character for those who love their coffee dark, flavorful, and unforgettable.",
    hot: HOT(2.5, 4.5, 5.25, 6),
    iced: ICED(6, 6.75, 7.5, 8.5),
    milkOptional: true,
    defaultMilk: "None",
    dairyFree: true,
    bestseller: true,
  }),
  drink({
    id: "steamer",
    name: "Steamer",
    category: "hot",
    short: "Steamed milk and the flavor you pick. No caffeine.",
    description:
      "Warm, velvety steamed milk blended with your favorite flavor. A cozy, caffeine-free delight for any time of day.",
    hot: HOT(2, 3.75, 4.75, 5.75),
    iced: ICED(6.25, 7.25, 8, 9.75),
    caffeineFree: true,
    shots: false,
  }),
  drink({
    id: "matcha-latte",
    name: "Matcha Latte",
    category: "hot",
    short: "Organic matcha and steamed milk.",
    description:
      "Vibrant organic Matcha blended with creamy steamed milk for a smooth, earthy flavor with delicate sweetness. A little moment of Zen in every sip.",
    hot: HOT(2.5, 5.25, 6.25, 8),
    iced: ICED(7.75, 9.25, 13.5, 15),
    shots: false,
    featured: true,
  }),
  drink({
    id: "hot-chocolate",
    name: "Hot Chocolate",
    category: "hot",
    short: "Ghirardelli dark chocolate and steamed milk.",
    description:
      "Rich, velvety Ghirardelli dark chocolate blended with steamed milk. Sweet, creamy, irresistibly chocolatey, pure comfort in every sip.",
    hot: HOT(3, 5.25, 6.75, 8.25),
    iced: ICED(7.75, 8.5, 13.25, 15.25),
    caffeineFree: true,
    shots: false,
  }),
  drink({
    id: "apple-cider",
    name: "Apple Cider",
    category: "hot",
    short: "Crisp apple, warm and caffeine-free.",
    description:
      "Sweet, crisp apple flavor with cozy autumn warmth in every sip. Comforting, refreshing, and full of fall-inspired goodness.",
    hot: HOT(2, 3.75, 4.75, 5.75),
    iced: ICED(6.25, 7.25, 8, 9.75),
    caffeineFree: true,
    dairyFree: true,
    milks: false,
    sweetness: false,
    syrups: false,
    shots: false,
    seasonal: true,
  }),
  drink({
    id: "hot-tea",
    name: "Hot Tea",
    category: "hot",
    short: "Earl Grey, vanilla bean, green, hibiscus, or chamomile.",
    description: "Steamed tea of your choice mixed with hot water.",
    hot: HOT(2.5, 4.5, 6, 7.5),
    iced: ICED(7, 8.5, 9.75, 10.5),
    milkOptional: true,
    defaultMilk: "None",
    dairyFree: true,
    shots: false,
    syrups: false,
    variations: tea,
  }),

  drink({
    id: "cold-brew",
    name: "Cold Brew",
    category: "cold",
    short: "Steeped 24 hours. Smooth, low acid, bold.",
    description:
      "Slow-steeped for 24 hours for a smooth, bold coffee flavor with low acidity and a naturally mellow finish. Refreshingly crisp, rich, and satisfying.",
    iced: ICED(3.5, 4.25, 7.5, 8.5),
    temps: ["iced"],
    defaultTemp: "iced",
    milkOptional: true,
    defaultMilk: "None",
    dairyFree: true,
    bestseller: true,
    featured: true,
  }),
  drink({
    id: "ice-rage",
    name: "Ice Rage",
    category: "cold",
    short: "Frozen ice-and-milk blend. Pick your mix.",
    description: "A frozen blended beverage made with an ice-and-milk base and your choice of flavored mixes.",
    iced: ICED(6.5, 8.5, 10.5, 13.5),
    temps: ["iced"],
    shots: false,
    variations: [{ id: "mix", label: "Mix", options: ["Vanilla", "Mocha", "Strawberry", "Caramel", "Cookies & cream"] }],
  }),
  drink({
    id: "fruit-smoothie",
    name: "Fruit Smoothie",
    category: "cold",
    short: "Blended fruit. Caffeine-free.",
    description: "A refreshing blend of fruity goodness, bursting with vibrant flavor and blended to smooth perfection.",
    iced: ICED(6, 7, 8, 10.5),
    temps: ["iced"],
    caffeineFree: true,
    shots: false,
    milks: false,
    variations: fruit,
  }),
  drink({
    id: "dirty-soda",
    name: "Dirty Soda",
    category: "cold",
    short: "Soda, syrup, and a splash of cream. Contains caffeine.",
    description:
      "A bubbly, refreshing blend of your choice of soda and your favorite flavored syrup. Light, fizzy, and bursting with flavor.",
    iced: ICED(5, 6, 7, 9.5),
    temps: ["iced"],
    shots: false,
    milkOptional: true,
    defaultMilk: "Half and Half",
    variations: [{ id: "soda", label: "Soda", options: ["Cola", "Dr Pepper", "Lemon-lime", "Root beer", "Orange"] }],
  }),

  drink({
    id: "italian-soda",
    name: "Italian Soda",
    category: "soda",
    short: "Club soda and the syrup you choose.",
    description:
      "A bubbly, refreshing blend of sparkling club soda and your favorite flavored syrup. Light, fizzy, and bursting with fruity sweetness.",
    iced: ICED(4.25, 4.75, 5.75, 8.5),
    temps: ["iced"],
    caffeineFree: true,
    dairyFree: true,
    milks: false,
    sweetness: false,
    shots: false,
    syrups: false,
    variations: [{ id: "syrup", label: "Syrup", options: SYRUPS }],
  }),
  ...[
    ["cherry-bomb", "Cherry Bomb", "Cherry soda with a bright lime snap."],
    ["cherry-lime", "Cherry Lime", "Cherry and lime over sparkling soda."],
    ["ocean-spray", "Ocean Spray", "Cranberry-citrus fizz, bright and tart."],
    ["raspberry-breeze", "Raspberry Breeze", "Raspberry soda with a soft floral finish."],
    ["razzbear", "Razzbear", "Raspberry and a creamy berry finish."],
    ["strawberry-shortcake", "Strawberry Shortcake", "Strawberry, vanilla, and a creamy fizz."],
    ["summer-night", "Summer Night", "A dusk-colored berry and citrus soda."],
    ["tigers-blood", "Tiger's Blood", "Coconut, strawberry, and watermelon."],
    ["tropical-sunset", "Tropical Sunset", "Mango, pineapple, and orange, layered."],
  ].map(([id, name, short]) =>
    drink({
      id,
      name,
      category: "soda",
      short,
      description: `${name} — a house Italian soda. Sparkling, caffeine-free, and layered with the flavors in the name.`,
      iced: SODA,
      temps: ["iced"],
      caffeineFree: true,
      dairyFree: true,
      milks: false,
      sweetness: false,
      shots: false,
      syrups: true,
    }),
  ),

  drink({
    id: "red-bull-smoothie",
    name: "Red Bull Smoothie",
    category: "energy",
    short: "Frozen Red Bull and one vibrant flavor.",
    description: "A refreshing frozen blend of Red Bull with your choice of one vibrant flavor, blended to smooth perfection.",
    iced: ICED(8.5, 9.5, 10.5, 13.5),
    temps: ["iced"],
    shots: false,
    milks: false,
    variations: [{ id: "flavor", label: "Flavor", options: ["Strawberry", "Mango", "Blue raspberry", "Coconut", "Tropical"] }],
  }),
  drink({
    id: "red-bull-kicker",
    name: "Red Bull Kicker",
    category: "energy",
    short: "Red Bull, syrup, and ice.",
    description: "Red Bull energy drink mixed with your choice of syrup, over ice.",
    iced: ICED(6.5, 8.5, 10.5, 13.5),
    temps: ["iced"],
    shots: false,
    milks: false,
    sweetness: false,
    variations: [{ id: "syrup", label: "Syrup", options: ["Cherry", "Coconut", "Mango", "Blue raspberry", "Vanilla"] }],
  }),
  drink({
    id: "cotton-candy-kicker",
    name: "Cotton Candy Kicker",
    category: "energy",
    short: "Blue raspberry, watermelon, and toasted marshmallow.",
    description: "Red Bull with blue raspberry, watermelon and toasted marshmallow syrups.",
    iced: KICKER,
    temps: ["iced"],
    shots: false,
    milkOptional: true,
    defaultMilk: "None",
    newer: true,
    featured: true,
  }),
  drink({
    id: "cotton-tail-kicker",
    name: "Cotton Tail Kicker",
    category: "energy",
    short: "Peach, pineapple, strawberry, and sweet cream.",
    description: "Red Bull with peach, pineapple, strawberry syrups and sweet cream.",
    iced: KICKER,
    temps: ["iced"],
    shots: false,
    defaultMilk: "Half and Half",
  }),
  drink({
    id: "flamingo-kicker",
    name: "Flamingo Kicker",
    category: "energy",
    short: "Raspberry, strawberry, vanilla, and whipped cream.",
    description: "Red Bull with raspberry, strawberry, vanilla syrups, with whipped cream.",
    iced: KICKER,
    temps: ["iced"],
    shots: false,
    milkOptional: true,
    defaultMilk: "None",
  }),
  drink({
    id: "hugs-n-kisses-kicker",
    name: "Hugs N' Kisses Kicker",
    category: "energy",
    short: "Strawberry, watermelon, and sweet cream.",
    description: "Red Bull with strawberry and watermelon syrups and sweet cream.",
    iced: KICKER,
    temps: ["iced"],
    shots: false,
    defaultMilk: "Half and Half",
  }),
  drink({
    id: "mai-tai-kicker",
    name: "Mai Tai Kicker",
    category: "energy",
    short: "Mango, pineapple, strawberry, and orange.",
    description: "Red Bull with mango, pineapple, strawberry and orange syrups.",
    iced: KICKER,
    temps: ["iced"],
    shots: false,
    milkOptional: true,
    defaultMilk: "None",
    dairyFree: true,
  }),
  drink({
    id: "red-dragon-kicker",
    name: "Red Dragon Kicker",
    category: "energy",
    short: "Mango, coconut, pineapple, orange, and raspberry.",
    description: "Red Bull with mango, coconut, pineapple, orange and raspberry.",
    iced: KICKER,
    temps: ["iced"],
    shots: false,
    defaultMilk: "Coconut",
  }),
  drink({
    id: "lotus-energy",
    name: "Lotus Energy Drink",
    category: "energy",
    short: "Build your own Lotus over ice.",
    description:
      "Bright, bold, and bursting with flavor. Lotus Energy mixed with your favorite fruity flavors and served over ice.",
    iced: ICED(4.5, 5.25, 8.75, 11),
    temps: ["iced"],
    shots: false,
    milkOptional: true,
    defaultMilk: "None",
    variations: [{ id: "base", label: "Lotus base", options: ["Blue", "Pink", "Gold", "White", "Lemonade"] }],
    featured: true,
  }),
  ...[
    ["beach-bum-lotus", "Beach Bum Lotus", "Blue Lotus, blue raspberry, lemon, lime, mango, and coconut milk."],
    ["blue-cosmo-bomb-lotus", "Blue Cosmo Bomb Lotus", "Blue Lotus, blue raspberry, lemon, lime, mango, and coconut."],
    ["first-kiss-lotus", "First Kiss Lotus", "Pink Lotus, huckleberry, peach, and coconut.", true],
    ["georgia-peach-lotus", "Georgia Peach Lotus", "Lemonade Lotus, peach, and blueberry."],
    ["lucky-leprechaun-lotus", "Lucky Leprechaun Lotus", "White Lotus, green apple, and pineapple."],
    ["ocean-mist-lotus", "Ocean Mist Lotus", "White Lotus, green apple, blue raspberry, and coconut."],
    ["passion-punch-lotus", "Passion Punch Lotus", "Gold Lotus, passion fruit, guava, and pineapple."],
    ["pink-rose-lotus", "Pink Rose Lotus", "Pink Lotus, passion fruit syrup, and coconut syrup.", true],
    ["pinky-lotus", "Pinky Lotus", "Pink Lotus, strawberry, raspberry, and watermelon."],
    ["pot-of-gold-lotus", "Pot of Gold Lotus", "Blue Lotus, green apple, kiwi, and peach."],
    ["pretty-in-pink-lotus", "Pretty in Pink Lotus", "Pink Lotus based fruity blend. Ask your barista for today’s mix.", true],
    ["princess-peach-lotus", "Princess Peach Lotus", "Pink Lotus, white peach syrup, and guava syrup."],
  ].map(([id, name, description, isNew]) =>
    drink({
      id: id as string,
      name: name as string,
      category: "energy",
      short: description as string,
      description: description as string,
      iced: LOTUS,
      temps: ["iced"],
      shots: false,
      milkOptional: true,
      defaultMilk: String(description).toLowerCase().includes("coconut milk") ? "Coconut" : "None",
      newer: Boolean(isNew),
      bestseller: id === "pot-of-gold-lotus" || id === "first-kiss-lotus",
      dairyFree: !String(description).toLowerCase().includes("coconut milk"),
    }),
  ),

  food({
    id: "breakfast-burrito",
    name: "Breakfast Burrito",
    category: "food",
    short: "Eggs, cheese, potatoes, and your choice of meat.",
    description:
      "Eggs and cheese with choice of sausage, bacon, turkey or ham, over seasoned potatoes, in a warm flour tortilla. Served with a side of salsa, sour cream and hot sauce.",
    flat: 11,
    variations: meat,
    bestseller: true,
    featured: true,
  }),
  food({
    id: "breakfast-bowl",
    name: "Breakfast Bowl",
    category: "food",
    short: "The burrito, served in a bowl.",
    description:
      "Eggs and cheese with choice of sausage, bacon, turkey or ham, over seasoned potatoes. Served with a side of salsa, sour cream and hot sauce.",
    flat: 9.5,
    variations: meat,
  }),
  food({
    id: "breakfast-sandwich",
    name: "Breakfast Sandwich",
    category: "food",
    short: "Bagel or English muffin, egg, cheese, and sauce.",
    description:
      "Choice of toasted bagel or English muffin topped with scrambled eggs, melted cheese, your choice of sausage, bacon, ham or turkey, and your choice of in-house Hollandaise or Basil Pesto sauce.",
    flat: 7.5,
    variations: [...bread, ...meat, ...sauce],
    bestseller: true,
  }),
  food({
    id: "top-of-the-morning",
    name: "Top of the Morning Breakfast Sandwich",
    category: "food",
    short: "Pesto, cheddar, egg, and turkey.",
    description:
      "House breakfast sandwich: pesto, cheddar, egg, and turkey on a toasted bagel or English muffin.",
    flat: 7.5,
    variations: bread,
  }),
  food({
    id: "bagel-butter",
    name: "Bagel w/ Butter",
    category: "food",
    short: "Toasted bagel with butter.",
    description: "Toasted bagel of choice topped with butter.",
    flat: 2,
    addonMode: "none",
    variations: bagel,
  }),
  food({
    id: "bagel-cream-cheese",
    name: "Bagel w/ Cream Cheese",
    category: "food",
    short: "Toasted bagel and cream cheese.",
    description: "Toasted bagel of choice served with cream cheese.",
    flat: 2.75,
    addonMode: "none",
    variations: bagel,
  }),
  food({
    id: "oatmeal",
    name: "Oatmeal",
    category: "food",
    short: "Hot oatmeal. Pick a style.",
    description: "Ready-made hot oatmeal of choice.",
    flat: 5,
    dairyFree: true,
    addonMode: "none",
    variations: [{ id: "style", label: "Style", options: ["Regular", "Maple brown sugar", "Apple cinnamon"] }],
  }),
  food({
    id: "yogurt-parfait",
    name: "Yogurt Parfait",
    category: "food",
    short: "Greek yogurt, granola, and fruit.",
    description: "Sweetened or unsweetened Greek yogurt layered with granola and topped with your choice of fruit.",
    flat: 8,
    addonMode: "none",
    variations: [
      { id: "yogurt", label: "Yogurt", options: ["Sweetened", "Unsweetened"] },
      ...fruit,
    ],
  }),
  food({
    id: "turkey-pesto-melt",
    name: "Turkey Pesto Cheddar Melt",
    category: "food",
    short: "Turkey, cheddar, and pesto. Tortilla or bagel.",
    description: "Warmed turkey and cheese topped with pesto sauce, served in a warmed flour tortilla or toasted bagel.",
    flat: 7,
    variations: [{ id: "bread", label: "Served on", options: ["Flour tortilla", "Toasted bagel"] }],
  }),
  food({
    id: "ham-cheese-roll",
    name: "Ham and Cheese Roll",
    category: "food",
    short: "Ham and cream cheese in a tortilla.",
    description: "Sliced ham with cream cheese, served in a flour tortilla.",
    flat: 5.5,
    addonMode: "none",
  }),
  food({
    id: "cheese-quesadilla",
    name: "Cheese Quesadilla",
    category: "food",
    short: "Melted cheese, salsa, sour cream, and hot sauce.",
    description: "Warmed tortilla with melted cheese. Served with a side of salsa, sour cream and hot sauce.",
    flat: 5.5,
  }),
  food({
    id: "blt-wrap",
    name: "B.L.T Wrap",
    category: "food",
    short: "Bacon, lettuce, tomato, and mayo.",
    description: "Bacon, lettuce, tomatoes and mayonnaise on a warm flour tortilla.",
    flat: 8,
    dairyFree: true,
  }),
  food({
    id: "blt-guac-wrap",
    name: "B.L.T w/ Guacamole Wrap",
    category: "food",
    short: "The B.L.T., plus fresh guacamole.",
    description: "The B.L.T wrap with fresh guacamole added.",
    flat: 8.75,
    dairyFree: true,
  }),
  food({
    id: "chicken-bacon-ranch",
    name: "Chicken, Bacon and Ranch Wrap",
    category: "food",
    short: "Chicken warm or cold, bacon, and ranch.",
    description:
      "Flour tortilla filled with lettuce, tomato, ranch dressing and your choice of warmed or cold chicken and bacon.",
    flat: 9,
    variations: [{ id: "chicken", label: "Chicken", options: ["Warmed", "Cold"] }],
  }),
  food({
    id: "chopped-club",
    name: "Chopped Club Wrap",
    category: "food",
    short: "Ham, turkey, bacon, Colby Jack, and honey mustard.",
    description:
      "Flour tortilla filled with chopped ham, turkey, Colby Jack cheese, bacon, lettuce, tomato and honey mustard.",
    flat: null,
    ask: "cafe",
  }),
  food({
    id: "breakfast-box",
    name: "Breakfast Box",
    category: "food",
    short: "Sandwich, hash brown, fruit, oatmeal or parfait, muffin, and a latte.",
    description:
      "A morning on-the-go box: build-your-own English muffin sandwich, hash brown patty, bowl of fruit, your choice of oatmeal or yogurt parfait, a muffin, and a 12 oz creamy latte.",
    flat: null,
    ask: "cafe",
    variations: [
      ...meat,
      { id: "side", label: "Side bowl", options: ["Oatmeal", "Yogurt parfait"] },
    ],
    window: { start: "07:30", end: "12:30", label: "Available 7:30 AM to 12:30 PM" },
  }),
  food({
    id: "lunch-box",
    name: "Lunch Box",
    category: "food",
    short: "A wrap, a side, a cookie, fruit or veg, an egg, and a drink.",
    description:
      "A midday box with your choice of the chopped club or the chicken, bacon and ranch wrap, choice of chips or crackers, 1 cookie, choice of fruit or vegetables, a hard-boiled egg and your 12 oz choice of beverage.",
    flat: null,
    ask: "cafe",
    variations: [
      { id: "wrap", label: "Wrap", options: ["Chopped club", "Chicken, bacon and ranch"] },
      { id: "side", label: "Side", options: ["Chips", "Crackers"] },
      { id: "produce", label: "Produce", options: ["Fruit", "Vegetables"] },
      { id: "drink", label: "12 oz drink", options: ["Latte", "Drip coffee", "Cold brew", "Italian soda"] },
    ],
    window: { start: "12:30", end: "17:30", label: "Available 12:30 PM to 5:30 PM" },
  }),

  food({
    id: "chocolate-chip-cookie",
    name: "Chocolate Chip Cookie",
    category: "baked",
    kind: "baked",
    short: "Fresh baked, still soft in the middle.",
    description: "Fresh baked chocolate chip cookie. Part of today’s bake — ask the barista what’s just come out.",
    flat: null,
    ask: "barista",
    addonMode: "none",
    bestseller: true,
  }),
  food({
    id: "muffin-almond-poppy",
    name: "Almond Poppy Seed Muffin",
    category: "baked",
    kind: "baked",
    short: "Almond muffin with poppy seeds.",
    description: "Almond poppy seed muffin from today’s bake case.",
    flat: null,
    ask: "barista",
    addonMode: "none",
  }),
  food({
    id: "muffin-blueberry",
    name: "Blueberry Cream Muffin",
    category: "baked",
    kind: "baked",
    short: "Blueberry muffin with a cream crumb.",
    description: "Blueberry cream muffin. Seasonal bakes rotate daily.",
    flat: null,
    ask: "barista",
    addonMode: "none",
    newer: true,
  }),
  food({
    id: "danish-cream-cheese",
    name: "Cream Cheese Danish",
    category: "baked",
    kind: "baked",
    short: "Flaky danish with cream cheese.",
    description: "Cream cheese danish, baked fresh.",
    flat: null,
    ask: "barista",
    addonMode: "none",
  }),
  food({
    id: "danish-cherry",
    name: "Cherry Danish",
    category: "baked",
    kind: "baked",
    short: "Flaky danish with cherry.",
    description: "Cherry danish from the daily case.",
    flat: null,
    ask: "barista",
    addonMode: "none",
  }),
  food({
    id: "cinnamon-roll",
    name: "Cinnamon Roll",
    category: "baked",
    kind: "baked",
    short: "Fresh roll with icing.",
    description: "Fresh cinnamon roll with icing. Ask about today’s other seasonal bakes.",
    flat: null,
    ask: "barista",
    addonMode: "none",
    featured: true,
    bestseller: true,
    seasonal: true,
  }),
];

export const CATEGORIES: { id: CategoryId; name: string; blurb: string; photo: string }[] = [
  { id: "espresso", name: "Espresso", blurb: "Pulled to order, hot or iced", photo: "cat-espresso" },
  { id: "specialty", name: "Specialty", blurb: "House lattes and breves", photo: "cat-specialty" },
  { id: "hot", name: "Hot Drinks & Teas", blurb: "Tea, matcha, cider, and drip", photo: "cat-hot" },
  { id: "cold", name: "Cold Drinks", blurb: "Cold brew, smoothies, and Ice Rage", photo: "cat-cold" },
  { id: "soda", name: "Italian Sodas", blurb: "Sparkling and caffeine-free", photo: "cat-soda" },
  { id: "energy", name: "Energy Drinks", blurb: "Kickers and Lotus favorites", photo: "cat-energy" },
  { id: "food", name: "Breakfast & Lunch", blurb: "Burritos, wraps, and boxes", photo: "cat-food" },
  { id: "baked", name: "Baked Goods", blurb: "Ask the barista — the case changes daily", photo: "cat-baked" },
];

export const CAFE = {
  name: "Forget Me Not Espresso",
  tagline: "A little stop, a lasting impression.",
  address: "1246 Noble Street",
  city: "Fairbanks, Alaska 99701",
  phone: "(907) 457-8777",
  phoneHref: "tel:+19074578777",
  email: "forgetmenotespresso22@gmail.com",
  maps: "https://maps.apple.com/?q=Forget%20Me%20Not%20Espresso&ll=64.836789,-147.713504&address=1246%20Noble%20Street,%20Fairbanks,%20AK%2099701",
  about:
    "April Painter has run this veteran-owned stop since 2022. The espresso is built on Kaladi Brothers beans, and the window on Noble Street is there so you can skip the line and still get a cup that feels like a visit.",
  pickup:
    "Order ahead, then pull up to Lane 2 on Noble Street. Tell us the name on the order and we’ll hand it out the window. Most ahead orders are ready in about 10–15 minutes.",
};

export const WEEK_HOURS: Record<number, [string, string]> = {
  0: ["07:00", "16:00"],
  1: ["06:00", "18:00"],
  2: ["06:00", "18:00"],
  3: ["06:00", "18:00"],
  4: ["06:00", "18:00"],
  5: ["06:00", "18:00"],
  6: ["07:00", "16:00"],
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function money(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export function upchargeLabel(amount: number) {
  return `+ ${money(amount)} (set in Admin)`;
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

function mins(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function formatClock(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const hr = (h ?? 0) % 12 || 12;
  const am = (h ?? 0) < 12;
  return `${hr}:${String(m ?? 0).padStart(2, "0")} ${am ? "AM" : "PM"}`;
}

export function hoursFor(day: number) {
  const span = WEEK_HOURS[day] ?? WEEK_HOURS[1]!;
  return `${formatClock(span[0])} – ${formatClock(span[1])}`;
}

export function dayName(day: number) {
  return DAY_NAMES[day] ?? "Today";
}

export function isOpen(now = new Date()) {
  const span = WEEK_HOURS[now.getDay()];
  if (!span) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= mins(span[0]) && cur < mins(span[1]);
}

export function itemWindow(item: MenuItem, now = new Date()) {
  if (!item.window) return { open: true as const, label: undefined as string | undefined };
  const cur = now.getHours() * 60 + now.getMinutes();
  const open = cur >= mins(item.window.start) && cur < mins(item.window.end);
  return { open, label: item.window.label };
}

export function getItem(id: string) {
  return MENU.find((item) => item.id === id);
}

export function sizesFor(item: MenuItem, temp: Temp): Size[] {
  const table = temp === "hot" ? item.hot : item.iced;
  if (!table) return [];
  return Object.keys(table)
    .map((k) => Number(k) as Size)
    .sort((a, b) => a - b);
}

export function defaultSelection(item: MenuItem): Selection {
  const variations: Record<string, string> = {};
  item.variations?.forEach((v) => {
    const first = v.options[0];
    if (first) variations[v.id] = first;
  });
  if (item.kind !== "drink") {
    return { temp: "iced", size: 16, milk: "None", sweetness: 0, syrups: [], shots: 0, addons: [], variations, notes: "" };
  }
  const temp: Temp = item.temps.includes(item.defaultTemp ?? "hot") ? (item.defaultTemp ?? item.temps[0] ?? "hot") : (item.temps[0] ?? "iced");
  const sizes = sizesFor(item, temp);
  const prefer: Size = temp === "hot" ? 12 : 16;
  const size = (sizes.includes(prefer) ? prefer : sizes[0] ?? 16) as Size;
  const plain = ["americano", "drip-coffee", "cold-brew", "sludge-cup", "hot-tea", "apple-cider"].includes(item.id);
  return {
    temp,
    size,
    milk: item.defaultMilk ?? (item.milkOptional ? "None" : "1%"),
    sweetness: plain || !item.sweetness ? 0 : 50,
    syrups: [],
    shots: 0,
    addons: [],
    variations,
    notes: "",
  };
}

export function milkChoices(item: MenuItem) {
  return item.milkOptional ? ["None", ...MILKS] : [...MILKS];
}

export function priceLabel(item: MenuItem, override?: ItemOverride) {
  if (override?.flatPrice != null) return money(override.flatPrice);
  if (item.flat != null) return money(item.flat + (override?.priceDelta ?? 0));
  if (item.ask === "barista") return "Ask our barista";
  if (item.ask === "cafe" || item.flat === null) return "Ask at café";
  const nums = [...Object.values(item.hot ?? {}), ...Object.values(item.iced ?? {})].filter((n): n is number => typeof n === "number");
  if (!nums.length) return "Ask our barista";
  return `From ${money(Math.min(...nums) + (override?.priceDelta ?? 0))}`;
}

export function addonName(id: string) {
  return ADDONS.find((a) => a.id === id)?.name ?? id;
}

export type Quote = { unit: number; pending: boolean; rows: { label: string; amount: number }[] };

export function quote(item: MenuItem, sel: Selection, cfg: AddonConfig, override?: ItemOverride): Quote {
  const rows: { label: string; amount: number }[] = [];
  const delta = override?.priceDelta ?? 0;
  if (item.kind !== "drink") {
    const flat = override?.flatPrice !== undefined ? override.flatPrice : item.flat;
    if (flat == null) {
      let extra = delta;
      sel.addons.forEach((id) => {
        extra += cfg.addons[id] ?? 0;
      });
      return { unit: round(Math.max(0, extra)), pending: true, rows };
    }
    rows.push({ label: item.name, amount: flat });
    let unit = flat + delta;
    sel.addons.forEach((id) => {
      const amount = cfg.addons[id] ?? 0;
      unit += amount;
      rows.push({ label: addonName(id), amount });
    });
    return { unit: round(unit), pending: false, rows };
  }
  const table = sel.temp === "hot" ? item.hot : item.iced;
  const base = table?.[sel.size];
  if (base == null) return { unit: 0, pending: true, rows };
  rows.push({ label: `${sel.temp === "hot" ? "Hot" : "Iced"} ${sel.size} oz`, amount: base });
  let unit = base + delta;
  if (delta) rows.push({ label: "Menu adjustment", amount: delta });
  const milkCost = milkUpcharge(item, sel, cfg);
  if (sel.milk && sel.milk !== "None" && item.milks) {
    rows.push({ label: sel.milk, amount: milkCost });
    unit += milkCost;
  }
  sel.syrups.forEach((s) => {
    const amount = round(s.pumps * cfg.syrupPump);
    unit += amount;
    rows.push({ label: `${s.name} ×${s.pumps}`, amount });
  });
  if (sel.shots > 0) {
    const amount = round(sel.shots * cfg.extraShot);
    unit += amount;
    rows.push({ label: `${sel.shots} extra shot${sel.shots > 1 ? "s" : ""}`, amount });
  }
  sel.addons.forEach((id) => {
    const amount = cfg.addons[id] ?? 0;
    unit += amount;
    rows.push({ label: addonName(id), amount });
  });
  return { unit: round(unit), pending: false, rows };
}

function milkUpcharge(item: MenuItem, sel: Selection, cfg: AddonConfig) {
  if (!item.milks || !sel.milk || sel.milk === "None") return 0;
  const def = item.defaultMilk ?? (item.milkOptional ? "None" : "1%");
  if (sel.milk === def || sel.milk === "1%") return 0;
  if (sel.milk === "Half and Half") return cfg.halfAndHalf;
  return cfg.milkAlt;
}

export function summarize(item: MenuItem, sel: Selection) {
  const bits: string[] = [];
  if (item.kind === "drink" && item.temps.length) {
    bits.push(sel.temp === "hot" ? "Hot" : "Iced");
    bits.push(`${sel.size} oz`);
  }
  Object.entries(sel.variations).forEach(([key, value]) => {
    const label = item.variations?.find((v) => v.id === key)?.label;
    if (value) bits.push(label ? `${label}: ${value}` : value);
  });
  if (item.milks && sel.milk && sel.milk !== "None") bits.push(sel.milk);
  if (item.sweetness) bits.push(`${sel.sweetness}% sweet`);
  sel.syrups.forEach((s) => bits.push(`${s.name} ×${s.pumps}`));
  if (sel.shots) bits.push(`${sel.shots} extra shot${sel.shots > 1 ? "s" : ""}`);
  sel.addons.forEach((id) => bits.push(addonName(id)));
  if (sel.notes.trim()) bits.push(sel.notes.trim());
  return bits.join(" · ");
}

export function canBeDairyFree(item: MenuItem) {
  return Boolean(item.dairyFree || item.milks);
}

export function pickupDays(now = new Date()) {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    d.setHours(12, 0, 0, 0);
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    return { id: d.toISOString().slice(0, 10), label, date: d };
  });
}

export function pickupTimes(day: Date, now = new Date()) {
  const span = WEEK_HOURS[day.getDay()] ?? WEEK_HOURS[1]!;
  const start = mins(span[0]);
  const end = mins(span[1]);
  const slots: string[] = [];
  const isToday = day.toDateString() === now.toDateString();
  const earliest = isToday ? now.getHours() * 60 + now.getMinutes() + 15 : start;
  for (let m = start; m < end; m += 15) {
    if (m < earliest) continue;
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    slots.push(formatClock(`${hh}:${mm}`));
  }
  return slots;
}

export function isBirthdayWeek(iso: string, now = new Date()) {
  const parts = iso.split("-").map(Number);
  const month = parts[1];
  const date = parts[2];
  if (!month || !date) return false;
  const birthday = new Date(now.getFullYear(), month - 1, date);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return birthday >= start && birthday < end;
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export const TRENDING = ["Forget Me Not Latte", "Cold Brew", "Pot of Gold Lotus", "Breakfast Burrito", "Cinnamon Roll"];
