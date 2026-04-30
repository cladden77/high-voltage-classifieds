"use client";

import { FormEvent, useState } from "react";

const PORTAL_ID = "243765446";
const FORM_ID = "ef60169f-ecda-4601-806b-f0a2e4657d7c";
const SUBMIT_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`;

/** HubSpot contact email field — internal name is usually `email`; change if your form uses another name. */
const EMAIL_FIELD = { objectTypeId: "0-1" as const, name: "email" as const };

type NewsletterSubscribeFormProps = {
  variant?: "footer" | "lightInline";
};

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export default function NewsletterSubscribeForm({
  variant = "footer",
}: NewsletterSubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const isLightInline = variant === "lightInline";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const payload = {
        submittedAt: Date.now().toString(),
        fields: [
          {
            objectTypeId: EMAIL_FIELD.objectTypeId,
            name: EMAIL_FIELD.name,
            value: email.trim(),
          },
        ],
        context: {
          hutk: readCookie("hubspotutk"),
          pageUri: window.location.href,
          pageName: document.title,
        },
      };

      const res = await fetch(SUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      let data: {
        inlineMessage?: string;
        message?: string;
        errors?: { message: string; errorType?: string }[];
      };
      try {
        data = JSON.parse(raw) as typeof data;
      } catch {
        setStatus("error");
        setMessage("Unexpected response. Please try again.");
        return;
      }

      if (!res.ok) {
        const errMsg =
          data.errors?.[0]?.message ||
          data.message ||
          "Something went wrong. Please try again.";
        setStatus("error");
        setMessage(errMsg);
        return;
      }

      setStatus("success");
      setEmail("");
      if (data.inlineMessage) {
        const stripped = data.inlineMessage.replace(/<[^>]+>/g, "").trim();
        setMessage(stripped || "Thanks for subscribing!");
      } else {
        setMessage("Thanks for subscribing!");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={
        isLightInline
          ? "mx-auto flex w-full max-w-[520px] flex-col gap-2 sm:flex-row sm:items-start"
          : "flex max-w-full flex-col gap-2.5"
      }
    >
      <input
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        placeholder={isLightInline ? "Enter your email" : "Your email address"}
        aria-label="Email address"
        disabled={status === "loading"}
        className={
          isLightInline
            ? "h-11 w-full rounded-lg border border-[#dbdbdb] bg-white px-5 text-[15px] text-[#5f5f5f] placeholder:text-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#f37121] disabled:opacity-60"
            : "w-full rounded-[10px] border-0 bg-[#2e2e2e] px-[14px] py-3 text-[15px] text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#f37121] disabled:opacity-60"
        }
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className={
          isLightInline
            ? "h-11 shrink-0 rounded-lg bg-[#f37121] px-8 text-[15px] font-bold text-white hover:bg-[#e55a0a] disabled:opacity-60"
            : "w-full rounded-[10px] bg-[#f37121] px-5 py-3 text-[15px] font-bold uppercase tracking-wide text-neutral-950 hover:bg-[#e55a0a] disabled:opacity-60"
        }
      >
        {status === "loading" ? "…" : "Subscribe"}
      </button>
      {message ? (
        <p
          className={
            isLightInline
              ? status === "error"
                ? "text-sm text-red-500 sm:basis-full"
                : "text-sm text-gray-600 sm:basis-full"
              : status === "error"
                ? "text-sm text-red-400"
                : "text-sm text-neutral-400"
          }
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
