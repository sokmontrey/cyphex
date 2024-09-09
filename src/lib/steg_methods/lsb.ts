import { ErrorCode } from '$lib/utils/error';
import { type Result, failure, success, createPipe_, ResultWrapper_, ResultAdapter_, log_ } from '$lib/utils/functional';
import { createMask, concatUint8Array } from '$lib/utils/steg';

export const apply
	= (lsb_value: number, payload: Uint8Array, payload_terminator: Uint8Array) =>
		(cover_data: Uint8ClampedArray): Result<ImageData> => {
			return createPipe_(
				ResultWrapper_(concatUint8Array(payload_terminator)),
				ResultAdapter_(splitBytes(lsb_value)),
				ResultAdapter_(checkPayloadSize(cover_data, lsb_value)),
				ResultWrapper_(replaceCoverData(cover_data, lsb_value)),
			)(success(payload));
		};

export const extract
	= (lsb_value: number, payload_terminator: Uint8Array) =>
		(cover_data: Uint8ClampedArray): Result<Uint8Array> => {
			return createPipe_(
				extractMaskedBits(lsb_value, payload_terminator),
				success,
			)(cover_data);
		};

const splitBytes = (bits_per_chunk: number) =>
	(byte_arr: Uint8Array): Result<Uint8Array> => {
		const total_bits = byte_arr.length * 8;
		const total_chunks = Math.ceil(total_bits / bits_per_chunk);
		const mask = createMask(bits_per_chunk);

		const result = new Uint8Array(total_chunks);
		let result_idx = 0;
		let bit_buffer = 0;
		let bit_count = 0;

		for (let i = 0; i < byte_arr.length; i++) {
			// using larger int (bit_buffer) as a STACK to store leftover + current byte
			bit_buffer <<= 8
			bit_buffer |= byte_arr[i];
			bit_count += 8;

			// while there are enough bits for a chunk
			while (bit_count >= bits_per_chunk) {
				// extract the chunk from the buffer
				// and store it in the result array
				bit_count -= bits_per_chunk;
				result[result_idx++] = (bit_buffer >> bit_count) & mask;
			}
		}

		// remaining bits
		if (bit_count > 0)
			result[result_idx] = (bit_buffer << (bits_per_chunk - bit_count)) & mask;

		return success(result);
	};

const checkPayloadSize = (cover: Uint8ClampedArray, lsb_value: number) =>
	(payload: Uint8Array): Result<Uint8Array> => {
		if (payload.length < cover.length) return success(payload);
		// convert payload and cover size (byte) to KB 
		// and create an informative error message
		const payload_size = (payload.length / 1000).toFixed(2);
		const max_size_allowed = Math.floor(lsb_value * cover.length / 8);
		const error_msg = `Max size allowed: ${max_size_allowed} KB. Recieved a payload of ${payload_size} KB.`;
		return failure(ErrorCode.PayloadTooLarge, error_msg);
	};

const replaceCoverData = (cover_data: Uint8ClampedArray, lsb_value: number) =>
	(payload: Uint8Array): Uint8ClampedArray => {
		for (let i = 0; i < payload.length; i++)
			cover_data[i] = (cover_data[i] & ~createMask(lsb_value)) | payload[i];
		return cover_data;
	}

const extractMaskedBits = (bits_per_chunk: number, payload_terminator: Uint8Array) =>
	(byte_arr: Uint8ClampedArray): Uint8Array => {
		const mask = createMask(bits_per_chunk);
		const total_bits = byte_arr.length * bits_per_chunk;
		const total_bytes = Math.ceil(total_bits / 8);

		const result = new Uint8Array(total_bytes);
		let result_idx = 0;
		let bit_buffer = 0;
		let bit_count = 0;

		let terminator_idx = 0;
		let total_size = 0;

		for (let i = 0; i < byte_arr.length; i++) {
			bit_buffer <<= bits_per_chunk;
			bit_buffer |= byte_arr[i] & mask;
			bit_count += bits_per_chunk;
			if (bit_count >= 8) {
				const byte = bit_buffer & 0xff;
				result[result_idx++] = byte;
				bit_buffer >>= 8;
				bit_count -= 8;
				total_size++;
				if (payload_terminator[terminator_idx] === byte) {
					terminator_idx++;
					if (terminator_idx === payload_terminator.length) break;
				} else {
					terminator_idx = 0;
				}
			}
		}

		return result.subarray(0, total_size - payload_terminator.length);
	};
