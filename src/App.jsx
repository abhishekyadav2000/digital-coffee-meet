import { useState, useEffect, useRef, useMemo, useCallback } from "react";

/* ================= DIGITAL COFFEE MEET ================= */

const CSS = `

:root{
  --roast:#120C08; --roast2:#1B120B;
  --cream:#F3E7D3; --cream-dim:#C9B99F;
  --green:#2E5C46; --leaf:#7CC79B;
  --gold:#D9A94E;
  --glass:rgba(255,244,228,0.055);
  --glass-brd:rgba(255,244,228,0.13);
}
.dcm-root{ font-family:'Outfit',system-ui,sans-serif; background:var(--roast); color:var(--cream); min-height:100vh; overflow-x:hidden; }
.dcm-display{ font-family:'Fraunces',serif; }
.dcm-mono{ font-family:'JetBrains Mono',monospace; font-variant-numeric:tabular-nums; }

.glass-card{ background:var(--glass); border:1px solid var(--glass-brd); border-radius:20px; backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); box-shadow:0 18px 50px -30px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,244,228,.07); }

.chip{ transition:all .22s cubic-bezier(.4,0,.2,1); border:1px solid var(--glass-brd); background:rgba(255,244,228,.04); }
.chip:hover{ transform:translateY(-2px); border-color:rgba(217,169,78,.55); background:rgba(217,169,78,.08); }
.chip.active{ border-color:var(--gold); background:rgba(217,169,78,.14); box-shadow:0 6px 24px -10px rgba(217,169,78,.5); }

.drink-tile{ transition:all .25s cubic-bezier(.34,1.4,.5,1); border:1px solid var(--glass-brd); background:rgba(255,244,228,.035); cursor:pointer; }
.drink-tile:hover{ transform:translateY(-3px) scale(1.02); background:rgba(255,244,228,.07); }
.drink-tile.active{ border-color:var(--tile-accent,var(--gold)); background:rgba(255,244,228,.08); box-shadow:0 10px 30px -14px var(--tile-accent,var(--gold)); }
.drink-tag{ font-size:10px; text-transform:uppercase; letter-spacing:.08em; border-radius:999px; padding:2px 8px; }
.drink-tag--gold{ color:var(--gold); background:rgba(217,169,78,.08); border:1px solid rgba(217,169,78,.28); }
.drink-tag--matcha{ background:rgba(255,244,228,.05); border:1px solid rgba(255,244,228,.1); }

.btn{ transition:all .2s ease; border:1px solid transparent; font-weight:600; letter-spacing:.02em; }
.btn:active{ transform:scale(.965); }
.btn-primary{ background:linear-gradient(135deg,#3A7458,#2E5C46); color:#F3E7D3; box-shadow:0 10px 28px -12px rgba(124,199,155,.55), inset 0 1px 0 rgba(255,255,255,.16); }
.btn-primary:hover{ filter:brightness(1.12); box-shadow:0 14px 34px -12px rgba(124,199,155,.7); }
.btn-ghost{ background:rgba(255,244,228,.05); border-color:var(--glass-brd); color:var(--cream); }
.btn-ghost:hover{ background:rgba(255,244,228,.1); border-color:rgba(255,244,228,.28); }
.btn-gold{ background:linear-gradient(135deg,#E2B75E,#B9873A); color:#241708; box-shadow:0 10px 26px -12px rgba(217,169,78,.6), inset 0 1px 0 rgba(255,255,255,.3); }
.btn-gold:hover{ filter:brightness(1.08); }
.btn:disabled{ opacity:.4; pointer-events:none; }

.chip:focus-visible, .btn:focus-visible, .drink-tile:focus-visible{
  outline:2px solid var(--leaf); outline-offset:2px;
}

.field{ background:rgba(0,0,0,.28); border:1px solid var(--glass-brd); color:var(--cream); border-radius:10px; transition:border-color .2s; }
.field:focus{ outline:none; border-color:var(--leaf); box-shadow:0 0 0 3px rgba(124,199,155,.14); }
.field::placeholder{ color:rgba(243,231,211,.32); }

@keyframes waveA{ from{transform:translateX(0)} to{transform:translateX(-140px)} }
@keyframes waveB{ from{transform:translateX(-140px)} to{transform:translateX(0)} }
@keyframes steamRise{
  0%{ transform:translateY(0) translateX(0) scaleX(1); opacity:0 }
  25%{ opacity:.55 }
  60%{ opacity:.32 }
  100%{ transform:translateY(-84px) translateX(var(--sway,8px)) scaleX(1.6); opacity:0 }
}
@keyframes particleDrift{
  0%{ transform:translateY(0) translateX(0); opacity:0 }
  20%{ opacity:var(--po,.35) }
  80%{ opacity:var(--po,.35) }
  100%{ transform:translateY(-46vh) translateX(var(--px,30px)); opacity:0 }
}
@keyframes iceBob{ 0%,100%{ transform:translateY(0) rotate(var(--rot,8deg)) } 50%{ transform:translateY(5px) rotate(calc(var(--rot,8deg) - 5deg)) } }
@keyframes urgentPulse{
  0%,100%{ filter:drop-shadow(0 0 14px rgba(217,169,78,.35)) }
  50%{ filter:drop-shadow(0 0 34px rgba(226,120,72,.75)) }
}
@keyframes clockUrgent{ 0%,100%{ transform:scale(1)} 50%{ transform:scale(1.06)} }
@keyframes fadeUp{ from{ opacity:0; transform:translateY(14px)} to{ opacity:1; transform:translateY(0)} }
@keyframes shimmer{ 0%{ background-position:-200% center } 100%{ background-position:200% center } }
@keyframes glowBreathe{ 0%,100%{ opacity:.5; transform:scale(1)} 50%{ opacity:.85; transform:scale(1.06)} }

.fade-up{ animation:fadeUp .5s cubic-bezier(.2,.8,.3,1) both; }
.mug-urgent{ animation:urgentPulse 1s ease-in-out infinite; }
.clock-urgent{ animation:clockUrgent 1s ease-in-out infinite; color:var(--gold) !important; }
.shimmer-text{
  background:linear-gradient(100deg,#D9A94E 20%,#F7E3B0 40%,#D9A94E 60%);
  background-size:200% auto; -webkit-background-clip:text; background-clip:text; color:transparent;
  animation:shimmer 2.6s linear infinite;
}
.steam-wisp{ position:absolute; bottom:0; width:9px; height:38px; border-radius:50%;
  background:radial-gradient(ellipse at center, rgba(243,231,211,.75), rgba(243,231,211,0) 70%);
  filter:blur(4px); animation:steamRise var(--dur,3.2s) ease-in-out infinite; animation-delay:var(--del,0s); }
.bg-particle{ position:fixed; border-radius:50%; filter:blur(2px); pointer-events:none;
  background:radial-gradient(circle, rgba(243,231,211,.5), transparent 70%);
  animation:particleDrift var(--dur,14s) linear infinite; animation-delay:var(--del,0s); }
.mood-glow{ transition:background 1s ease; animation:glowBreathe 6s ease-in-out infinite; }
.mood-glow-pos{ position:absolute; left:50%; top:46%; transform:translate(-50%,-50%); width:min(90vw,560px); height:min(90vw,560px); }

.eyebrow{ font-size:11px; text-transform:uppercase; letter-spacing:.22em; color:var(--cream-dim); }
.sublabel{ font-size:10.5px; text-transform:uppercase; letter-spacing:.24em; color:var(--cream-dim); }
.clock-label{ font-size:9.5px; text-transform:uppercase; letter-spacing:.3em; }
.clock-num{ font-size:clamp(32px, 9vw, 44px); }
.mug-svg{ width:min(78vw, 360px); }
.clock-pos{ top:44%; }
.min-h-mug{ min-height:440px; }
.hero-lh{ line-height:1.05; }
.t-15{ font-size:15px; }
.t-11{ font-size:11px; }
.t-10{ font-size:10.5px; }
.main-grid{ display:grid; gap:1rem; }
@media (min-width:1024px){ .main-grid{ grid-template-columns:300px minmax(0,1fr) 300px; } }

@media (prefers-reduced-motion:reduce){
  .steam-wisp,.bg-particle,.mood-glow,.shimmer-text,.mug-urgent,.clock-urgent{ animation:none !important; }
  *{ transition-duration:.01ms !important; }
}
`;

/* ---------------- Drinks ---------------- */
const DRINKS = [
  { id:"espresso",  name:"Espresso",   emoji:"☕", liquid:"#31190F", liquidHi:"#5A3018", foam:"#C08A4F", foamH:9,  hot:true,  ice:false, mood:"#8A5A33", note:"Short. Intense. Straight to the point.", aroma:["Bold","Roasty","Quick"], fortune:"Big things come in small cups. Keep it sharp." },
  { id:"latte",     name:"Latte",      emoji:"🥛", liquid:"#C49A6C", liquidHi:"#DEB98C", foam:"#F2E4CC", foamH:26, hot:true,  ice:false, mood:"#B98F5E", note:"Smooth talker. Easy pace.", aroma:["Creamy","Mellow","Warm"], fortune:"The smoothest conversations start with a good pour." },
  { id:"cappuccino",name:"Cappuccino", emoji:"🫧", liquid:"#A9784B", liquidHi:"#C79A67", foam:"#F6ECD9", foamH:38, hot:true,  ice:false, mood:"#A67C4B", note:"Classic. Heavy on the foam.", aroma:["Frothy","Balanced","Classic"], fortune:"A little froth on top makes everything feel special." },
  { id:"matcha",    name:"Matcha",     emoji:"🍵", liquid:"#7FA65A", liquidHi:"#9DC077", foam:"#EAF2DA", foamH:18, hot:true,  ice:false, mood:"#5E8A47", note:"Calm focus. Zen pitch energy.", aroma:["Grassy","Calm","Focused"], fortune:"Steady focus beats loud energy. Breathe, then begin." },
  { id:"mocha",     name:"Mocha",      emoji:"🍫", liquid:"#4A2A1A", liquidHi:"#6E4327", foam:"#E9D2B8", foamH:22, hot:true,  ice:false, mood:"#6B3E22", note:"Sweet close. Chocolate finish.", aroma:["Chocolatey","Rich","Sweet"], fortune:"End on something sweet and they'll remember you." },
  { id:"americano", name:"Americano",  emoji:"🌊", liquid:"#33200F", liquidHi:"#4F3418", foam:null,      foamH:0,  hot:true,  ice:false, mood:"#6E4B2A", note:"No frills. All business.", aroma:["Clean","Simple","Honest"], fortune:"Simplicity is a flex. Say less, mean more." },
  { id:"coldbrew",  name:"Cold Brew",  emoji:"🧊", liquid:"#21130C", liquidHi:"#3B2414", foam:null,      foamH:0,  hot:false, ice:true,  mood:"#3E5A66", note:"Ice cold delivery. Zero steam.", aroma:["Smooth","Cool","Slow-steeped"], fortune:"Good things take time to steep. Stay cool." },
  { id:"chai",      name:"Chai Latte", emoji:"✨", liquid:"#B78347", liquidHi:"#D3A468", foam:"#F3E2C8", foamH:24, hot:true,  ice:false, mood:"#A5713B", note:"Spiced. Warm. Memorable.", aroma:["Spiced","Cozy","Fragrant"], fortune:"A little spice makes any moment memorable." },
];

const PRESETS = [
  { label:"0:30", sec:30 }, { label:"1:00", sec:60 }, { label:"2:00", sec:120 },
  { label:"5:00", sec:300 }, { label:"10:00", sec:600 },
];

const fmt = (ms) => {
  const t = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(t / 60), s = t % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
};

/* ---------------- HeaderLogo ---------------- */
function LogoBadge({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="lgRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7CC79B" /><stop offset="55%" stopColor="#2E5C46" /><stop offset="100%" stopColor="#D9A94E" />
        </linearGradient>
        <linearGradient id="lgCup" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3E7D3" /><stop offset="100%" stopColor="#C9B99F" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="47" fill="#17100A" stroke="url(#lgRing)" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(243,231,211,.14)" strokeWidth="1" strokeDasharray="2.4 4.2" />
      {/* steam */}
      <path d="M42 30 q3 -5 0 -9 q-3 -4 0 -8" fill="none" stroke="#7CC79B" strokeWidth="2.2" strokeLinecap="round" opacity=".85"/>
      <path d="M52 32 q3 -5 0 -9 q-3 -4 0 -8" fill="none" stroke="#D9A94E" strokeWidth="2.2" strokeLinecap="round" opacity=".85"/>
      {/* cup */}
      <path d="M32 40 h30 l-3.4 22 q-.7 5 -6 5 h-11.2 q-5.3 0 -6 -5 Z" fill="url(#lgCup)"/>
      <path d="M62 43 q10 0 9 8 q-1 8 -10.5 7.2" fill="none" stroke="url(#lgCup)" strokeWidth="3.4" strokeLinecap="round"/>
      {/* digital clock element on cup */}
      <rect x="37" y="46" width="20" height="10" rx="2.4" fill="#17100A"/>
      <text x="47" y="53.8" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7" fontWeight="700" fill="#7CC79B">2:00</text>
      <path d="M30 74 h40" stroke="#D9A94E" strokeWidth="2" strokeLinecap="round" opacity=".9"/>
    </svg>
  );
}

function HeaderLogo() {
  return (
    <header className="flex items-center gap-3 px-5 sm:px-8 py-4 relative z-20">
      <LogoBadge size={46} />
      <div>
        <div className="dcm-display font-semibold tracking-wide t-15 sm:text-base leading-tight">DIGITAL COFFEE MEET</div>
        <div className="sublabel" style={{color:"var(--cream-dim)"}}>Pitch-timer café</div>
      </div>
      <div className="ml-auto hidden sm:flex items-center gap-2 text-xs" style={{color:"var(--cream-dim)"}}>
        <span className="w-1.5 h-1.5 rounded-full" style={{background:"var(--leaf)", boxShadow:"0 0 8px var(--leaf)"}} />
        Bar is open
      </div>
    </header>
  );
}

/* Drink tile/tag accents: gold for readability on dark UI; Matcha keeps its green */
const drinkTileAccent = (d) => (d.id === "matcha" ? d.liquidHi : "var(--gold)");

/* ---------------- CoffeeSelector ---------------- */
function CoffeeSelector({ drink, onSelect, disabled }) {
  const isMatcha = drink.id === "matcha";
  return (
    <section className="glass-card p-4 sm:p-5">
      <h2 className="eyebrow mb-3" style={{color:"var(--cream-dim)"}}>Their drink</h2>
      <div className="grid grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2">
        {DRINKS.map((d) => (
          <button key={d.id} onClick={() => onSelect(d)} disabled={disabled}
            className={`drink-tile rounded-xl px-1.5 py-2.5 flex flex-col items-center gap-1 ${drink.id===d.id?"active":""} ${disabled?"opacity-50 cursor-not-allowed":""}`}
            style={{ "--tile-accent": drinkTileAccent(d) }} title={d.note} aria-pressed={drink.id===d.id}>
            <span className="w-6 h-6 rounded-full border" style={{ background:`linear-gradient(180deg, ${d.foam||d.liquidHi} 0 28%, ${d.liquid} 32%)`, borderColor:"rgba(243,231,211,.25)" }} />
            <span className="t-10 font-medium leading-tight text-center" style={{color:"var(--cream)"}}>{d.name}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs italic" style={{color:"var(--cream-dim)"}}>{drink.note}</p>
      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {drink.aroma.map((a) => (
          <span key={a}
            className={`drink-tag ${isMatcha ? "drink-tag--matcha" : "drink-tag--gold"}`}
            style={isMatcha ? { color: drink.liquidHi } : undefined}>
            {a}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------------- TimerControls ---------------- */
function TimerControls({ totalSec, setTotalSec, status, onStart, onPause, onResume, onReset, onRefill, disabled }) {
  const [custom, setCustom] = useState("");
  const [customError, setCustomError] = useState("");
  const applyCustom = () => {
    const v = custom.trim();
    if (!v) return;
    const parts = v.split(":");
    if (parts.length > 2 || !/^[\d:.\s]+$/.test(v)) { setCustomError("Use minutes (3.5) or mm:ss (3:30)"); return; }
    let sec = 0;
    if (parts.length === 2) { sec = (parseInt(parts[0])||0)*60 + (parseInt(parts[1])||0); }
    else sec = Math.round(parseFloat(v)*60) || 0;
    if (!sec || sec < 5) { setCustomError("Minimum 5 seconds"); return; }
    if (sec > 3600) { setCustomError("Maximum 60 minutes"); return; }
    setCustomError("");
    setTotalSec(sec);
    setCustom("");
  };
  return (
    <section className="glass-card p-4 sm:p-5">
      <h2 className="eyebrow mb-3" style={{color:"var(--cream-dim)"}}>Brew time</h2>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p.sec} onClick={() => setTotalSec(p.sec)} disabled={disabled}
            className={`chip dcm-mono rounded-full px-3.5 py-1.5 text-sm ${totalSec===p.sec?"active":""} ${disabled?"opacity-50":""}`}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <input value={custom} onChange={e=>{setCustom(e.target.value); setCustomError("");}} onKeyDown={e=>e.key==="Enter"&&applyCustom()}
          placeholder="Custom — e.g. 3:30 or 3.5" disabled={disabled}
          className="field flex-1 px-3 py-2 text-sm min-w-0" aria-label="Custom duration in minutes or mm:ss (5 seconds to 60 minutes)"
          aria-invalid={!!customError} />
        <button onClick={applyCustom} disabled={disabled} className="btn btn-ghost rounded-lg px-3.5 text-sm">Set</button>
      </div>
      {customError && <p className="text-xs mt-1.5" style={{color:"#E29B6B"}} role="alert">{customError}</p>}

      <div className="grid grid-cols-2 gap-2 mt-4">
        {status === "idle" && (
          <button onClick={onStart} className="btn btn-primary col-span-2 rounded-xl py-3 t-15">▶ Start Coffee Meet</button>
        )}
        {status === "running" && (
          <button onClick={onPause} className="btn btn-ghost col-span-2 rounded-xl py-3 t-15">⏸ Pause</button>
        )}
        {status === "paused" && (
          <button onClick={onResume} className="btn btn-primary col-span-2 rounded-xl py-3 t-15">▶ Resume</button>
        )}
        {status === "done" && (
          <button onClick={onRefill} className="btn btn-gold col-span-2 rounded-xl py-3 t-15">☕ Refill Coffee</button>
        )}
        {status === "done" ? (
          <button onClick={onReset} className="btn btn-ghost col-span-2 rounded-xl py-2.5 text-sm">↺ Reset</button>
        ) : (
          <>
            <button onClick={onReset} className="btn btn-ghost rounded-xl py-2.5 text-sm">↺ Reset</button>
            <button onClick={onRefill} className="btn btn-ghost rounded-xl py-2.5 text-sm" disabled={status==="idle"}>☕ Top up</button>
          </>
        )}
      </div>
    </section>
  );
}

/* ---------------- GlassMugTimer ---------------- */
function GlassMugTimer({ drink, level, remainingMs, status, urgent }) {
  // Inner liquid region of the mug (SVG coords)
  const innerTop = 76, innerBot = 308, innerH = innerBot - innerTop;
  const surfaceY = innerTop + (1 - level) * innerH;
  const foamH = drink.foamH * Math.min(1, level * 4); // foam thins out as cup empties
  const wave = "M0 8 Q 17.5 0 35 8 T 70 8 T 105 8 T 140 8 T 175 8 T 210 8 T 245 8 T 280 8 T 315 8 T 350 8 T 385 8 T 420 8 V 40 H 0 Z";
  const running = status === "running";

  return (
    <div className={`relative flex flex-col items-center ${urgent ? "mug-urgent" : ""}`} style={{ transition:"filter .4s" }}>
      {/* steam */}
      {drink.hot && level > 0.02 && (status==="running"||status==="paused"||status==="idle") && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-20 z-10 pointer-events-none" aria-hidden="true">
          <span className="steam-wisp" style={{left:"22%", "--dur":"3.4s", "--del":"0s",  "--sway":"-10px", opacity: running?1:.5}} />
          <span className="steam-wisp" style={{left:"48%", "--dur":"2.8s", "--del":".9s", "--sway":"6px",  opacity: running?1:.5}} />
          <span className="steam-wisp" style={{left:"70%", "--dur":"3.8s", "--del":"1.7s","--sway":"12px", opacity: running?1:.5}} />
        </div>
      )}

      <svg viewBox="0 0 320 360" className="mug-svg drop-shadow-2xl" role="img"
        aria-label={`Glass mug of ${drink.name}, ${Math.round(level*100)}% full`}>
        <defs>
          <clipPath id="mugClip">
            <path d="M100 74 L110 298 Q111 310 123 310 L197 310 Q209 310 210 298 L220 74 Z" />
          </clipPath>
          <linearGradient id="glassEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(243,231,211,.55)"/><stop offset="12%" stopColor="rgba(243,231,211,.12)"/>
            <stop offset="85%" stopColor="rgba(243,231,211,.1)"/><stop offset="100%" stopColor="rgba(243,231,211,.5)"/>
          </linearGradient>
          <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={drink.liquidHi}/><stop offset="100%" stopColor={drink.liquid}/>
          </linearGradient>
          <linearGradient id="saucer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(243,231,211,.25)"/><stop offset="100%" stopColor="rgba(243,231,211,.04)"/>
          </linearGradient>
        </defs>

        {/* saucer */}
        <ellipse cx="160" cy="330" rx="96" ry="12" fill="url(#saucer)" opacity=".8"/>
        <ellipse cx="160" cy="336" rx="70" ry="7" fill="rgba(0,0,0,.45)"/>

        {/* handle */}
        <path d="M222 118 C 276 112, 286 202, 226 210" fill="none" stroke="url(#glassEdge)" strokeWidth="15" strokeLinecap="round"/>
        <path d="M222 118 C 276 112, 286 202, 226 210" fill="none" stroke="rgba(243,231,211,.16)" strokeWidth="7" strokeLinecap="round"/>

        {/* glass body back tint */}
        <path d="M96 66 L107 300 Q108 316 124 316 L196 316 Q212 316 213 300 L224 66 Z" fill="rgba(243,231,211,.045)"/>

        {/* liquid */}
        <g clipPath="url(#mugClip)">
          <rect x="92" y={surfaceY} width="136" height={innerBot - surfaceY + 6} fill="url(#liquidGrad)" style={{transition:"y .35s linear, height .35s linear"}}/>
          {/* waves at surface */}
          <g transform={`translate(0 ${surfaceY - 8})`} style={{transition:"transform .35s linear"}}>
            <g style={{animation: running ? "waveA 3.2s linear infinite" : "none"}}>
              <path d={wave} transform="translate(60 0)" fill={drink.liquidHi} opacity=".9"/>
              <path d={wave} transform="translate(-80 0)" fill={drink.liquidHi} opacity=".9"/>
            </g>
            <g style={{animation: running ? "waveB 4.6s linear infinite" : "none"}}>
              <path d={wave} transform="translate(30 2)" fill={drink.liquid} opacity=".75"/>
              <path d={wave} transform="translate(-110 2)" fill={drink.liquid} opacity=".75"/>
            </g>
          </g>
          {/* foam layer */}
          {drink.foam && foamH > 1 && (
            <g transform={`translate(0 ${surfaceY - foamH - 4})`} style={{transition:"transform .35s linear"}}>
              <g style={{animation: running ? "waveA 5.4s linear infinite" : "none"}}>
                <path d={wave} transform="translate(20 0)" fill={drink.foam} opacity=".96"/>
                <path d={wave} transform="translate(-120 0)" fill={drink.foam} opacity=".96"/>
              </g>
              <rect x="92" y="10" width="136" height={foamH} fill={drink.foam} opacity=".96"/>
              <rect x="92" y={foamH + 2} width="136" height="4" fill="rgba(255,255,255,.28)"/>
            </g>
          )}
          {/* ice cubes for cold brew */}
          {drink.ice && level > 0.08 && (
            <g style={{transition:"transform .35s linear"}} transform={`translate(0 ${surfaceY})`}>
              <rect x="120" y="6" width="30" height="30" rx="7" fill="rgba(220,238,246,.32)" stroke="rgba(240,250,255,.5)" strokeWidth="1.5"
                style={{animation:"iceBob 3.4s ease-in-out infinite", transformBox:"fill-box", transformOrigin:"center", "--rot":"10deg"}}/>
              <rect x="166" y="12" width="26" height="26" rx="6" fill="rgba(220,238,246,.26)" stroke="rgba(240,250,255,.45)" strokeWidth="1.5"
                style={{animation:"iceBob 4.1s ease-in-out infinite", animationDelay:".6s", transformBox:"fill-box", transformOrigin:"center", "--rot":"-12deg"}}/>
            </g>
          )}
          {/* inner shading */}
          <path d="M100 74 L110 298 Q111 310 123 310 L140 310 L132 74 Z" fill="rgba(255,255,255,.07)"/>
        </g>

        {/* glass walls + rim */}
        <path d="M96 66 L107 300 Q108 316 124 316 L196 316 Q212 316 213 300 L224 66"
          fill="none" stroke="url(#glassEdge)" strokeWidth="4" strokeLinecap="round"/>
        <ellipse cx="160" cy="66" rx="64" ry="9" fill="none" stroke="rgba(243,231,211,.5)" strokeWidth="2.5"/>
        <ellipse cx="160" cy="66" rx="64" ry="9" fill="rgba(243,231,211,.05)"/>
        {/* highlight streak */}
        <path d="M112 92 L119 270" stroke="rgba(255,255,255,.35)" strokeWidth="7" strokeLinecap="round" opacity=".55"/>
      </svg>

      {/* digital clock overlay */}
      <div className={`absolute left-1/2 -translate-x-1/2 clock-pos -translate-y-1/2 z-10 ${urgent?"clock-urgent":""}`}>
        <div className="rounded-2xl px-5 py-2.5 text-center"
          style={{ background:"rgba(10,6,3,.42)", border:"1px solid rgba(243,231,211,.18)", backdropFilter:"blur(6px)", boxShadow:"0 8px 30px rgba(0,0,0,.45)" }}>
          <div className="dcm-mono font-bold clock-num leading-none" style={{ color:"var(--cream)", textShadow:"0 0 22px rgba(243,231,211,.28)" }}>
            {fmt(remainingMs)}
          </div>
          <div className="clock-label mt-1" style={{color: urgent ? "var(--gold)" : "var(--cream-dim)"}}>
            {status==="done" ? "cup empty" : status==="paused" ? "on hold" : urgent ? "last sips" : drink.name}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- PitchModePanel ---------------- */
const EMPTY_PITCH = { name:"", purpose:"", title:"", p1:"", p2:"", p3:"", cta:"" };

function PitchModePanel({ pitch, setPitch, live }) {
  const [open, setOpen] = useState(true);
  const set = (k) => (e) => setPitch(prev => ({ ...prev, [k]: e.target.value }));
  const points = [pitch.p1, pitch.p2, pitch.p3].filter(Boolean);

  if (live) {
    return (
      <section className="glass-card p-5 fade-up">
        <div className="eyebrow mb-1" style={{color:"var(--leaf)"}}>Now pitching</div>
        {(pitch.name || pitch.purpose) && (
          <div className="text-xs mb-2" style={{color:"var(--cream-dim)"}}>
            {pitch.name && <>with <span style={{color:"var(--cream)"}}>{pitch.name}</span></>}{pitch.name && pitch.purpose && " · "}{pitch.purpose}
          </div>
        )}
        <h3 className="dcm-display text-xl sm:text-2xl font-semibold leading-snug">{pitch.title || "Your pitch"}</h3>
        {points.length > 0 && (
          <ul className="mt-3 space-y-2">
            {points.slice(0,3).map((p,i)=>(
              <li key={i} className="flex gap-2.5 text-sm leading-snug">
                <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{background:"var(--gold)"}} />{p}
              </li>
            ))}
          </ul>
        )}
        {pitch.cta && (
          <div className="mt-4 rounded-xl px-3.5 py-2.5 text-sm font-medium"
            style={{background:"rgba(217,169,78,.1)", border:"1px solid rgba(217,169,78,.35)", color:"#F0D9A6"}}>
            → {pitch.cta}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="glass-card p-4 sm:p-5">
      <button onClick={()=>setOpen(o=>!o)} className="w-full flex items-center justify-between text-left">
        <h2 className="eyebrow" style={{color:"var(--cream-dim)"}}>Pitch mode</h2>
        <span className="text-xs" style={{color:"var(--cream-dim)"}}>{open?"−":"+"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <input className="field px-3 py-2 text-sm" placeholder="Their name" value={pitch.name} onChange={set("name")} />
            <input className="field px-3 py-2 text-sm" placeholder="Meeting purpose" value={pitch.purpose} onChange={set("purpose")} />
          </div>
          <input className="field w-full px-3 py-2 text-sm" placeholder="Pitch title" value={pitch.title} onChange={set("title")} />
          <input className="field w-full px-3 py-2 text-sm" placeholder="Talking point 1" value={pitch.p1} onChange={set("p1")} />
          <input className="field w-full px-3 py-2 text-sm" placeholder="Talking point 2" value={pitch.p2} onChange={set("p2")} />
          <input className="field w-full px-3 py-2 text-sm" placeholder="Talking point 3" value={pitch.p3} onChange={set("p3")} />
          <input className="field w-full px-3 py-2 text-sm" placeholder="Call to action — e.g. Book the follow-up" value={pitch.cta} onChange={set("cta")} />
          <p className="t-11" style={{color:"var(--cream-dim)"}}>These appear beside the mug while the coffee drains.</p>
        </div>
      )}
    </section>
  );
}

/* ---------------- SharePanel ---------------- */
function SharePanel({ drink, totalSec, pitch, onToast, host, setHost }) {
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      onToast("Copied to clipboard");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); onToast("Copied to clipboard"); }
      catch { onToast("Couldn't copy — select and copy manually"); }
      document.body.removeChild(ta);
    }
  };
  const buildLink = () => {
    const base = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
    const q = new URLSearchParams();
    q.set("drink", drink.id); q.set("t", String(totalSec));
    Object.entries(pitch).forEach(([k, v]) => { if (v) q.set(k, v); });
    if (host) q.set("from", host);
    return `${base}?${q.toString()}`;
  };
  const mm = Math.floor(totalSec/60), ss = totalSec%60;
  const dur = `${mm}:${String(ss).padStart(2,"0")}`;
  const invite = [
    `☕ You're invited to a Digital Coffee Meet`,
    `Drink: ${drink.name} · Timer: ${dur}`,
    pitch.title ? `Pitch: ${pitch.title}` : null,
    pitch.name ? `With: ${pitch.name}` : null,
    `Sip the coffee. Share the pitch. Beat the clock.`,
    buildLink(),
  ].filter(Boolean).join("\n");

  return (
    <section className="glass-card p-4 sm:p-5">
      <h2 className="eyebrow mb-3" style={{color:"var(--cream-dim)"}}>Share</h2>
      <input className="field w-full px-3 py-2 text-sm mb-2" placeholder="Hosted by (your name)" value={host} onChange={e=>setHost(e.target.value)} aria-label="Host name for the invite link" />
      <div className="grid grid-cols-1 gap-2">
        <button onClick={()=>copy(buildLink())} className="btn btn-ghost rounded-xl py-2.5 text-sm">
          🔗 Copy Meeting Link
        </button>
        <button onClick={()=>copy(invite)} className="btn btn-ghost rounded-xl py-2.5 text-sm">
          ✉️ Share Experience
        </button>
      </div>
      <p className="t-11 mt-3 leading-relaxed" style={{color:"var(--cream-dim)"}}>
        The link preloads their name, drink, and timer — when they open it, the coffee is already poured. Screen-share this tab and say: “Before I pitch, let me offer you a digital coffee.”
      </p>
    </section>
  );
}

/* ---------------- Ambient background ---------------- */
function Ambience({ mood }) {
  const particles = useMemo(() => Array.from({length:14}, (_,i)=>({
    left: `${(i*7.3+4)%96}%`, bottom: `${(i*13)%40}%`,
    size: 3 + (i%4)*2, dur: `${11 + (i%6)*3}s`, del: `${(i*1.7)%12}s`,
    px: `${(i%2?1:-1)*(14+(i%5)*10)}px`, po: 0.14 + (i%4)*0.07,
  })), []);
  return (
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0" style={{background:"radial-gradient(1200px 700px at 50% -10%, #241708 0%, transparent 60%), radial-gradient(900px 600px at 90% 110%, #17110B 0%, transparent 55%), var(--roast)"}}/>
      <div className="mood-glow mood-glow-pos rounded-full"
        style={{ background:`radial-gradient(circle, ${mood}33 0%, ${mood}14 40%, transparent 70%)`, filter:"blur(10px)" }}/>
      <div className="absolute inset-x-0 bottom-0 h-52" style={{background:"linear-gradient(to top, rgba(0,0,0,.55), transparent)"}}/>
      {particles.map((p,i)=>(
        <span key={i} className="bg-particle" style={{ left:p.left, bottom:p.bottom, width:p.size, height:p.size, "--dur":p.dur, "--del":p.del, "--px":p.px, "--po":p.po }}/>
      ))}
    </div>
  );
}

/* ---------------- App ---------------- */
export default function App() {
  const [drink, setDrink] = useState(DRINKS[1]); // Latte default
  const [totalSec, setTotalSecRaw] = useState(120);
  const [remainingMs, setRemainingMs] = useState(120000);
  const [status, setStatus] = useState("idle"); // idle | running | paused | done
  const [pitch, setPitch] = useState(EMPTY_PITCH);
  const [toast, setToast] = useState(null);
  const endAtRef = useRef(null);
  const toastTimer = useRef(null);
  const appRef = useRef(null);
  const [host, setHost] = useState("");
  const [invitedBy, setInvitedBy] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const prevStatus = useRef("idle");

  const setTotalSec = (sec) => {
    setTotalSecRaw(sec);
    if (status === "idle" || status === "done") { setRemainingMs(sec * 1000); if (status==="done") setStatus("idle"); }
  };

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => {
      const left = Math.max(0, endAtRef.current - Date.now());
      setRemainingMs(left);
      if (left <= 0) { setStatus("done"); clearInterval(id); }
    }, 100);
    return () => clearInterval(id);
  }, [status]);

  // Load a shared coffee meet from the URL (?drink=&t=&name=&title=&from=...)
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      if (![...q.keys()].length) return;
      const d = DRINKS.find(x => x.id === q.get("drink"));
      if (d) setDrink(d);
      const t = parseInt(q.get("t"), 10);
      if (t >= 5 && t <= 3600) { setTotalSecRaw(t); setRemainingMs(t * 1000); }
      const loaded = {};
      ["name","purpose","title","p1","p2","p3","cta"].forEach(k => { const v = q.get(k); if (v) loaded[k] = v; });
      if (Object.keys(loaded).length) setPitch(p => ({ ...p, ...loaded }));
      const from = q.get("from");
      if (from) { setHost(from); setInvitedBy(from); }
    } catch {}
  }, []);

  // Soft chime when the coffee finishes
  useEffect(() => {
    if (prevStatus.current !== "done" && status === "done" && soundOn) {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        [523.25, 659.25, 783.99].forEach((f, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = "sine"; o.frequency.value = f;
          o.connect(g); g.connect(ctx.destination);
          const t0 = ctx.currentTime + i * 0.13;
          g.gain.setValueAtTime(0, t0);
          g.gain.linearRampToValueAtTime(0.1, t0 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.5);
          o.start(t0); o.stop(t0 + 0.55);
        });
      } catch {}
    }
    prevStatus.current = status;
  }, [status, soundOn]);

  const start = () => { endAtRef.current = Date.now() + (remainingMs > 0 ? remainingMs : totalSec*1000); if (remainingMs<=0) setRemainingMs(totalSec*1000); setStatus("running"); };
  const pause = () => { setRemainingMs(Math.max(0, endAtRef.current - Date.now())); setStatus("paused"); };
  const resume = () => { endAtRef.current = Date.now() + remainingMs; setStatus("running"); };
  const reset = () => { setStatus("idle"); setRemainingMs(totalSec * 1000); };
  const refill = () => { setRemainingMs(totalSec * 1000); if (status === "running") endAtRef.current = Date.now() + totalSec*1000; else setStatus("idle"); };

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const level = totalSec > 0 ? Math.min(1, Math.max(0, remainingMs / (totalSec * 1000))) : 0;
  const urgent = status === "running" && remainingMs <= 10000 && remainingMs > 0;
  const live = status === "running" || status === "paused";

  const scrollToApp = () => appRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });

  // Keyboard shortcuts: Space start/pause, R refill, F focus mode, Esc exits focus
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.code === "Space") {
        e.preventDefault();
        if (status === "running") pause();
        else if (status === "paused") resume();
        else if (status === "idle") start();
      } else if (e.key === "r" || e.key === "R") { refill();
      } else if (e.key === "f" || e.key === "F") { setFocusMode(m => !m);
      } else if (e.key === "Escape") { setFocusMode(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="dcm-root">
      <style>{CSS}</style>
      <Ambience mood={drink.mood} />

      <div className="relative z-10 max-w-6xl mx-auto">
        {!focusMode && <HeaderLogo />}

        {/* Hero */}
        {!focusMode && <section className="px-5 sm:px-8 pt-8 sm:pt-14 pb-10 text-center fade-up">
          <div className="flex justify-center mb-5"><LogoBadge size={92} /></div>
          <h1 className="dcm-display text-4xl sm:text-6xl font-bold tracking-tight hero-lh">
            Digital Coffee <span style={{color:"var(--leaf)"}}>Meet</span>
          </h1>
          <p className="dcm-display italic text-lg sm:text-xl mt-3" style={{color:"var(--cream-dim)"}}>
            Sip the coffee. Share the pitch. Beat the clock.
          </p>
          <p className="max-w-xl mx-auto mt-4 t-15 leading-relaxed" style={{color:"var(--cream-dim)"}}>
            Offer anyone on your next call a digital coffee. Pick their drink, set the brew time,
            and pitch while the cup drains — when the coffee's gone, your time is up.
          </p>
          <button onClick={scrollToApp} className="btn btn-primary rounded-full px-7 py-3 mt-7 t-15">☕ Pour a coffee</button>
        </section>}

        {invitedBy && !focusMode && (
          <div className="px-4 sm:px-8 pb-4 fade-up">
            <div className="glass-card px-4 py-3 text-sm text-center" style={{borderColor:"rgba(124,199,155,.35)"}}>
              ☕ <span style={{color:"var(--leaf)", fontWeight:600}}>{invitedBy}</span> poured you a {drink.name}{pitch.name ? ` — welcome, ${pitch.name}!` : "."} Press Start when you're ready.
            </div>
          </div>
        )}

        {/* Main app */}
        <main ref={appRef} className={focusMode ? "px-4 pb-16 pt-10 flex justify-center" : "px-4 sm:px-8 pb-16 main-grid items-start scroll-mt-6"}>
          {/* Left column */}
          <div className={`space-y-4 order-2 lg:order-1 ${focusMode ? "hidden" : ""}`}>
            <CoffeeSelector drink={drink} onSelect={setDrink} disabled={status==="running"} />
            <TimerControls
              totalSec={totalSec} setTotalSec={setTotalSec} status={status}
              onStart={start} onPause={pause} onResume={resume} onReset={reset} onRefill={refill}
              disabled={status==="running" || status==="paused"}
            />
          </div>

          {/* Center mug */}
          <div className="order-1 lg:order-2 flex flex-col items-center justify-start pt-2 pb-6 min-h-mug">
            <GlassMugTimer drink={drink} level={level} remainingMs={remainingMs} status={status} urgent={urgent} />
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <button onClick={()=>setFocusMode(m=>!m)} className="btn btn-ghost rounded-full px-4 py-1.5 text-xs" title="Shortcut: F">
                {focusMode ? "✕ Exit focus" : "⛶ Focus mode"}
              </button>
              <button onClick={()=>setSoundOn(s=>!s)} className="btn btn-ghost rounded-full px-4 py-1.5 text-xs" title="Chime when the coffee finishes" aria-pressed={soundOn}>
                {soundOn ? "🔔 Chime on" : "🔕 Chime off"}
              </button>
              {focusMode && status !== "running" && (
                <button onClick={status==="paused" ? resume : status==="done" ? refill : start} className="btn btn-primary rounded-full px-4 py-1.5 text-xs">
                  ▶ {status==="paused" ? "Resume" : status==="done" ? "Refill" : "Start"}
                </button>
              )}
              {focusMode && status === "running" && (
                <button onClick={pause} className="btn btn-ghost rounded-full px-4 py-1.5 text-xs">⏸ Pause</button>
              )}
            </div>
            {status === "done" && (
              <div className="text-center mt-5 px-4 fade-up" style={{maxWidth:"420px"}}>
                <div className="dcm-display shimmer-text text-xl sm:text-2xl font-semibold">Coffee finished. Pitch delivered.</div>
                <div className="dcm-display italic text-sm sm:text-base mt-2.5 leading-relaxed" style={{color:"var(--cream)"}}>“{drink.fortune}”</div>
                <div className="eyebrow mt-3">Your {drink.name} fortune</div>
              </div>
            )}
            {focusMode && (
              <div className="text-center mt-4 fade-up" style={{maxWidth:"520px"}}>
                {pitch.title && <div className="dcm-display text-xl font-semibold">{pitch.title}</div>}
                {pitch.cta && <div className="text-sm mt-1" style={{color:"var(--gold)"}}>→ {pitch.cta}</div>}
                <div className="t-11 mt-2" style={{color:"var(--cream-dim)"}}>Space start/pause · R refill · Esc exit</div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className={`space-y-4 order-3 ${focusMode ? "hidden" : ""}`}>
            <PitchModePanel pitch={pitch} setPitch={setPitch} live={live} />
            <SharePanel drink={drink} totalSec={totalSec} pitch={pitch} onToast={showToast} host={host} setHost={setHost} />
          </div>
        </main>

        <footer className="px-5 pb-8 text-center t-11" style={{color:"rgba(201,185,159,.5)"}}>
          DIGITAL COFFEE MEET — an original coffeehouse for online meetings. Brewed with care, timed to the second.
        </footer>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 fade-up">
          <div className="glass-card px-4 py-2.5 text-sm" style={{borderColor:"rgba(124,199,155,.4)"}}>✓ {toast}</div>
        </div>
      )}
    </div>
  );
}
