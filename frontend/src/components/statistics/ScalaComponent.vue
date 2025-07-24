<template>
	<div
		:class="`scala scala-${status}`"
		class="scala-component"
	>
		<div
			class="scala-range"
			:style="{ left: `${rangeStart}%`, width: `${rangeWidth}%` }"
		></div>
		<div
			class="scala-target"
			:style="{ left: `${targetPos}%` }"
		></div>
		<div
			class="scala-current"
			:style="{ left: `${currentPos}%` }"
		></div>
	</div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
// Props Definition
interface Props {
	rangeStart: number
	rangeEnd: number
	rangeOffset?: number
	target: number
	current: number
}
const props = withDefaults(defineProps<Props>(), {
	rangeOffset: 0
})
// Computed Values
const totalStart = computed(() => props.rangeStart - props.rangeOffset)
const totalEnd = computed(() => props.rangeEnd + props.rangeOffset)
const totalRange = computed(() => totalEnd.value - totalStart.value)
const rangeStart = computed(() =>
	((props.rangeStart - totalStart.value) / totalRange.value) * 100
)
const rangeWidth = computed(() =>
	((props.rangeEnd - props.rangeStart) / totalRange.value) * 100
)
const targetPos = computed(() =>
	((props.target - totalStart.value) / totalRange.value) * 100
)
const currentPos = computed(() =>
	((props.current - totalStart.value) / totalRange.value) * 100
)
// Status Logic
const status = computed(() => {
	if (props.current > props.target) {
		if (props.current <= props.rangeEnd) {
			return 'yellow' // Nach Ziel, aber in Range
		} else {
			return 'red' // Über Range
		}
	}
	return 'green' // Default: vor Ziel
})
</script>