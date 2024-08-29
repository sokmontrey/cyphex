<script lang="ts">
	import { getImageDataFromBitmap } from '$lib/utils/image';

	export let img_data: ImageData | null | string = null;

	async function handleFiles(event: any) {
		const file = event.target.files[0];
		const bitmap = await createImageBitmap(file);
		const w = bitmap.width;
		const h = bitmap.height;
		img_data = await getImageDataFromBitmap(bitmap, w, h);
	}
</script>

<input type="file" on:change={handleFiles} />
