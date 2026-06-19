import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
  it("should merge standard class names", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("should resolve Tailwind conflicts using twMerge", () => {
    // text-red-500 should override text-blue-500
    expect(cn("text-blue-500", "text-red-500")).toBe("text-red-500");
    // p-4 should override p-2
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("should handle conditional classes using clsx", () => {
    expect(cn("base-class", { "active-class": true, "inactive-class": false })).toBe(
      "base-class active-class"
    );
  });

  it("should handle arrays of classes", () => {
    expect(cn(["class1", "class2"], "class3")).toBe("class1 class2 class3");
  });

  it("should handle falsy values gracefully", () => {
    expect(
      cn(
        "class1",
        null,
        undefined,
        false,
        0,
        "",
        "class2"
      )
    ).toBe("class1 class2");
  });

  it("should handle complex combinations of inputs", () => {
    const isHovered = true;
    const isDisabled = false;

    expect(
      cn(
        "base-btn",
        ["text-white", "font-bold"],
        {
          "hover:bg-blue-600": isHovered,
          "opacity-50 cursor-not-allowed": isDisabled,
        },
        "bg-blue-500 bg-red-500" // twMerge should resolve this to bg-red-500
      )
    ).toBe("base-btn text-white font-bold hover:bg-blue-600 bg-red-500");
  });
});
