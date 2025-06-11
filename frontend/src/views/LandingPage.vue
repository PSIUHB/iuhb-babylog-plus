<template>
	<div class="min-h-screen" data-theme="baby-light">
		<!-- Navigation -->
		<div class="navbar bg-base-100 shadow-sm sticky top-0 z-50">
			<div class="navbar-start">
				<a class="btn btn-ghost text-xl font-bold text-primary">
					<img class="babylog-logo" src="./../assets/images/logo/babylogplus.png" alt="BabyLog+ Logo">
				</a>
			</div>
			<div class="navbar-end">
				<div class="hidden lg:flex">
					<ul class="menu menu-horizontal px-1">
						<li><a href="#features" class="text-base-content/70 hover:text-primary">Features</a></li>
						<li><a href="#testimonials" class="text-base-content/70 hover:text-primary">Reviews</a></li>
						<li><a href="#pricing" class="text-base-content/70 hover:text-primary">Pricing</a></li>
					</ul>
				</div>
				<button class="btn btn-primary btn-sm ml-2">Get Started</button>
			</div>
		</div>

		<!-- Hero Section -->
		<div class="hero bg-gradient-to-br from-primary/5 to-secondary/5 min-h-[85vh]">
			<div class="hero-content flex-col lg:flex-row-reverse max-w-6xl mx-auto px-4">
				<div class="flex-1 flex justify-center">
					<div class="relative">
						<!-- Mock Phone Interface -->
						<div class="mockup-phone bg-primary/10 border-primary">
							<div class="camera bg-primary"></div>
							<div class="display">
								<div class="artboard artboard-demo phone-1 bg-base-100">
									<div class="p-4 space-y-3">
										<div class="flex justify-between items-center">
											<h3 class="font-bold text-sm">Today's Care</h3>
											<div class="badge badge-primary badge-sm">Live</div>
										</div>

										<!-- Twin Cards -->
										<div class="space-y-2">
											<div class="card card-compact bg-primary/10 border border-primary/20">
												<div class="card-body">
													<div class="flex items-center gap-2">
														<div class="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs font-bold">
															A
														</div>
														<div class="flex-1">
															<div class="text-xs font-semibold">Anna</div>
															<div class="text-xs text-base-content/60">Last fed: 2h ago</div>
														</div>
													</div>
												</div>
											</div>

											<div class="card card-compact bg-secondary/10 border border-secondary/20">
												<div class="card-body">
													<div class="flex items-center gap-2">
														<div class="w-8 h-8 rounded-full bg-secondary text-secondary-content flex items-center justify-center text-xs font-bold">
															B
														</div>
														<div class="flex-1">
															<div class="text-xs font-semibold">Ben</div>
															<div class="text-xs text-base-content/60">Last fed: 1h ago</div>
														</div>
													</div>
												</div>
											</div>
										</div>

										<div class="flex gap-2">
											<button class="btn btn-primary btn-xs flex-1">🍼 Feed</button>
											<button class="btn btn-secondary btn-xs flex-1">💤 Sleep</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="flex-1 text-center lg:text-left">
					<h1 class="text-4xl lg:text-6xl font-bold text-base-content">
						Care Coordination for
						<span class="text-primary block">Multiple Babies</span>
					</h1>
					<p class="py-6 text-lg text-base-content/70 max-w-xl">
						The digital care documentation app designed specifically for parents of twins, triplets, and higher-order multiples.
						Keep your entire family coordinated with real-time sync and intuitive tracking.
					</p>
					<div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
						<router-link to="/auth/register" class="btn btn-primary btn-lg">
							Get started for free
						</router-link>
					</div>
				</div>
			</div>
		</div>

		<!-- Features Section -->
		<div id="features" class="py-20 bg-gradient-to-br from-secondary/5 to-accent/5">
			<div class="max-w-6xl mx-auto px-4">
				<div class="text-center mb-16">
					<h2 class="text-4xl font-bold text-base-content mb-4">
						Built for Multiple Baby Families
					</h2>
					<p class="text-lg text-base-content/70 max-w-2xl mx-auto">
						Every feature is designed with the unique challenges of caring for multiple babies in mind.
					</p>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					<div
						v-for="(feature, index) in features"
						:key="index"
						class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300"
					>
						<div class="card-body items-center text-center">
							<div class="text-4xl mb-4">{{ feature.icon }}</div>
							<h3 class="card-title text-lg">{{ feature.title }}</h3>
							<p class="text-base-content/70">{{ feature.description }}</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- How It Works Section -->
		<div class="py-20 bg-base-100">
			<div class="max-w-6xl mx-auto px-4">
				<div class="text-center mb-16">
					<h2 class="text-4xl font-bold text-base-content mb-4">
						Simple Steps to Better Care
					</h2>
					<p class="text-lg text-base-content/70">
						Get started in minutes with our intuitive setup process
					</p>
				</div>

				<ul class="steps steps-vertical lg:steps-horizontal w-full">
					<li
						v-for="(step, index) in steps"
						:key="index"
						class="step step-primary"
						:data-content="index + 1"
					>
						<div class="text-left">
							<h3 class="font-bold text-lg">{{ step.title }}</h3>
							<p class="text-base-content/70">{{ step.description }}</p>
						</div>
					</li>
				</ul>
			</div>
		</div>

		<!-- Testimonials Section -->
		<div id="testimonials" class="py-20 bg-gradient-to-br from-accent/5 to-primary/5">
			<div class="max-w-6xl mx-auto px-4">
				<div class="text-center mb-16">
					<h2 class="text-4xl font-bold text-base-content mb-4">
						Loved by Families Worldwide
					</h2>
					<p class="text-lg text-base-content/70">
						See what other parents of multiples are saying about BabyLog+
					</p>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					<div
						v-for="(testimonial, index) in testimonials"
						:key="index"
						class="card bg-base-100 shadow-lg"
					>
						<div class="card-body">
							<div class="flex items-center gap-4 mb-4">
								<div class="avatar placeholder">
									<div class="bg-neutral text-neutral-content rounded-full w-12">
										<span class="text-xl">{{ testimonial.avatar }}</span>
									</div>
								</div>
								<div>
									<div class="font-bold">{{ testimonial.name }}</div>
									<div class="text-sm text-base-content/60">{{ testimonial.role }}</div>
								</div>
							</div>
							<p class="text-base-content/80">"{{ testimonial.text }}"</p>
							<div class="card-actions justify-end">
								<div class="rating rating-sm">
									<input type="radio" name="rating-1" class="mask mask-star-2 bg-warning" disabled checked />
									<input type="radio" name="rating-1" class="mask mask-star-2 bg-warning" disabled checked />
									<input type="radio" name="rating-1" class="mask mask-star-2 bg-warning" disabled checked />
									<input type="radio" name="rating-1" class="mask mask-star-2 bg-warning" disabled checked />
									<input type="radio" name="rating-1" class="mask mask-star-2 bg-warning" disabled checked />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Pricing Section -->
		<div id="pricing" class="py-20 bg-base-100">
			<div class="max-w-4xl mx-auto px-4">
				<div class="text-center mb-16">
					<h2 class="text-4xl font-bold text-base-content mb-4">
						Simple, Fair Pricing
					</h2>
					<p class="text-lg text-base-content/70">
						Choose the plan that works best for your family
					</p>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
					<div class="card bg-base-100 shadow-lg border border-base-300">
						<div class="card-body">
							<h3 class="card-title text-2xl">Free Plan</h3>
							<div class="text-4xl font-bold text-primary my-4">
								€0<span class="text-lg font-normal text-base-content/60">/month</span>
							</div>
							<ul class="space-y-3">
								<li class="flex items-center gap-2">
									<svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
									</svg>
									Up to 2 babies
								</li>
								<li class="flex items-center gap-2">
									<svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
									</svg>
									Basic care tracking
								</li>
								<li class="flex items-center gap-2">
									<svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
									</svg>
									Up to 2 caregivers
								</li>
							</ul>
							<div class="card-actions justify-end mt-6">
								<button class="btn btn-outline btn-block">Get Started Free</button>
							</div>
						</div>
					</div>

					<div class="card bg-base-100 shadow-xl border-2 border-primary relative">
						<div class="badge badge-primary absolute -top-3 left-1/2 transform -translate-x-1/2">
							Most Popular
						</div>
						<div class="card-body">
							<h3 class="card-title text-2xl">Premium Plan</h3>
							<div class="text-4xl font-bold text-primary my-4">
								€9.99<span class="text-lg font-normal text-base-content/60">/month</span>
							</div>
							<ul class="space-y-3">
								<li class="flex items-center gap-2">
									<svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
									</svg>
									Unlimited babies
								</li>
								<li class="flex items-center gap-2">
									<svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
									</svg>
									Advanced analytics
								</li>
								<li class="flex items-center gap-2">
									<svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
									</svg>
									Unlimited caregivers
								</li>
								<li class="flex items-center gap-2">
									<svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
									</svg>
									Export data for doctors
								</li>
								<li class="flex items-center gap-2">
									<svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
									</svg>
									Priority support
								</li>
							</ul>
							<div class="card-actions justify-end mt-6">
								<button class="btn btn-primary btn-block">Start Free Trial</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- CTA Section -->
		<div class="py-20 bg-gradient-to-r from-primary to-secondary text-primary-content">
			<div class="max-w-4xl mx-auto px-4 text-center">
				<h2 class="text-4xl font-bold mb-6">
					Ready to Simplify Your Multiple Baby Care?
				</h2>
				<p class="text-xl mb-8 opacity-90">
					Join thousands of families who trust BabyLog+ to keep their babies healthy and happy.
				</p>
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<button class="btn btn-accent btn-lg">
						Start Your Free Trial
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</button>
					<button class="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary">
						Schedule Demo Call
					</button>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<footer class="footer footer-center bg-base-200 text-base-content p-10">
			<aside>
				<div class="text-2xl font-bold text-primary mb-4">👶 BabyLog+</div>
				<p class="font-bold">
					Digital Care Documentation for Multiple Baby Families
				</p>
				<p>Made with ❤️ for parents of twins, triplets, and more</p>
			</aside>
			<nav>
				<div class="grid grid-flow-col gap-4">
					<a href="#" class="link link-hover">Privacy Policy</a>
					<a href="#" class="link link-hover">Terms of Service</a>
					<a href="#" class="link link-hover">Support</a>
					<a href="#" class="link link-hover">Contact</a>
				</div>
			</nav>
			<div class="text-sm text-base-content/60">
				© 2025 BabyLog+ - All rights reserved
			</div>
		</footer>
	</div>
</template>

<script setup>
import { ref } from 'vue'

// Reactive data
const isMenuOpen = ref(false)

const stats = [
	{ title: 'Active Families', value: '2,400+', desc: 'Trust BabyLog+' },
	{ title: 'Babies Tracked', value: '4,800+', desc: 'Around the world' },
	{ title: 'Care Events', value: '1.2M+', desc: 'Logged daily' }
]

const features = [
	{
		icon: '👶',
		title: 'Multi-Child Management',
		description: 'Simultaneously track care events for multiple babies with just one click'
	},
	{
		icon: '🔄',
		title: 'Real-time Sync',
		description: 'All caregivers see new entries instantly across all devices'
	},
	{
		icon: '📊',
		title: 'Intuitive Dashboard',
		description: 'Color-coded overview of all children for quick differentiation'
	},
	{
		icon: '📝',
		title: 'Comprehensive Tracking',
		description: 'Log feedings, sleep, diapers, medications, temperature, and weight'
	},
	{
		icon: '👨‍👩‍👧‍👦',
		title: 'Family Access',
		description: 'Securely invite multiple caregivers including grandparents'
	},
	{
		icon: '📱',
		title: 'Mobile First',
		description: 'Works perfectly on any device - no app store needed'
	}
]

const steps = [
	{
		title: 'Create Your Family',
		description: 'Set up profiles for your babies and invite caregivers'
	},
	{
		title: 'Start Tracking',
		description: 'Log feeding, sleeping, and diaper changes with one tap'
	},
	{
		title: 'Stay Synchronized',
		description: 'Everyone sees updates in real-time across all devices'
	},
	{
		title: 'Analyze Patterns',
		description: 'View insights and export data for pediatrician visits'
	}
]

const testimonials = [
	{
		name: 'Sarah & Michael',
		role: 'Parents of Twins',
		text: 'BabyLog+ saved our sanity! With twins, we were constantly confused about who ate when. Now everything is crystal clear.',
		avatar: '👩‍🦰'
	},
	{
		name: 'Dr. Emma Schmidt',
		role: 'Pediatrician',
		text: 'I recommend BabyLog+ to all my families with multiples. The detailed records help me provide better care.',
		avatar: '👩‍⚕️'
	},
	{
		name: 'James & Lisa',
		role: 'Parents of Triplets',
		text: 'Three babies, four caregivers, one app. BabyLog+ keeps our entire family coordinated perfectly.',
		avatar: '👨‍🦱'
	}
]
</script>

<style scoped>
/* Custom styles can be added here if needed */
.mockup-phone {
	transform: scale(0.8);
}

@media (min-width: 1024px) {
	.mockup-phone {
		transform: scale(1);
	}
}
</style>