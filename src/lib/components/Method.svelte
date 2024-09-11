<script lang="ts">
	import type { Methods, Mode } from '$lib/steg_methods/methods';
	import { method_list, method_info, mode_info } from '$lib/steg_methods/methods';

	import SubHeading from './SubHeading.svelte';
	import Info from './Info.svelte';

	export let method: Methods = 'lsb';
	export let mode: Mode = 'apply';

	const changeMode = () => {
		mode = mode === 'apply' ? 'extract' : 'apply';
	};
</script>

<section class="">
	<div class="flex items-center">
		<SubHeading text={'Method:'} />

		<Info info={method_info[method]}>
			<select value="lsb" class="px-4 pm-btn ml-4">
				{#each method_list as m}
					<option value={m.name}>{m.text}</option>
				{/each}
			</select>
		</Info>
	</div>

	<br />

	<div class="flex items-center w-full">
		<SubHeading text={'Mode:'} />

		<Info info={mode_info[mode]}>
			<button on:click={changeMode} class="outline-none sd-btn">
				{mode === 'apply' ? 'APPLY' : 'EXTRACT'}
			</button>
		</Info>
	</div>
</section>
