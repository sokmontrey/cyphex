export enum ErrorCode {
	UnableToReadImageData,
	UnableToWriteImageData,
	UnsupportedFileType,
	NoFileSelected,
	UnableToEncodeText,
	UnableToDecodeText,
	TextCannotBeEmpty,
	PayloadTooLarge,
};

export const createErrorMessage = (err_code: ErrorCode, additional_msg: string): string => {
	const value = additional_msg;
	switch (err_code) {
		/* 
		 * Dealing with images 
		 */
		case ErrorCode.UnableToReadImageData:
			return `Unable to read image data`;
		case ErrorCode.UnableToWriteImageData:
			return `Unable to write image data`;
		/* 
		 * Dealing with files
		 */
		case ErrorCode.UnsupportedFileType:
			return `Unsupported file type: ${value}`;
		case ErrorCode.NoFileSelected:
			return `No file selected`;
		/* 
		 * Dealing with text
		 */
		case ErrorCode.UnableToEncodeText:
			return `Unable to encode text: ${value}`;
		case ErrorCode.UnableToDecodeText:
			return `Unable to decode text: ${value}`;
		case ErrorCode.TextCannotBeEmpty:
			return `Text cannot be empty`;
		/* 
		 * Dealing with LSB steganography method
		 */
		case ErrorCode.PayloadTooLarge:
			return `Payload too large: ${value}`;
		default:
			return `Unexpected error occurred`;
	}
}
