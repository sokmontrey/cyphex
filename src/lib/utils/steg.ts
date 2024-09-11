export const concatUint8Array
	= (b: Uint8Array) =>
		(a: Uint8Array): Uint8Array => {
			const result = new Uint8Array(a.length + b.length);
			result.set(a);
			result.set(b, a.length);
			return result;
		};

/* 
 * insert b at the beginning of array a
 */
export const insertStartUint8Array
	= (b: Uint8Array) =>
		(a: Uint8Array): Uint8Array => {
			const result = new Uint8Array(b.length + a.length);
			result.set(b);
			result.set(a, b.length);
			return result;
		};


export const createMask = (n: number) => (1 << n) - 1;
