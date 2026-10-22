<script lang="ts">
  import type { NationDef } from "../lib/ffot3/types";
  import { countForNation } from "../lib/ffot3/catalog";
  import { catalogPath, navigate } from "../lib/ffot3/router";
  import { nationSurface } from "../lib/ffot3/ui";
  import Roundel from "./Roundel.svelte";

  let { nation }: { nation: NationDef } = $props();
  const count = $derived(countForNation(nation.id));
  const surface = $derived(nationSurface(nation.id));

  function open() {
    navigate(catalogPath(nation.id));
  }
</script>

<button
  type="button"
  class="group flex w-full min-w-0 items-center gap-3 rounded-xl border border-line bg-ink-2 p-3 text-left transition-[transform,border-color] duration-200 hover:border-brass active:scale-[0.99]"
  onclick={open}
>
  <span class="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-line-2 {surface}">
    <Roundel nationId={nation.id} size={48} />
  </span>
  <span class="min-w-0 flex-1">
    <span class="block truncate font-display text-xl leading-none tracking-wide text-paper uppercase">{nation.name}</span>
    <span class="mt-1 block truncate text-sm text-muted">{nation.subtitle}</span>
  </span>
  <span class="flex flex-col items-end gap-1">
    <span class="rounded-full px-2 py-0.5 font-display text-xs tracking-wider uppercase {surface}">
      {nation.short}
    </span>
    <span class="text-xs tabular-nums text-muted">{count} cards</span>
  </span>
</button>
