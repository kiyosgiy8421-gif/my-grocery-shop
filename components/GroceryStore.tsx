"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  X,
  Plus,
  Minus,
  Leaf,
  UtensilsCrossed,
  Apple,
  Home,
  Beef,
} from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Category, CartItem, OrderItem } from "@/lib/types";

const DELIVERY_AREAS = [
  { id: "godakawela-town", label: "Godakawela Town", charge: 300 },
  { id: "pallebedda", label: "Pallebedda", charge: 400 },
  { id: "rakwana", label: "Rakwana", charge: 500 },
] as const;

const CATEGORIES: { id: Category; label: string; icon: React.ElementType }[] = [
  { id: "Vegetables", label: "Vegetables", icon: Leaf },
  { id: "Grocery", label: "Grocery", icon: UtensilsCrossed },
  { id: "Fruits", label: "Fruits", icon: Apple },
  { id: "Household", label: "Household", icon: Home },
  { id: "Meat", label: "Meat", icon: Beef },
];

export default function GroceryStore() {
  const { user, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: "",
    address: "",
    phone: "",
    area: "",
  });

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const addToCart = (product: (typeof PRODUCTS)[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryCharge =
    DELIVERY_AREAS.find((a) => a.id === checkoutForm.area)?.charge ?? 300;
  const cartTotal = cartSubtotal + deliveryCharge;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleOrderNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.customerName || !checkoutForm.address || !checkoutForm.phone || !checkoutForm.area) {
      return;
    }
    if (cart.length === 0) return;

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      alert("Please log in to place an order.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems: OrderItem[] = cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));

      const deliveryChargeNum = Number(deliveryCharge);
      const totalAmountNum = Number(cartTotal);

      const { error } = await supabase.from("orders").insert({
        user_id: currentUser.id,
        customer_name: String(checkoutForm.customerName),
        address: String(checkoutForm.address),
        phone: String(checkoutForm.phone),
        delivery_area: String(checkoutForm.area),
        delivery_charge: deliveryChargeNum,
        items: orderItems,
        total_amount: totalAmountNum,
      });

      if (error) throw error;

      const areaLabel =
        DELIVERY_AREAS.find((a) => a.id === checkoutForm.area)?.label ??
        checkoutForm.area;

      fetch("/api/notify-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: checkoutForm.customerName,
          address: checkoutForm.address,
          phone: checkoutForm.phone,
          deliveryArea: areaLabel,
          deliveryCharge: deliveryChargeNum,
          totalAmount: totalAmountNum,
          items: orderItems.map((i) => ({
            name: i.name,
            price: Number(i.price),
            quantity: Number(i.quantity),
          })),
        }),
      }).catch((err) => console.warn("Telegram notification failed:", err));

      setOrderSuccess(true);
      setCart([]);
      setCheckoutForm({ customerName: "", address: "", phone: "", area: "" });

      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : (err as { message?: string })?.message ?? "Unknown error";
      console.error("Order failed:", message, err);
      alert(`Failed to place order: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white md:flex-row">
      {/* Sidebar - hidden on mobile, shown as horizontal scroll or drawer */}
      <aside className="flex-shrink-0 border-b border-green-100 bg-green-50 md:w-56 md:border-b-0 md:border-r">
        <div className="flex overflow-x-auto p-4 md:flex-col md:overflow-x-visible md:p-6">
          <h2 className="mb-4 hidden text-lg font-semibold text-green-800 md:block">
            Categories
          </h2>
          <nav className="flex gap-2 md:flex-col md:gap-1">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedCategory(selectedCategory === id ? null : id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 text-left transition-colors md:px-3 md:py-2 ${
                  selectedCategory === id
                    ? "bg-green-600 text-white"
                    : "text-green-800 hover:bg-green-100"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Search bar */}
        <header className="sticky top-0 z-10 border-b border-green-100 bg-white px-4 py-3 shadow-sm md:px-6">
          <div className="relative flex max-w-xl">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-green-200 bg-green-50/50 py-2.5 pl-10 pr-4 text-green-900 placeholder-green-500 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>
        </header>

        {/* Product grid */}
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-green-900">
              {selectedCategory ? selectedCategory : "All Products"}
            </h1>
            <span className="text-sm text-green-600">
              {filteredProducts.length} items
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="flex flex-col overflow-hidden rounded-xl border border-green-100 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-green-50">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="line-clamp-2 text-sm font-medium text-green-900">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-base font-semibold text-green-600">
                    Rs. {product.price.toFixed(0)}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <p className="py-12 text-center text-green-600">
              No products found. Try a different search or category.
            </p>
          )}
        </main>
      </div>

      {/* Floating cart button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-green-700 md:bottom-8 md:right-8 md:h-16 md:w-16"
        aria-label="Open cart"
      >
        <ShoppingCart className="h-6 w-6 md:h-7 md:w-7" />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-green-600">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </button>

      {/* Cart drawer */}
      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl md:max-w-lg">
            <div className="flex items-center justify-between border-b border-green-100 px-4 py-4">
              <h2 className="text-lg font-semibold text-green-900">
                Your Cart ({cartCount} items)
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-full p-2 text-green-600 hover:bg-green-50"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {orderSuccess ? (
                <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <span className="text-4xl">✓</span>
                  </div>
                  <h3 className="text-xl font-semibold text-green-800">
                    Order Placed!
                  </h3>
                  <p className="text-green-600">
                    Thank you for your order. We will deliver it soon.
                  </p>
                </div>
              ) : cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center text-green-600">
                  <ShoppingCart className="h-16 w-16 opacity-50" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-green-100 px-4 py-4">
                    {cart.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 py-3"
                      >
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-green-50">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-medium text-green-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-green-600">
                            Rs. {item.price.toFixed(0)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="rounded-full p-1.5 text-green-600 hover:bg-green-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-6 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="rounded-full p-1.5 text-green-600 hover:bg-green-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="rounded-full p-1.5 text-red-500 hover:bg-red-50"
                          aria-label="Remove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Checkout - protected for logged-in users only */}
                  {!user ? (
                    <div className="border-t border-green-100 px-4 py-6">
                      <p className="mb-4 text-center text-green-800">
                        Sign in to place your order
                      </p>
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <button
                          onClick={() => openAuthModal("login")}
                          className="rounded-lg bg-green-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-700"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => openAuthModal("signup")}
                          className="rounded-lg border border-green-600 px-6 py-2.5 font-medium text-green-700 transition-colors hover:bg-green-50"
                        >
                          Sign Up
                        </button>
                      </div>
                      <div className="mt-4 space-y-1 border-t border-green-100 pt-4">
                        <div className="flex justify-between text-sm text-green-700">
                          <span>Subtotal</span>
                          <span>Rs. {cartSubtotal.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-700">
                          <span>Delivery (est.)</span>
                          <span>Rs. {deliveryCharge}</span>
                        </div>
                        <div className="flex justify-between pt-2 font-semibold text-green-900">
                          <span>Total</span>
                          <span>Rs. {(cartSubtotal + deliveryCharge).toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                  <form
                    onSubmit={handleOrderNow}
                    className="border-t border-green-100 px-4 py-4"
                  >
                    <h3 className="mb-3 font-medium text-green-900">
                      Delivery Details
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Customer Name"
                        value={checkoutForm.customerName}
                        onChange={(e) =>
                          setCheckoutForm((prev) => ({
                            ...prev,
                            customerName: e.target.value,
                          }))
                        }
                        required
                        className="w-full rounded-lg border border-green-200 px-3 py-2 text-green-900 placeholder-green-500 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        value={checkoutForm.address}
                        onChange={(e) =>
                          setCheckoutForm((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        required
                        className="w-full rounded-lg border border-green-200 px-3 py-2 text-green-900 placeholder-green-500 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={checkoutForm.phone}
                        onChange={(e) =>
                          setCheckoutForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        required
                        className="w-full rounded-lg border border-green-200 px-3 py-2 text-green-900 placeholder-green-500 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      />
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-green-800">
                          Delivery Area
                        </label>
                        <select
                          value={checkoutForm.area}
                          onChange={(e) =>
                            setCheckoutForm((prev) => ({
                              ...prev,
                              area: e.target.value,
                            }))
                          }
                          required
                          className="w-full rounded-lg border border-green-200 px-3 py-2 text-green-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        >
                          <option value="">Select area</option>
                          {DELIVERY_AREAS.map((area) => (
                            <option key={area.id} value={area.id}>
                              {area.label} (Rs. {area.charge})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1 border-t border-green-100 pt-4">
                      <div className="flex justify-between text-sm text-green-700">
                        <span>Subtotal</span>
                        <span>Rs. {cartSubtotal.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-700">
                        <span>Delivery</span>
                        <span>Rs. {deliveryCharge}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-green-100 pt-3">
                        <span className="font-semibold text-green-900">
                          Total: Rs. {cartTotal.toFixed(0)}
                        </span>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="rounded-lg bg-green-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-70"
                        >
                          {isSubmitting ? "Placing..." : "Order Now"}
                        </button>
                      </div>
                    </div>
                  </form>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
