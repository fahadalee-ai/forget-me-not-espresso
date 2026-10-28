import { useState } from "react";
import { asset } from "@/lib/utils";
import { useCafe } from "./store";
import { NavBar } from "./ui";

const SLIDES = [
  {
    photo: "onboard-brew.jpg",
    title: "Discover Your Perfect Brew",
    body: "A full menu with photos, and a cup you can tune — size, milk, sweetness, syrups, and extra shots.",
  },
  {
    photo: "onboard-order.jpg",
    title: "Order, Sip, Enjoy",
    body: "Order ahead, skip the line at Lane 2, and watch your drink move from the bar to the window.",
  },
  {
    photo: "onboard-reward.jpg",
    title: "Sip More, Earn More",
    body: "Points on every pickup, a free drink when you reach 400, and a birthday latte on the house.",
  },
];

export function Splash() {
  return (
    <div className="page" style={{ background: "#1c1917", display: "grid", placeItems: "center", textAlign: "center" }}>
      <img src={asset("photos/splash-latte.jpg")} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.22 }} />
      <div style={{ position: "relative", padding: 24 }}>
        <svg className="steam" width="80" height="46" viewBox="0 0 80 46" style={{ margin: "0 auto 8px", display: "block" }} aria-hidden>
          <path d="M20 40c8-12 0-16 8-28M40 42c6-14-2-18 6-30M58 40c8-10 0-16 8-26" stroke="#faf7f2" strokeWidth="2" fill="none" opacity="0.7" />
        </svg>
        <img src={asset("brand/logo-w.png")} alt="Forget Me Not Espresso" className="splash-logo" style={{ width: 210, height: 210, objectFit: "cover", borderRadius: "50%", margin: "0 auto" }} />
        <svg className="bloom" width="28" height="28" viewBox="0 0 28 28" style={{ margin: "10px auto 0", display: "block" }} aria-hidden>
          <circle cx="14" cy="14" r="4" fill="#f4d35e" />
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse key={deg} cx="14" cy="6" rx="4.2" ry="6" fill="#2463eb" transform={`rotate(${deg} 14 14)`} />
          ))}
        </svg>
        <p className="tag-in h-display" style={{ color: "#faf7f2", fontSize: 22, marginTop: 14 }}>
          A little stop, a lasting impression.
        </p>
      </div>
    </div>
  );
}

export function Onboarding() {
  const cafe = useCafe();
  const [i, setI] = useState(0);
  const slide = SLIDES[i]!;
  const last = i === SLIDES.length - 1;
  return (
    <div className="page" style={{ background: "#111" }}>
      <img src={asset(`photos/${slide.photo}`)} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(12,10,9,.92) 0%, rgba(12,10,9,.55) 42%, rgba(12,10,9,.15) 100%)" }} />
      <button className="btn-plain" style={{ position: "absolute", top: 58, right: 12, color: "white", zIndex: 2 }} onClick={() => cafe.finishOnboarding()}>
        Skip
      </button>
      <div style={{ position: "absolute", left: 24, right: 24, bottom: 36, zIndex: 2, color: "white" }}>
        <h1 className="h-display" style={{ fontSize: 34, margin: "0 0 8px" }}>{slide.title}</h1>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.4, color: "rgba(255,255,255,.85)", minHeight: 72 }}>{slide.body}</p>
        <div style={{ display: "flex", gap: 6, margin: "16px 0" }} aria-label="Page">
          {SLIDES.map((_, n) => (
            <i key={n} style={{ width: n === i ? 18 : 7, height: 7, borderRadius: 99, background: n === i ? "#2463eb" : "rgba(255,255,255,.45)" }} />
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => (last ? cafe.finishOnboarding() : setI(i + 1))}>
          {last ? "Get Started" : "Next"}
        </button>
      </div>
    </div>
  );
}

function AppleMark() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" aria-hidden>
      <path d="M13.2 9.5c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.7-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.8-.4 6.9 1.1 9.2.8 1.1 1.7 2.3 2.9 2.3 1.1 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.6-1-2.7-3.9zM11 3.2c.6-.8 1.1-1.9.9-3-1 .1-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.5 2.9-1.4z" />
    </svg>
  );
}

export function Welcome() {
  const cafe = useCafe();
  const logo = asset(cafe.resolvedTheme === "dark" ? "brand/logo-w.png" : "brand/logo.png");
  return (
    <div className="page welcome">
      <div className="welcome-hero">
        <img src={asset("photos/auth-welcome-light.jpg")} alt="" />
        <div className="welcome-fade" />
      </div>
      <div className="welcome-sheet">
        <img className="auth-mark" src={logo} alt="Forget Me Not Espresso" />
        <p className="auth-kicker">Fairbanks · Est. 1997</p>
        <h1 className="h-display">Welcome in.</h1>
        <p className="auth-lead">Order ahead for Lane 2 at 1246 Noble Street. Kaladi Brothers beans, pulled to order.</p>
        <div className="auth-actions">
          <button className="btn btn-apple" onClick={() => cafe.loginApple()}>
            <AppleMark /> Continue with Apple
          </button>
          <button className="btn btn-primary" onClick={() => cafe.setPhase("login")}>Log In</button>
          <button className="btn btn-secondary" onClick={() => cafe.setPhase("register")}>Create Account</button>
          <button className="btn btn-plain" onClick={() => cafe.continueGuest()}>Continue as Guest</button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  right,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  right?: React.ReactNode;
}) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div>
        <input value={value} type={type} placeholder={placeholder} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} />
        {right}
      </div>
    </label>
  );
}

function ShowPassword({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="auth-reveal" onClick={onToggle}>
      {show ? "Hide" : "Show"}
    </button>
  );
}

export function Auth() {
  const cafe = useCafe();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("1998-06-12");
  const [diet, setDiet] = useState<string[]>([]);
  const [terms, setTerms] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const logo = asset(cafe.resolvedTheme === "dark" ? "brand/logo-w.png" : "brand/logo.png");

  if (cafe.phase === "login") {
    return (
      <AuthPage title="Log in" lead="Use the email on your account. Pickup orders stay tied to this name." onBack={() => cafe.setPhase("welcome")} logo={logo}>
        <div className="auth-card">
          <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" placeholder="name@email.com" />
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            type={show ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Your password"
            right={<ShowPassword show={show} onToggle={() => setShow((v) => !v)} />}
          />
        </div>
        <div className="auth-row-end">
          <button className="auth-text" onClick={() => cafe.setPhase("forgot")}>Forgot password?</button>
        </div>
        <button className="btn btn-primary" onClick={() => cafe.login(email, password)}>
          Log In
        </button>
        <div className="or-row">or</div>
        <button className="btn btn-apple" onClick={() => cafe.loginApple()}><AppleMark /> Sign in with Apple</button>
        <p className="auth-foot">
          New here? <button onClick={() => { setEmail(""); setPassword(""); cafe.setPhase("register"); }}>Create an account</button>
        </p>
        <button
          className="auth-demo"
          onClick={() => {
            setEmail("alex@forgetmenot.cafe");
            setPassword("latte123");
          }}
        >
          Use the preview account
        </button>
      </AuthPage>
    );
  }

  if (cafe.phase === "register") {
    const diets = ["Dairy-free", "Caffeine-free", "Oat milk", "Almond milk", "Coconut milk", "Vegetarian"];
    return (
      <AuthPage title="Create account" lead="A few details so we can keep your orders, points, and birthday treat." onBack={() => cafe.setPhase("welcome")} logo={logo}>
        <p className="auth-section">About you</p>
        <div className="auth-card">
          <Field label="Full name" value={name} onChange={setName} autoComplete="name" placeholder="Alex Morgan" />
          <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" placeholder="name@email.com" />
          <Field label="Mobile" value={phone} onChange={setPhone} type="tel" autoComplete="tel" placeholder="(907) 555-0142" />
        </div>
        <p className="auth-section">Password</p>
        <div className="auth-card">
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Password"
            right={<ShowPassword show={show} onToggle={() => setShow((v) => !v)} />}
          />
        </div>
        <p className="auth-section">Birthday reward</p>
        <div className="auth-card">
          <label className="auth-field">
            <span>Birthday</span>
            <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          </label>
        </div>
        <p className="auth-section">Preferences</p>
        <div className="auth-chips">
          {diets.map((d) => (
            <button key={d} className={`chip ${diet.includes(d) ? "on" : ""}`} onClick={() => setDiet((list) => (list.includes(d) ? list.filter((x) => x !== d) : [...list, d]))}>{d}</button>
          ))}
        </div>
        <label className="auth-check">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
          <span>I agree to the Terms and Privacy Policy.</span>
        </label>
        <button className="btn btn-primary" onClick={() => cafe.register({ name, email, phone, password, birthday, dietary: diet })}>
          Create Account
        </button>
        <p className="auth-foot">
          Already have an account? <button onClick={() => cafe.setPhase("login")}>Log in</button>
        </p>
      </AuthPage>
    );
  }

  if (cafe.phase === "forgot") {
    return (
      <AuthPage title="Reset password" lead="We’ll send a 6-digit code to your email. In this preview, any 6 digits will do." onBack={() => cafe.setPhase("login")} logo={logo}>
        <div className="auth-card">
          <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" placeholder="name@email.com" />
        </div>
        <button className="btn btn-primary" onClick={() => cafe.sendReset(email)}>Send Code</button>
      </AuthPage>
    );
  }

  if (cafe.phase === "otp") {
    const code = otp.join("");
    return (
      <AuthPage title="Enter the code" lead={`Sent to ${cafe.resetEmail || "your email"}.`} onBack={() => cafe.setPhase("forgot")} logo={logo}>
        <div className="otp-row">
          {otp.map((digit, index) => (
            <input
              key={index}
              value={digit}
              size={1}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              aria-label={`Digit ${index + 1}`}
              onChange={(e) => {
                const next = e.target.value.replace(/\D/g, "").slice(-1);
                const copy = [...otp];
                copy[index] = next;
                setOtp(copy);
                const sibling = e.target.nextElementSibling;
                if (next && sibling instanceof HTMLInputElement) sibling.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !otp[index]) {
                  const sibling = e.currentTarget.previousElementSibling;
                  if (sibling instanceof HTMLInputElement) sibling.focus();
                }
              }}
            />
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => cafe.verifyOtp(code)}>Verify</button>
        <button className="btn btn-plain" onClick={() => cafe.pushToast("Code sent again")}>Resend code</button>
      </AuthPage>
    );
  }

  return (
    <AuthPage title="New password" lead="Choose something you don’t use for other accounts." onBack={() => cafe.setPhase("otp")} logo={logo}>
      <div className="auth-card">
        <Field
          label="New password"
          value={password}
          onChange={setPassword}
          type={show ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Password"
          right={<ShowPassword show={show} onToggle={() => setShow((v) => !v)} />}
        />
      </div>
      <button className="btn btn-primary" onClick={() => cafe.setPassword(password)}>Update Password</button>
    </AuthPage>
  );
}

function AuthPage({ title, lead, onBack, logo, children }: { title: string; lead: string; onBack: () => void; logo: string; children: React.ReactNode }) {
  return (
    <div className="page auth">
      <img className="auth-bg" src={asset("photos/auth-cup-light.jpg")} alt="" />
      <div className="auth-bg-fade" />
      <div className="auth-front">
        <NavBar title={title} onBack={onBack} />
        <div className="screen-pad">
          <img className="auth-mark" src={logo} alt="" />
          <h1 className="h-display">{title}</h1>
          <p className="auth-lead">{lead}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Permissions() {
  const cafe = useCafe();
  const [step, setStep] = useState<"note" | "loc" | "sys">("note");
  const logo = asset(cafe.resolvedTheme === "dark" ? "brand/logo-w.png" : "brand/logo.png");
  return (
    <div className="page">
      <NavBar title={step === "loc" ? "Location" : "Notifications"} />
      <div className="screen-pad">
        {step !== "sys" && <img className="perm-mark" src={logo} alt="" />}
        {step === "note" && (
          <>
            <h1 className="h-display screen-title">Know when it’s ready</h1>
            <p className="lead">We’ll only ping you when your drink hits the window, and for offers you opt into. You can change this anytime.</p>
            <div className="actions">
              <button className="btn btn-primary" onClick={() => setStep("sys")}>Continue</button>
              <button className="btn btn-plain" onClick={() => setStep("loc")}>Not now</button>
            </div>
          </>
        )}
        {step === "sys" && (
          <div className="alert" style={{ marginTop: 28 }}>
            <h3>“Forget Me Not” Would Like to Send You Notifications</h3>
            <p>Alerts include order status and the occasional seasonal special.</p>
            <div className="alert-actions">
              <button onClick={() => setStep("loc")}>Don’t Allow</button>
              <button className="bold" onClick={() => setStep("loc")}>Allow</button>
            </div>
          </div>
        )}
        {step === "loc" && (
          <>
            <h1 className="h-display screen-title">Find the window</h1>
            <p className="lead">Location is used for directions to 1246 Noble Street and to show whether we’re open. We don’t track you in the background.</p>
            <div className="actions">
              <button className="btn btn-primary" onClick={() => cafe.finishPerms()}>Allow Location</button>
              <button className="btn btn-plain" onClick={() => cafe.finishPerms()}>Not now</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
