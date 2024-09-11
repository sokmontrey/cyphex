<script lang="ts">
	import { type Result } from '$lib/utils/functional';
	import {
		createAsyncPipe_,
		SkipIfFailure_,
		ImageDataAdapter_,
		ImageDataWrapper_,
		ResultAdapter_,
		IsOk_,
		resultToMessage,
		failure
	} from '$lib/utils/functional';
	import { type ImageData } from 'fast-png';
	import { stringToBytes } from '$lib/utils/text';
	import { encodeImage, toBlob, downloadImage } from '$lib/utils/image';

	import type { Methods } from '$lib/steg_methods/methods';
	import { getApplyPipeline, getExtractPipeline } from '$lib/steg_methods/methods';

	import { ErrorCode } from '$lib/utils/error';

	import SubHeading from '$lib/components/SubHeading.svelte';
	import Method from '$lib/components/Method.svelte';
	import SettingManager from '$lib/components/SettingManager.svelte';
	import ImageInput from '$lib/components/ImageInput.svelte';
	import ApplyPayload from '$lib/components/ApplyPayload.svelte';
	import ExtractPayload from '$lib/components/ExtractPayload.svelte';
	import Info from '$lib/components/Info.svelte';

	let mode: 'apply' | 'extract' = 'apply';
	let method: Methods = 'lsb';
	let settings: any = [];

	let cover_image_data_result: Result<ImageData> = failure(ErrorCode.CoverImageIsNotSelected);
	let apply_payload_result: Result<Uint8Array> = failure(ErrorCode.PayloadImageIsNotSelected);
	let extract_payload_result: Result<Uint8Array>;

	let result: Result<any>;
	let is_ok: boolean = false;
	let message: string;

	const PAYLOAD_TERMINATOR = stringToBytes('$$END$$').value as Uint8Array;

	const submit = async () => {
		if (mode === 'apply') {
			if (!apply_payload_result.is_ok) {
				result = apply_payload_result;
				return;
			}
			const payload_bytes = apply_payload_result.value as Uint8Array;
			const apply_pipeline = getApplyPipeline(method, settings, payload_bytes, PAYLOAD_TERMINATOR);
			message = await createAsyncPipe_(
				//apply
				SkipIfFailure_(apply_payload_result),
				ResultAdapter_(ImageDataWrapper_(apply_pipeline)),
				ResultAdapter_(encodeImage),
				ResultAdapter_(toBlob),
				ResultAdapter_(downloadImage('applied')),
				IsOk_((_is_ok: boolean) => (is_ok = _is_ok)),
				resultToMessage('Successfully applied payload to the image.')
			)(cover_image_data_result);
		} else {
			const extract_pipeline = getExtractPipeline(method, settings, PAYLOAD_TERMINATOR);
			extract_payload_result = await createAsyncPipe_(
				//extract
				ResultAdapter_(ImageDataAdapter_(extract_pipeline))
			)(cover_image_data_result);
		}
	};

	$: if (result) {
		is_ok = result.is_ok;
		message = resultToMessage('Successfully extracted payload from the image.')(result);
	}

	const coverChanged = () => {
		if (!cover_image_data_result.is_ok) {
			result = cover_image_data_result;
		}
	};
</script>

<header>
	<h1 class="text-2xl mr-10 inline">Cyphex</h1>
	<a class="hover:text-blue-500 hover:underline" href="https://github.com/sokmontrey/cyphex"
		><i class="fa-brands fa-github"></i> GitHub</a
	>
	<p class="text-gray-800">A simple stegonography tool for hiding information within an image.</p>
	<p class="text-gray-800">NOTE: Cyphex only supports .png image at the moment.</p>
</header>

<hr class="my-10" />

<main>
	<Method bind:mode bind:method />
	<br />
	<SettingManager bind:setting_values={settings} bind:mode bind:method />

	<br />
	<section>
		<Info info="The image to cover up your hidden message">
			<SubHeading text={'Cover'} />
			<ImageInput bind:img_data={cover_image_data_result} onChange={coverChanged} />
		</Info>
	</section>

	<br />

	{#if mode === 'apply'}
		<ApplyPayload bind:payload_to_apply={apply_payload_result} />
	{:else}
		<ExtractPayload extracted_payload={extract_payload_result} bind:result />
	{/if}

	<br />

	{#if message}
		<p class={is_ok ? 'text-green-600' : 'text-red-600'}>{message}</p>
	{/if}

	<Info info={!cover_image_data_result.is_ok ? 'Please select a cover image' : ''}>
		<button class="pm-btn" on:click={submit} disabled={!cover_image_data_result.is_ok}>
			{mode === 'apply' ? 'APPLY' : 'EXTRACT'}
		</button>
	</Info>
</main>

<footer></footer>
