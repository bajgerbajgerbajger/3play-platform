import { render } from "@testing-library/react";

import { VideoPlayer } from "./VideoPlayer";

test("Skip Forward button uses snappy 75ms transition", () => {
  const { container } = render(<VideoPlayer src="test.mp4" />);

  const icon = container.querySelector(
    '[data-lucide="skip-forward"], .lucide-skip-forward'
  );
  expect(icon).toBeTruthy();

  const button = icon?.closest("button");
  expect(button).toBeTruthy();
  expect(button).toHaveClass("duration-75");
  expect(button?.className).not.toContain("duration-200");
});

