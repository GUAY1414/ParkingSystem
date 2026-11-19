"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = { reference: string; size?: number };

export default function SessionQr({ reference, size = 220 }: Props) {
  const [image, setImage] = useState("");

  useEffect(() => {
    QRCode.toDataURL(reference, { width: size, margin: 2, errorCorrectionLevel: "M" })
      .then(setImage)
      .catch(() => setImage(""));
  }, [reference, size]);

  return image
    ? <img src={image} alt={`QR reference ${reference}`} width={size} height={size} style={{ display: "block", margin: "auto", borderRadius: 8 }} />
    : <div style={{ width: size, height: size, margin: "auto", background: "#eef3f6", borderRadius: 8 }} />;
}
