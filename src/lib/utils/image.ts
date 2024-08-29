export async function getImageDataFromBitmap(bitmap: ImageBitmap, width: number, height: number) {
	const offscreenCanvas = new OffscreenCanvas(width, height);
	const ctx = offscreenCanvas.getContext('2d');
	ctx.drawImage(bitmap, 0, 0);
	return ctx.getImageData(0, 0, width, height);
}
