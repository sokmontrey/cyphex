import { ErrorCode } from '$lib/utils/error';
import { type Result, failure, success, pipe_, map_, bind_ } from '$lib/utils/functional';
import { stringToByte } from '$lib/utils/text';
import { createMask, splitBytes } from '$lib/utils/byte';

const replaceCover
	= (cover: Uint8ClampedArray, lsb_value: number) =>
		(payload: Uint8Array): Uint8ClampedArray => {
			const result = new Uint8ClampedArray(cover.length);
			for (let i = 0; i < payload.length; i++)
				result[i] = (cover[i] & ~createMask(lsb_value)) | payload[i];
			return result;
		}

const checkPayloadSize
	= (cover: Uint8ClampedArray, lsb_value: number) =>
		(payload: Uint8Array): Result<Uint8Array> => {
			if (payload.length < cover.length) return success(payload);
			// convert payload and cover size (byte) to KB 
			// and create an informative error message
			const payload_size = (payload.length / 1000).toFixed(2);
			const max_size_allowed = Math.floor(lsb_value * cover.length / 8);
			const error_msg = `Max size allowed: ${max_size_allowed} KB. Recieved a payload of ${payload_size} KB.`;
			return failure(ErrorCode.PayloadTooLarge, error_msg);
		};

export const apply
	= (payload: string, lsb_value: number) =>
		(cover: ImageData): Result<ImageData> => {
			return pipe_(
				// TODO: deal with image data returning
				stringToByte,
				map_(splitBytes(lsb_value)),
				bind_(checkPayloadSize(cover.data, lsb_value)),
				map_(replaceCover(cover.data, lsb_value)),
			)(payload);
		};

export const extract = () => {
};
