import { z } from "zod";

const inputSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  bodyText: z.string().min(1),
  bodyHtml: z.string().min(1),
  fromName: z.string().min(1),
  fromEmail: z.string().optional(),
  pdfBase64: z.string().min(1),
  docxBase64: z.string().min(1),
  pdfFilename: z.string().min(1),
  docxFilename: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  // Validation
  const result = inputSchema.safeParse(body);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid input payload: " + result.error.message,
    });
  }

  const data = result.data;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error:
        "RESEND_API_KEY belum dikonfigurasi di server. " +
        "Daftar gratis di https://resend.com, lalu tambahkan RESEND_API_KEY ke file .env",
    };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const fromHeader = `${data.fromName} <${fromEmail}>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromHeader,
        to: [data.to],
        subject: data.subject,
        text: data.bodyText,
        html: data.bodyHtml,
        attachments: [
          {
            filename: data.pdfFilename,
            content: data.pdfBase64,
            contentType: "application/pdf",
          },
          {
            filename: data.docxFilename,
            content: data.docxBase64,
            contentType:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          },
        ],
      }),
    });

    if (!response.ok) {
      let errorDetail = `HTTP ${response.status}`;
      try {
        const errBody = await response.json();
        errorDetail = errBody.message || errBody.error || errorDetail;
      } catch {
        errorDetail = await response.text().catch(() => errorDetail);
      }
      return { success: false, error: errorDetail };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Internal server error during email dispatch",
    };
  }
});
