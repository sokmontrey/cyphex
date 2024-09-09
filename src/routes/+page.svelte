<script lang="ts">
	import {
		createAsyncPipe_,
		ResultAdapter_,
		ResultWrapper_,
		log_,
		SuccessCallback_,
		DeadEndResultWrapper_,
		ImageDataWrapper_,
		ImageDataAdapter_,
		SkipIfFailure_,
		resultToMessage,
		type Result
	} from '$lib/utils/functional';
	import { decodeImage, encodeImage, downloadImage, toBlob } from '$lib/utils/image';
	import { getFileFromTarget, checkSupportedImageType, getImageArrayBuffer } from '$lib/utils/file';
	import { stringToBytes, bytesToString } from '$lib/utils/text';
	import { apply, extract } from '$lib/steg_methods/lsb';

	/**
	 * Terms:
	 *		cover: the image that the payload will be hidden in
	 *		payload: the data that will be hidden in the cover
	 * TODO: instead of using terminator, create a structure with defined size to explain the payload
	 */

	let mode: 'apply' | 'extract' = 'apply';
	let payload: string = '';
	let lsb_count: number = 4;
	let message: string = '';

	const PAYLOAD_TERMINATOR = stringToBytes('$$END$$').value as Uint8Array;

	const handleFile = async (e: InputEvent) => {
		const target = e.target as HTMLInputElement;

		// can handle different types of payload
		const payloadToBytesPipeline = stringToBytes;
		const bytesToPayloadPipeline = bytesToString;

		const coverToBytesPipeline = createAsyncPipe_(
			getFileFromTarget,
			ResultAdapter_(checkSupportedImageType),
			ResultAdapter_(getImageArrayBuffer),
			ResultAdapter_(decodeImage)
		);

		const payload_pl_result: Result<Uint8Array> = payloadToBytesPipeline(payload);
		const cover_pl_result: Result<ImageData> = await coverToBytesPipeline(target);

		// can be switch to a different steg method
		const applyFunc = apply(lsb_count, payload_pl_result.value as Uint8Array, PAYLOAD_TERMINATOR);
		const extractFunc = extract(lsb_count, PAYLOAD_TERMINATOR);

		// the payload might be an image
		// handle it accordingly
		const extractionDisplayFunc = (result_value: any) => {
			payload = result_value;
		};

		if (mode === 'apply') {
			message = await createAsyncPipe_(
				SkipIfFailure_(payload_pl_result),
				ResultAdapter_(ImageDataWrapper_(applyFunc)),
				ResultAdapter_(encodeImage),
				ResultAdapter_(toBlob),
				DeadEndResultWrapper_(downloadImage('cyphex.png')),
				resultToMessage('Successfully apply payload to the image')
			)(cover_pl_result);
		} else {
			message = await createAsyncPipe_(
				ResultAdapter_(ImageDataAdapter_(extractFunc)),
				ResultAdapter_(bytesToPayloadPipeline),
				SuccessCallback_(extractionDisplayFunc),
				resultToMessage('Successfully extract payload from the image')
			)(cover_pl_result);
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
