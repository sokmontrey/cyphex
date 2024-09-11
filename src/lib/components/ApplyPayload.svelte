<script lang="ts">
	import SubHeading from './SubHeading.svelte';
	import ImageInput from './ImageInput.svelte';

	import { type ImageData } from 'fast-png';
	import { payloadImageDataToBytes } from '$lib/utils/image';
	import { ResultAdapter_, type Result } from '$lib/utils/functional';
	import { stringToBytes } from '$lib/utils/text';

	let type: 'text' | 'image' = 'image';
	export let payload_to_apply: Result<Uint8Array>;

	let text_payload: string = '';
	let image_data_payload: Result<ImageData>;

	$: if (text_payload) {
		payload_to_apply = stringToBytes(text_payload);
	}
	$: if (image_data_payload && image_data_payload.is_ok) {
		payload_to_apply = ResultAdapter_(payloadImageDataToBytes)(image_data_payload);
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

	{#if type === 'text'}
		<textarea
			bind:value={text_payload}
			placeholder="Your message here..."
			class="outline-none border-l-2 border-zinc-300 py-2 px-4 w-full md:w-1/2"
		/>
	{:else if type === 'image'}
		<ImageInput bind:img_data={image_data_payload} />
	{/if}
</section>
