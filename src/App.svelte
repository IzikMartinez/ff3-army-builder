<script lang="ts">
  import { onMount } from "svelte";
  import NationSelect from "./pages/NationSelect.svelte";
  import Catalog from "./pages/Catalog.svelte";
  import ArmyList from "./pages/ArmyList.svelte";
  import { path, parsePath, syncFromLocation } from "./lib/ffot3/router";

  const route = $derived(parsePath($path));

  onMount(() => {
    syncFromLocation();
    const onPop = () => syncFromLocation();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  });
</script>

{#if route.name === "catalog"}
  {#key route.nationId}
    <Catalog nationId={route.nationId} />
  {/key}
{:else if route.name === "list"}
  <ArmyList />
{:else}
  <NationSelect />
{/if}
