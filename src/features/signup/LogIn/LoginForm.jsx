"use client";

import React, { useState } from "react";
import styles from "./LoginForm.module.scss";
import { auth } from "@/firebase/config";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const LoginForm = ({ onContinue }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible", // or "normal"
          callback: (response) => {
            console.log("Recaptcha verified:", response);
          },
        }
      );
    }
  };

  const handleContinue = async () => {
    if (!phoneNumber) return alert("Enter phone number");

    setupRecaptcha();

    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        `+91${phoneNumber}`,
        appVerifier
      );
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      console.log("OTP sent successfully!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert(error.message);
    }
  };

  const verifyOTP = async (otp) => {
    try {
      const result = await window.confirmationResult.confirm(otp);
      console.log("User signed in:", result.user);
      onContinue?.();
    } catch (error) {
      console.error("OTP verification failed:", error);
    }
  };

  return (
    <div className={styles.loginForm}>
      <h2 className={styles.title}>
        Glad to have you at <span>Print Easy</span>.
        <br /> Stay tuned for exclusive offers & updates!
      </h2>

      <p className={styles.subtitle}>Login or Signup</p>
      <p className={styles.helper}>
        Use your email or another service to continue, signing up is free!
      </p>

      <input
        type="text"
        placeholder="Enter Mobile Number"
        className={styles.input}
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />

      <div id="recaptcha-container"></div>

      <button className={styles.continueBtn} onClick={handleContinue}>
        Continue
      </button>

      {otpSent && (
        <div>
          <input
            type="text"
            placeholder="Enter OTP"
            onChange={(e) => verifyOTP(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default LoginForm;
