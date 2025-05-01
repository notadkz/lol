"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";

interface NavItem {
  name: string;
  href: string;
}

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export default function MobileNav({
  isOpen,
  onClose,
  navItems,
}: MobileNavProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      // Animate menu items when menu opens
      gsap.fromTo(
        ".mobile-nav-item",
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [isOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto p-4 h-full flex flex-col">
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex flex-col items-center justify-center flex-grow space-y-8">
          {navItems.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "mobile-nav-item text-xl font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              )}
              onClick={onClose}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
