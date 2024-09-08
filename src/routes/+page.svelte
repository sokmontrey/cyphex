<script lang="ts">
	import {
		pipe_,
		pipeAsync_,
		ResultAdapter_,
		ResultWrapper_,
		log_,
		SuccessCallback_,
		DeadEndResultWrapper_,
		ImageDataWrapper_,
		SkipIfFailure_,
		resultToMessage,
		type Result
	} from '$lib/utils/functional';
	import { decodeImage, encodeImage, downloadImage, toBlob } from '$lib/utils/image';
	import { getFileFromTarget, checkSupportedImageType, getImageArrayBuffer } from '$lib/utils/file';
	import { stringToBytes, bytesToString } from '$lib/utils/text';
	import { apply, extract } from '$lib/steg_methods/lsb';

	let mode: 'apply' | 'extract' = 'apply';
	let payload: string = '';
	let lsb_count: number = 4;
	let message: string = '';

	const handleFile = async (e: InputEvent) => {
		const target = e.target as HTMLInputElement;

		const payload_pl_result: Result<Uint8Array> = await pipe_(stringToBytes)(payload);

		const apply_func = apply(lsb_count, payload_pl_result.value as Uint8Array);
		const extract_func = extract(lsb_count);

		const cover_pl_result: Result<ImageData> = await pipeAsync_(
			getFileFromTarget,
			ResultAdapter_(checkSupportedImageType),
			ResultAdapter_(getImageArrayBuffer),
			ResultAdapter_(decodeImage)
		)(target);

		const apply_pl = pipeAsync_(
			SkipIfFailure_(payload_pl_result),
			ResultAdapter_(ImageDataWrapper_(apply_func)),
			ResultAdapter_(encodeImage),
			ResultAdapter_(toBlob),
			DeadEndResultWrapper_(downloadImage('cyphex.png')),
			resultToMessage('Successfully apply payload to the image')
		);

		const extract_pl = pipeAsync_(
			ResultAdapter_(extract_func),
			ResultAdapter_(bytesToString),
			SuccessCallback_((result: any) => (payload = result)),
			resultToMessage('Successfully extract payload from the image')
		);

		if (mode === 'apply') {
			message = await apply_pl(cover_pl_result);
		} else {
			message = await extract_pl(cover_pl_result);
		}
	};

	const onModeChange = (e: InputEvent) => {
		payload = '';
	};
</script>

<svelte:head>
	<title>Cyphex</title>
</svelte:head>

<div>
	<p>{message}</p>

	<label for="mode-slt">Mode: </label>
	<select bind:value={mode} on:change={onModeChange} id="mode-slt">
		<option value="apply">Apply</option>
		<option value="extract">Extract</option>
	</select>

	<br />

	<label for="">LSB value:</label>
	<input type="number" bind:value={lsb_count} />

	<br />

	{#if mode === 'apply'}
		<label for="">Payload: </label>
		<textarea bind:value={payload} />
	{/if}

	{#if mode === 'extract'}
		<label for="">Payload: </label>
		<textarea bind:value={payload} readonly />
	{/if}

	<br />

	<input type="file" on:change={handleFile} />
</div>

<style>
	textarea,
	input {
		border: solid black 1px;
		width: 50%;
	}
</style>
