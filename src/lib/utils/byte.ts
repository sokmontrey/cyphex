export function createMask(n: number) {
	return (1 << n) - 1;
}

export function splitBytes(byte_arr: Uint8Array, bits_per_chunk: number): Uint8Array {
	const num_bits = byte_arr.length * 8;
	const num_chunks = Math.ceil(num_bits / bits_per_chunk);
	const result = new Uint8Array(num_chunks);
	const mask = createMask(bits_per_chunk);

	let result_idx = 0;
	let bit_buffer = 0;
	let bit_count = 0;

	for (let i = 0; i < byte_arr.length; i++) {
		// using larger int (bit_buffer) as a STACK to store leftover + current byte
		bit_buffer = (bit_buffer << 8) | byte_arr[i];
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

	return result;
}
