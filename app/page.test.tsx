import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("URL을 입력하기 전에는 변환 버튼이 비활성화되어 있다", () => {
  render(<Home />);

  expect(screen.getByRole("button", { name: "변환" })).toBeDisabled();
});

test("URL을 입력하면 변환 버튼이 활성화된다", () => {
  render(<Home />);

  fireEvent.change(screen.getByPlaceholderText("https://example.com/article"), {
    target: { value: "https://example.com/article" },
  });

  expect(screen.getByRole("button", { name: "변환" })).toBeEnabled();
});

test("지우기를 누르면 입력값이 초기화된다", () => {
  render(<Home />);
  const input = screen.getByPlaceholderText("https://example.com/article");

  fireEvent.change(input, { target: { value: "https://example.com/article" } });
  fireEvent.click(screen.getByRole("button", { name: "지우기" }));

  expect(input).toHaveValue("");
  expect(screen.getByRole("button", { name: "변환" })).toBeDisabled();
});
