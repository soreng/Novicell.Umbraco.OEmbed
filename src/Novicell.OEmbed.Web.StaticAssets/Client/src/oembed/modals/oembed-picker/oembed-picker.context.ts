import { OEmbedRepository } from "../../repository/oembed";
import { OEmbedPickerStore } from "./oembed-picker.store";
import { OEMBED_MODAL } from "./oembed-picker-modal.token";
import type { OEmbedValueModel } from "../../../property-editors/types";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { UmbObjectState } from "@umbraco-cms/backoffice/observable-api";
import { umbOpenModal } from "@umbraco-cms/backoffice/modal";

/**
 * Context for oEmbed picker functionality.
 * Manages state, repository communication, and preview fetching.
 *
 * Consumed by the picker modal and child input components via
 * consumeContext(UMB_OEMBED_PICKER_CONTEXT, callback).
 */
export class UmbOEmbedPickerContext extends UmbControllerBase {
  readonly #store = new OEmbedPickerStore();
  readonly #repository = new OEmbedRepository(this);

  // The committed picker value (URL + resolved oEmbed). Source of truth that
  // the input element mirrors into its form-control value.
  readonly #value = new UmbObjectState<OEmbedValueModel | undefined>(undefined);

  // Public observables
  readonly value$ = this.#value.asObservable();
  readonly url$ = this.#store.url$;
  readonly preview$ = this.#store.preview$;
  readonly loading$ = this.#store.loading$;
  readonly error$ = this.#store.error$;

  constructor(host: UmbControllerHost) {
    super(host);
  }

  /**
   * Update the URL and fetch preview data.
   */
  async updateUrl(url: string): Promise<void> {
    this.#store.setUrl(url);
  }

  /**
   * Fetch oEmbed preview data for the current URL.
   */
  async fetchPreview(
    url?: string,
    maxWidth?: number,
    maxHeight?: number,
  ): Promise<void> {
    const urlToFetch = url || this.#store.getUrl();
    if (!urlToFetch) return;

    this.#store.setLoading(true);

    const { data, error } = await this.#repository.requestOEmbed({
      url: urlToFetch,
      maxWidth,
      maxHeight,
    });

    if (data) {
      this.#store.setPreview(data);
    } else {
      this.#store.setError(error);
    }
  }

  /**
   * Get the current URL value (for form submission).
   */
  getUrl(): string {
    return this.#store.getUrl();
  }

  /**
   * Get the current committed picker value.
   */
  getValue(): OEmbedValueModel | undefined {
    return this.#value.getValue();
  }

  /**
   * Set the committed picker value (e.g. seeding from persisted data).
   */
  setValue(value: OEmbedValueModel | undefined): void {
    this.#value.setValue(value);
  }

  /**
   * Clear the committed picker value.
   */
  clearValue(): void {
    this.#value.setValue(undefined);
  }

  /**
   * Open the picker modal and commit the chosen value.
   * @param url Optional URL to pre-fill the modal with.
   * @returns The chosen value, or undefined if cancelled.
   */
  async openPicker(url?: string): Promise<OEmbedValueModel | undefined> {
    const result = await umbOpenModal(this, OEMBED_MODAL, {
      data: { url },
    }).catch(() => undefined);

    if (!result) return undefined;

    const value: OEmbedValueModel = { ...result };
    this.#value.setValue(value);
    return value;
  }

  /**
   * Reset all state to initial values.
   */
  reset(): void {
    this.#store.reset();
    this.#value.setValue(undefined);
  }
}
