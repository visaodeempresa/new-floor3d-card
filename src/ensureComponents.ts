// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
/**
 * @fork-contributor Maycon Willian Oliveira (@visaodeempresa)
 * @github https://github.com/visaodeempresa
 * @contribution HA custom element loader compatibility with Lit 3 and modern HACS.
 */
export const loadHaComponents = () => {
    if (
        !customElements.get("hui-action-editor") ||
        !customElements.get("ha-icon-picker") ||
        !customElements.get("ha-entity-picker")
    ) {
        (customElements.get("hui-button-card") as any)?.getConfigElement();
    }
};