import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(new URL("../noora_frontend/src/lib/routes.ts", import.meta.url), "utf8")
  .replace("as const", "")
  .replace("export { routes };", "return routes;");
const loadRoutes = new Function("process", "window", source);
const env = {
  NEXT_PUBLIC_APP_URL: "",
  NEXT_PUBLIC_EXTERNAL_API_URL: "/backend",
  NEXT_PUBLIC_INTERNAL_API_URL: "http://backend:4000",
};

for (const origin of ["http://localhost:3000", "http://95.38.184.97:3000", "https://noora.example.com"]) {
  test(`browser routes follow ${origin}`, () => {
    const routes = loadRoutes({ env }, { location: { origin } });
    assert.equal(routes.app, origin);
    assert.equal(routes.externalApi, origin + "/backend");
    assert.equal(new URL("files/123/export", routes.externalApi.replace(/\/$/, "") + "/").href,
      origin + "/backend/files/123/export");
    assert.equal(new URL(env.NEXT_PUBLIC_EXTERNAL_API_URL, origin).origin, origin);
  });
}

test("server requests use Docker DNS", () => {
  const routes = loadRoutes({ env }, undefined);
  assert.equal(routes.externalApi, "http://backend:4000");
  assert.equal(routes.internalApi, "http://backend:4000");
});

test("dynamic links render without a browser origin during build", () => {
  const helperSource = readFileSync(new URL("../noora_frontend/src/lib/utils/url/getDynamicUrl.ts", import.meta.url), "utf8")
    .replace('import { routes } from "@/routes";', "")
    .replace("(url: string): string", "(url)")
    .replace("export { getDynamicUrl };", "return getDynamicUrl;");
  const getDynamicUrl = new Function("routes", helperSource)({ app: "" });
  assert.match(getDynamicUrl("/dashboard?tab=all#list"), /^\/dashboard\?tab=all&t=\d+#list$/);
  assert.match(getDynamicUrl("https://example.com/file"), /^https:\/\/example.com\/file\?t=\d+$/);
});
