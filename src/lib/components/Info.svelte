<script lang="ts">
	export let info: string = '';
</script>

<div class="group relative w-full">
	<slot />

	<!--create a floating info box-->
	<span
		class="text-sm text-gray-500 opacity-0 transition-all duration-200 ease-in-out absolute z-10 md:group-hover:opacity-100 px-4 translate-y-1"
	>
		<i class="fa-solid fa-circle-info"></i>
		{info}
	</span>
</div>
