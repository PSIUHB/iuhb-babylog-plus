<template>
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<FeedingScheduleChart />
		<SleepPatternsChart />
	</div>
</template>
<script setup>
import FeedingScheduleChart from '../statistics/FeedingScheduleChart.vue'
import SleepPatternsChart from '../statistics/SleepPatternsChart.vue'
</script>