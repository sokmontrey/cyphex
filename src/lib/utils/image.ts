import type { DecodedPng, ImageData } from 'fast-png';
import { decode, encode } from 'fast-png';

import type { Result } from '$lib/utils/functional';
import { success, failure, createPipe_, ResultWrapper_ } from '$lib/utils/functional';
import { ErrorCode } from '$lib/utils/error';
import { fail } from '@sveltejs/kit';
import { insertStartUint8Array } from './steg';
import { bytesToString } from './text';

export const decodeImage
	= (array_buffer: ArrayBuffer): Result<ImageData> => {
		try {
			return success(decode(array_buffer) as ImageData);
		} catch (e: any) {
			return failure(ErrorCode.UnableToReadImageData, "", e);
		}
	};

export const encodeImage
	= (image_data: ImageData): Result<ArrayBuffer> => {
		try {
			const array_buffer = encode(image_data).buffer;
			return success(array_buffer);
		} catch (e: any) {
			return failure(ErrorCode.UnableToWriteImageData, "", e);
		}
	};

export const toBlob
	= (img_array_buffer: ArrayBuffer): Result<Blob> => {
		try {
			const blob = new Blob([img_array_buffer], { type: 'image/png' });
			return success(blob);
		} catch (e: any) {
			return failure(ErrorCode.UnableToCreateFile, "", e);
		}
	};

// export const blobToURL
// 	= (blob: Blob): Result<string> => {
// 		try {
// 			const url = URL.createObjectURL(blob);
// 			return success(url);
// 		} catch (e: any) {
// 			return failure(ErrorCode.UnableToReadImageData, '', e);
// 		}
// 	};

export const downloadImage
	= (file_name: string) =>
		(blob: Blob): Result<string> => {
			try {
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = file_name + '.png';
				a.click();
				a.remove();
				return success(url);
			} catch (e) {
				return failure(ErrorCode.UnableToDownloadFile);
			}
		};

export const getData
	= (image_data: ImageData): Result<Uint8Array> => {
		try {
			return success(image_data.data as Uint8Array);
		} catch (e: any) {
			return failure(ErrorCode.UnableToReadImageData, "", e);
		}
	}

export const getImageUrlFromFile
	= async (file: File): Promise<string> => {
		return new Promise((resolve, _) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result;
				if (typeof result !== 'string') return;
				resolve(reader.result as string);
			};
			reader.readAsDataURL(file);
		});
	};

export const payloadImageDataToBytes
	= (image_data: ImageData): Result<Uint8Array> => {
		if (!image_data)
			return failure(ErrorCode.UnableToReadImageData);
		if (!image_data.width || !image_data.height)
			return failure(ErrorCode.InvalidPayloadImageDimension);

		const w = image_data.width;
		const h = image_data.height;
		// using 32 bits integer for width and height
		const image_info = new Uint8Array((2 * 32) / 8);
		// w32 = w4 w3 w2 w1 <- 8 bits each
		// order: w4 w3 w2 w1 h4 h3 h2 h1
		for (let i = 0; i < 4; i++) {
			image_info[3 - i] = w >> (i * 8) && 0xff;
			image_info[7 - i] = h >> (i * 8) && 0xff;
		}

		return createPipe_(
			getData,
			ResultWrapper_(insertStartUint8Array(image_info))
		)(image_data);
	};

export const bytesToPayloadImageData
	= (bytes: Uint8Array): Result<ImageData> => {
		let width = 0;
		let height = 0;
		let idx = 0;

		for (let i = 0; i < 4; i++) {
			width |= bytes[idx++];
			width <<= 8;
		}
		for (let i = 0; i < 4; i++) {
			height |= bytes[idx++];
			if (i < 3) height <<= 8;
		}

		if (bytes.length < 8) return failure(ErrorCode.PayloadIsNotAnImage);

		const data = new Uint8Array(bytes.length - (2 * 32));
		data.set(bytes.slice(2 * 4));

		const result: ImageData = {
			width,
			height,
			data,
		};

		return success(result);
	};

