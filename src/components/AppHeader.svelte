<script lang="ts">
  import { force, standCount } from "../lib/ffot3/store";
  import { navigate } from "../lib/ffot3/router";

  let { title = "FFOT3 Force Builder", backHref = "" }: { title?: string; backHref?: string } =
    $props();

  function goHome() {
    navigate("/");
  }
  function goList() {
    navigate("/list");
  }
  function goBack() {
    if (backHref) navigate(backHref);
  }

  const isNormal = $derived($force.rangeSystem === "imperial");
  const count = $derived($standCount);
  const isDark = $derived($force.theme === "dark");
</script>

<header class="print:hidden sticky top-0 z-30 border-b border-line bg-ink/90 backdrop-blur-md">
  <div class="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
    <div class="flex min-w-0 items-center gap-3">
      {#if backHref}
        <button
          type="button"
          class="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-[12px] border border-line bg-ink-2 px-3 text-sm font-medium text-paper transition-transform duration-150 hover:border-brass active:scale-[0.98]"
          onclick={goBack}
        >
          Back
        </button>
      {:else}
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-olive"
          onclick={goHome}
          aria-label="Home"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 16 V10 L12 4 L20 10 V16 H15 V12 H9 V16Z"
              stroke="currentColor"
              class="text-paper"
              stroke-width="1.6"
            />
            <rect x="8" y="14" width="8" height="4" class="fill-brass" />
          </svg>
        </button>
      {/if}

      <div class="min-w-0 flex-1">
        <p class="font-display text-[11px] tracking-[0.22em] text-brass uppercase">
          Fistful of TOWs 3
        </p>
        <h1 class="truncate font-display text-xl leading-none text-paper sm:text-2xl">{title}</h1>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <div
        class="flex h-11 min-w-0 flex-1 items-center overflow-hidden rounded-[12px] border border-line bg-ink-2 p-1 sm:flex-none"
        role="group"
        aria-label="Range"
      >
        <span class="shrink-0 px-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted"
          >Scale</span
        >
        <button
          type="button"
          class="h-full min-w-0 flex-1 rounded-[8px] px-2.5 text-sm font-medium whitespace-nowrap sm:flex-none {isNormal
            ? 'bg-paper text-ink'
            : 'text-muted'}"
          aria-pressed={isNormal}
          onclick={() => force.setRange("imperial")}
        >
          1:5
        </button>
        <button
          type="button"
          class="h-full min-w-0 flex-1 rounded-[8px] px-2.5 text-sm font-medium whitespace-nowrap sm:flex-none {isNormal
            ? 'text-muted'
            : 'bg-paper text-ink'}"
          aria-pressed={!isNormal}
          onclick={() => force.setRange("metric")}
        >
          1:1
        </button>
      </div>

      <button
        type="button"
        class="relative flex h-11 items-center gap-2 rounded-[12px] border border-line bg-olive px-3 text-sm font-medium text-paper transition-transform duration-150 hover:bg-olive-2 active:scale-[0.98]"
        onclick={goList}
      >
        Force
        {#if count > 0}
          <span
            class="flex h-6 min-w-6 items-center justify-center rounded-full bg-paper px-1.5 font-display text-sm text-ink tabular-nums"
          >
            {count}
          </span>
        {/if}
      </button>

      <button
        type="button"
        class="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-line bg-ink-2 text-paper transition-[transform,background-color] duration-150 hover:border-brass active:scale-[0.98] sm:ml-0"
        onclick={() => force.toggleTheme()}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Light mode" : "Dark mode"}
      >
        {#if isDark}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7" />
            <path
              d="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
            />
          </svg>
        {:else}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15.4 3.6A8.4 8.4 0 1 0 20.4 14 6.6 6.6 0 0 1 15.4 3.6Z"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linejoin="round"
            />
          </svg>
        {/if}
      </button>
    </div>
  </div>
</header>
