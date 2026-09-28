import "./styles.css";
import { mount } from "svelte";
import App from "./App.svelte";
import { installPreviewHostBridge } from "@/lib/preview-host-bridge";
import { navigate, ROUTE_PATHS } from "@/lib/ffot3/router";

const target = document.getElementById("app");
if (!target) {
  throw new Error("Missing #app root");
}

mount(App, { target });

installPreviewHostBridge({
  navigate: (path) => navigate(path),
  getRoutePaths: () => ROUTE_PATHS,
});
