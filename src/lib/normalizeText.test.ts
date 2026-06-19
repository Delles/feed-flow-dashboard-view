import { describe, it, expect } from "vitest";
import { normalizeText } from "./normalizeText";

describe("normalizeText", () => {
    it("should convert strings to lowercase", () => {
        expect(normalizeText("HELLO WORLD")).toBe("hello world");
        expect(normalizeText("Mixed Case String")).toBe("mixed case string");
    });

    it("should remove diacritic marks (accents)", () => {
        expect(normalizeText("Café")).toBe("cafe");
        expect(normalizeText("München")).toBe("munchen");
        expect(normalizeText("Niño")).toBe("nino");
        expect(normalizeText("façade")).toBe("facade");
        expect(normalizeText("Hôtel")).toBe("hotel");
        expect(normalizeText("naïve")).toBe("naive");
        expect(normalizeText("Curaçao")).toBe("curacao");
    });

    it("should handle strings with numbers and special characters", () => {
        expect(normalizeText("Test 123!@#")).toBe("test 123!@#");
        expect(normalizeText("!@#$%^&*()_+")).toBe("!@#$%^&*()_+");
        expect(normalizeText("München 123!")).toBe("munchen 123!");
    });

    it("should return an empty string when given an empty string", () => {
        expect(normalizeText("")).toBe("");
    });

    it("should not modify already normalized strings", () => {
        expect(normalizeText("hello world")).toBe("hello world");
        expect(normalizeText("123 test!")).toBe("123 test!");
    });
});
