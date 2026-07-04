/**
 * Compresse une image côté navigateur avant upload — le bucket Supabase Storage est
 * limité (50 Mo en test) et une simple preuve de défi n'a besoin ni de haute résolution
 * ni de haute qualité JPEG pour rester lisible.
 */
export async function compressImage(
    file: File,
    { maxDimension = 1280, quality = 0.7 }: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
    if (!file.type.startsWith('image/')) return file;

    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return file;

    // Le fichier compressé peut dépasser l'original sur une image déjà très petite/simple
    // (rare, mais arrive sur des captures d'écran) — dans ce cas on garde l'original.
    if (blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
}
