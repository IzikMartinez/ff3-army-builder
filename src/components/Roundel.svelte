<script lang="ts">
  let { nationId, size = 44 }: { nationId: string; size?: number } = $props();
  import zapad from "../lib/images/zapad.png";
  import yugo from "../lib/images/yugo.svg";
</script>

<svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" class="shrink-0">
  {#if nationId === "us"}
    <circle cx="24" cy="24" r="23" fill="var(--color-nation-us)" />
    <circle cx="24" cy="24" r="18" fill="none" stroke="#e8e2d4" stroke-width="2" />
    <polygon
      fill="#e8e2d4"
      points="24,8 27.2,18.2 38,18.4 29.4,24.8 32.6,35 24,29.2 15.4,35 18.6,24.8 10,18.4 20.8,18.2"
    />
  {:else if nationId === "baor"}
    <circle cx="24" cy="24" r="23" fill="#00247d" />
    <circle cx="24" cy="24" r="15" fill="#e8e2d4" />
    <circle cx="24" cy="24" r="8" fill="#cf142b" />
  {:else if nationId === "west-germany"}
    <circle cx="24" cy="24" r="23" fill="var(--color-nation-west-germany)" />
    <path
      fill="#e8e2d4"
      d="M24 7l5 5 11 1-1 11 5 5-5 5 1 11-11 1-5 5-5-5-11-1 1-11-5-5 5-5-1-11 11-1 5-5zm0 8l-2.4 6.2L15 23.4l6.2 2.4L24 32l2.8-6.2 6.2-2.4-6.6-2.2L24 15z"
    />
  {:else if nationId === "france"}
    <circle cx="24" cy="24" r="23" fill="#2f6f8f" />
    <rect x="9" y="9" width="10" height="30" fill="#1d3557" />
    <rect x="19" y="9" width="10" height="30" fill="#e8e2d4" />
    <rect x="29" y="9" width="10" height="30" fill="#c23b32" />
  {:else if nationId === "canada"}
    <circle cx="24" cy="24" r="23" fill="var(--color-nation-canada)" />
    <path fill="#e8e2d4" d="M24 10l3 7 8-1-5 6 4 7-7-3-3 8-3-8-7 3 4-7-5-6 8 1 3-7z" />
  {:else if nationId === "netherlands"}
    <circle cx="24" cy="24" r="23" fill="var(--color-nation-netherlands)" />
    <rect x="10" y="14" width="28" height="6" fill="#d97b6a" />
    <rect x="10" y="21" width="28" height="6" fill="#e8e2d4" />
    <rect x="10" y="28" width="28" height="6" fill="#1d3557" />
  {:else if nationId === "belgium"}
    <circle cx="24" cy="24" r="23" fill="var(--color-nation-belgium)" />
    <rect x="9" y="9" width="10" height="30" fill="#16170f" />
    <rect x="19" y="9" width="10" height="30" fill="#c4b89a" />
    <rect x="29" y="9" width="10" height="30" fill="#9b1b1e" />
  {:else if nationId === "denmark"}
    <circle cx="24" cy="24" r="23" fill="var(--color-nation-denmark)" />
    <rect x="8" y="21" width="32" height="6" fill="#e8e2d4" />
    <rect x="18" y="10" width="6" height="28" fill="#e8e2d4" />
  {:else if nationId === "italy"}
    <circle cx="24" cy="24" r="23" fill="var(--color-nation-italy)" />
    <rect x="9" y="9" width="10" height="30" fill="#2f5d50" />
    <rect x="19" y="9" width="10" height="30" fill="#e8e2d4" />
    <rect x="29" y="9" width="10" height="30" fill="#9b1b1e" />
  {:else if nationId === "norway"}
    <circle cx="24" cy="24" r="23" fill="var(--color-nation-norway)" />
    <rect x="8" y="20" width="32" height="8" fill="#e8e2d4" />
    <rect x="16" y="10" width="8" height="28" fill="#e8e2d4" />
    <rect x="8" y="22" width="32" height="4" fill="#9b1b1e" />
    <rect x="18" y="10" width="4" height="28" fill="#9b1b1e" />
  {:else if nationId === "soviets"}
    <circle cx="24" cy="24" r="23" fill="var(--color-nation-soviets)" />
    <polygon
      fill="#c4b89a"
      points="24,8 26.6,17.2 36,17.4 28.4,23.2 31.2,32.4 24,27.2 16.8,32.4 19.6,23.2 12,17.4 21.4,17.2"
    />
    <circle cx="24" cy="24" r="4" fill="none" stroke="#c4b89a" stroke-width="1.4" />
  {:else if nationId === "east-germany"}
    <circle cx="24" cy="24" r="23" fill="var(--color-nation-east-germany)" />
    <rect x="10" y="12" width="28" height="8" fill="#16170f" />
    <rect x="10" y="20" width="28" height="8" fill="#9b1b1e" />
    <rect x="10" y="28" width="28" height="8" fill="#c4b89a" />
  {:else if nationId === "poland"}
    <circle cx="24" cy="24" r="23" fill="#e8e2d4" stroke="#16170f" stroke-width="2" />
    <rect x="10" y="10" width="28" height="14" fill="#f4f1ea" />
    <rect x="10" y="24" width="28" height="14" fill="#9b1b1e" />
  {:else if nationId === "czechoslovakia"}
    <circle cx="24" cy="24" r="23" fill="var(--color-nation-czechoslovakia)" />
    <polygon points="8,24 24,10 24,38" fill="#1e4b8a" />
    <rect x="24" y="10" width="16" height="14" fill="#e8e2d4" />
    <rect x="24" y="24" width="16" height="14" fill="#9b1b1e" />
  {:else if nationId === "hungary"}
    <circle cx="24" cy="24" r="23" fill="var(--color-nation-hungary)" />
    <rect x="10" y="13" width="28" height="7" fill="#9b1b1e" />
    <rect x="10" y="20" width="28" height="8" fill="#e8e2d4" />
    <rect x="10" y="28" width="28" height="7" fill="#3f4a2e" />
  {:else if nationId === "romania"}
    <circle cx="24" cy="24" r="23" fill="var(--color-nation-romania)" />
    <rect x="9" y="9" width="10" height="30" fill="#1e4b8a" />
    <rect x="19" y="9" width="10" height="30" fill="#c4b89a" />
    <rect x="29" y="9" width="10" height="30" fill="#9b1b1e" />
  {:else if nationId === "bulgaria"}
    <circle cx="24" cy="24" r="23" fill="var(--color-nation-bulgaria)" />
    <rect x="10" y="13" width="28" height="7" fill="#e8e2d4" />
    <rect x="10" y="20" width="28" height="8" fill="#3f4a2e" />
    <rect x="10" y="28" width="28" height="7" fill="#9b1b1e" />
  {:else if nationId === "japan"}
    <circle cx="24" cy="24" r="23" fill="#e8e2d4" />
    <circle cx="24" cy="24" r="8" fill="#bc002d" />
  {:else if nationId === "south-africa"}
    <circle cx="24" cy="24" r="23" fill="#007749" />
    <polygon points="8,24 20,16 20,32" fill="#e8e2d4" />
    <rect x="20" y="18" width="18" height="4" fill="#c4b89a" />
    <rect x="20" y="26" width="18" height="4" fill="#1e4b8a" />
  {:else if nationId === "zapadoslavia"}
    <img src={zapad} alt="Zapad" class="scale-50" />
  {:else if nationId === "yugoslavia"}
    <img src={yugo} alt="Yugo" class="scale-150" />
  {:else}
    <circle cx="24" cy="24" r="23" fill="#2a2c24" />
  {/if}
</svg>
