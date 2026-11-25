import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import styles from "./WingStart.module.css";

interface WingStartActionCopy {
  title: string;
  description: string;
  icon: LucideIcon;
  image?: string;
  en?: string;
}

export type WingStartAction = WingStartActionCopy & (
  { target: string; href?: never } | { href: string; target?: never }
);

export function WingStart({ label, actions }: { label: string; actions: WingStartAction[] }) {
  const moveTo = (target: string) => {
    const destination = document.getElementById(target);
    if (!destination) return;
    destination.scrollIntoView({ block: "start", behavior: "instant" });
    const focusTarget = destination.querySelector<HTMLElement>("input, button, a[href], select") ?? destination;
    if (!focusTarget.hasAttribute("tabindex") && focusTarget === destination) focusTarget.setAttribute("tabindex", "-1");
    focusTarget.focus({ preventScroll: true });
  };

  const illustrated = actions.every((action) => action.image);

  return <nav className={`${styles.start} ${illustrated ? styles.illustrated : ""}`} aria-label={label}>
    <div className={styles.heading}><span className={styles.rule} aria-hidden="true" /><span>{label}</span></div>
    <div className={styles.actions}>
      {actions.map(({ title, description, icon: Icon, image, en, target, href }) => {
        const content = <>
          {image ? <img className={styles.art} src={image} alt="" /> : null}
          <span className={styles.icon}><Icon size={23} strokeWidth={1.4} aria-hidden="true" /></span>
          <span className={styles.copy}>
            <strong>{title}</strong>
            {en ? <span lang="en">{en}</span> : <span>{description}</span>}
          </span>
          <ArrowLeft className={styles.arrow} size={17} aria-hidden="true" />
        </>;
        return target !== undefined
          ? <button className={styles.action} type="button" key={target} onClick={() => moveTo(target)}>{content}</button>
          : <Link className={styles.action} href={href} key={href}>{content}</Link>;
      })}
    </div>
  </nav>;
}
