"use client";

import React, { useState, useEffect } from "react";
import styles from "./navbar.module.scss";
import {
  User,
  Briefcase,
  MapPin,
  Heart,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import logo from "@/assessts/light-2x.webp";
import DynamicModal from "@/component/Modal/Modal";
import LoginForm from "@/features/signup/LogIn/LoginForm";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    setIsLoggedIn(!!userToken);
  }, []);

  const navItems = [
    { icon: User, label: "Profile", link: "/" },
    { icon: Briefcase, label: "Orders", link: "/orders" },
    { icon: MapPin, label: "Address", link: "/address" },
    { icon: Heart, label: "Wishlist", link: "/wishlist" },
    { icon: ShoppingCart, label: "Cart", link: "/cart" },
  ];

  const handleIconClick = (label, link) => {
    if (!isLoggedIn) {
      setIsLoginModalVisible(true);
    } else {
      router.push(link);
    }
  };

  const handleContinue = () => {
    setIsLoginModalVisible(false);
    setTimeout(() => setIsOtpModalVisible(true), 300);
  };

  return (
    <>
      <nav className={styles.nav}>
        <header className={styles.logoWrapper} onClick={() => router.push("/")}>
          <Image src={logo} alt="logo" className={styles.logo} />
        </header>

        {/* Hamburger Icon */}
        <div className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </div>

        {/* Menu */}
        <ul className={`${styles.iconList} ${menuOpen ? styles.active : ""}`}>
          {navItems.map(({ icon: Icon, label, link }, index) => (
            <li
              key={index}
              onClick={() => handleIconClick(label, link)}
              className={styles.iconItem}
            >
              <Icon size={20} />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* Login Modal */}
      <DynamicModal
        open={isLoginModalVisible}
        onClose={() => setIsLoginModalVisible(false)}
      >
        <LoginForm onContinue={handleContinue} setIsLoginModalVisible={setIsLoginModalVisible}/>
      </DynamicModal>

    </>
  );
};

export default Navbar;
