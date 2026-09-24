import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type VerificationStatus =
  | "PASS"
  | "FAIL"
  | "BLOCKED_CREDENTIAL";

type VerificationResult = {
  id: string;
  provider: string;
  category: "public" | "credentialed";
  status: VerificationStatus;
  request: {
    method: "GET" | "POST";
    url: string;
    headers?: string[];
  };
  httpStatus: number | null;
  durationMs: number | null;
  contentType: string | null;
  schemaValid: boolean | null;
  checkedAt: string;
  error: string | null;
  credentialEnv?: string[];
};

type ProbeOptions = {
  id: string;
  provider: string;
  category: "public" | "credentialed";
  url: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: URLSearchParams;
  credentialEnv?: string[];
  validate: (payload: unknown) => boolean;
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const outputArgIndex = args.indexOf("--output");
const outputPath =
  outputArgIndex >= 0 && args[outputArgIndex + 1]
    ? resolve(process.cwd(), args[outputArgIndex + 1])
    : resolve(
        process.cwd(),
        "artifacts/provider-verification/" +
          new Date().toISOString().slice(0, 10) +
          ".json",
      );

const publicOnly = args.includes("--public-only");
const timeoutMs = 15_000;
const retryable = new Set([408, 425, 429, 500, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function redactUrl(raw: string): string {
  const url = new URL(raw);
  for (const key of [
    "key",
    "username",
    "apiKey",
    "api_key",
    "token",
    "access_token",
  ]) {
    if (url.searchParams.has(key)) url.searchParams.set(key, "[REDACTED]");
  }
  return url.toString();
}

function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/key=[^&\s]+/gi, "key=[REDACTED]")
    .replace(/username=[^&\s]+/gi, "username=[REDACTED]")
    .replace(/Basic\s+[A-Za-z0-9+/=]+/gi, "Basic [REDACTED]")
    .slice(0, 500);
}

async function requestJson(
  options: ProbeOptions,
): Promise<VerificationResult> {
  const startedAt = performance.now();
  let lastError: unknown = null;
  let lastStatus: number | null = null;
  let lastContentType: string | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(options.url, {
        method: options.method ?? "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "YaRasoolAllah-ProviderVerifier/1.0",
          ...options.headers,
        },
        body: options.body,
        signal: AbortSignal.timeout(timeoutMs),
      });

      lastStatus = response.status;
      lastContentType = response.headers.get("content-type");

      const text = await response.text();
      let payload: unknown = null;
      try {
        payload = JSON.parse(text);
      } catch {
        payload = null;
      }

      const schemaValid = payload !== null && options.validate(payload);
      const ok = response.ok && schemaValid;

      if (!ok && retryable.has(response.status) && attempt < 2) {
        await sleep(350 * (attempt + 1));
        continue;
      }

      return {
        id: options.id,
        provider: options.provider,
        category: options.category,
        status: ok ? "PASS" : "FAIL",
        request: {
          method: options.method ?? "GET",
          url: redactUrl(options.url),
          headers: options.headers ? Object.keys(options.headers) : undefined,
        },
        httpStatus: response.status,
        durationMs: Math.round(performance.now() - startedAt),
        contentType: lastContentType,
        schemaValid,
        checkedAt: new Date().toISOString(),
        error: ok
          ? null
          : !response.ok
            ? "HTTP " + response.status
            : "response schema did not match the expected contract",
        credentialEnv: options.credentialEnv,
      };
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await sleep(350 * (attempt + 1));
        continue;
      }
    }
  }

  return {
    id: options.id,
    provider: options.provider,
    category: options.category,
    status: "FAIL",
    request: {
      method: options.method ?? "GET",
      url: redactUrl(options.url),
      headers: options.headers ? Object.keys(options.headers) : undefined,
    },
    httpStatus: lastStatus,
    durationMs: Math.round(performance.now() - startedAt),
    contentType: lastContentType,
    schemaValid: false,
    checkedAt: new Date().toISOString(),
    error: safeError(lastError),
    credentialEnv: options.credentialEnv,
  };
}

function blocked(
  id: string,
  provider: string,
  envNames: string[],
  requestUrl: string,
): VerificationResult {
  return {
    id,
    provider,
    category: "credentialed",
    status: "BLOCKED_CREDENTIAL",
    request: {
      method: "GET",
      url: redactUrl(requestUrl),
    },
    httpStatus: null,
    durationMs: null,
    contentType: null,
    schemaValid: null,
    checkedAt: new Date().toISOString(),
    error: null,
    credentialEnv: envNames,
  };
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

async function verifyPublicProviders(): Promise<VerificationResult[]> {
  const probes: ProbeOptions[] = [
    {
      id: "open-library-search",
      provider: "Open Library",
      category: "public",
      url:
        "https://openlibrary.org/search.json?q=Ibn%20Hisham" +
        "&fields=key,title,author_name,first_publish_year,edition_key,cover_i" +
        "&limit=1&page=1",
      validate(payload) {
        const value = objectValue(payload);
        return Array.isArray(value?.docs) && typeof value?.numFound === "number";
      },
    },
    {
      id: "internet-archive-metadata",
      provider: "Internet Archive",
      category: "public",
      url: "https://archive.org/metadata/opensource",
      validate(payload) {
        const value = objectValue(payload);
        return Boolean(objectValue(value?.metadata)) && Array.isArray(value?.files);
      },
    },
    {
      id: "qdl-iiif-manifest",
      provider: "Qatar Digital Library",
      category: "public",
      url: "https://www.qdl.qa/en/iiif/qnlhc/12933/manifest",
      validate(payload) {
        const value = objectValue(payload);
        return Boolean(value?.["@context"]) && (Array.isArray(value?.sequences) || Array.isArray(value?.items));
      },
    },
    {
      id: "gallica-iiif-manifest",
      provider: "BnF Gallica",
      category: "public",
      url: "https://gallica.bnf.fr/iiif/ark:/12148/btv1b550076223/manifest.json",
      validate(payload) {
        const value = objectValue(payload);
        return Boolean(value?.["@context"]) && (Array.isArray(value?.sequences) || Array.isArray(value?.items));
      },
    },
    {
      id: "mp3quran-languages",
      provider: "MP3Quran",
      category: "public",
      url: "https://mp3quran.net/api/v3/languages",
      validate(payload) {
        const value = objectValue(payload);
        return Array.isArray(value?.language) && value!.language.length > 0;
      },
    },
    {
      id: "aladhan-methods",
      provider: "AlAdhan",
      category: "public",
      url: "https://api.aladhan.com/v1/methods",
      validate(payload) {
        const value = objectValue(payload);
        return value?.code === 200 && Boolean(objectValue(value?.data));
      },
    },
    {
      id: "dorar-search",
      provider: "Dorar",
      category: "public",
      url:
        "https://dorar.net/dorar_api.json?skey=" +
        encodeURIComponent("إنما الأعمال بالنيات"),
      validate(payload) {
        const value = objectValue(payload);
        return Array.isArray(value?.ahadith);
      },
    },
  ];

  const results: VerificationResult[] = [];
  for (const probe of probes) {
    console.log("VERIFY", probe.provider, redactUrl(probe.url));
    results.push(await requestJson(probe));
  }
  return results;
}

async function verifyQuranFoundation(): Promise<VerificationResult> {
  const clientId = process.env.QF_CLIENT_ID?.trim();
  const clientSecret = process.env.QF_CLIENT_SECRET?.trim();
  const env = (process.env.QF_ENV?.trim() || "prelive").toLowerCase();
  const prelive = env !== "production";
  const oauthBase = prelive
    ? "https://prelive-oauth2.quran.foundation"
    : "https://oauth2.quran.foundation";
  const apiBase = prelive
    ? "https://apis-prelive.quran.foundation"
    : "https://apis.quran.foundation";
  const requestUrl = apiBase + "/content/api/v4/chapters";

  if (!clientId || !clientSecret || publicOnly) {
    return blocked(
      "quran-foundation-chapters",
      "Quran Foundation",
      ["QF_CLIENT_ID", "QF_CLIENT_SECRET", "QF_ENV"],
      requestUrl,
    );
  }

  const startedAt = performance.now();
  try {
    const basic = Buffer.from(clientId + ":" + clientSecret).toString("base64");
    const tokenResponse = await fetch(oauthBase + "/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: "Basic " + basic,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "YaRasoolAllah-ProviderVerifier/1.0",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "content",
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const tokenPayload = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenResponse.ok || !tokenPayload.access_token) {
      return {
        id: "quran-foundation-chapters",
        provider: "Quran Foundation",
        category: "credentialed",
        status: "FAIL",
        request: { method: "GET", url: requestUrl, headers: ["x-auth-token", "x-client-id"] },
        httpStatus: tokenResponse.status,
        durationMs: Math.round(performance.now() - startedAt),
        contentType: tokenResponse.headers.get("content-type"),
        schemaValid: false,
        checkedAt: new Date().toISOString(),
        error: "OAuth token request failed or returned no access_token",
        credentialEnv: ["QF_CLIENT_ID", "QF_CLIENT_SECRET", "QF_ENV"],
      };
    }

    return await requestJson({
      id: "quran-foundation-chapters",
      provider: "Quran Foundation",
      category: "credentialed",
      url: requestUrl,
      headers: {
        "x-auth-token": tokenPayload.access_token,
        "x-client-id": clientId,
      },
      credentialEnv: ["QF_CLIENT_ID", "QF_CLIENT_SECRET", "QF_ENV"],
      validate(payload) {
        const value = objectValue(payload);
        return Array.isArray(value?.chapters);
      },
    });
  } catch (error) {
    return {
      id: "quran-foundation-chapters",
      provider: "Quran Foundation",
      category: "credentialed",
      status: "FAIL",
      request: { method: "GET", url: requestUrl, headers: ["x-auth-token", "x-client-id"] },
      httpStatus: null,
      durationMs: Math.round(performance.now() - startedAt),
      contentType: null,
      schemaValid: false,
      checkedAt: new Date().toISOString(),
      error: safeError(error),
      credentialEnv: ["QF_CLIENT_ID", "QF_CLIENT_SECRET", "QF_ENV"],
    };
  }
}

async function verifyCredentialedProviders(): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [await verifyQuranFoundation()];

  const sunnahKey = process.env.SUNNAH_API_KEY?.trim();
  if (!sunnahKey || publicOnly) {
    results.push(
      blocked(
        "sunnah-collections",
        "Sunnah.com",
        ["SUNNAH_API_KEY"],
        "https://api.sunnah.com/v1/collections?limit=1&page=1",
      ),
    );
  } else {
    results.push(
      await requestJson({
        id: "sunnah-collections",
        provider: "Sunnah.com",
        category: "credentialed",
        url: "https://api.sunnah.com/v1/collections?limit=1&page=1",
        headers: { "X-API-Key": sunnahKey },
        credentialEnv: ["SUNNAH_API_KEY"],
        validate(payload) {
          const value = objectValue(payload);
          return Array.isArray(value?.data);
        },
      }),
    );
  }

  const geonamesUser = process.env.GEONAMES_USERNAME?.trim();
  const geonamesUrl =
    "https://api.geonames.org/searchJSON?q=Dubai&maxRows=1&username=" +
    encodeURIComponent(geonamesUser || "[missing]");
  if (!geonamesUser || publicOnly) {
    results.push(
      blocked(
        "geonames-search",
        "GeoNames",
        ["GEONAMES_USERNAME"],
        geonamesUrl,
      ),
    );
  } else {
    results.push(
      await requestJson({
        id: "geonames-search",
        provider: "GeoNames",
        category: "credentialed",
        url: geonamesUrl,
        credentialEnv: ["GEONAMES_USERNAME"],
        validate(payload) {
          const value = objectValue(payload);
          return Array.isArray(value?.geonames);
        },
      }),
    );
  }

  const youtubeKey = process.env.YOUTUBE_DATA_API_KEY?.trim();
  const youtubeUrl =
    "https://www.googleapis.com/youtube/v3/channels" +
    "?part=snippet,contentDetails&forHandle=%40one4kids&key=" +
    encodeURIComponent(youtubeKey || "[missing]");
  if (!youtubeKey || publicOnly) {
    results.push(
      blocked(
        "youtube-one4kids-channel",
        "YouTube Data API",
        ["YOUTUBE_DATA_API_KEY"],
        youtubeUrl,
      ),
    );
  } else {
    results.push(
      await requestJson({
        id: "youtube-one4kids-channel",
        provider: "YouTube Data API",
        category: "credentialed",
        url: youtubeUrl,
        credentialEnv: ["YOUTUBE_DATA_API_KEY"],
        validate(payload) {
          const value = objectValue(payload);
          return Array.isArray(value?.items) && value!.items.length > 0;
        },
      }),
    );
  }

  const timezoneKey = process.env.TIMEZONEDB_API_KEY?.trim();
  const timezoneUrl =
    "https://api.timezonedb.com/v2.1/get-time-zone" +
    "?format=json&by=zone&zone=Asia%2FDubai&key=" +
    encodeURIComponent(timezoneKey || "[missing]");
  if (!timezoneKey || publicOnly) {
    results.push(
      blocked(
        "timezonedb-dubai",
        "TimeZoneDB",
        ["TIMEZONEDB_API_KEY"],
        timezoneUrl,
      ),
    );
  } else {
    results.push(
      await requestJson({
        id: "timezonedb-dubai",
        provider: "TimeZoneDB",
        category: "credentialed",
        url: timezoneUrl,
        credentialEnv: ["TIMEZONEDB_API_KEY"],
        validate(payload) {
          const value = objectValue(payload);
          return value?.status === "OK" && value?.zoneName === "Asia/Dubai";
        },
      }),
    );
  }

  return results;
}

async function main(): Promise<void> {
  const startedAt = new Date().toISOString();
  const results = [
    ...(await verifyPublicProviders()),
    ...(await verifyCredentialedProviders()),
  ];

  const publicFailures = results.filter(
    (item) => item.category === "public" && item.status !== "PASS",
  );
  const credentialFailures = results.filter(
    (item) => item.category === "credentialed" && item.status === "FAIL",
  );

  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    startedAt,
    mode: publicOnly ? "public-only" : "all-configured",
    summary: {
      total: results.length,
      passed: results.filter((item) => item.status === "PASS").length,
      failed: results.filter((item) => item.status === "FAIL").length,
      blockedCredential: results.filter(
        (item) => item.status === "BLOCKED_CREDENTIAL",
      ).length,
      publicFailures: publicFailures.length,
      credentialFailures: credentialFailures.length,
    },
    results,
  };

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(report, null, 2) + "\n", "utf-8");

  for (const item of results) {
    console.log(
      [
        item.status.padEnd(18),
        item.provider.padEnd(24),
        String(item.httpStatus ?? "-").padEnd(4),
        String(item.durationMs ?? "-").padStart(6) + "ms",
        item.schemaValid === null ? "-" : item.schemaValid ? "schema=PASS" : "schema=FAIL",
      ].join(" "),
    );
  }
  console.log("Evidence:", outputPath);

  if (publicFailures.length || credentialFailures.length) {
    process.exitCode = 1;
  }
}

await main();
