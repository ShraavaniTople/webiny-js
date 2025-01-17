import { API } from "@editorjs/editorjs";

const COLOR_TOOL_CLASS = "cdx-text-color";

class TextColorTool {
    _state: boolean;
    color: string;
    api: API;
    tag: string;
    class: string;
    colorPicker: HTMLDivElement;
    button: HTMLButtonElement;
    config: {
        themeColors: string[];
    };
    _CSS: any;

    constructor({ api, config }) {
        this.api = api;
        this.button = null;
        this._state = false;
        this.tag = "SPAN";
        this.color = "red";
        this.class = COLOR_TOOL_CLASS;
        this.config = config || { themeColors: ["#44bd32"] };
        this._CSS = {
            colorPicker: "ce-text-color-tool",
            colorBox: "ce-text-color-tool__color-box",
            colorBoxActive: "ce-text-color-tool__color-box--active"
        };
    }

    static get isInline(): boolean {
        return true;
    }

    /**
     * Sanitize method returns rules to let Editor know which HTML tags it should respect.
     * @returns {object} sanitizer configuration.
     * https://editorjs.io/sanitizer
     */
    static get sanitize(): Record<string, any> {
        // Block Tools are not connected with Inline ones,
        // so markup added by Inline Tool will be removed on pasting or on saving.
        // We need this config so that `class` & `style` attributes will remain intact for "span".
        return {
            span: el => {
                // Respect `class` and `style` attributes if this condition is meet.
                if (el.classList.contains(COLOR_TOOL_CLASS)) {
                    return {
                        class: COLOR_TOOL_CLASS,
                        style: el.style
                    };
                }
                return {};
            }
        };
    }

    get state(): boolean {
        return this._state;
    }

    set state(state) {
        this._state = state;

        this.button.classList.toggle(this.api.styles.inlineToolButtonActive, state);
    }
    /**
     * Render method must return HTML element of the button for Inline Toolbar.
     */
    render(): HTMLButtonElement {
        this.button = document.createElement("button");
        this.button.type = "button";
        this.button.innerHTML =
            '<svg width="20" height="18"><path d="M10.458 12.04l2.919 1.686-.781 1.417-.984-.03-.974 1.687H8.674l1.49-2.583-.508-.775.802-1.401zm.546-.952l3.624-6.327a1.597 1.597 0 0 1 2.182-.59 1.632 1.632 0 0 1 .615 2.201l-3.519 6.391-2.902-1.675zm-7.73 3.467h3.465a1.123 1.123 0 1 1 0 2.247H3.273a1.123 1.123 0 1 1 0-2.247z"/></svg>';
        this.button.classList.add(this.api.styles.inlineToolButton);

        return this.button;
    }

    /**
     * Input for the link
     */
    public renderActions(): HTMLElement {
        // Create action element
        this.colorPicker = document.createElement("div");
        // Add element properties
        this.colorPicker.classList.add(this._CSS.colorPicker);

        this.config.themeColors.forEach(color => {
            // create element
            const colorBox = document.createElement("button");
            // add properties
            colorBox.style.backgroundColor = color;
            colorBox.classList.add(this._CSS.colorBox);

            colorBox.addEventListener("click", () => {
                if (this.color === color) {
                    // reset the color
                    this.color = "unset";
                } else {
                    // set color
                    this.color = color;
                }

                this.colorPicker.childNodes.forEach((node: HTMLElement) => {
                    if (node.classList.contains(this._CSS.colorBoxActive)) {
                        // remove active class
                        node.classList.remove(this._CSS.colorBoxActive);
                    }
                });
                // add active class
                colorBox.classList.add(this._CSS.colorBoxActive);
            });
            // save element
            this.colorPicker.appendChild(colorBox);
        });

        // Return element
        return this.colorPicker;
    }

    /**
     * Finally, when button is pressed Editor calls
     * surround method of the tool with Range object as an argument.
     * @param range
     */
    surround(range): void {
        if (this.state) {
            this.unwrap(range);
            return;
        }

        this.wrap(range);
    }

    wrap(range): void {
        const selectedText = range.extractContents();
        const mark = document.createElement(this.tag);

        mark.classList.add(this.class);

        mark.appendChild(selectedText);
        range.insertNode(mark);

        this.api.selection.expandToTag(mark);
    }

    unwrap(range): void {
        const mark = this.api.selection.findParentTag(this.tag, this.class);
        const text = range.extractContents();

        mark.remove();

        range.insertNode(text);
    }

    showActions(mark): void {
        this.colorPicker.onclick = () => {
            mark.style.color = this.color;
        };
        this.colorPicker.hidden = false;
    }

    hideActions(): void {
        this.colorPicker.onchange = null;
        this.colorPicker.hidden = true;
    }

    /**
     * CheckState method of each Inline Tool is called by Editor with current `Selection`
     * when user selects some text
     */
    checkState(): void {
        const mark = this.api.selection.findParentTag(this.tag);

        this.state = !!mark;

        if (this.state) {
            this.showActions(mark);
        } else {
            this.hideActions();
        }
    }

    convertToHex(color): string {
        const rgb = color.match(/(\d+)/g);

        let hexR = parseInt(rgb[0]).toString(16);
        let hexG = parseInt(rgb[1]).toString(16);
        let hexB = parseInt(rgb[2]).toString(16);

        hexR = hexR.length === 1 ? "0" + hexR : hexR;
        hexG = hexG.length === 1 ? "0" + hexG : hexG;
        hexB = hexB.length === 1 ? "0" + hexB : hexB;

        return "#" + hexR + hexG + hexB;
    }

    clear(): void {
        this.hideActions();
    }
}

export default TextColorTool;
