import { describe, expect, it } from "vitest";
import { handleRequest } from "../src/index.js";

function request(path: string, init?: RequestInit): Request {
  return new Request(`https://geo-service.test${path}`, init);
}

describe("Worker API routes", () => {
  it("serves GET /health", async () => {
    const response = await handleRequest(request("/health"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      service: "geo-service",
    });
  });

  it("simulates a valid audit and returns its Markdown report", async () => {
    const response = await handleRequest(
      request("/api/audit/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          companyName: "Nürnberger Beispiel GmbH",
          website: "https://example.invalid",
          industry: "Handwerk",
          location: "Nürnberg",
        }),
      }),
    );
    const body = (await response.json()) as {
      audit: { mode: string; checks: unknown[] };
      reportMarkdown: string;
    };

    expect(response.status).toBe(200);
    expect(body.audit.mode).toBe("simulation");
    expect(body.audit.checks).toHaveLength(3);
    expect(body.reportMarkdown).toContain("GEO-Sichtbarkeitscheck");
  });

  it("rejects invalid JSON and missing fields", async () => {
    const invalidJson = await handleRequest(
      request("/api/audit/simulate", { method: "POST", body: "{" }),
    );
    const missingFields = await handleRequest(
      request("/api/audit/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ companyName: "Firma" }),
      }),
    );

    expect(invalidJson.status).toBe(400);
    expect(missingFields.status).toBe(400);
  });

  it("rejects non-HTTP website schemes and unknown paths", async () => {
    const invalidUrl = await handleRequest(
      request("/api/audit/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          companyName: "Firma",
          website: "file:///etc/passwd",
          industry: "Branche",
        }),
      }),
    );
    const notFound = await handleRequest(request("/missing"));

    expect(invalidUrl.status).toBe(400);
    expect(notFound.status).toBe(404);
  });
});
