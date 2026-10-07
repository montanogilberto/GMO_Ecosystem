// Renders text from our own en.json / es.json that contains simple markup
// (<b>, <code>, <i>, <br>). Never use it for user input or AI output —
// React's normal escaping must handle those.
import type { JSX } from "react";

type Props = { html: string; as?: keyof JSX.IntrinsicElements; className?: string };

export default function Html({ html, as: Tag = "span", className }: Props) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
