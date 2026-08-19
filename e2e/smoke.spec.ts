import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 URL 입력창과 변환 버튼이 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Feedme/);
  await expect(page.getByPlaceholder("https://example.com/article")).toBeVisible();
  await expect(page.getByRole("button", { name: "변환" })).toBeDisabled();
});
