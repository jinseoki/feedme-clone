import { lookup } from "node:dns/promises";
import { isIPv4, isIPv6 } from "node:net";

/**
 * Rejects URLs that would send the server's own request to a private,
 * loopback, or link-local address (SSRF). Only plain http/https URLs whose
 * hostname resolves exclusively to public addresses are allowed.
 */
export class UnsafeUrlError extends Error {}

function isPrivateIPv4(address: string): boolean {
  const parts = address.split(".").map(Number);
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // shared address space (CGNAT)
  return false;
}

function isPrivateIPv6(address: string): boolean {
  const normalized = address.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9") ||
    normalized.startsWith("fea") || normalized.startsWith("feb")) return true; // fe80::/10
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // fc00::/7
  if (normalized.startsWith("::ffff:")) {
    return isPrivateIPv4(normalized.slice("::ffff:".length));
  }
  return false;
}

function isPrivateAddress(address: string): boolean {
  if (isIPv4(address)) return isPrivateIPv4(address);
  if (isIPv6(address)) return isPrivateIPv6(address);
  return true; // unknown shape: treat as unsafe rather than guess
}

export function assertHttpUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError("유효한 URL 형식이 아니에요.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new UnsafeUrlError("http 또는 https 주소만 변환할 수 있어요.");
  }
  return parsed;
}

/** Resolves the URL's hostname and throws if every/any resolved address is private. */
export async function assertPublicHost(url: URL): Promise<void> {
  const hostname = url.hostname;
  if (hostname === "localhost") {
    throw new UnsafeUrlError("내부 주소로는 변환할 수 없어요.");
  }

  let addresses: { address: string }[];
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new UnsafeUrlError("이 주소를 찾을 수 없어요.");
  }

  if (addresses.length === 0 || addresses.some((a) => isPrivateAddress(a.address))) {
    throw new UnsafeUrlError("내부 주소로는 변환할 수 없어요.");
  }
}
