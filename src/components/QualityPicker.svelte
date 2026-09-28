<script lang="ts">
  import { QUALITIES } from "../lib/ffot3/catalog";
  import { qualityLabel, qualityShort } from "../lib/ffot3/combat";
  import type { Quality } from "../lib/ffot3/types";

  let {
    quality,
    onChange,
    interactive = true,
    btnClass = "flex h-9 min-w-18 items-center justify-center rounded-sm border border-paper/40 bg-paper px-2.5 font-display text-[0.95rem] tracking-[0.14em] text-olive uppercase",
  }: {
    quality: Quality;
    onChange?: (id: string) => void;
    interactive?: boolean;
    btnClass?: string;
  } = $props();

  let open = $state(false);

  function select(id: string) {
    onChange?.(id);
    open = false;
  }

  function toggle() {
    if (!interactive || !onChange) return;
    open = !open;
  }
</script>

<div class="relative shrink-0 {open ? 'z-50' : 'z-10'}">
  <button
    type="button"
    class="{btnClass} {interactive && onChange
      ? 'hover:brightness-110 active:scale-[0.98]'
      : 'cursor-default'}"
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-label="Unit quality {qualityLabel(quality)}"
    onclick={toggle}
  >
    {qualityShort(quality)}
  </button>

  {#if open}
    <div
      class="absolute top-[calc(100%+6px)] right-0 z-50 min-w-44 rounded-md border border-line bg-ink-2 p-1 shadow-[0_16px_32px_-18px_rgba(0,0,0,0.55)] print:hidden"
      role="listbox"
      aria-label="Select quality"
    >
      {#each QUALITIES as q (q.experience)}
        <button
          type="button"
          role="option"
          aria-selected={q.experience === quality.experience}
          class="flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-sm {q.experience ===
          quality.experience
            ? 'bg-paper text-ink'
            : 'bg-transparent text-paper hover:bg-ink-3'}"
          onclick={() => select(q.experience)}
        >
          <span class="font-display tracking-[0.12em] uppercase">{qualityShort(q)}</span>
          <span class="tabular-nums opacity-70">Q{q.quality}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

{#if open}
  <button
    type="button"
    class="fixed inset-0 z-40 cursor-default bg-transparent print:hidden"
    tabindex="-1"
    aria-hidden="true"
    onclick={() => (open = false)}
  ></button>
{/if}
