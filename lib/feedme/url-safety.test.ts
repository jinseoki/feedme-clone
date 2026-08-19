import { expect, test, vi } from "vitest";

vi.mock("node:dns/promises", () => {
  const mocked = { lookup: vi.fn() };
  return { ...mocked, default: mocked };
});

const { lookup } = await import("node:dns/promises");
const { assertHttpUrl, assertPublicHost, UnsafeUrlError } = await import("./url-safety");

test("http/https가 아닌 스킴은 거부한다", () => {
  expect(() => assertHttpUrl("file:///etc/passwd")).toThrow(UnsafeUrlError);
  expect(() => assertHttpUrl("javascript:alert(1)")).toThrow(UnsafeUrlError);
});

test("형식이 잘못된 URL은 거부한다", () => {
  expect(() => assertHttpUrl("not a url")).toThrow(UnsafeUrlError);
});

test("유효한 http(s) URL은 통과한다", () => {
  expect(assertHttpUrl("https://example.com/article").hostname).toBe("example.com");
});

test("localhost 호스트는 거부한다", async () => {
  await expect(assertPublicHost(new URL("http://localhost:3000/"))).rejects.toThrow(
    UnsafeUrlError
  );
});

test("사설(private) IP로 해석되는 호스트는 거부한다", async () => {
  vi.mocked(lookup).mockResolvedValueOnce([
    { address: "127.0.0.1", family: 4 },
  ] as never);
  await expect(assertPublicHost(new URL("http://internal.example/"))).rejects.toThrow(
    UnsafeUrlError
  );
});

test("공인 IP로만 해석되는 호스트는 통과한다", async () => {
  vi.mocked(lookup).mockResolvedValueOnce([
    { address: "93.184.216.34", family: 4 },
  ] as never);
  await expect(assertPublicHost(new URL("https://example.com/"))).resolves.toBeUndefined();
});

test("DNS 조회가 실패하면 거부한다", async () => {
  vi.mocked(lookup).mockRejectedValueOnce(new Error("ENOTFOUND"));
  await expect(assertPublicHost(new URL("https://no-such-host.invalid/"))).rejects.toThrow(
    UnsafeUrlError
  );
});
