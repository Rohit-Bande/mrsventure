import React from "react";
import { useShop } from "@/context/ShopContext";

export default function AnnouncementBar() {
  const { config } = useShop();
  return (
    <div
      data-testid="announcement-bar"
      className="bg-forest-deep text-cream text-center text-xs sm:text-[13px] tracking-wide py-2 px-4"
    >
      <span className="font-medium">{config.announcement}</span>
    </div>
  );
}
