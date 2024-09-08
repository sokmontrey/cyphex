import type { ImageData } from '$lib/utils/image';
import { ErrorCode, createErrorMessage } from '$lib/utils/error';

export type Success<T> = { is_ok: true, value: T };
export type Failure = { is_ok: false, err_code: ErrorCode, e: Error | null, value: string };
export type Result<T> = Success<T> | Failure;

export const success = <T>(value: T): Success<T> => ({ is_ok: true, value });
export const failure = (err_code: ErrorCode, additional_msg: string = "", e: Error | null = null): Failure =>
	({ is_ok: false, err_code, e, value: additional_msg });

const _reduced = (f: Function, g: Function): Function => (arg: any) => g(f(arg));
export const pipe_ = (...fns: Array<Function>): Function => fns.reduce(_reduced);

const _reducedAsync = (f: Function, g: Function): Function => async (arg: any) => {
	const result = await f(arg);
	return g(result);
};

export const pipeAsync_ = (...fns: Array<Function>): Function =>
	(arg: any) => fns.reduce(_reducedAsync, (arg: any) => arg)(arg);

export const ResultAdapter_
	= (f: Function) =>
		(input: Result<any>) =>
			input.is_ok ? f(input.value) : input;

export const ResultWrapper_
	= (f: Function) =>
		(input: Result<any>) =>
			input.is_ok ? success(f(input.value)) : input;

export const DeadEndResultWrapper_
	= (f: Function) =>
		(input: Result<any>) => { if (input.is_ok) { f(input.value); } return input; };

export const ImageDataWrapper_
	= (f: Function) =>
		(image_data: ImageData): Result<ImageData> => {
			const result = f(image_data.data);
			if (result.is_ok) {
				image_data.data = result.value;
				return success(image_data);
			}
			return result;
		};

export const SkipIfFailure_
	= (external_input: Result<any>) =>
		(input: Result<any>) => external_input.is_ok ? input : external_input;

export const log_ = (msg: string) => (arg: any) => { console.log(`[${msg}]: `, arg); return arg; };

export const callback_ = (f: Function) => (arg: any) => { f(arg); return arg; };
export const SuccessCallback_ = (f: Function) => (input: Result<any>) => { if (input.is_ok) { f(input.value); } return input; };

export const resultToMessage = (succes_msg: string) => (result: Result<any>): string => {
	if (result.is_ok) {
		return succes_msg;
	} else {
		return createErrorMessage(result.err_code, result.value);
	}
};
