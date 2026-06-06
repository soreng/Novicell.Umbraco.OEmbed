import {OEmbedRepository} from "../../repository/oembed/";
import type { OEmbedModalData, OEmbedModalValue } from './oembed-picker-modal.token.ts';
import {css, html, when, customElement, state, nothing} from '@umbraco-cms/backoffice/external/lit';
import type { UUIButtonState, UUIInputEvent } from '@umbraco-cms/backoffice/external/uui';
import { umbFocus } from '@umbraco-cms/backoffice/lit-element';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';

import "../../components/oembed-preview/oembed-preview.element.ts";
import { UmbApiError, UmbCancelError } from "@umbraco-cms/backoffice/resources";
import {OEmbedResponseModel} from "../../../api";
import { umbBindToValidation, UmbValidationContext } from "@umbraco-cms/backoffice/validation";

@customElement(OembedPickerModalElement.tagName)
export class OembedPickerModalElement extends UmbModalBaseElement<
    OEmbedModalData,
    OEmbedModalValue
> {
    static readonly tagName = 'oembed-modal';

    readonly #validation = new UmbValidationContext(this);
    
    readonly #oembedRepository = new OEmbedRepository(this);

    #validUrl?: string;

    #close() {
        this.modalContext?.reject();
    }

    async #submit() {
        this._submitButtonState = 'waiting';

        try {
            await this.#validation.validate();
            this._submitButtonState = 'success';
            this.modalContext?.submit();
        } catch {
            this._submitButtonState = 'failed';
        }
    }    
    
    @state()
    private _loading?: UUIButtonState;

    @state()
    private _error?: UmbApiError | UmbCancelError = undefined;

    @state()
    private _url = '';

    @state()
    private _submitButtonState: UUIButtonState;
    
    override connectedCallback() {
        super.connectedCallback();
        if (this.data?.url) {
            this._url = this.data.url;
            this.#getPreview();
        }
    }

    async #getPreview() {
        this._loading = 'waiting';

        const {data, error} = await this.#oembedRepository.requestOEmbed({
            url: this._url,
            //maxWidth: this._width > 0 ? this._width : undefined,
            //maxHeight: this._height > 0 ? this._height : undefined,
        });

        if (data) {
            this.#validUrl = this._url;
            this.value = {
                ...this.value,
                oembed: {
                    ...data,
                },
                url: this.#validUrl,
            };
            this._error = undefined;
        } else {
            // attach server error for validation feedback
            this._error = error || undefined;
        }

        this._loading = this._error === undefined ? 'success' : 'failed';
    }

    #onUrlChange(e: UUIInputEvent) {
        this._url = e.target.value as string;
    }

    #renderLink( url?: string | null, text?: string | null ) {
        if(!url || !text) return nothing;
        return html`<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }

    #renderAuthor( name?: string | null, url?: string | null ) {
        if(!name || !url) return nothing;
        return html`<span>${this.localize.term('general_by').toLocaleLowerCase()} ${this.#renderLink(url, name)}</span>`;
    }

    #renderProvider( name?: string | null, url?: string | null ) {
        if(!name || !url) return nothing;
        return html`<span>${this.localize.term('general_on').toLocaleLowerCase()} ${this.#renderLink(url, name)}</span>`;
    }

    #renderThumbnail( url?: string | null, width?: number | null, height?: number | null, alt?: string | null ) {
        if(!url) return nothing;
        return html`<umb-property-layout
                label=${this.localize.term('general_thumbnail')}
                orientation="vertical">
            <div slot="editor"><div><img src="${url}" width="${width}" height="${height}" alt="${alt}" /></div></div>
        </umb-property-layout>`;
    }
    
    #renderPreview(oembed: OEmbedResponseModel) {
        return html`
            <umb-property-layout
                    label=${this.localize.term('general_preview')}
                    orientation="vertical">
                <div slot="editor">
                    <oembed-preview .value="${oembed}"></oembed-preview>
                    <div>${oembed.title}</div>
                    <small slot="detail">
                        ${this.#renderAuthor(oembed.authorName, oembed.authorUrl)}
                        ${this.#renderProvider(oembed.providerName, oembed.providerUrl)}
                    </small>
                </div>
            </umb-property-layout>
            ${this.#renderThumbnail(null /*oembed.thumbnailUrl*/, oembed.thumbnailWidth, oembed.thumbnailHeight, oembed.title)}
        `;
    }

    renderInput() {
        return html`
            <uui-input 
                    id="url"
                    data-mark="input:url"
                    label=${this.localize.term('placeholders_enterUrl')}
                    placeholder=${this.localize.term('placeholders_enterUrl')}
                    .value=${this._url}
                    @input=${this.#onUrlChange}
                    required="true"
                   ${umbFocus()}
                   ${umbBindToValidation(this)}>
                <uui-button
                        slot="append"
                        look="primary"
                        color="positive"
                        @click=${this.#getPreview}
                        label=${this.localize.term('general_retrieve')}></uui-button>
            </uui-input>
        `;
    }
    
    #renderError() {
        return html`<div class="">${JSON.stringify(this._error)}</div>`;
    }
    
    override render() {
        return html`
            <umb-body-layout headline="Embed">
                <uui-box>
                    <umb-property-layout label=${this.localize.term('general_url')} orientation="vertical">
                        <div slot="editor">${this.renderInput()}</div>
                    </umb-property-layout>
                    ${when(this._loading === 'failed', () => this.#renderError())}
                    ${when(this._loading === 'waiting', () => html`<uui-loader-circle></uui-loader-circle>`)}
                    ${when(this._loading === 'success', () => this.#renderPreview(this.value.oembed!))}
                </uui-box>
                <uui-button
                        slot="actions"
                        id="cancel"
                        look="secondary"
                        label=${this.localize.term('buttons_confirmActionCancel')}
                        @click=${this.#close}></uui-button>
                <uui-button
                        slot="actions"
                        id="submit"
                        color="positive"
                        look="primary"
                        .state=${this._submitButtonState}
                        label=${this.localize.term('buttons_confirmActionConfirm')}
                        @click=${this.#submit}></uui-button>
            </umb-body-layout>
        `;
    }

    static override styles = [
        UmbTextStyles,
        css`
            uui-input {
                width: 100%;
                --uui-button-border-radius: 0;
            }

            umb-property-layout:first-child {
                padding-top: 0;
            }

            umb-property-layout:last-child {
                padding-bottom: 0;
            }
        `,
    ];
}

export default OembedPickerModalElement;

declare global {
    interface HTMLElementTagNameMap {
        'oembed-modal': OembedPickerModalElement;
    }
}
