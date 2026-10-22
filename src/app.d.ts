// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module "*.svelte" {
  import type { Component } from "svelte";
  const component: Component;
  export default component;
}
