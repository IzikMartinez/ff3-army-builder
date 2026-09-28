import { writable } from "svelte/store";

export type Route =
  | { name: "home" }
  | { name: "catalog"; nationId: string }
  | { name: "list" };

export function parsePath(path: string): Route {
  const clean = (path.split("?")[0] ?? "/").replace(/\/+$/, "") || "/";
  if (clean === "/") return { name: "home" };
  if (clean === "/list") return { name: "list" };
  const match = /^\/force\/([^/]+)$/.exec(clean);
  if (match?.[1]) return { name: "catalog", nationId: decodeURIComponent(match[1]) };
  return { name: "home" };
}

export function catalogPath(nationId: string): string {
  return `/force/${encodeURIComponent(nationId)}`;
}

const initialPath = typeof window !== "undefined" ? window.location.pathname || "/" : "/";
export const path = writable(initialPath);

export function navigate(next: string, replace = false) {
  const url = next.startsWith("/") ? next : `/${next}`;
  if (typeof window !== "undefined") {
    if (replace) window.history.replaceState({}, "", url);
    else window.history.pushState({}, "", url);
  }
  path.set(url.split("?")[0] ?? url);
}

export function syncFromLocation() {
  if (typeof window === "undefined") return;
  path.set(window.location.pathname || "/");
}

export const ROUTE_PATHS = [
  "/",
  "/list",
  "/force/us",
  "/force/baor",
  "/force/west-germany",
  "/force/france",
  "/force/canada",
  "/force/netherlands",
  "/force/belgium",
  "/force/denmark",
  "/force/italy",
  "/force/norway",
  "/force/soviets",
  "/force/east-germany",
  "/force/poland",
  "/force/czechoslovakia",
  "/force/hungary",
  "/force/romania",
  "/force/bulgaria",
  "/force/japan",
  "/force/south-africa",
];
