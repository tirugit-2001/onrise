"use client";
import React from "react";
import styles from "./OfferMarquee.module.scss";

const OfferMarquee = () => {
  const offers = {
    data: [
      {
        id: "LDs8zA0heR40uBizhIjr",
        headline: "🚚 Free Shipping on orders above ₹500",
        isActive: true,
      },
      {
        id: "Mjz2PNUSocHjBPlFr4aO",
        headline:
          "👜 Customized Tote Pouch with Rhinestone Initial on orders above ₹900",
        isActive: true,
      },
      {
        id: "OpwWGX4u9f0H1rH6BPqi",
        headline: "🎁 Free Gift + 10% OFF on orders above ₹600",
        isActive: true,
      },
      {
        id: "oDgQeFvb8Mq0MLPOCFcJ",
        headline: "💥 Flat 20% OFF on all products sitewide!",
        isActive: true,
      },
    ],
  };
  return (
    <div className={styles.marqueeWrapper}>
      <div className={styles.marqueeContent}>
        {offers?.data
          .filter((item) => item.isActive)
          .map((item) => (
            <span key={item.id} className={styles.marqueeItem}>
              {item.headline}
            </span>
          ))}

        {/* Duplicate for seamless looping */}
        {offers?.data
          .filter((item) => item.isActive)
          .map((item) => (
            <span key={item.id + "_clone"} className={styles.marqueeItem}>
              {item.headline}
            </span>
          ))}
      </div>
    </div>
  );
};

export default OfferMarquee;
