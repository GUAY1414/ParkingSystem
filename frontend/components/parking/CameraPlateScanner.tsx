"use client";

import { useRef, useState } from "react";
import { Camera, RotateCcw, Upload } from "lucide-react";

export default function CameraPlateScanner({ onPlateConfirmed }: { onPlateConfirmed: (plate: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [plate, setPlate] = useState("");
  const [ocrStatus, setOcrStatus] = useState("");

  async function startCamera() {
    try {
      setOcrStatus("");
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (error) {
      setOcrStatus(error instanceof DOMException && error.name === "NotAllowedError"
        ? "Camera permission was denied. Allow camera access or enter the plate manually."
        : "Camera unavailable. You can enter the plate manually.");
    }
  }

  async function captureAndRecognize() {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);

    await recognizeImage(canvas);
  }

  function stopCamera() {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  }

  async function recognizeImage(image: HTMLCanvasElement) {
    setOcrStatus("Recognizing plate…");
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng");
    const result = await worker.recognize(image);
    await worker.terminate();
    const text = result.data.text.toUpperCase();
    const candidates = text.replace(/[^A-Z0-9]/g, "").match(/[A-Z]{2,3}\d{3,4}|\d{3}[A-Z]{3}/g);
    const suggested = candidates?.[0] ?? text.replace(/[^A-Z0-9]/g, "").trim();
    setPlate(suggested);
    setOcrStatus(suggested ? "Review the recognized value. OCR may be incorrect." : "Plate could not be read. Enter it manually.");
  }

  async function uploadPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !canvasRef.current) return;
    const bitmap = await createImageBitmap(file);
    const canvas = canvasRef.current;
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
    await recognizeImage(canvas);
    bitmap.close();
  }

  return (
    <section style={{ border: "1px solid #e7edf4", borderRadius: 14, padding: 16, background: "white" }}>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", aspectRatio: "16/10", objectFit: "cover", borderRadius: 10, background: "#10233f", display: stream ? "block" : "none" }} />
      <canvas ref={canvasRef} hidden />
      {!stream && <button type="button" className="secondary-button" style={{ width: "100%", height: 140 }} onClick={startCamera}><Camera size={20} /> Open rear camera</button>}
      {stream && <div style={{ display: "flex", gap: 8, marginTop: 10 }}><button type="button" className="primary-button" onClick={captureAndRecognize}><Camera size={16} /> Capture plate</button><button type="button" className="secondary-button" onClick={stopCamera}><RotateCcw size={16} /> Stop</button></div>}
      <label className="secondary-button" style={{ width: "100%", marginTop: 8, cursor: "pointer" }}><Upload size={16} /> Upload plate photo<input type="file" accept="image/*" onChange={uploadPhoto} style={{ display: "none" }} /></label>
      {ocrStatus && <p style={{ color: "#66758a", fontSize: 12, lineHeight: 1.5 }}>{ocrStatus}</p>}
      <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginTop: 12 }}>License plate number</label>
      <input value={plate} onChange={(event) => setPlate(event.target.value.toUpperCase())} placeholder="Example: ABC1234" style={{ width: "100%", height: 46, border: "1px solid #dde5ed", borderRadius: 9, padding: "0 12px", marginTop: 7, letterSpacing: ".08em", fontWeight: 800 }} />
      <button type="button" className="primary-button" disabled={!plate.trim()} onClick={() => onPlateConfirmed(plate.trim())} style={{ width: "100%", marginTop: 10, border: 0 }}>Confirm plate</button>
    </section>
  );
}
