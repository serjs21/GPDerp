export const PILL_W = 320;
export const PILL_H = 44;

export const PILL_CAPSULE_D =
  "M 22 0 H 298 A 22 22 0 0 1 320 22 A 22 22 0 0 1 298 44 H 22 A 22 22 0 0 1 0 22 A 22 22 0 0 1 22 0 Z";
export const SEAM_S_D = "M 160 0 Q 145 11 160 22 Q 175 33 160 44";
export const SEAM_S_TO_H_D1 = "M 154 2 Q 144 12 160 22 Q 176 32 166 42";
export const SEAM_S_TO_H_D2 = "M 120 6 Q 146 16 170 22 Q 194 28 220 38";
export const SEAM_S_TO_H_D3 = "M 70 16 Q 136 20 160 22 Q 184 24 250 28";
export const SEAM_H_D = "M 0 22 L 320 22";

function yinLeftRegion(cx, amp = 14) {
  return `M 22 0 H ${cx} Q ${cx - amp} 11 ${cx} 22 Q ${cx + amp} 33 ${cx} 44 H 22 A 22 22 0 0 1 0 22 A 22 22 0 0 1 22 0 Z`;
}

const TOP_SPLIT_D = "M 22 0 H 298 A 22 22 0 0 1 320 22 H 0 A 22 22 0 0 1 22 0 Z";
const LEFT_SLIVER_D = "M 22 0 H 54 A 22 22 0 0 1 54 44 H 22 A 22 22 0 0 1 0 22 A 22 22 0 0 1 22 0 Z";

export const expectedStates = [
  {
    name: "idle",
    whitePathD: yinLeftRegion(160, 15),
    seamPathD: SEAM_S_D,
    seamOpacity: 0.4,
    loginOpacity: 1,
    registerOpacity: 1,
    registerColor: "#fff",
  },
  {
    name: "login-10",
    whitePathD: yinLeftRegion(176, 13),
    seamPathD: SEAM_S_D,
    seamOpacity: 0.3,
    loginOpacity: 1,
    registerOpacity: 0.45,
    registerColor: "#fff",
  },
  {
    name: "login-s2h-15",
    whitePathD: yinLeftRegion(188, 12),
    seamPathD: SEAM_S_TO_H_D1,
    seamOpacity: 0.26,
    loginOpacity: 1,
    registerOpacity: 0.3,
    registerColor: "#fff",
  },
  {
    name: "login-s2h-22",
    whitePathD: yinLeftRegion(204, 10),
    seamPathD: SEAM_S_TO_H_D2,
    seamOpacity: 0.22,
    loginOpacity: 1,
    registerOpacity: 0.24,
    registerColor: "#fff",
  },
  {
    name: "login-s2h-30",
    whitePathD: TOP_SPLIT_D,
    seamPathD: SEAM_S_TO_H_D3,
    seamOpacity: 0.18,
    loginOpacity: 1,
    registerOpacity: 0.2,
    registerColor: "#fff",
  },
  {
    name: "login-25",
    whitePathD: TOP_SPLIT_D,
    seamPathD: SEAM_H_D,
    seamOpacity: 0.22,
    loginOpacity: 1,
    registerOpacity: 0.2,
    registerColor: "#fff",
  },
  {
    name: "login-45",
    whitePathD: PILL_CAPSULE_D,
    seamPathD: SEAM_H_D,
    seamOpacity: 0.08,
    loginOpacity: 1,
    registerOpacity: 0.08,
    registerColor: "#bd003f",
  },
  {
    name: "login-70",
    whitePathD: PILL_CAPSULE_D,
    seamPathD: SEAM_H_D,
    seamOpacity: 0,
    loginOpacity: 1,
    registerOpacity: 0,
    registerColor: "#bd003f",
  },
  {
    name: "login-end",
    whitePathD: PILL_CAPSULE_D,
    seamPathD: SEAM_H_D,
    seamOpacity: 0,
    loginOpacity: 1,
    registerOpacity: 0,
    registerColor: "#bd003f",
  },
  {
    name: "register-10",
    whitePathD: yinLeftRegion(146, 12),
    seamPathD: SEAM_S_D,
    seamOpacity: 0.3,
    loginOpacity: 0.45,
    registerOpacity: 1,
    registerColor: "#fff",
  },
  {
    name: "register-s2h-15",
    whitePathD: yinLeftRegion(136, 11),
    seamPathD: SEAM_S_TO_H_D1,
    seamOpacity: 0.26,
    loginOpacity: 0.3,
    registerOpacity: 1,
    registerColor: "#fff",
  },
  {
    name: "register-s2h-22",
    whitePathD: yinLeftRegion(126, 10),
    seamPathD: SEAM_S_TO_H_D2,
    seamOpacity: 0.22,
    loginOpacity: 0.24,
    registerOpacity: 1,
    registerColor: "#fff",
  },
  {
    name: "register-s2h-30",
    whitePathD: yinLeftRegion(112, 9),
    seamPathD: SEAM_S_TO_H_D3,
    seamOpacity: 0.18,
    loginOpacity: 0.2,
    registerOpacity: 1,
    registerColor: "#fff",
  },
  {
    name: "register-25",
    whitePathD: yinLeftRegion(122, 10),
    seamPathD: SEAM_S_D,
    seamOpacity: 0.22,
    loginOpacity: 0.2,
    registerOpacity: 1,
    registerColor: "#fff",
  },
  {
    name: "register-45",
    whitePathD: LEFT_SLIVER_D,
    seamPathD: SEAM_H_D,
    seamOpacity: 0.14,
    loginOpacity: 0.08,
    registerOpacity: 1,
    registerColor: "#fff",
  },
  {
    name: "register-70",
    whitePathD: LEFT_SLIVER_D,
    seamPathD: SEAM_H_D,
    seamOpacity: 0.08,
    loginOpacity: 0,
    registerOpacity: 1,
    registerColor: "#fff",
  },
  {
    name: "register-end",
    whitePathD: LEFT_SLIVER_D,
    whiteOpacity: 0,
    seamPathD: SEAM_H_D,
    seamOpacity: 0,
    loginOpacity: 0,
    registerOpacity: 1,
    registerColor: "#fff",
  },
];

export function renderExpectedHtml(state) {
  const whiteOpacity = state.whiteOpacity ?? 1;
  return `<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #0d1117;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    }
    .frame {
      padding: 18px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.02);
    }
    .pill {
      width: ${PILL_W}px;
      height: ${PILL_H}px;
      border-radius: 999px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.16);
    }
    .labels {
      position: absolute;
      inset: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      place-items: center;
      font-weight: 700;
      font-size: 28px;
      letter-spacing: 0.1px;
      transform: scale(0.5);
      transform-origin: top left;
      width: 200%;
      height: 200%;
      z-index: 2;
    }
    .login {
      color: #bd003f;
      text-shadow: 0 0 1px rgba(255,255,255,0.7);
      opacity: ${state.loginOpacity};
      transform: translateY(1px);
    }
    .register {
      color: ${state.registerColor};
      text-shadow: 0 0 1px rgba(0,0,0,0.32);
      opacity: ${state.registerOpacity};
      transform: translateY(1px);
    }
  </style>
</head>
<body>
  <div class="frame">
    <div class="pill">
      <svg width="${PILL_W}" height="${PILL_H}" viewBox="0 0 320 44" aria-hidden>
        <defs>
          <clipPath id="pillClip"><path d="${PILL_CAPSULE_D}" /></clipPath>
        </defs>
        <g clip-path="url(#pillClip)">
          <rect x="0" y="0" width="320" height="44" fill="#bd003f" />
          <path d="${state.whitePathD}" fill="#f8f7f3" opacity="${whiteOpacity}" />
          <path
            d="${state.seamPathD}"
            fill="none"
            stroke="rgba(255,255,255,0.62)"
            stroke-width="2.4"
            stroke-linecap="round"
            opacity="${state.seamOpacity}"
          />
        </g>
      </svg>
      <div class="labels">
        <span class="login">Login</span>
        <span class="register">Register</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

