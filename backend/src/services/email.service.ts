import { Resend } from "resend";
import { env } from "../config/env";

export async function sendReceiptEmail(params: {
  to: string;
  receiptNumber: string;
  plateNumber: string;
  locationName: string;
  zoneName: string;
  amountPesos: number;
  paymentMethod: string;
  issuedAt: string;
}) {
  if (!env.resendApiKey) {
    return { sent: false, reason: "RESEND_NOT_CONFIGURED" };
  }

  const resend = new Resend(env.resendApiKey);
  const { error } = await resend.emails.send({
    from: env.emailFrom,
    to: [params.to],
    subject: `Parking receipt ${params.receiptNumber}`,
    html: `
      <h2>Kuya meron pa? parking receipt</h2>
      <p><strong>Receipt:</strong> ${params.receiptNumber}</p>
      <p><strong>Vehicle:</strong> ${params.plateNumber}</p>
      <p><strong>Location:</strong> ${params.locationName}</p>
      <p><strong>Zone:</strong> ${params.zoneName}</p>
      <p><strong>Amount:</strong> ₱${params.amountPesos.toFixed(2)}</p>
      <p><strong>Payment method:</strong> ${params.paymentMethod}</p>
      <p><strong>Issued:</strong> ${params.issuedAt}</p>
    `,
  });

  if (error) {
    console.error("Receipt email failed:", error);
    return { sent: false, reason: "RESEND_ERROR" };
  }

  return { sent: true };
}
