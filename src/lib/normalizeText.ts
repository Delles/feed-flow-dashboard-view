export function normalizeText(str: string): string {
    // Convert to lower case, decompose accents, and remove diacritic marks
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}
