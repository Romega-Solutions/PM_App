import { getManualLocationFromQuery } from "../useLocationSearch";

jest.mock("expo-location", () => ({}));

jest.mock("../../api/accountApi", () => ({
  accountApi: {
    saveLocation: jest.fn(),
  },
}));

describe("getManualLocationFromQuery", () => {
  it("creates a city-only manual location from typed input", () => {
    expect(getManualLocationFromQuery("  Paris  ")).toEqual({
      city: "Paris",
      country: "",
    });
  });

  it("creates a city and country manual location from comma-separated input", () => {
    expect(getManualLocationFromQuery("Berlin, Germany")).toEqual({
      city: "Berlin",
      country: "Germany",
    });
  });

  it("ignores empty or too-short input", () => {
    expect(getManualLocationFromQuery("")).toBeNull();
    expect(getManualLocationFromQuery(" A ")).toBeNull();
  });
});
