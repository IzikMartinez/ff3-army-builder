<script lang="ts">
  import zapad from "../lib/images/zapad.png";
  import yugo from "../lib/images/yugo.svg";

  let { nationId, size = 44 }: { nationId: string; size?: number } = $props();

  /** Five-point star centred on (cx, cy), point up. */
  function star(cx: number, cy: number, outer: number, inner = outer * 0.382): string {
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(" ");
  }

  /** Pie slice of the r=20 disc between two angles (degrees, 0 = east, clockwise). */
  function sector(from: number, to: number, r = 20): string {
    const p = (deg: number) => {
      const a = (deg * Math.PI) / 180;
      return `${(24 + r * Math.cos(a)).toFixed(2)} ${(24 + r * Math.sin(a)).toFixed(2)}`;
    };
    return `M24 24 L${p(from)} A${r} ${r} 0 0 1 ${p(to)} Z`;
  }

  /** Concentric roundels, outermost first. */
  const ROUNDELS: Record<string, string[]> = {
    baor: ["#012169", "#ffffff", "#c8102e"],
    france: ["#ef4135", "#ffffff", "#0055a4"],
    italy: ["#008c45", "#ffffff", "#cd212a"],
    belgium: ["#e30613", "#fdda24", "#000000"],
    denmark: ["#c8102e", "#ffffff", "#c8102e"],
    norway: ["#ba0c2f", "#ffffff", "#00205b"],
    netherlands: ["#ae1c28", "#ffffff", "#21468b", "#ff7f00"],
    romania: ["#ce1126", "#fcd116", "#002b7f"],
    bulgaria: ["#d62612", "#00966e", "#ffffff"],
  };
  const RADII = [20, 13.5, 7, 3];

  // Canadian flag maple leaf, scaled into the roundel centre.
  const MAPLE =
    "24,13 25.6,16.2 27.4,15.2 26.8,21 29.6,18 30.2,19.6 33.4,19 32.4,22.4 34,23.2 28.8,27.4 29.4,29.2 24.6,28.6 24.8,34 23.2,34 23.4,28.6 18.6,29.2 19.2,27.4 14,23.2 15.6,22.4 14.6,19 17.8,19.6 18.4,18 21.2,21 20.6,15.2 22.4,16.2";

  // Bundeswehr cross: flared black cross with a white border.
  const BW_CROSS =
    "21.5,21.5 19.5,9 28.5,9 26.5,21.5 39,19.5 39,28.5 26.5,26.5 28.5,39 19.5,39 21.5,26.5 9,28.5 9,19.5";
</script>

<svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" class="shrink-0">
  {#if ROUNDELS[nationId]}
    {#each ROUNDELS[nationId] as fill, i (i)}
      <circle cx="24" cy="24" r={RADII[i]} {fill} />
    {/each}
    {#if nationId === "bulgaria"}
      <polygon points={star(24, 24.6, 5.6)} fill="#d62612" />
    {/if}
  {:else if nationId === "us"}
    <circle cx="24" cy="24" r="19" fill="none" stroke="#ffffff" stroke-width="2.4" />
    <polygon points={star(24, 25.2, 15)} fill="#ffffff" />
  {:else if nationId === "west-germany"}
    <polygon points={BW_CROSS} fill="#000000" stroke="#ffffff" stroke-width="2.6" stroke-linejoin="miter" />
  {:else if nationId === "canada"}
    <circle cx="24" cy="24" r="20" fill="#1d4f91" />
    <circle cx="24" cy="24" r="13.5" fill="#ffffff" />
    <polygon points={MAPLE} fill="#d80621" transform="translate(24 24) scale(0.82) translate(-24 -23.5)" />
  {:else if nationId === "soviets"}
    <polygon points={star(24, 25.6, 19)} fill="#cc0000" stroke="#cc0000" stroke-width="5" stroke-linejoin="miter" />
    <polygon points={star(24, 25.6, 19)} fill="#cc0000" stroke="#ffffff" stroke-width="2.6" stroke-linejoin="miter" />
    <polygon points={star(24, 25.6, 19)} fill="#cc0000" />
  {:else if nationId === "hungary"}
    <polygon points={star(24, 25.6, 18)} fill="#477050" stroke="#477050" stroke-width="5.5" stroke-linejoin="miter" />
    <polygon points={star(24, 25.6, 18)} fill="#ffffff" stroke="#ffffff" stroke-width="3" stroke-linejoin="miter" />
    <polygon points={star(24, 25.6, 18)} fill="#ce2939" />
  {:else if nationId === "east-germany"}
    <clipPath id="gdr-disc"><circle cx="24" cy="24" r="20" /></clipPath>
    <g clip-path="url(#gdr-disc)">
      <rect x="4" y="4" width="40" height="13.4" fill="#000000" />
      <rect x="4" y="17.3" width="40" height="13.4" fill="#dd0000" />
      <rect x="4" y="30.6" width="40" height="13.4" fill="#ffce00" />
    </g>
    <circle cx="24" cy="24" r="20" fill="none" stroke="#ffffff" stroke-width="1.2" />
    <!-- State emblem, simplified: hammer and compass inside a wreath. -->
    <circle cx="24" cy="24" r="7.2" fill="#dd0000" stroke="#ffce00" stroke-width="1.6" />
    <path d="M21 28.5 L24 19.5 L27 28.5" fill="none" stroke="#ffce00" stroke-width="1.3" />
    <rect x="20.6" y="20.6" width="6.8" height="1.6" fill="#ffce00" />
    <rect x="23.3" y="20.6" width="1.4" height="7.4" fill="#ffce00" />
  {:else if nationId === "poland"}
    <!-- Szachownica: 2×2 checkerboard, each square bordered in the opposite colour. -->
    <rect x="9" y="9" width="15" height="15" fill="#ffffff" />
    <rect x="11.5" y="11.5" width="10" height="10" fill="#dc143c" />
    <rect x="24" y="9" width="15" height="15" fill="#dc143c" />
    <rect x="26.5" y="11.5" width="10" height="10" fill="#ffffff" />
    <rect x="9" y="24" width="15" height="15" fill="#dc143c" />
    <rect x="11.5" y="26.5" width="10" height="10" fill="#ffffff" />
    <rect x="24" y="24" width="15" height="15" fill="#ffffff" />
    <rect x="26.5" y="26.5" width="10" height="10" fill="#dc143c" />
  {:else if nationId === "czechoslovakia"}
    <path d={sector(-90, 30)} fill="#ffffff" />
    <path d={sector(30, 150)} fill="#d7141a" />
    <path d={sector(150, 270)} fill="#11457e" />
  {:else if nationId === "japan"}
    <circle cx="24" cy="24" r="17" fill="#ffffff" />
    <circle cx="24" cy="24" r="13.5" fill="#bc002d" />
  {:else if nationId === "south-africa"}
    <!-- SADF Castle of Good Hope: nested five-bastion forts. -->
    <polygon points={star(24, 25, 20, 14)} fill="#e87722" />
    <polygon points={star(24, 25, 14, 9.8)} fill="#ffffff" />
    <polygon points={star(24, 25, 8.4, 5.9)} fill="#002395" />
  {:else if nationId === "zapadoslavia" || nationId === "yugoslavia"}
    <clipPath id="art-{nationId}"><rect x="2" y="2" width="44" height="44" rx="6" /></clipPath>
    <image
      href={nationId === "zapadoslavia" ? zapad : yugo}
      x="2"
      y="2"
      width="44"
      height="44"
      preserveAspectRatio="xMidYMid {nationId === 'zapadoslavia' ? 'slice' : 'meet'}"
      clip-path="url(#art-{nationId})"
    />
  {:else}
    <circle cx="24" cy="24" r="20" fill="#2a2c24" />
  {/if}
</svg>
