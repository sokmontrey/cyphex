import {
	createPipe_,
	createAsyncPipe_,
	ResultAdapter_,
	ResultWrapper_,
	log_,
	IsOk_,
	SuccessCallback_,
	DeadEndResultWrapper_,
	ImageDataWrapper_,
	ImageDataAdapter_,
	SkipIfFailure_,
	resultToMessage,
	type Result
} from '$lib/utils/functional';
import { decodeImage, encodeImage, downloadImage, toBlob, type ImageData, getData } from '$lib/utils/image';
import { getFileFromTarget, checkSupportedImageType, getImageArrayBuffer } from '$lib/utils/file';
import { insertStartUint8Array } from './steg';

export const imageDecodePipeline
	= createAsyncPipe_(
		getFileFromTarget,
		ResultAdapter_(checkSupportedImageType),
		ResultAdapter_(getImageArrayBuffer),
		ResultAdapter_(decodeImage) // getting image data (pixel data) for manipulation
	);
