import type { Result } from '$lib/utils/functional';
import { failure, success } from '$lib/utils/functional';
import { ErrorCode } from '$lib/utils/error';

const supported_img_types: string[] = ['png', 'jpeg'];

export const checkSupportedImageType = (file: File): Result<File> => {
	const file_ext = file.name.split('.').pop();
	if (file_ext === undefined)
		return failure(ErrorCode.UnsupportedFileType, 'unknown');
	if (!supported_img_types.includes(file_ext))
		return failure(ErrorCode.UnsupportedFileType, '".' + file_ext + '"');
	return success(file);
};

export const getFileFromTarget = (target: HTMLInputElement): Result<File> => {
	const files = target.files;
	if (files === null || files.length === 0)
		return failure(ErrorCode.NoFileSelected)
	const file = files[0];
	return success(file);
};

export const getImageArrayBuffer = async (file: File): Promise<Result<ArrayBuffer>> => {
	try {
		const array_buffer = await file.arrayBuffer();
		return success(array_buffer);
	} catch (e) {
		return failure(ErrorCode.UnableToReadImageData);
	}
}
