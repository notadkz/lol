"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/lib/types/product";
import ProductCard from "./product-card";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface ProductListProps {
  products: Product[];
  title?: string;
}

export default function ProductList({ products, title }: ProductListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (containerRef.current) {
      // Animate products when they come into view
      const productItems =
        containerRef.current.querySelectorAll(".product-item");

      gsap.fromTo(
        productItems,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom-=100",
            toggleActions: "play none none none",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [products]);

  return (
    <div ref={containerRef} className="space-y-6">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <div key={product.id} className="product-item">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
