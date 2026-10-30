import type { ReactNode } from "react";

export function Page({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="page">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="title">{title}</h1>
      {lede ? <p className="lede">{lede}</p> : null}
      {children}
    </div>
  );
}
