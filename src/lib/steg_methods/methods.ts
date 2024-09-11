import { apply as applyLSB, extract as extractLSB } from '$lib/steg_methods/lsb';

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

export const getMethod
	= (method_name: string, settings: any[], payload_bytes: Uint8Array, payload_terminator: Uint8Array) => {
		let apply_pipeline;
		let extract_pipeline;

		switch (method_name) {
			case 'lsb':
				apply_pipeline = applyLSB(settings, payload_bytes, payload_terminator);
				extract_pipeline = extractLSB(settings, payload_terminator);
				break;
			default:
				apply_pipeline = applyLSB(settings, payload_bytes, payload_terminator);
				extract_pipeline = extractLSB(settings, payload_terminator);
				break;
		}

		return [apply_pipeline, extract_pipeline];
	}
