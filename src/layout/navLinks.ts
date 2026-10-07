import en from "./en.json";

type NavKey = keyof typeof en.nav;

/** Menu entries, in order. `key` = text in layout/en.json · es.json → "nav"; `label` = same in both languages. */
export const NAV_LINKS: { id: string; key?: NavKey; label?: string }[] = [
  { id: "ask", key: "ask" },
  { id: "ecosystem", key: "ecosystem" },
  { id: "factory", label: "Factory" },
  { id: "built", key: "built" },
  { id: "architecture", key: "architecture" },
  { id: "apps", label: "Apps" },
  { id: "rewards", label: "Rewards" },
  { id: "roadmap", key: "roadmap" },
  { id: "contact", key: "contact" },
];
