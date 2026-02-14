export type Category = "Vegetables" | "Grocery" | "Fruits" | "Household" | "Meat";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: Category;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}
