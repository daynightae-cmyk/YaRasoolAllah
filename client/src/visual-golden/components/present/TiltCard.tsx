import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import styles from "./present.module.css";

interface Props {
  children: ReactNode;
  className?: string;
  as?: "div" | "article";
}

export function TiltCard({ children, className = "", as = "div" }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const Tag = as;

  function onMove(e: MouseEvent<HTMLElement>) {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = (0.5 - y) * 9;
    const ry = (x - 0.5) * 12;
    el.style.transform = `perspective(920px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
  }

  function onLeave() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <Tag
      ref={ref as never}
      className={`${styles.tilt} ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ "--gx": "50%", "--gy": "40%" } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
