<script lang="ts">
	import { Img } from '$lib/utils/image';
	import { textToByte } from '$lib/utils/text';
	import { splitBytes } from '$lib/utils/byte';

	const payload_raw = textToByte('Hello World');
	const payload_splited = splitBytes(payload_raw, 3);

	async function handleFile(e: any) {
		const file = e.target.files[0];
		const img = await Img.fromFile(file);
		img.decode();
	}
</script>

<svelte:head>
	<title>Cyphex</title>
</svelte:head>

<div>
	<input type="file" on:change={handleFile} />
</div>
