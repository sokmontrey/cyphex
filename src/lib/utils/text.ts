import { ErrorCode } from '$lib/utils/error';
import { type Result, success, failure } from '$lib/utils/functional';

export const stringToByte = (str: string): Result<Uint8Array> => {
	if (str === "") return failure(ErrorCode.TextCannotBeEmpty);

	try {
		return success(new TextEncoder().encode(str));
	} catch (e) {
		return failure(ErrorCode.UnableToEncodeText, str);
	}
}

export const byteToString = (arr: Uint8Array): Result<string> => {
	try {
		return success(new TextDecoder().decode(arr));
	} catch (e) {
		return failure(ErrorCode.UnableToDecodeText);
	}
}
