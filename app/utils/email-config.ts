const RESEND_KEY_STORAGE = "resend_api_key";

export function getStoredResendKey(): string {
  try {
    return localStorage.getItem(RESEND_KEY_STORAGE) || "";
  } catch {
    return "";
  }
}

export function setStoredResendKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(RESEND_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(RESEND_KEY_STORAGE);
    }
  } catch {
    // ignore
  }
}

export function hasResendKey(): boolean {
  return getStoredResendKey().length > 0;
}

/**
 * Send email directly via Resend REST API from the browser.
 * Works when user has stored a Resend API key in settings.
 */
export async function sendEmailViaResendClient(params: {
  apiKey: string;
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  fromName: string;
  fromEmail?: string;
  pdfBase64: string;
  docxBase64: string;
  pdfFilename: string;
  docxFilename: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const fromEmail = params.fromEmail || "onboarding@resend.dev";
  const fromHeader = `${params.fromName} <${fromEmail}>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromHeader,
        to: [params.to],
        subject: params.subject,
        text: params.bodyText,
        html: params.bodyHtml,
        attachments: [
          {
            filename: params.pdfFilename,
            content: params.pdfBase64,
            content_type: "application/pdf",
          },
          {
            filename: params.docxFilename,
            content: params.docxBase64,
            content_type:
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
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}
