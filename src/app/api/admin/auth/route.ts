import {
  adminAuthResponse,
  hasConfiguredAdminEmails,
  isAdminEmail,
  isValidEmail,
  normalizeEmail,
} from "@/lib/admin/auth";
import { readJsonBodyWithinLimit } from "@/lib/request-body";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_AUTH_BODY_SIZE = 4_096;

async function verifyRecaptcha(token: string, request: Request) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return "unavailable" as const;
  if (!token || token.length > 4_096) return "invalid" as const;

  try {
    const verificationResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }),
        signal: AbortSignal.timeout(5_000),
      },
    );
    if (!verificationResponse.ok) return "unavailable" as const;

    const result = (await verificationResponse.json()) as {
      success?: unknown;
      hostname?: unknown;
    };
    if (result.success !== true || typeof result.hostname !== "string") {
      return "invalid" as const;
    }

    const requestHost = new URL(request.url).hostname.toLowerCase();
    if (process.env.NODE_ENV === "production" && result.hostname.toLowerCase() !== requestHost) {
      return "invalid" as const;
    }

    return "valid" as const;
  } catch {
    return "unavailable" as const;
  }
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getClaims();
    const email = typeof data?.claims?.email === "string"
      ? normalizeEmail(data.claims.email)
      : null;

    if (error || !isAdminEmail(email)) {
      return adminAuthResponse({ error: "Sesi admin tidak valid." }, 401);
    }

    return adminAuthResponse({ email: email ?? "" });
  } catch {
    return adminAuthResponse(
      { error: "Supabase belum dikonfigurasi dengan benar di server." },
      503,
    );
  }
}

export async function POST(request: Request) {
  const parsedBody = await readJsonBodyWithinLimit(request, MAX_AUTH_BODY_SIZE);
  if (parsedBody.status === "too-large") {
    return adminAuthResponse({ error: "Permintaan autentikasi terlalu besar." }, 413);
  }
  if (parsedBody.status === "invalid") {
    return adminAuthResponse({ error: "Permintaan autentikasi tidak valid." }, 400);
  }
  const body = parsedBody.body;
  const action =
    typeof body === "object" && body !== null && "action" in body && typeof body.action === "string"
      ? body.action
      : "";
  const emailValue =
    typeof body === "object" && body !== null && "email" in body && typeof body.email === "string"
      ? normalizeEmail(body.email)
      : "";
  const token =
    typeof body === "object" && body !== null && "token" in body && typeof body.token === "string"
      ? body.token.trim()
      : "";
  const captchaToken =
    typeof body === "object" && body !== null && "captchaToken" in body && typeof body.captchaToken === "string"
      ? body.captchaToken.trim()
      : "";

  if (action === "logout") {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.auth.getClaims();
      const email = typeof data?.claims?.email === "string" ? data.claims.email : null;

      if (error || !isAdminEmail(email)) {
        return adminAuthResponse({ error: "Sesi admin tidak valid." }, 401);
      }

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        return adminAuthResponse({ error: "Sesi admin tidak dapat diakhiri." }, 500);
      }

      return adminAuthResponse({ ok: true });
    } catch {
      return adminAuthResponse(
        { error: "Supabase belum dikonfigurasi dengan benar di server." },
        503,
      );
    }
  }

  if (action !== "request-otp" && action !== "resend-otp" && action !== "verify-otp") {
    return adminAuthResponse({ error: "Permintaan autentikasi tidak valid." }, 400);
  }

  if (!isValidEmail(emailValue)) {
    return adminAuthResponse(
      {
        error:
          action !== "verify-otp"
            ? "Masukkan alamat email yang valid."
            : "Kode OTP tidak valid atau sudah kedaluwarsa.",
      },
      400,
    );
  }

  if (action === "verify-otp" && !/^\d{6}$/.test(token)) {
    return adminAuthResponse({ error: "Kode OTP tidak valid atau sudah kedaluwarsa." }, 400);
  }

  if (!hasConfiguredAdminEmails()) {
    return adminAuthResponse(
      { error: "Daftar email admin belum dikonfigurasi di server." },
      503,
    );
  }

  if (action === "request-otp") {
    const captchaStatus = await verifyRecaptcha(captchaToken, request);
    if (captchaStatus === "unavailable") {
      return adminAuthResponse({ error: "reCAPTCHA belum dapat diverifikasi. Coba lagi nanti." }, 503);
    }
    if (captchaStatus !== "valid") {
      return adminAuthResponse({ error: "Centang verifikasi I'm not a robot lalu coba lagi." }, 400);
    }
  }

  if (action === "verify-otp" && !isAdminEmail(emailValue)) {
    return adminAuthResponse({ error: "Kode OTP tidak valid atau sudah kedaluwarsa." }, 400);
  }

  try {
    const supabase = await createSupabaseServerClient();

    if (action === "request-otp" || action === "resend-otp") {
      if (isAdminEmail(emailValue)) {
        const { error } = await supabase.auth.signInWithOtp({
          email: emailValue,
          options: { shouldCreateUser: false },
        });

        if (error) {
          const isRateLimited = error.status === 429;
          return adminAuthResponse(
            {
              error: isRateLimited
                ? "Tunggu 60 detik sebelum meminta kode baru."
                : "Kode OTP belum dapat dikirim. Coba lagi.",
            },
            isRateLimited ? 429 : 502,
          );
        }
      }

      return adminAuthResponse({ ok: true });
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: emailValue,
      token,
      type: "email",
    });

    if (error || !data.user || !isAdminEmail(data.user.email)) {
      if (data.session) await supabase.auth.signOut();
      return adminAuthResponse(
        { error: "Kode OTP tidak valid atau sudah kedaluwarsa." },
        400,
      );
    }

    return adminAuthResponse({ ok: true });
  } catch {
    return adminAuthResponse(
      { error: "Supabase belum dikonfigurasi dengan benar di server." },
      503,
    );
  }
}
