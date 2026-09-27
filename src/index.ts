import { generateMarkdownReport, runSimulatedAudit } from "./audit.js";

interface WorkerEnv {
  [key: string]: unknown;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(
  payload: Record<string, unknown>,
  field: string,
): string | undefined {
  const value = payload[field];
  if (typeof value !== "string" || value.trim().length === 0) return undefined;
  return value.trim();
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/health") {
    return jsonResponse({ status: "ok", service: "geo-service" });
  }

  if (request.method === "POST" && url.pathname === "/api/audit/simulate") {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ error: "Request body must be valid JSON." }, 400);
    }

    if (!isRecord(payload)) {
      return jsonResponse({ error: "Request body must be a JSON object." }, 400);
    }

    const companyName = requiredString(payload, "companyName");
    const website = requiredString(payload, "website");
    const industry = requiredString(payload, "industry");
    if (!companyName || !website || !industry) {
      return jsonResponse(
        { error: "companyName, website, and industry must be non-empty strings." },
        400,
      );
    }

    let parsedWebsite: URL;
    try {
      parsedWebsite = new URL(website);
    } catch {
      return jsonResponse({ error: "website must be a valid HTTP(S) URL." }, 400);
    }
    if (parsedWebsite.protocol !== "https:" && parsedWebsite.protocol !== "http:") {
      return jsonResponse({ error: "website must use HTTP or HTTPS." }, 400);
    }

    const location =
      typeof payload.location === "string" && payload.location.trim()
        ? payload.location.trim()
        : undefined;
    const audit = runSimulatedAudit(
      { companyName, website: parsedWebsite.toString(), industry, location },
    );

    return jsonResponse({ audit, reportMarkdown: generateMarkdownReport(audit) });
  }

  return jsonResponse({ error: "Not found." }, 404);
}

const worker = {
  fetch(request: Request, _env: WorkerEnv): Promise<Response> {
    return handleRequest(request);
  },
};

export default worker;
