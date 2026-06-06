import { html, customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UMB_PROPERTY_CONTEXT } from '@umbraco-cms/backoffice/property';
import { UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/property-editor";
import { UMB_VALIDATION_EMPTY_LOCALIZATION_KEY, UmbFormControlMixin } from '@umbraco-cms/backoffice/validation';

import { OEmbedValueModel } from "../types.ts";
import { InputOEmbedElement } from '../../oembed/components/input-oembed/input-oembed.element.js';

@customElement(PropertyEditorUiOEmbedPickerElement.tagName)
export default class PropertyEditorUiOEmbedPickerElement
    extends UmbFormControlMixin<OEmbedValueModel, typeof UmbLitElement, undefined>(UmbLitElement)
    implements UmbPropertyEditorUiElement {
    
    static readonly tagName = 'oembed-property-editor';

    /**
     * Sets the input to mandatory, meaning validation will fail if the value is empty.
     * @type {boolean}
     */
    @property({ type: Boolean })
    mandatory?: boolean;

    @property({ type: String })
    mandatoryMessage = UMB_VALIDATION_EMPTY_LOCALIZATION_KEY;

    /**
     * Sets the input to readonly mode, meaning value cannot be changed but still able to read and select its content.
     * @type {boolean}
     * @attr
     * @default false
     */
    @property({ type: Boolean, reflect: true })
    readonly = false;

    @state()
    private _alias?: string;

    @state()
    private _variantId?: string;    

    constructor() {
        super();

        this.consumeContext(UMB_PROPERTY_CONTEXT, (context) => {
            this.observe(context?.alias, (alias) => (this._alias = alias));
            this.observe(context?.variantId, (variantId) => (this._variantId = variantId?.toString() || 'invariant'));
        });
    }
    
    #onChange(event: CustomEvent & { target: InputOEmbedElement}) {
        const isEmpty = event.target.value === undefined;
        this.value = isEmpty ? undefined : event.target.value;
        this.dispatchEvent(new UmbChangeEvent());
    }    
    
    override render() {
        return html`

            hello from OEmbed Picker UI, alias: ${this._alias}, variantId: ${this._variantId}

			<input-oembed
				.alias=${this._alias}
				.value=${this.value}
                .variantId=${this._variantId}
                .required=${this.mandatory}
				.requiredMessage=${this.mandatoryMessage}
				@change=${this.#onChange}
				?readonly=${this.readonly}>
			</input-oembed>
		`;
    }    
    
}

PropertyEditorUiOEmbedPickerElement

export { PropertyEditorUiOEmbedPickerElement as element };

declare global {
    interface HTMLElementTagNameMap {
        [PropertyEditorUiOEmbedPickerElement.tagName] : PropertyEditorUiOEmbedPickerElement;
    }
}