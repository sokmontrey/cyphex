<script lang="ts">
	import { decodeImage, encodeImage, type ImageData } from '$lib/utils/image';

	import { stringToByte } from '$lib/utils/text';
	import { splitBytes } from '$lib/utils/byte';

	import { getFileFromTarget, checkSupportedImageType, getImageArrayBuffer } from '$lib/utils/file';
	import { pipeAsync_, bind_, log_, map_, resultToMessage } from '$lib/utils/functional';

	const handleFile = async (e: InputEvent) => {
		const target = e.target as HTMLInputElement;

		const message = await pipeAsync_(
			//
			getFileFromTarget,
			bind_(checkSupportedImageType),
			bind_(getImageArrayBuffer),
			bind_(decodeImage),
			// bind_(apply('Hello world')),
			log_('test'),
			resultToMessage('Successfully apply payload to the image')
		)(target);

		console.log(message);

		// const modified_img = apply(img_data, 'Hello World');
		// const modified_arr_buffer = encodeImage(modified_img);
		//
		// const blob = new Blob([modified_arr_buffer], { type: 'image/png' });
		// const url = URL.createObjectURL(blob);
		// const a = document.createElement('a');
		// a.href = url;
		// a.download = 'something.png';
		// a.click();
		// a.remove();
	};
</script>

<svelte:head>
	<title>Cyphex</title>
</svelte:head>

<div>
	<input type="file" on:change={handleFile} />
</div>
