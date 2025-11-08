"use client";

import React, { useState, useEffect } from "react";
import styles from "./otp.module.scss";

const OTPModal = () => {
  const [timer, setTimer] = useState(45);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.otpModal}>
      <h2>OTP Verification</h2>
      <p>We have sent a verification code to +91 8861406251</p>
      <div className={styles.otpBoxes}>
        {[...Array(6)].map((_, i) => (
          <input key={i} type="text" maxLength="1" />
        ))}
      </div>
      <p>
        Didn’t get the OTP? Resend in <strong>{timer}s</strong>
      </p>
    </div>
  );
};

export default OTPModal;
