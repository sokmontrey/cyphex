export enum ErrorCode {
	UnableToReadImageData,
	UnableToWriteImageData,
	UnsupportedFileType,
	NoFileSelected,
	UnableToEncodeText,
	UnableToDecodeText,
	TextCannotBeEmpty,
	PayloadTooLarge,
	UnableToCreateFile,
	InvalidLSBValue,
	UnableToDownloadFile,
	TerminatorNotFound,
	InvalidPayloadImageDimension,
	PayloadIsNotAnImage,
};

export const createErrorMessage = (err_code: ErrorCode, value: string): string => {
	switch (err_code) {
		/* 
		 * Dealing with images 
		 */
		case ErrorCode.UnableToReadImageData:
			return `Unable to read image data`;
		case ErrorCode.UnableToWriteImageData:
			return `Unable to write image data`;
		/* 
		 * Dealing with payload images 
		 */
		case ErrorCode.InvalidPayloadImageDimension:
			return `Payload image dimensions are not valid.`;
		case ErrorCode.PayloadIsNotAnImage:
			return `Payload is not an image.`;
		/* 
		 * Dealing with files
		 */
		case ErrorCode.UnsupportedFileType:
			return `Unsupported file type: ${value}`;
		case ErrorCode.NoFileSelected:
			return `No file selected. Please select an image file (png).`;
		case ErrorCode.UnableToCreateFile:
			return `Unable to create file`;
		case ErrorCode.UnableToDownloadFile:
			return `Unable to download file`;
		/* 
		 * Dealing with text
		 */
		case ErrorCode.UnableToEncodeText:
			return `Unable to encode text: ${value}`;
		case ErrorCode.UnableToDecodeText:
			return `Unable to decode text: ${value}`;
		case ErrorCode.TextCannotBeEmpty:
			return `Payload text cannot be empty`;
		/* 
		 * Dealing with LSB steganography method
		 */
		case ErrorCode.PayloadTooLarge:
			return `Payload too large: ${value}`;
		case ErrorCode.InvalidLSBValue:
			return `Invalid LSB value (must be an integer from 1 to 8)`;
		case ErrorCode.TerminatorNotFound:
			return `Terminator not found. This image may not have any payload or the setting is incorrect.`
		default:
			return `Unexpected error occurred`;
	}
}
