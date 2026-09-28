<script lang="ts">
  import type { EquipMark } from "../../lib/ffot3/types";

  let { marks }: { marks: EquipMark[] } = $props();

  let codeMap = new Map<string, string>([
    ["n", "NBC"],
    ["s", "Stable"],
    ["i", "IR"],
    ["o", "Open"],
    ["t", "Thermal 1"],
    ["r", "Fixed R"],
    ["hl", "LIM"],
    ["G1", "G1"],
    ["G3", "G3"],
  ]);
</script>

{#if marks.length > 0}
  <ul class="m-0 flex list-none flex-wrap justify-end gap-1.5 p-0">
    {#each marks as mark, index (mark.code + index)}
      <li class="group relative z-1 hover:z-30 focus-within:z-30">
        <button
          type="button"
          class="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-line-2 bg-stone-500 px-2 font-display text-sm tracking-wide text-paper hover:border-paper hover:bg-paper hover:text-ink focus-visible:border-paper focus-visible:bg-paper focus-visible:text-ink bw:border-black bw:bg-white bw:text-black"
          aria-label="{mark.code}: {mark.name}"
          aria-describedby="equip-tip-{mark.code}-{index}"
        >
          {codeMap.get(mark.code) ?? mark.code}
        </button>
        <span
          id="equip-tip-{mark.code}-{index}"
          class="pointer-events-none absolute bottom-[calc(100%+8px)] z-40 w-max max-w-64 rounded-[10px] border border-line bg-ink px-2.5 py-2 text-paper opacity-0 shadow-[0_16px_28px_-18px_rgba(0,0,0,0.65)] transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100 print:hidden bw:border-black bw:bg-black bw:text-white {index ===
          0
            ? 'left-0 origin-bottom-left translate-y-1 scale-[0.98]'
            : index === marks.length - 1
              ? 'right-0 left-auto origin-bottom-right translate-y-1 scale-[0.98]'
              : 'left-1/2 origin-bottom -translate-x-1/2 translate-y-1 scale-[0.98] group-hover:-translate-x-1/2 group-focus-within:-translate-x-1/2'}"
          role="tooltip"
        >
          <strong class="block font-display text-[0.82rem] leading-tight tracking-wide"
            >{mark.name}</strong
          >
          <span class="mt-1 block text-xs leading-snug tracking-normal text-brass normal-case"
            >{mark.effect}</span
          >
        </span>
      </li>
    {/each}
  </ul>
{/if}
