<script lang="ts">
	import type { Result } from '$lib/utils/functional';
	import { createAsyncPipe_, ResultAdapter_, SuccessCallback_ } from '$lib/utils/functional';
	import { checkSupportedImageType, getFileFromTarget, getImageArrayBuffer } from '$lib/utils/file';
	import { type ImageData } from 'fast-png';
	import { decodeImage, getImageUrlFromFile } from '$lib/utils/image';

	export let img_data: Result<ImageData>;
	let image_url: string;

	const handleFile = async (e: InputEvent) => {
		const target = e.target as HTMLInputElement;
		let file: File | undefined;

		const decodePipeline = createAsyncPipe_(
			getFileFromTarget,
			ResultAdapter_(checkSupportedImageType),
			SuccessCallback_((file_: File) => (file = file_)),
			ResultAdapter_(getImageArrayBuffer),
			ResultAdapter_(decodeImage)
		);

		const decode_result = await decodePipeline(target);
		img_data = decode_result;

		if (decode_result.is_ok && file !== undefined) {
			image_url = await getImageUrlFromFile(file);
		}
	};
</script>

<input type="file" class="file-inp" on:change={handleFile} />
{#if image_url}
	<img src={image_url} class=" mt-4 w-[200px]" alt="preview" />
{/if}
