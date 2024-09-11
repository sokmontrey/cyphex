<script lang="ts">
	import SubHeading from './SubHeading.svelte';

	import { bytesToPayloadImageData, downloadImage, encodeImage, toBlob } from '$lib/utils/image';
	import { createPipe_, ResultAdapter_, SuccessCallback_, log_ } from '$lib/utils/functional';
	import type { Result } from '$lib/utils/functional';
	import { bytesToString } from '$lib/utils/text';
	import { cutPayloadTypeFromBytes, getPayloadTypeNameFromBytes } from '$lib/steg_methods/methods';

	export let extracted_payload: Result<Uint8Array>;
	export let result: Result<any>;

	let type: string = 'image';
	let text_payload: string = '';
	let image_url: string = '';

	$: decoding_payload_block: if (extracted_payload) {
		const payload_type_result = ResultAdapter_(getPayloadTypeNameFromBytes)(extracted_payload);
		if (!payload_type_result.is_ok) {
			result = payload_type_result;
			break decoding_payload_block;
		}
		type = payload_type_result.value;
		const pipeline =
			type === 'text'
				? createPipe_(
						ResultAdapter_(cutPayloadTypeFromBytes),
						ResultAdapter_(bytesToString),
						SuccessCallback_((text: string) => (text_payload = text))
					)
				: createPipe_(
						ResultAdapter_(cutPayloadTypeFromBytes),
						ResultAdapter_(bytesToPayloadImageData),
						ResultAdapter_(encodeImage),
						ResultAdapter_(toBlob),
						ResultAdapter_(downloadImage('extracted')),
						SuccessCallback_((url: string) => (image_url = url))
					);
		result = pipeline(extracted_payload);
	}
</script>

<section>
	<SubHeading text={'Payload'} />
	<p class="inp-lbl">Type:</p>
	<p class="mb-5 inline">
		{type === 'text' ? 'Text' : 'Image'}
	</p>

	<br />

	{#if type === 'text' && text_payload}
		<p class="">Payload: {text_payload}</p>
	{:else if type === 'image' && image_url}
		<img src={image_url} class=" mt-4 w-[200px]" alt="payload" />
	{/if}
</section>
