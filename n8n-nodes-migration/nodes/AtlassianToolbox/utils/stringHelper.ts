export function stripHtmlTags(input: string): string {
    return input.replace(/<\/?[^>]+(>|$)/g, '');
}

export function checkHyperlinks(input: string): boolean {
    return new RegExp(
        '([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?',
    ).test(input);
}

export function containsVietnameseCharacter(str: string): boolean {
    const regex = /^[a-zA-Z0-9\s_.-]+$/;
    const isNormalTone = regex.test(str);
    return !isNormalTone;
}
