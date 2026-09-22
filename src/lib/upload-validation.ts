export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function photoFormat(bytes: Uint8Array): 'jpeg' | 'png' | 'webp' | null {
    if (bytes.length < 12) return null;
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
    if ([137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b)) return 'png';
    const text = (a: number, b: number) => String.fromCharCode(...bytes.slice(a, b));
    return text(0, 4) === 'RIFF' && text(8, 12) === 'WEBP' ? 'webp' : null;
}
