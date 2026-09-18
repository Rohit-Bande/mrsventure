import { useEffect, useState } from "react";
import { getProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export default function BrandProducts({ brand, title }) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;

    setResult(null);

    getProducts()
      .then((products) => {
        const matching = products.filter(
          (product) => product.brand?.trim() === brand.trim()
        );

        if (active) {
          setResult({ brand, products: matching });
        }
      })
      .catch(() => {
        if (active) setResult({ brand, error: true });
      });

    return () => {
      active = false;
    };
  }, [brand]);

  const current = result?.brand === brand ? result : null;

  return (
    <section className="mt-16">
      <h2 className="font-serif text-3xl text-forest-deep">
        {title}
      </h2>

      {!current ? (
        <p role="status" className="mt-6">
          Loading products...
        </p>
      ) : current.error ? (
        <p role="alert" className="mt-6 text-red-600">
          Unable to load products. Please refresh the page.
        </p>
      ) : current.products.length === 0 ? (
        <p className="mt-6 text-slate-600">
          No products are currently listed for this brand.
        </p>
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {current.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}