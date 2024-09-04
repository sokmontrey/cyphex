<script lang="ts">
	import { decode, encode } from 'fast-png';
	import { textToByte } from '$lib/utils/text';
	import { splitBytes, createMask } from '$lib/utils/byte';

	function apply(cover: Uint8ClampedArray, payload: string) {
		const payload_raw = textToByte(payload);
		const payload_splited = splitBytes(payload_raw, 3);
		if (payload_splited.length > cover.length) throw new Error('Payload is too large');
		const mask = createMask(3);
		for (let i = 0; i < payload_splited.length; i++) {
			cover[i] &= ~mask;
			cover[i] |= payload_splited[i];
		}
		return cover;
	}

	async function handleFile(e: any) {
		const file = e.target.files[0];
		const original_arr_buffer = await file.arrayBuffer();
		const img = decode(original_arr_buffer);
		apply(img.data as Uint8ClampedArray, 'Hello World');
		const modified_arr_buffer = encode(img);
		const blob = new Blob([modified_arr_buffer], { type: 'image/png' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'something.png';
		a.click();
		a.remove();
	}
</script>

<svelte:head>
	<title>Cyphex</title>
</svelte:head>

<div>
	<input type="file" on:change={handleFile} />
</div>
