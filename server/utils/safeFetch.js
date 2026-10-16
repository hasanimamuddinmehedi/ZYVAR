const dns = require("node:dns").promises;
const http = require("node:http");
const https = require("node:https");
const net = require("node:net");

function isPrivateIPv4(ip) {
  const [a, b, c] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && (c === 0 || c === 2)) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 88 && c === 99) ||
    (a === 198 && ([18, 19].includes(b) || (b === 51 && c === 100))) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  if (!net.isIPv6(ip)) return true;

  const normalized = ip.toLowerCase();
  if (normalized.startsWith("::ffff:")) {
    const mapped = normalized.slice(7);
    return !net.isIPv4(mapped) || isPrivateIPv4(mapped);
  }

  // Only globally routable unicast IPv6 addresses are allowed.
  return !normalized.startsWith("2") && !normalized.startsWith("3");
}

async function resolvePublicUrl(rawUrl) {
  if (typeof rawUrl !== "string" || rawUrl.length > 2048) {
    throw new Error("Invalid URL");
  }

  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Unsupported protocol");
  }
  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new Error("Unsupported port");
  }
  if (url.username || url.password) {
    throw new Error("Credentials not allowed");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = net.isIP(hostname)
    ? [{ address: hostname, family: net.isIP(hostname) }]
    : await dns.lookup(hostname, { all: true, verbatim: true });

  if (!addresses.length || addresses.some(({ address }) => isPrivateIp(address))) {
    throw new Error("Blocked address");
  }

  return { url, address: addresses[0] };
}

async function assertPublicUrl(rawUrl) {
  const { url } = await resolvePublicUrl(rawUrl);
  return url;
}

function requestPinned({ url, address }, { timeoutMs, maxBytes, headersOnly, accept }) {
  const client = url.protocol === "https:" ? https : http;
  const hostname = url.hostname.replace(/^\[|\]$/g, "");

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      callback(value);
    };

    const request = client.request(
      {
        protocol: url.protocol,
        hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: "GET",
        servername: net.isIP(hostname) ? undefined : hostname,
        lookup: (_host, options, callback) => {
          if (options?.all) {
            callback(null, [address]);
          } else {
            callback(null, address.address, address.family);
          }
        },
        headers: {
          Accept: accept,
          "User-Agent":
            "Mozilla/5.0 (compatible; ZyvarProductBot/1.0; +https://zyvar.com)",
        },
      },
      (response) => {
        const headers = new Headers(response.headers);
        const status = response.statusCode || 0;
        const location = headers.get("location");

        if (status >= 300 && status < 400 && location) {
          response.resume();
          finish(resolve, { status, headers, finalUrl: url.href, body: null });
          return;
        }

        if (headersOnly) {
          response.resume();
          finish(resolve, { status, headers, finalUrl: url.href, body: null });
          return;
        }

        const declaredLength = Number(headers.get("content-length"));
        if (declaredLength > maxBytes) {
          response.destroy();
          finish(reject, new Error("Response too large"));
          return;
        }

        const chunks = [];
        let total = 0;
        response.on("data", (chunk) => {
          total += chunk.length;
          if (total > maxBytes) {
            response.destroy(new Error("Response too large"));
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () => {
          finish(resolve, {
            status,
            headers,
            finalUrl: url.href,
            body: Buffer.concat(chunks),
          });
        });
        response.on("error", (error) => finish(reject, error));
        response.on("aborted", () =>
          finish(reject, new Error("Response ended unexpectedly"))
        );
      }
    );

    request.setTimeout(timeoutMs, () =>
      request.destroy(new Error("Request timed out"))
    );
    request.on("error", (error) => finish(reject, error));
    request.end();
  });
}

async function safeFetch(rawUrl, options = {}) {
  const {
    timeoutMs = 8000,
    maxBytes = 1024 * 1024,
    maxRedirects = 3,
    headersOnly = false,
    accept = "*/*",
  } = options;

  let current = rawUrl;
  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    const resolved = await resolvePublicUrl(current);
    const response = await requestPinned(resolved, {
      timeoutMs,
      maxBytes,
      headersOnly,
      accept,
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return response;
      current = new URL(location, resolved.url).href;
      continue;
    }

    return response;
  }

  throw new Error("Too many redirects");
}

module.exports = { safeFetch, assertPublicUrl, isPrivateIp };
