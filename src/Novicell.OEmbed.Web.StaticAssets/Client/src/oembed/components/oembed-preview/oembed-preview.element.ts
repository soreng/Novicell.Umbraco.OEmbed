import {css, html, customElement, when, nothing, property, query, PropertyValueMap} from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/property-editor";
import {OEmbedType} from "../../../api";

export interface OEmbedPreviewModel {
    type: OEmbedType;
    html?: string | null;
    url?: string | null;
    width: number;
    height: number;
}

@customElement(OEmbedPreviewElement.tagName)
export class OEmbedPreviewElement extends UmbLitElement implements UmbPropertyEditorUiElement {

    static readonly tagName = 'oembed-preview';

    #observer = new MutationObserver((mutations, observer) => {
        var c = this.onMutation
        mutations.forEach(function(mutation) {
            c(mutation, observer);
        });
    });
    
    // use the connectedCallback as suggested by Jacob Overgaard as this is where the this.value is available and assigned
    connectedCallback() {
        super.connectedCallback();
    }

    @query('.oembed-frame')
    frame ?: HTMLIFrameElement;
    
    /**
     * Updated runs every time the element renders, so it's well-
     * suited for managing light DOM children, or anything else that you
     * don't directly control in your template.
     * @param  {Map<string, any>} changedProperties
     */
    updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
        console.log('updated', changedProperties);
        super.updated(changedProperties);
    }    
    
    onMutation(mutation:MutationRecord, observer:MutationObserver) {
        console.log('mutation', mutation, observer);
    }
    
    #renderImg(url:string, width:number, height:number) {
        // render OEmbed photo
        // use oembed properties url, width, height
        return html`<img 
                class="oembed-photo"
                src="${url}"
                width="${width}"
                height="${height}"/>`;
    }

    @property()
    value?: OEmbedPreviewModel;

    #renderIFrame(markup:string, width?:number , height?:number) {
        // render OEmbed element
        // use oembed properties html, width, height

        this.#observer.takeRecords();
        this.#observer.disconnect()
        
        const aspectRatio = (width && height) ? width / height : 0;

        var element = window.document.createElement("div");
        element.insertAdjacentHTML("afterbegin", markup);

        let style: string = '';
        if (aspectRatio > 0) {
            element.style.width = "100%";
            element.style.height = "100%";
            style = "<style>html,body,iframe{width:100%;height:100%;margin:0;padding:0;overflow: hidden}</style>";
        }

        const srcdoc = `<html><head></head><body>${style}${element.outerHTML}</body></html>`;

        return html`
            <iframe
                    srcdoc="${srcdoc}"
                    class="oembed-frame"
                    style="${aspectRatio > 0 ? 'aspect-ratio:' + aspectRatio + ';' : ''}"
                    onload="this.#observer.observe(this.#frame)"
                    sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>`;
    }

    
   render() {

       const value = this.value;

       if (value === undefined) return nothing;

       return when(value.type == 'photo',
           () => this.#renderImg(value.url!, value.width, value.height),
           () => this.#renderIFrame(value.html!, value.width, value.height));
   }

    static styles = [
        css`
            .oembed-frame,
            .oembed-photo {
                max-width: 100%;
            }

            .oembed-frame{
                margin: 0;
                width: 100%;
                border: none;
                //height: 0;
                //border:2px solid deeppink;
            }
            
            .oembed-photo{
                height: auto;
                //border:2px solid greenyellow;
            }

            .oembed-container {
                max-width: 100%;
                width: 100%;
            }

            .novicell-oembed-preview__container--fixed-ratio {
                position: relative;
                padding-top: 0;
            }

            .novicell-oembed-preview .novicell-oembed-preview__frame {
                width: 100%;
                height: 0;
            }

            .novicell-oembed-preview
            .novicell-oembed-preview__container--fixed-ratio
            .novicell-oembed-preview__frame {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                height: 100%;
            }

            .novicell-oembed-preview .__info {
                position: unset;
                opacity: unset;
            }
        `,
    ];
}

export { OEmbedPreviewElement as default };

declare global {
    interface HTMLElementTagNameMap {
        [OEmbedPreviewElement.tagName]: OEmbedPreviewElement;
    }
}