"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./canvas.module.scss";

const FONTS = [
  { id: "f1", name: "Arial", css: "Arial, sans-serif" },
  { id: "f2", name: "Times", css: "'Times New Roman', serif" },
  { id: "f3", name: "Comic", css: "'Comic Sans MS', cursive" },
  { id: "f4", name: "Impact", css: "Impact, fantasy" },
  { id: "f5", name: "Lobster", css: "'Lobster', cursive" },
];

export default function CanvasEditor({ shirtUrl, batmanUrl, onDesignReady }) {
  const canvasRef = useRef(null);
  const [font, setFont] = useState(FONTS[0]);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(30);
  const [text, setText] = useState("Mini Knight.\nMega Might!");
  const [textX, setTextX] = useState(250);
  const [textY, setTextY] = useState(420);
  const [dragging, setDragging] = useState(false);

  // Load images
  const [shirtImg, setShirtImg] = useState(null);
  const [batmanImg, setBatmanImg] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = shirtUrl || "";
    img.onload = () => setShirtImg(img);
    img.onerror = () => setShirtImg(null);
  }, [shirtUrl]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = batmanUrl || shirtUrl || "";
    img.onload = () => setBatmanImg(img);
    img.onerror = () => setBatmanImg(null);
  }, [batmanUrl, shirtUrl]);

  // Draw everything
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      ctx.clearRect(0, 0, 500, 600);

      // 1. Shirt
      if (shirtImg) {
        ctx.drawImage(shirtImg, 0, 0, 500, 600);
      } else {
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(0, 0, 500, 600);
      }

      // 3. Text
      ctx.font = `${size}px ${font.css}`;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const lines = text.split("\n");
      const lineHeight = size * 1.2;
      lines.forEach((line, i) => {
        ctx.fillText(
          line,
          textX,
          textY + i * lineHeight - ((lines.length - 1) * lineHeight) / 2
        );
      });
    };

    draw();
  }, [shirtImg, batmanImg, text, font, color, size, textX, textY]);

  // Drag text
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (Math.hypot(x - textX, y - textY) < 80) setDragging(true);
    };
    const onMove = (e) => {
      if (!dragging) return;
      const rect = canvas.getBoundingClientRect();
      setTextX(e.clientX - rect.left);
      setTextY(e.clientY - rect.top);
    };
    const onUp = () => setDragging(false);

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onUp);
    return () => {
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onUp);
    };
  }, [dragging, textX, textY]);

  // Export PNG
  const exportDesign = () => {
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onDesignReady(dataUrl);
  };

  return (
    <div className={styles.canvasSection}>
      <canvas
        ref={canvasRef}
        width={500}
        height={600}
        className={styles.canvas}
        style={{
          cursor: dragging ? "grabbing" : "grab",
          border: "1px solid #ddd",
          borderRadius: "10px",
        }}
      />

      <div className={styles.toolbar}>
        <div className={styles.fontTabs}>
          {FONTS.map((f, i) => (
            <button
              key={f.id}
              className={`${styles.fontTab} ${
                font.id === f.id ? styles.active : ""
              }`}
              onClick={() => setFont(f)}
              style={{ fontFamily: f.css }}
            >
              Font {i + 1}
            </button>
          ))}
        </div>

        <div className={styles.bottomToolbar}>
  <div className={styles.toolbarGroup}>
    <button className={styles.toolButton}>
      <span className={styles.icon}>A<span style={{ fontSize: "0.7em" }}>A</span></span>
      <span className={styles.label}>Font Size</span>
    </button>

    <div className={styles.divider}></div>

    <button className={styles.toolButton}>
      <span className={styles.icon}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 0a.5.5 0 0 1 .47.33L11.09 7H4.91L7.53.33A.5.5 0 0 1 8 0zM4.5 8h7a.5.5 0 0 1 .47.67L9.41 15H6.59L4.03 8.67A.5.5 0 0 1 4.5 8z"/>
        </svg>
      </span>
      <span className={styles.label}>Colour</span>
    </button>

    <div className={styles.divider}></div>

    <button className={styles.toolButton}>
      <span className={styles.icon} style={{ fontFamily: "serif", fontSize: "22px" }}>f</span>
      <span className={styles.label}>Fonts</span>
    </button>

    <div className={styles.divider}></div>

    <button className={styles.toolButton}>
      <span className={styles.icon}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3zm10 10H3V4h10v8z"/>
          <path d="M5 5h2v2H5V5zm4 0h2v2H9V5zM5 9h2v2H5V9zm4 0h2v2H9V9z"/>
        </svg>
      </span>
      <span className={styles.label}>Edit</span>
    </button>
  </div>

  <button className={styles.closeButton}>×</button>
</div>


        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text..."
          className={styles.textInput}
          rows={3}
        />
      </div>
    </div>
  );
}
