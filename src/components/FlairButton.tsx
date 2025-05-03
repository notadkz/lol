"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

interface FlairButtonProps {
  text?: string;
  accentColor?: string;
  primaryColor?: string;
  className?: string;
}

export default function FlairButton({
  text = "Explore SVG",
  accentColor = "#fefbe0",
  primaryColor = "#0e100f",
  className,
}: FlairButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const circle = circleRef.current;
    const text = textRef.current;

    if (!button || !circle || !text) return;

    const handleMouseMove = (e: MouseEvent) => {
      const buttonRect = button.getBoundingClientRect();
      const x = e.clientX - buttonRect.left;
      const y = e.clientY - buttonRect.top;

      requestAnimationFrame(() => {
        circle.style.left = x + "px";
        circle.style.top = y + "px";
      });
    };

    const handleMouseLeave = () => {
      circle.style.transform = "translate(-50%, -50%) scale(0)";
      text.style.color = accentColor;
    };

    const handleMouseEnter = () => {
      circle.style.transform = "translate(-50%, -50%) scale(1)";
      text.style.color = primaryColor;
    };

    button.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("mouseleave", handleMouseLeave);
    button.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      button.removeEventListener("mousemove", handleMouseMove);
      button.removeEventListener("mouseleave", handleMouseLeave);
      button.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [accentColor, primaryColor]);

  return (
    <div
      ref={buttonRef}
      className={clsx(
        "relative inline-flex items-center justify-center h-10 px-6 rounded-full border-2 cursor-pointer overflow-hidden",
        className
      )}
      style={{
        borderColor: accentColor,
        // backgroundColor: primaryColor,
      }}
    >
      <div
        ref={circleRef}
        className="absolute w-[175%] aspect-square rounded-full pointer-events-none transition-transform duration-200 ease-in-out"
        style={{
          backgroundColor: accentColor,
          transform: "translate(-50%, -50%) scale(0)",
          zIndex: 1,
        }}
      />
      <span
        ref={textRef}
        className="relative text-sm font-semibold whitespace-nowrap transition-colors duration-200 ease-in-out"
        style={{
          color: accentColor,
          zIndex: 2,
        }}
      >
        {text}
      </span>
    </div>
  );
}
