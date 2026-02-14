import GroceryStore from "@/components/GroceryStore";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <GroceryStore />
    </div>
  );
}
