<script lang="ts">
  import AppHeader from "../components/AppHeader.svelte";
  import NationTile from "../components/NationTile.svelte";
  import { nationsByAlliance } from "../lib/ffot3/nations";

  const nato = nationsByAlliance("nato");
  const warpac = nationsByAlliance("warpac");
  const warpacAlt = nationsByAlliance("warpac-alt");
  const other = nationsByAlliance("other");
  const warpacFantasy = warpac
    .filter((elem) => elem.id === "soviets" || elem.id === "east-germany")
    .concat(warpacAlt);

  let fantasyToggle = $state(false);
  const warpacShown = $derived(fantasyToggle ? warpacFantasy : warpac);
</script>

<div class="min-h-dvh">
  <AppHeader title="Force Builder" />

  <main class="mx-auto max-w-6xl px-4 py-6 sm:py-10">
    <div class="mb-8 max-w-2xl">
      <p class="font-display text-sm tracking-[0.22em] text-brass uppercase">
        Cold War order of battle
      </p>
      <h2 class="mt-2 font-display text-4xl leading-none text-paper sm:text-5xl">
        Select a nation
      </h2>
      <p class="mt-3 max-w-xl text-base leading-relaxed text-muted">
        NATO on the left. Warsaw Pact on the right. Open a catalog, filter by year, and pin unit
        cards to a printable force list.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section class="rounded-[28px] border border-line bg-ink-2/80 p-4 sm:p-5">
        <header class="mb-4 flex items-end justify-between gap-3 px-1">
          <div>
            <p class="font-display text-xs tracking-[0.2em] text-brass uppercase">Alliance</p>
            <h3 class="font-display text-3xl text-paper">NATO</h3>
          </div>
          <span class="text-sm text-muted">{nato.length} nations</span>
        </header>
        <div class="flex flex-col gap-2">
          {#each nato as nation (nation.id)}
            <NationTile {nation} />
          {/each}
        </div>
      </section>

      <section class="rounded-[28px] border border-line bg-ink-2/80 p-4 sm:p-5">
        <header class="mb-4 flex items-end justify-between gap-3 px-1">
          <div>
            <p class="font-display text-xs tracking-[0.2em] text-danger uppercase">Alliance</p>
            <h3 class="font-display text-3xl text-paper">Warsaw Pact</h3>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={fantasyToggle}
              class="flex h-8 items-center gap-2 rounded-full border px-3 font-display text-xs tracking-[0.16em] uppercase transition-colors duration-150 {fantasyToggle
                ? 'border-brass bg-brass text-ink'
                : 'border-line-2 text-muted hover:border-brass hover:text-paper'}"
              onclick={() => (fantasyToggle = !fantasyToggle)}
            >
              <span
                class="h-2 w-2 rounded-full {fantasyToggle ? 'bg-ink' : 'bg-line-2'}"
                aria-hidden="true"
              ></span>
              Fantasy
            </button>
            <span class="text-sm text-muted">{warpacShown.length} nations</span>
          </div>
        </header>
        <div class="flex flex-col gap-2">
          {#each warpacShown as nation (nation.id)}
            <NationTile {nation} />
          {/each}
        </div>
      </section>
    </div>

    {#if other.length}
      <section class="mt-6 rounded-[28px] border border-line bg-ink-2/80 p-4 sm:p-5">
        <header class="mb-4 flex items-end justify-between gap-3 px-1">
          <div>
            <p class="font-display text-xs tracking-[0.2em] text-brass uppercase">
              Aviation extras
            </p>
            <h3 class="font-display text-3xl text-paper">Other</h3>
          </div>
          <span class="text-sm text-muted">{other.length} nations</span>
        </header>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {#each other as nation (nation.id)}
            <NationTile {nation} />
          {/each}
        </div>
      </section>
    {/if}
  </main>
</div>
