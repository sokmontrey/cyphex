import { apply as applyLSB, extract as extractLSB } from '$lib/steg_methods/lsb';
import { ErrorCode } from '$lib/utils/error';
import { failure, success, type Result } from '$lib/utils/functional';
import { insertStartUint8Array } from '$lib/utils/steg';

export type Methods = 'lsb';
export type Mode = 'apply' | 'extract';

export const mode_info = {
	apply: 'Hide a payload inside an image',
	extract: 'Extract the payload from an image (previously applied with this tool)'
};
export const method_info = {
	lsb: "Using least significant bit(s) of each pixel data to store the payload."
};

interface MethodName {
	name: Methods;
	text: string;
}

export const method_list: MethodName[] = [{
	name: 'lsb',
	text: 'Least Significant Bit (LSB)'
}];

export const MethodSettings = {
	lsb: [
		{
			text: 'LSB Value (1-8)',
			info: 'The number of bits used on each pixel data. (4 is recommended)',
			type: 'number',
			input_attr: {
				min: 1,
				max: 8,
				step: 1,
			},
			value: 4,
			default_value: 4
		}
	],
};

export const getApplyPipeline
	= (method_name: string, settings: any[], payload_bytes: Uint8Array, payload_terminator: Uint8Array) => {
		let pipeline;
		switch (method_name) {
			case 'lsb':
				pipeline = applyLSB(settings, payload_bytes, payload_terminator);
				break;
			default:
				pipeline = applyLSB(settings, payload_bytes, payload_terminator);
				break;
		}
		return pipeline;
	}

export const getExtractPipeline
	= (method_name: string, settings: any[], payload_terminator: Uint8Array) => {
		let pipeline;
		switch (method_name) {
			case 'lsb':
				pipeline = extractLSB(settings, payload_terminator);
				break;
			default:
				pipeline = extractLSB(settings, payload_terminator);
				break;
		}
		return pipeline;
	}

interface TypeCode {
	[key: string]: number,
}
const type_code: TypeCode = {
	'image': 0,
	'text': 1,
};

export const getPayloadTypeCode
	= (type: string): Result<number> => {
		if (type_code[type] === undefined) return failure(ErrorCode.UndefinedPayloadType);
		return success(type_code[type]);
	};

export const getPayloadTypeName
	= (code: number): Result<string> => {
		// file type name in type_code
		const name = Object.keys(type_code).find(key => type_code[key] === code);
		if (!name) return failure(ErrorCode.UndefinedPayloadType);
		return success(name);
	};

export const getPayloadTypeNameFromBytes
	= (bytes: Uint8Array): Result<string> => {
		if (bytes.length === 0) return failure(ErrorCode.UndefinedPayloadType);
		return getPayloadTypeName(bytes[0]);
	};

export const insertPayloadType
	= (type: string) =>
		(bytes: Uint8Array): Result<Uint8Array> => {
			const code_result = getPayloadTypeCode(type);
			if (!code_result.is_ok) code_result;
			const type_code_arr = new Uint8Array(1);
			type_code_arr[0] = code_result.value as number;
			return success(insertStartUint8Array(type_code_arr)(bytes));
		};

export const cutPayloadTypeFromBytes
	= (bytes: Uint8Array): Result<Uint8Array> => {
		const result = new Uint8Array(bytes.length - 1);
		result.set(bytes.slice(1));
		return success(result);
	}
