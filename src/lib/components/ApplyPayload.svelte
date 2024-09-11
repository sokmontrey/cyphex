<script lang="ts">
	import SubHeading from './SubHeading.svelte';
	import ImageInput from './ImageInput.svelte';
	import Info from './Info.svelte';

	import { type ImageData } from 'fast-png';
	import { payloadImageDataToBytes } from '$lib/utils/image';
	import { ResultAdapter_, createPipe_, type Result } from '$lib/utils/functional';
	import { stringToBytes } from '$lib/utils/text';
	import { insertPayloadType } from '$lib/steg_methods/methods';

	let type: 'text' | 'image' = 'image';
	export let payload_to_apply: Result<Uint8Array>;

	let text_payload: string = '';
	let image_data_payload: Result<ImageData>;

	$: if (text_payload) {
		payload_to_apply = createPipe_(
			//
			stringToBytes,
			ResultAdapter_(insertPayloadType('text'))
		)(text_payload);
	}
	$: if (image_data_payload && image_data_payload.is_ok) {
		payload_to_apply = createPipe_(
			//
			ResultAdapter_(payloadImageDataToBytes),
			ResultAdapter_(insertPayloadType('image'))
		)(image_data_payload);
	}

	const changePayloadType = () => {
		type = type === 'text' ? 'image' : 'text';
	};
</script>

<section>
	<SubHeading text={'Payload'} />
	<p class="inp-lbl">Type:&nbsp;</p>
	<button class="pm-btn mb-5" on:click={changePayloadType}>
		{type === 'text' ? 'TEXT' : 'IMAGE'}
	</button>

	<br />

	{#if type === 'text'}
		<Info info={'Text to be hide in your cover image'}>
			<textarea
				bind:value={text_payload}
				placeholder="Your message here..."
				class="outline-none border-l-2 border-zinc-300 py-2 px-4 w-full md:w-1/2"
			/>
		</Info>
	{:else if type === 'image'}
		<Info info={'Image to be hide in your cover image'}>
			<ImageInput bind:img_data={image_data_payload} />
		</Info>
	{/if}
</section>
