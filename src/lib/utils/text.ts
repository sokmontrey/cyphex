export function textToByte(str: string): Uint8Array {
	return new TextEncoder().encode(str);
}

export function byteToText(arr: Uint8Array): string {
	return new TextDecoder().decode(arr);
}
