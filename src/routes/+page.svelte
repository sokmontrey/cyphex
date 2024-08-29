<script lang="ts">
	import ImageInput from '$lib/components/ImageInput.svelte';
	import SettingInput from '$lib/components/SettingInput.svelte';

	let input_img_data: ImageData | null = null;
	$: input_size = input_img_data ? 3 * input_img_data.width * input_img_data.height : 0;
	$: available_payload_size = input_size;

	let method = 'lsb';

	let payload_type = 'image';
	let payload_data: ImageData | string | null = null;
</script>

<svelte:head>
	<title>Cyphex</title>
</svelte:head>

<div>
	<p class="inline">Input Image:</p>
	<ImageInput bind:img_data={input_img_data} />
</div>

<div>
	<p class="inline">Method:</p>
	<select bind:value={method}>
		<option value="lsb">LSB (Least Significant Bit)</option>
	</select>
</div>

<div>
	<p class="inline">Setting:</p>
	<SettingInput bind:value />
</div>

<div>
	<p class="inline">Payload Type:</p>
	<select bind:value={payload_type}>
		<option value="image">Image</option>
		<option value="text">Text</option>
	</select>
</div>

{#if input_img_data}
	<div>
		<p>Input size: {input_size} bytes</p>
		<p>Available payload size: {available_payload_size} bytes ()</p>
	</div>
{/if}

<div>
	<p class="inline">Payload:</p>
	{#if payload_type === 'image'}
		<ImageInput bind:img_data={payload_data} />
	{:else if payload_type === 'text'}
		<input bind:value={payload_data} />
	{/if}
</div>
