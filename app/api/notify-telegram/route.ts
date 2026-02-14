import { NextResponse } from "next/server";

interface OrderNotificationPayload {
  customerName: string;
  address: string;
  phone: string;
  deliveryArea: string;
  deliveryCharge: number;
  totalAmount: number;
  items: { name: string; price: number; quantity: number }[];
}

export async function POST(request: Request) {
  const botToken =
    process.env.TELEGRAM_BOT_TOKEN ??
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const chatId =
    process.env.TELEGRAM_CHAT_ID ??
    process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return NextResponse.json(
      { error: "Telegram credentials not configured" },
      { status: 500 }
    );
  }

  try {
    const body: OrderNotificationPayload = await request.json();
    const { customerName, address, phone, deliveryArea, deliveryCharge, totalAmount, items } = body;

    const itemsList = items
      .map((i) => `• ${i.name} × ${i.quantity} — Rs. ${(i.price * i.quantity).toFixed(0)}`)
      .join("\n");

    const text = [
      "🛒 *New Order*",
      "",
      `*Customer:* ${customerName}`,
      `*Phone:* ${phone}`,
      `*Address:* ${address}`,
      `*Delivery Area:* ${deliveryArea}`,
      "",
      "*Items:*",
      itemsList,
      "",
      `*Delivery:* Rs. ${deliveryCharge}`,
      `*Total:* Rs. ${totalAmount.toFixed(0)}`,
    ].join("\n");

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram notification failed:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
