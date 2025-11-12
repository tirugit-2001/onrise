"use client";
import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import styles from "./cart.module.scss";
import api from "@/axiosInstance/axiosInstance";
import NoResult from "@/component/NoResult/NoResult";
import { useRouter } from "next/navigation";
import CartRewards from "./CartRewards/CartRewards";
import DefaultAddress from "./DefaultAddress/DefaultAddress";
import PriceList from "./PriceList/PriceList";

const Cart = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [cartItems, setCartItems] = useState([]);
  const [addressList, setAddressList] = useState([]);
  const router = useRouter();

  // 🧮 Update item quantity
  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // 💰 Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price =
        Number(item.price) ||
        Number(item.totalPrice) ||
        Number(item.product?.price) ||
        0;
      const qty = Number(item.quantity) || 1;
      return sum + price * qty;
    }, 0);
  };

  const bagTotal = calculateTotal();
  const couponDiscount = 0;
  const grandTotal = bagTotal - couponDiscount;

  // 🛒 Fetch Cart Data
  const getCartData = async () => {
    try {
      const res = await api.get(`${apiUrl}/v1/cart`, {
        headers: {
          "x-api-key":
            "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10",
        },
      });
      console.log(res.data.data, "🧾 Cart API Response");
      setCartItems(res?.data?.data || []);
    } catch (error) {
      console.error("❌ Error fetching cart:", error);
    }
  };

  // 🗑️ Delete Item
  const handleDelete = async (id) => {
    try {
      await api.delete(`/v1/cart?itemId=${id}`, {
        headers: {
          "x-api-key":
            "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10",
        },
      });
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  // 🏠 Get Address List
  const getAddressList = async () => {
    try {
      const res = await api.get(`/v1/address/all`, {
        headers: {
          "x-api-key":
            "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10",
        },
      });
      setAddressList(res?.data?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCartData();
    getAddressList();
  }, []);

  return (
    <div className={styles.cartPage}>
      {cartItems?.length > 0 ? (
        <>
          <CartRewards totalAmount={bagTotal} />

          <div className={styles.cartContainer}>
            {/* LEFT: Cart Items */}
            <div className={styles.cartItems}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemImage}>
                    <img src={item.imageUrl} alt={item.name} />
                  </div>

                  <div className={styles.itemDetails}>
                    <div>
                      <div className={styles.itemHeader}>
                        <h3 className={styles.itemName}>{item.name}</h3>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className={styles.removeBtn}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className={styles.itemMeta}>
                        <span>
                          {item.options?.size} | {item.options?.color}
                        </span>
                        <span className={styles.quantitySelector}>
                          QTY |
                          <select
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.id,
                                parseInt(e.target.value)
                              )
                            }
                          >
                            {[...Array(10).keys()].map((num) => (
                              <option key={num + 1} value={num + 1}>
                                {num + 1}
                              </option>
                            ))}
                          </select>
                        </span>
                      </div>
                    </div>

                    <div className={styles.itemFooter}>
                      <button className={styles.wishlistBtn}>
                        MOVE TO WISHLIST
                      </button>
                      <span className={styles.itemPrice}>
                        ₹
                        {item.price ||
                          item.totalPrice ||
                          item.product?.price ||
                          0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: Address + Price */}
            <div className={styles.rightSection}>
              <DefaultAddress
                addressList={addressList}
                onChange={() => console.log("Change Address Clicked")}
              />
              <PriceList bagTotal={bagTotal} grandTotal={grandTotal} />
            </div>
          </div>
        </>
      ) : (
        <NoResult
          title="Oops! Your Cart is Empty"
          description="It seems like your shopping cart is currently empty. Start adding items to your cart to continue shopping and enjoy a seamless checkout experience. Explore our products and find the perfect items for you."
          buttonText="Explore"
          onButtonClick={() => router.push("/")}
        />
      )}
    </div>
  );
};

export default Cart;
