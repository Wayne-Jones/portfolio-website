import { describe, expect, it } from "vitest";

import { joinMetadata, joinProjectMetadata } from "@/lib/meta";

describe("joinMetadata", () => {
  it("renders only the location", () => {
    expect(joinMetadata(["Oregon, USA", undefined])).toBe("Oregon, USA");
  });

  it("renders only the camera", () => {
    expect(joinMetadata([undefined, "Fujifilm X-T5"])).toBe("Fujifilm X-T5");
  });

  it("joins both with the editorial separator", () => {
    expect(joinMetadata(["Oregon, USA", "Fujifilm X-T5"])).toBe("Oregon, USA · Fujifilm X-T5");
  });

  it("returns an empty string when neither is set", () => {
    expect(joinMetadata([undefined, ""])).toBe("");
    expect(joinMetadata([])).toBe("");
  });
});

describe("joinProjectMetadata", () => {
  it("keeps em-dash placeholders for missing fields", () => {
    expect(joinProjectMetadata({})).toBe("— · — · —");
    expect(joinProjectMetadata({ role: "Design" })).toBe("Design · — · —");
    expect(joinProjectMetadata({ role: "Design", client: "Acme", year: 2025 })).toBe(
      "Design · Acme · 2025",
    );
  });
});
