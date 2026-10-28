import { AddCardScreen, CartSheet, CheckoutScreen, ConfirmScreen, ReceiptScreen, TrackScreen } from "./checkout";
import { CategoryScreen, ContextSheet, FavoritesScreen, FilterSheet, MenuScreen, ProductScreen, SearchScreen, ShareSheet } from "./browse";
import { HomeScreen } from "./home";
import { Auth, Onboarding, Permissions, Splash, Welcome } from "./launch";
import {
  AboutScreen,
  BirthdayScreen,
  DealsScreen,
  DietaryScreen,
  EditProfile,
  HelpScreen,
  NotifSettings,
  NotificationsScreen,
  OrdersScreen,
  PaymentsScreen,
  ProfileScreen,
  ReviewsScreen,
  RewardsScreen,
  SettingsScreen,
  StoreScreen,
  TermsScreen,
} from "./more";
import { AdminApp } from "./admin";
import { useCafe } from "./store";
import { Overlay, StatusBar, TabBar } from "./ui";

export function CafeApp() {
  const cafe = useCafe();
  if (cafe.adminOpen) return <AdminApp />;

  let screen = <Splash />;
  if (cafe.phase === "onboarding") screen = <Onboarding />;
  if (cafe.phase === "welcome") screen = <Welcome />;
  if (cafe.phase === "login" || cafe.phase === "register" || cafe.phase === "forgot" || cafe.phase === "otp" || cafe.phase === "reset") screen = <Auth />;
  if (cafe.phase === "permissions") screen = <Permissions />;
  if (cafe.phase === "app") screen = <Main />;

  const lightAuth = cafe.phase === "welcome" || cafe.phase === "login" || cafe.phase === "register" || cafe.phase === "forgot" || cafe.phase === "otp" || cafe.phase === "reset";
  const anim = cafe.dir === "pop" ? "anim-pop" : cafe.dir === "push" ? "anim-push" : "anim-fade";
  const routeKey = cafe.phase === "app" ? `${cafe.tab}-${cafe.route.name}-${"itemId" in cafe.route ? cafe.route.itemId : ""}-${"orderId" in cafe.route ? cafe.route.orderId : ""}` : cafe.phase;

  return (
    <div className="stage-center">
      <div className="phone" data-theme={lightAuth ? "light" : cafe.resolvedTheme} style={{ ["--text-scale" as string]: String(cafe.textScale) }}>
        {cafe.phase !== "splash" && cafe.phase !== "onboarding" && <StatusBar />}
        <div key={routeKey} className={anim} style={{ position: "absolute", inset: 0 }}>
          {screen}
        </div>
        {cafe.phase === "app" && cafe.route.name === "root" && <TabBar />}
        <div className="home-indicator" />
        {cafe.phase === "app" && cafe.lines.length > 0 && cafe.route.name !== "checkout" && cafe.route.name !== "confirm" && cafe.route.name !== "product" && (
          <button className="float-cart" style={{ bottom: cafe.route.name === "root" ? 98 : 28 }} onClick={() => cafe.setSheet("cart")}>
            View cart · {cafe.lines.reduce((s, l) => s + l.qty, 0)}
          </button>
        )}
        <CartSheet />
        <FilterSheet />
        <ContextSheet />
        <ShareSheet />
        <Overlay />
      </div>
    </div>
  );
}

function Main() {
  const cafe = useCafe();
  const route = cafe.route;
  if (cafe.tab === "home" && route.name === "root") return <HomeScreen />;
  if (cafe.tab === "menu" && route.name === "root") return <MenuScreen />;
  if (cafe.tab === "orders" && route.name === "root") return <OrdersScreen />;
  if (cafe.tab === "rewards" && route.name === "root") return <RewardsScreen />;
  if (cafe.tab === "profile" && route.name === "root") return <ProfileScreen />;
  switch (route.name) {
    case "category":
      return <CategoryScreen categoryId={route.categoryId} />;
    case "search":
      return <SearchScreen />;
    case "product":
      return <ProductScreen itemId={route.itemId} lineId={route.lineId} />;
    case "favorites":
      return <FavoritesScreen />;
    case "checkout":
      return <CheckoutScreen />;
    case "add-card":
      return <AddCardScreen />;
    case "confirm":
      return <ConfirmScreen orderId={route.orderId} />;
    case "track":
      return <TrackScreen orderId={route.orderId} />;
    case "receipt":
      return <ReceiptScreen orderId={route.orderId} />;
    case "deals":
      return <DealsScreen />;
    case "birthday":
      return <BirthdayScreen />;
    case "notifications":
      return <NotificationsScreen />;
    case "notif-settings":
      return <NotifSettings />;
    case "edit-profile":
      return <EditProfile />;
    case "dietary":
      return <DietaryScreen />;
    case "payments":
      return <PaymentsScreen />;
    case "reviews":
      return <ReviewsScreen />;
    case "settings":
      return <SettingsScreen />;
    case "help":
      return <HelpScreen />;
    case "store":
      return <StoreScreen />;
    case "about":
      return <AboutScreen />;
    case "terms":
      return <TermsScreen />;
    default:
      return <HomeScreen />;
  }
}
