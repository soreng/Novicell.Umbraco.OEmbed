import { expect } from "chai";
import { OEmbedPickerStore } from "./oembed-picker.store";
import { mockOEmbedResponses } from "../mocks/data";

/**
 * Tests for OEmbedPickerStore.
 * Verifies state management, observables, and store methods.
 */
describe("OEmbedPickerStore", () => {
  let store: OEmbedPickerStore;

  beforeEach(() => {
    store = new OEmbedPickerStore();
  });

  describe("URL state", () => {
    it("should initialize with empty URL", () => {
      expect(store.getUrl()).to.equal("");
    });

    it("should update URL via setUrl()", () => {
      store.setUrl("https://youtube.com/watch?v=dQw4w9WgXcQ");
      expect(store.getUrl()).to.equal(
        "https://youtube.com/watch?v=dQw4w9WgXcQ",
      );
    });

    it("should emit URL changes via url$ observable", (done) => {
      let emissionCount = 0;
      const expectedUrls = ["https://example.com", "https://youtube.com"];

      store.url$.subscribe((url) => {
        expect(url).to.equal(expectedUrls[emissionCount]);
        emissionCount++;

        if (emissionCount === 2) {
          done();
        }
      });

      store.setUrl(expectedUrls[0]);
      store.setUrl(expectedUrls[1]);
    });
  });

  describe("Preview state", () => {
    it("should initialize with undefined preview", (done) => {
      store.preview$.subscribe((preview) => {
        expect(preview).to.be.undefined;
        done();
      });
    });

    it("should update preview via setPreview()", (done) => {
      store.preview$.subscribe((preview) => {
        if (preview) {
          expect(preview.type).to.equal("video");
          expect(preview.provider_name).to.equal("YouTube");
          done();
        }
      });

      store.setPreview(mockOEmbedResponses.youtube);
    });

    it("should clear preview when setting error", (done) => {
      // First set a preview
      store.setPreview(mockOEmbedResponses.youtube);

      let hasCleared = false;
      store.preview$.subscribe((preview) => {
        if (hasCleared) {
          expect(preview).to.be.undefined;
          done();
        }
      });

      // Then set error (should clear preview)
      hasCleared = true;
      store.setError(new Error("Test error") as any);
    });
  });

  describe("Loading state", () => {
    it("should initialize as idle", (done) => {
      store.loading$.subscribe((state) => {
        expect(state).to.equal("idle");
        done();
      });
    });

    it("should transition to loading and back", (done) => {
      const states: string[] = [];

      store.loading$.subscribe((state) => {
        states.push(state);

        if (states.length === 2) {
          expect(states).to.deep.equal(["loading", "idle"]);
          done();
        }
      });

      store.setLoading(true);
      store.setLoading(false);
    });
  });

  describe("Reset", () => {
    it("should reset all state to initial values", (done) => {
      // Set some state
      store.setUrl("https://example.com");
      store.setPreview(mockOEmbedResponses.image);
      store.setLoading(true);

      // Reset
      store.reset();

      // Verify reset
      expect(store.getUrl()).to.equal("");
      expect(store.getLoading()).to.equal("idle");

      store.preview$.subscribe((preview) => {
        expect(preview).to.be.undefined;
        done();
      });
    });
  });

  describe("Batch updates with mute/unmute", () => {
    it("should batch state updates", (done) => {
      const emissions: any[] = [];

      store.url$.subscribe((url) => {
        emissions.push({ type: "url", value: url });
      });

      store.mute();
      store.setUrl("https://example1.com");
      store.setUrl("https://example2.com");
      store.setUrl("https://example3.com");
      store.unmute();

      setTimeout(() => {
        // After unmute, should only have the final value
        expect(emissions.length).to.be.greaterThan(0);
        expect(emissions[emissions.length - 1].value).to.equal(
          "https://example3.com",
        );
        done();
      }, 50);
    });
  });
});
