import { useHistory } from "react-router-dom";
import { langPath, saveLang, type Lang } from "../lib/i18n";

/** EN / ES switch. Both languages are one page, so the scroll position stays. */
export default function LangSwitch({ lang, label }: { lang: Lang; label: string }) {
  const history = useHistory();
  const go = (next: Lang) => (e: React.MouseEvent) => {
    e.preventDefault();
    saveLang(next);
    if (next !== lang) history.replace(langPath(next));
  };
  return (
    <div className="lang" role="group" aria-label={label}>
      {(["en", "es"] as const).map((l) => (
        <a key={l} href={langPath(l)} hrefLang={l} lang={l} className={l === lang ? "active" : undefined}
           aria-current={l === lang ? "page" : undefined} onClick={go(l)}>
          {l.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
