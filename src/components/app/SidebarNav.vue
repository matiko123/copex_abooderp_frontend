<script setup lang="ts">
import SidebarNav from '@/components/app/SidebarNav.vue';
import { useRouter, RouterLink } from 'vue-router'
import { onMounted } from 'vue';

defineProps<{
  menu: {
  	icon: String,
  	text: String,
  	url: String,
  	highlight: Boolean,
  	children: Object
  };
}>();

function subIsActive(urls) {
	var currentRoute = useRouter().currentRoute.value.path;
	var match = false;
	
	for (var x = 0; x < urls.length; x++) {
		if (urls[x].url == currentRoute) {
			match = true;
		}
	}
	
	return match;
}
</script>
<template>
	<!-- menu with submenu -->
	<div v-if="menu.children" class="menu-item has-sub " v-bind:class="{ 'active': subIsActive(menu.children) }" style="cursor: pointer;">
		<a class="menu-link bg-white m-1" style="border-radius: 12px;border-bottom: 2px solid #6B6B6B;">
			<span class="menu-icon" v-if="menu.icon">
				<i v-bind:class="menu.icon"></i>
				<span class="w-5px h-5px rounded-3 bg-theme position-absolute top-0 end-0 mt-3px me-3px" v-if="menu.highlight"></span>
			</span>
			<span class="menu-text">{{ menu.text }}</span>
			<span class="menu-caret" v-if="menu.children"><b class="caret"></b></span>
		</a>
		<div class="menu-submenu " style="cursor: pointer;">
			<template  v-for="(submenu, index) in menu.children">
								<!-- <sidebar-nav class="my-1" style="border-radius: 12px;border-bottom: 2px solid #6B6B6B;;margin-left: -10px;background-color: #D6DDEA;" v-bind:menu="submenu"></sidebar-nav> -->

				<sidebar-nav class="my-1"  v-bind:menu="submenu"></sidebar-nav>
			</template>
		</div>
	</div>
  
	<!-- menu without submenu -->
	<router-link v-else v-bind:to="menu.url" custom v-slot="{ navigate, href, isActive }">
		<div class="menu-item " v-bind:class="{ 'active': isActive }" style="cursor: pointer;">
			<a v-bind:href="href" @click="navigate" class="menu-link bg-white my-1" style="border-radius: 12px;border-bottom: 2px solid #6B6B6B;">
				<span class="menu-icon" v-if="menu.icon">
					<i v-bind:class="menu.icon"></i>
					<span class="menu-icon-label" v-if="menu.label">{{ menu.label }}</span>
				</span>
				<span class="menu-text ">{{ menu.text }}</span>
			</a>
		</div>
	</router-link>
</template>