"use client";
import React, { useEffect, useRef } from "react";

const SAFE = {
  left: 140,
  top: 260,
  width: 260,
  height: 180
};

export default function CanvasEditor({ product }) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js";
    script.onload = () => initCanvas();
    document.body.appendChild(script);

    return () => {
      fabricCanvasRef.current?.dispose();
    };
  }, [product]);

  const resolveImageURL = (img) => {
    if (!img) return null;
    if (typeof img === "object" && img.src) return img.src;
    if (img.startsWith("/_next/image")) {
      const real = new URL(img, window.location.origin).searchParams.get("url");
      return real || img;
    }
    return img;
  };

  const initCanvas = () => {
    if (!window.fabric) return;

    const canvas = new window.fabric.Canvas(canvasRef.current, {
      width: 600,
      height: 900
    });

    fabricCanvasRef.current = canvas;
    loadShirt(canvas);
  };

  const loadShirt = (canvas) => {
    const shirtURL = resolveImageURL(product?.canvasImage);
    const illustrationURL = resolveImageURL(product?.illustrationImage);

    if (!shirtURL) return console.error("No shirt image provided");

    // Load shirt background
    window.fabric.Image.fromURL(
      shirtURL,
      (shirtImg) => {
        if (!shirtImg) return console.error("Shirt image failed to load");

        const scale = canvas.width / shirtImg.width;
        shirtImg.scale(scale);

        canvas.setBackgroundImage(
          shirtImg,
          () => {
            canvas.renderAll();

            // Load illustration image (locked, not draggable)
            if (illustrationURL) {
              window.fabric.Image.fromURL(
                illustrationURL,
                (illuImg) => {
                  if (!illuImg) return console.error("Illustration failed");

                  // Scale illustration slightly bigger than SAFE area
                  const scaleX = SAFE.width / illuImg.width * 1.2; // 20% bigger
                  const scaleY = SAFE.height / illuImg.height * 1.2;
                  const scale = Math.min(scaleX, scaleY);
                  illuImg.scale(scale);

                  illuImg.set({
                    left: SAFE.left + (SAFE.width - illuImg.width * scale) / 2,
                    top: SAFE.top + (SAFE.height - illuImg.height * scale) / 2,
                    selectable: false, // not draggable or selectable
                    evented: false // ignore mouse events
                  });

                  canvas.add(illuImg);
                  canvas.renderAll();
                  addTextBelowIllustration(canvas, illuImg);
                },
                { crossOrigin: "anonymous" }
              );
            } else {
              addTextBelowIllustration(canvas, null);
            }
          },
          { originX: "left", originY: "top" }
        );
      },
      { crossOrigin: "anonymous" }
    );
  };

  const addTextBelowIllustration = (canvas, illustration) => {
    const topPosition = illustration
      ? illustration.top + illustration.height * illustration.scaleY + 10
      : SAFE.top;

    const text = new window.fabric.Textbox("Enter your text", {
      left: SAFE.left,
      top: topPosition,
      width: SAFE.width,
      fontSize: 26,
      fill: "black",
      editable: true,
      textAlign: "center",
      splitByGrapheme: true
    });

    // Restrict text inside SAFE width
    text.on("moving", () => {
      if (text.left < SAFE.left) text.left = SAFE.left;
      if (text.left + text.width > SAFE.left + SAFE.width)
        text.left = SAFE.left + SAFE.width - text.width;
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  return (
    <div style={{ width: 600 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
