<script lang="ts">
	import {
		createAsyncPipe_,
		ResultAdapter_,
		ResultWrapper_,
		log_,
		IsOk_,
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
	import { imageDecodePipeline } from '$lib/utils/pipeline';

	/**
	 * Terms:
	 *		cover: the image that the payload will be hidden in
	 *		payload: the data that will be hidden in the cover
	 * TODO: instead of using terminator, create a structure with defined size to explain the payload
	 */

	const info = {
		apply: 'Hiding payloads inside an image.',
		extract: 'Extracting payloads from an image (previously applied using this tool).'
	};

	let mode: 'apply' | 'extract' = 'apply';

	let payload_type: 'text' | 'image' = 'text';
	let payload: string = '';
	let lsb_count: number = 4; // make a setting object for a more general method setting

	let is_ok: boolean = false;
	let message: string = '';

	let cover_file_target: HTMLInputElement;
	let cover_img_url: string = '';

	const PAYLOAD_TERMINATOR = stringToBytes('$$END$$').value as Uint8Array;

	const showImage = (file: File) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result;
			if (typeof result !== 'string') return;
			cover_img_url = reader.result as string;
		};
		reader.readAsDataURL(file);
	};

	const handleFile = async (e: InputEvent) => {
		cover_file_target = e.target as HTMLInputElement;
		if (!cover_file_target) return;
		if (!cover_file_target.files) return;
		if (cover_file_target.files.length === 0) return;
		showImage(cover_file_target.files[0]);
	};

	const submit = async () => {
		// can handle different types of payload
		const payloadToBytesPipeline = stringToBytes;
		const bytesToPayloadPipeline = bytesToString;

		const payload_pl_result: Result<Uint8Array> = payloadToBytesPipeline(payload);
		const payload_bytes = payload_pl_result.value as Uint8Array;
		const image_cover_pl_result: Result<ImageData> = await imageDecodePipeline(cover_file_target);

		// the payload might be an image
		// handle it accordingly
		const extractionDisplayFunc = (result_value: any) => {
			payload = result_value;
		};

		const mainPipeline =
			mode === 'apply'
				? createAsyncPipe_(
						SkipIfFailure_(payload_pl_result),
						ResultAdapter_(ImageDataWrapper_(apply(lsb_count, payload_bytes, PAYLOAD_TERMINATOR))),
						ResultAdapter_(encodeImage),
						ResultAdapter_(toBlob),
						ResultAdapter_(downloadImage('image.png')),
						IsOk_((_is_ok: boolean) => (is_ok = _is_ok)),
						resultToMessage('Successfully apply payload to the image')
					)
				: createAsyncPipe_(
						ResultAdapter_(ImageDataAdapter_(extract(lsb_count, PAYLOAD_TERMINATOR))),
						ResultAdapter_(bytesToPayloadPipeline),
						SuccessCallback_(extractionDisplayFunc),
						IsOk_((_is_ok: boolean) => (is_ok = _is_ok)),
						resultToMessage('Successfully extract payload from the image')
					);

		message = await mainPipeline(image_cover_pl_result);
	};

	const onModeChange = (e: InputEvent) => {
		mode = mode === 'apply' ? 'extract' : 'apply';
		payload = '';
		message = '';
	};

	const switchPayloadType = () => {
		payload_type = payload_type === 'text' ? 'image' : 'text';
	};
</script>

<svelte:head>
	<title>Cyphex</title>
</svelte:head>

<div class="p-10 md:p-20">
	<header>
		<h1 class="text-2xl mr-10 inline">Cyphex</h1>
		<a class="hover:text-teal-500" href="https://github.com/sokmontrey/cyphex"
			><i class="fa-brands fa-github"></i> GitHub</a
		>
		<p>A simple stegonography tool for hiding information within an image.</p>
		<p class="opacity-50">NOTE: Cyphex only supports .png image at the moment.</p>
	</header>

	<hr class="my-10" />

	<main>
		<section class="mt-5 pl-4">
			<div class="mb-4 flex">
				<p class="border-l-2 border-zinc-300 pl-4">Method:</p>
				<!--TODO: Integrate different methods here-->
				<select
					id="mode-btn"
					class="outline-none mx-4 px-4 text-white bg-zinc-900 hover:bg-zinc-300 hover:text-zinc-900 transition-all duration-200 ease-in-out active:translate-y-1"
				>
					<option value="lsb">Least Significant Bit (LSB)</option>
				</select>
			</div>
			<div class="mb-4 flex">
				<p class="border-l-2 border-zinc-300 pl-4">Mode&nbsp;&nbsp;:</p>
				<button
					on:click={onModeChange}
					id="mode-btn"
					class="outline-none px-4 mx-4 px-4 text-white bg-zinc-900 hover:bg-zinc-300 hover:text-zinc-900 transition-all duration-200 ease-in-out active:translate-y-1"
				>
					{mode === 'apply' ? 'APPLY' : 'EXTRACT'}
				</button>
			</div>

			<p class="mb-4">
				<i class="fa-solid fa-circle-info"></i>
				{info[mode]}
			</p>
		</section>

		<section class="mt-5">
			<h2 class="text-xl">Settings</h2>
			<div class="pt-4 flex pl-4">
				<p class="inline border-l-2 border-zinc-300 pl-4">LSB value:</p>
				<input
					id="lsb-inp"
					type="number"
					min="1"
					max="8"
					step="1"
					class="font-mono w-[90px] pl-2 outline-none mx-4 transition-all duration-200 ease-in-out"
					bind:value={lsb_count}
				/>
			</div>
		</section>

		<section class="mt-5 md:flex w-full">
			<div class="flex-1">
				<h2 class="text-xl">Cover Image</h2>
				<div class="pl-4">
					<input
						type="file"
						class="mt-4 file:text-white file:bg-zinc-900 file:hover:bg-zinc-300 file:hover:text-zinc-900 file:px-4 file:mr-4 file:transition-all file:duration-200 file:ease-in-out file:border-none outline-none"
						on:change={handleFile}
					/>
					{#if cover_img_url}
						<img src={cover_img_url} class=" mt-4 w-[200px]" alt="cover" />
					{/if}
				</div>
			</div>
			<div class="flex-1">
				{#if mode === 'apply'}
					<h2 class="text-xl">Payload</h2>
					<div class="pl-4">
						<p class="border-l-2 inline border-zinc-300 pl-4">Payload Type:</p>
						<button
							on:click={switchPayloadType}
							class="px-4 text-white bg-zinc-900 hover:bg-zinc-300 hover:text-zinc-900 transition-all duration-200 ease-in-out active:translate-y-1"
						>
							{payload_type === 'image' ? 'Image' : 'Text'}
						</button>
						<br />
						<textarea
							bind:value={payload}
							placeholder="Your message here..."
							class="outline-none border-l-2 border-zinc-300 py-2 px-4 mt-4 w-full md:w-1/2"
						/>
					</div>
				{/if}

				{#if mode === 'extract'}
					<p class="inline">Payload:</p>
					{#if payload}
						<p class="inline">{payload}</p>
					{/if}
				{/if}
			</div>
		</section>
		<section class="mt-5">
			<br />

			<p class={is_ok ? 'text-green-500' : 'text-red-500'}>{message}</p>

			<button
				on:click={submit}
				class="outline-none px-4 text-white bg-zinc-900 hover:bg-zinc-300 hover:text-zinc-900 transition-all duration-200 ease-in-out active:translate-y-1 mt-4"
			>
				{mode === 'apply' ? 'Apply' : 'Extract'}
			</button>
		</section>
	</main>
</div>
