import { type DecodedPng } from 'fast-png';
import { decode, encode } from 'fast-png';

import type { Result } from '$lib/utils/functional';
import { success, failure } from '$lib/utils/functional';
import { ErrorCode } from '$lib/utils/error';

export interface ImageData extends DecodedPng {
	colorSpace: string;
}

export const decodeImage
	= (array_buffer: ArrayBuffer): Result<ImageData> => {
		try {
			const img_data = decode(array_buffer) as ImageData;
			img_data.colorSpace = 'srgb';
			return success(img_data);
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
