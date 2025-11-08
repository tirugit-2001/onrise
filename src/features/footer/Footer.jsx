"use client";

import React from "react";
import Image from "next/image";
import { Instagram, Facebook, Youtube } from "lucide-react";
import styles from "./footer.module.scss";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.logoSection}>
          <Image
            src="/logo.png"
            alt="Onrise Logo"
            width={60}
            height={60}
            className={styles.logo}
          />
        </div>

        <div className={styles.columns}>
          <div className={styles.column}>
            <h3>SHOP</h3>
            <ul>
              <li>T-Shirts</li>
              <li>Shirts</li>
              <li>Kids Wear</li>
              <li>Customizable Tees</li>
              <li>Family Combos</li>
              <li>Birthday Specials</li>
              <li>Offers & Discounts</li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3>ONRISE</h3>
            <ul>
              <li>About Us</li>
              <li>Our Process</li>
              <li>Career</li>
              <li>Contact Us</li>
              <li>Franchise Enquiry</li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3>POLICIES</h3>
            <ul>
              <li>Privacy Policy</li>
              <li>Return & Exchange</li>
              <li>Shipping Policy</li>
              <li>Terms & Conditions</li>
            </ul>
          </div>
        </div>

        <div className={styles.socials}>
          <a href="#" aria-label="Instagram">
            <Instagram size={22} strokeWidth={1.8} />
          </a>
          <a href="#" aria-label="Facebook">
            <Facebook size={22} strokeWidth={1.8} />
          </a>
          <a href="#" aria-label="YouTube">
            <Youtube size={22} strokeWidth={1.8} />
          </a>
        </div>
      </div>

      
      <div className={styles.copy}>
        Copyright ©2025 Onrise. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
