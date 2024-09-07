import { type DecodedPng } from 'fast-png';
import { decode, encode } from 'fast-png';

import type { Result } from '$lib/utils/functional';
import { success, failure } from '$lib/utils/functional';
import { ErrorCode } from '$lib/utils/error';

export interface ImageData extends DecodedPng {
	colorSpace: string;
}

export function decodeImage(array_buffer: ArrayBuffer): Result<ImageData> {
	try {
		const img_data = decode(array_buffer) as ImageData;
		img_data.colorSpace = 'srgb';
		return success(img_data);
	} catch (e) {
		return failure(ErrorCode.UnableToReadImageData);
	}
}

export async function encodeImage(image_data: ImageData) {
	try {
		const array_buffer = encode(image_data);
		return success(array_buffer);
	} catch (e) {
		return failure(ErrorCode.UnableToWriteImageData);
	}
}
