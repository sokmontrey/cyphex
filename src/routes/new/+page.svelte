<script lang="ts">
	import { type Result } from '$lib/utils/functional';
	import {
		createAsyncPipe_,
		SkipIfFailure_,
		ImageDataAdapter_,
		ResultAdapter_,
		IsOk_,
		resultToMessage
	} from '$lib/utils/functional';
	import { type ImageData } from 'fast-png';
	import { stringToBytes } from '$lib/utils/text';
	import { encodeImage, toBlob, downloadImage } from '$lib/utils/image';

	import type { Methods } from '$lib/steg_methods/methods';
	import { getMethod } from '$lib/steg_methods/methods';

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

	let cover_image_data_result: Result<ImageData>;
	let payload_result: Result<Uint8Array>;

	let result: Result<any>;
	let is_ok: boolean = false;

	const PAYLOAD_TERMINATOR = stringToBytes('$$END$$').value as Uint8Array;

	const submit = async () => {
		const payload_bytes = payload_result.value as Uint8Array;
		const [apply_pipeline, extract_pipeline] = getMethod(
			method,
			settings,
			payload_bytes,
			PAYLOAD_TERMINATOR
		);
		const main_pipeline =
			mode === 'apply'
				? createAsyncPipe_(
						///
						SkipIfFailure_(payload_result),
						ResultAdapter_(ImageDataAdapter_(apply_pipeline)),
						ResultAdapter_(encodeImage),
						ResultAdapter_(toBlob),
						ResultAdapter_(downloadImage('image.png')),
						IsOk_((_is_ok: boolean) => (is_ok = _is_ok)),
						resultToMessage('Successfully apply payload to the image')
					)
				: createAsyncPipe_();
		main_pipeline(cover_image_data_result);
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
			<ImageInput bind:img_data={cover_image_data_result} />
		</Info>
	</section>

	<br />

	{#if mode === 'apply'}
		<ApplyPayload bind:payload_to_apply={payload_result} />
	{:else}
		<ExtractPayload extracted_payload={payload_result} bind:result />
	{/if}

	<br />

	<button class="pm-btn" on:click={submit}>
		{mode === 'apply' ? 'APPLY' : 'EXTRACT'}
	</button>
</main>

<footer></footer>
