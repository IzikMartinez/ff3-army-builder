<script lang="ts">
  import AppHeader from "../components/AppHeader.svelte";
  import UnitCard from "../components/UnitCard.svelte";
  import { DEFAULT_QUALITY, QUALITY_BY_ID, getUnit } from "../lib/ffot3/catalog";
  import { force, standCount, totalPoints } from "../lib/ffot3/store";

  const rows = $derived(
    $force.entries
      .map((entry) => {
        const unit = getUnit(entry.unitId);
        const quality = QUALITY_BY_ID[entry.quality] ?? DEFAULT_QUALITY;
        return unit ? { entry, unit, quality } : null;
      })
      .filter((row): row is NonNullable<typeof row> => row !== null),
  );
  const bw = $derived($force.bwMode);
  const normalRange = $derived($force.rangeSystem === "imperial");
  const name = $derived($force.listName);
  const empty = $derived($force.entries.length === 0);
  const count = $derived($standCount);
  const points = $derived($totalPoints);

  function printList() {
    window.print();
  }
</script>

<div class="min-h-dvh print:bg-white print:p-0 print:text-black">
  <AppHeader title="Force list" backHref="/" />

  <main class="mx-auto max-w-6xl px-4 py-5">
    <section class="print:hidden mb-5 rounded-[24px] border border-line bg-ink-2 p-4">
      <div class="grid gap-4 md:grid-cols-[1fr_auto_auto]">
        <label class="block">
          <span class="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">List name</span>
          <input
            class="h-11 w-full rounded-[12px] border border-line bg-ink px-3 text-base text-paper"
            value={name}
            oninput={(e) => force.setName(e.currentTarget.value)}
          />
        </label>
        <div class="block">
          <span class="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">Print mode</span>
          <div class="flex h-11 overflow-hidden rounded-[12px] border border-line bg-ink p-1">
            <button
              type="button"
              class="flex-1 rounded-[8px] text-sm {bw ? 'text-muted' : 'bg-paper text-ink'}"
              onclick={() => force.setBw(false)}
            >
              Color
            </button>
            <button
              type="button"
              class="flex-1 rounded-[8px] text-sm {bw ? 'bg-paper text-ink' : 'text-muted'}"
              onclick={() => force.setBw(true)}
            >
              B&W
            </button>
          </div>
        </div>
        <div class="flex items-end gap-2">
          <button
            type="button"
            class="h-11 flex-1 rounded-[12px] bg-paper px-4 text-sm font-medium text-ink"
            onclick={printList}
          >
            Save PDF
          </button>
          <button
            type="button"
            class="h-11 rounded-[12px] border border-line px-4 text-sm text-paper"
            onclick={() => force.clear()}
            disabled={empty}
          >
            Clear
          </button>
        </div>
      </div>
      <p class="mt-3 text-sm text-muted">
        {count} stands · {points} base points · {normalRange ? "1:5 scale" : "1:1 scale"}
        {#if bw}
          · black-and-white print
        {/if}
      </p>
    </section>

    <div class="mb-4 hidden print:block">
      <h2 class="font-display text-3xl text-ink">{name}</h2>
      <p class="text-sm">
        FFOT3 · {count} stands · {points} pts ·
        {normalRange ? "1:5" : "1:1"}
      </p>
    </div>

    {#if rows.length === 0}
      <div class="rounded-[24px] border border-line bg-ink-2 px-4 py-16 text-center">
        <p class="font-display text-2xl">No units on the list</p>
        <p class="mt-2 text-muted">Pick a nation and add cards from the catalog.</p>
      </div>
    {:else}
      <div class="grid gap-4 lg:grid-cols-1 print:grid-cols-1">
        {#each rows as row (row.entry.id)}
          <div class="flex flex-col gap-2">
            <div
              class="print:hidden flex flex-wrap items-center gap-2 rounded-[14px] border border-line bg-ink-2 px-3 py-2"
            >
              <span class="mr-auto font-display text-lg text-paper">{row.unit.Name}</span>
              <label class="flex items-center gap-2 text-sm text-muted">
                Qty
                <input
                  type="number"
                  min="1"
                  class="h-10 w-16 rounded-[10px] border border-line bg-ink px-2 text-paper tabular-nums"
                  value={row.entry.quantity}
                  oninput={(e) => force.setQuantity(row.entry.id, Number(e.currentTarget.value))}
                />
              </label>
              <button
                type="button"
                class="h-10 rounded-[10px] border border-line px-3 text-sm text-paper"
                onclick={() => force.remove(row.entry.id)}
              >
                Remove
              </button>
            </div>
            <UnitCard
              unit={row.unit}
              quality={row.quality}
              {bw}
              quantity={row.entry.quantity}
              missileId={row.entry.missileId}
              heloPods={row.entry.heloPods}
              towedLoad={row.entry.towedLoad}
              onQuality={(id) => force.setEntryQuality(row.entry.id, id)}
              onMissile={(id) => force.setEntryMissile(row.entry.id, id)}
              onHeloPods={(picks) => force.setEntryHeloPods(row.entry.id, picks)}
              onTowed={(picks) => force.setEntryTowedLoad(row.entry.id, picks)}
            />
          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>
