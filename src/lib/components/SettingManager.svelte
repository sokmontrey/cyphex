<script lang="ts">
	import type { Methods, Mode } from '$lib/steg_methods/methods';
	import { MethodSettings } from '$lib/steg_methods/methods';
	import SubHeading from './SubHeading.svelte';
	import Info from './Info.svelte';

	export let method: Methods = 'lsb';
	export let mode: Mode = 'apply';

	export let setting_values: any = [];
	$: settings = MethodSettings[method];
	$: setting_values = settings.map((s) => s.value && s.default_value);
</script>

<section>
	<SubHeading text={'Settings'} />
	{#each settings as s}
		<Info info={s.info}>
			<span>
				<p class="inp-lbl">{s.text}:</p>
				{#if s.type === 'number'}
					<input {...s.input_attr} type="number" bind:value={s.value} class="inp" />
				{:else if s.type === 'text'}
					<input {...s.input_attr} type="text" bind:value={s.value} class="inp" />
				{/if}
			</span>
		</Info>
	{/each}
</section>
