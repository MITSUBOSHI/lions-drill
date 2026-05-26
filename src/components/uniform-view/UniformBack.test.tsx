import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import UniformBack from "./UniformBack";

describe("UniformBack", () => {
  it("renders uniform name and number", () => {
    const { container } = render(
      <UniformBack uniformName="MAKI" numberDisp="2" />,
    );

    const texts = container.querySelectorAll("text");
    expect(texts).toHaveLength(2);
    expect(texts[0].textContent).toBe("MAKI");
    expect(texts[1].textContent).toBe("2");
  });

  it("has accessible aria-label", () => {
    const { container } = render(
      <UniformBack uniformName="MAKI" numberDisp="2" />,
    );

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-label", "MAKI 2番のユニフォーム背面");
  });

  it("uses smaller font size for long names (> 8 chars)", () => {
    const { container } = render(
      <UniformBack uniformName="MATSUMOTO" numberDisp="40" />,
    );

    const nameText = container.querySelectorAll("text")[0];
    expect(nameText.style.fontSize).toBe("30px");
  });

  it("uses medium font size for medium names (7-8 chars)", () => {
    const { container } = render(
      <UniformBack uniformName="YAMAZAKI" numberDisp="19" />,
    );

    const nameText = container.querySelectorAll("text")[0];
    expect(nameText.style.fontSize).toBe("36px");
  });

  it("uses default font size for short names (<= 6 chars)", () => {
    const { container } = render(
      <UniformBack uniformName="MAKI" numberDisp="2" />,
    );

    const nameText = container.querySelectorAll("text")[0];
    expect(nameText.style.fontSize).toBe("44px");
  });

  it("uses smaller font size for 3-digit numbers", () => {
    const { container } = render(
      <UniformBack uniformName="SHOJI" numberDisp="122" />,
    );

    const numberText = container.querySelectorAll("text")[1];
    expect(numberText.style.fontSize).toBe("90px");
  });

  it("uses default font size for 1-2 digit numbers", () => {
    const { container } = render(
      <UniformBack uniformName="MAKI" numberDisp="2" />,
    );

    const numberText = container.querySelectorAll("text")[1];
    expect(numberText.style.fontSize).toBe("130px");
  });
});
