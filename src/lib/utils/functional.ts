import { ErrorCode, createErrorMessage } from '$lib/utils/error';

export type Success<T> = { is_ok: true, value: T };
export type Failure = { is_ok: false, err_code: ErrorCode, additional_msg: string };
export type Result<T> = Success<T> | Failure;

export const success = <T>(value: T): Success<T> => ({ is_ok: true, value });
export const failure = (err_code: ErrorCode, additional_msg: string = ""): Failure => ({ is_ok: false, err_code, additional_msg });

const _reduced = (f: Function, g: Function): Function => (arg: any) => g(f(arg));
export const pipe_ = (...fns: Array<Function>): Function => fns.reduce(_reduced);

const _reducedAsync = (f: Function, g: Function): Function => async (arg: any) => {
	const result = await f(arg);
	return g(result);
};
export const pipeAsync_ = (...fns: Array<Function>): Function =>
	(arg: any) => fns.reduce(_reducedAsync, (arg: any) => arg)(arg);

export const bind_ = (f: Function) => (input: Result<any>) => input.is_ok ? f(input.value) : input;
export const map_ = (f: Function) => (input: Result<any>) => input.is_ok ? success(f(input)) : input;

export const log_ = (msg: string) => (arg: any) => { console.log(`[${msg}]: `, arg); return arg; };

export const resultToMessage = (succes_msg: string) => (result: Result<any>): string => {
	if (result.is_ok) {
		return succes_msg;
	} else {
		return createErrorMessage(result.err_code, result.additional_msg);
	}
};
