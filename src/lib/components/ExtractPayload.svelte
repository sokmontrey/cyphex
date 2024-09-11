<script lang="ts">
	import SubHeading from './SubHeading.svelte';

	import { bytesToPayloadImageData, downloadImage, encodeImage, toBlob } from '$lib/utils/image';
	import { createPipe_, ResultAdapter_, SuccessCallback_ } from '$lib/utils/functional';
	import type { Result } from '$lib/utils/functional';
	import { bytesToString } from '$lib/utils/text';

	let type: 'text' | 'image' = 'image';
	export let extracted_payload: Result<Uint8Array>;
	export let result: Result<any>;

	let text_payload: string = '';
	let image_url: string = '';

	$: if (extracted_payload) {
		const pipeline =
			type === 'text'
				? createPipe_(
						ResultAdapter_(bytesToString),
						SuccessCallback_((text: string) => (text_payload = text))
					)
				: createPipe_(
						ResultAdapter_(bytesToPayloadImageData),
						ResultAdapter_(encodeImage),
						ResultAdapter_(toBlob),
						ResultAdapter_(downloadImage),
						SuccessCallback_((url: string) => (image_url = url))
					);
		result = pipeline(extracted_payload);
	}

	const changePayloadType = () => {
		type = type === 'text' ? 'image' : 'text';
	};
</script>

<section>
	<SubHeading text={'Payload'} />
	<p class="inp-lbl">Type:</p>
	<button class="sd-btn mb-5" on:click={changePayloadType}>
		{type === 'text' ? 'TEXT' : 'IMAGE'}
	</button>

	<br />

	{#if type === 'text' && text_payload}
		<p class="">Payload: {text_payload}</p>
	{:else if type === 'image' && image_url}
		<img src={image_url} class=" mt-4 w-[200px]" alt="payload" />
	{/if}
</section>
