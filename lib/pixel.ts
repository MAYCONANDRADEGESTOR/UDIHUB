export const PIXEL_ID = "4151514745140497";

declare global {
  interface Window { fbq: (...args: any[]) => void; _fbq: any; }
}

export function pageview() {
  if (typeof window !== "undefined" && window.fbq) window.fbq("track", "PageView");
}

export function lead(data?: { professionalId?: string; category?: string }) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead", {
      content_name: data?.category || "Profissional",
      content_ids: data?.professionalId ? [data.professionalId] : [],
      content_type: "service",
    });
  }
}

export function viewContent(data?: { professionalId?: string; category?: string }) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: data?.category || "Profissional",
      content_ids: data?.professionalId ? [data.professionalId] : [],
      content_type: "service",
    });
  }
}

export function completeRegistration(role: string) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "CompleteRegistration", {
      content_name: role === "professional" ? "Cadastro Profissional" : "Cadastro Cliente",
      status: true,
    });
  }
}

export function purchase(plan: string, value: number) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Purchase", {
      value,
      currency: "BRL",
      content_name: plan === "professional_annual" ? "Plano Anual" : "Plano Profissional",
      content_type: "subscription",
    });
  }
}
