<template>
  <div class="avatar" :class="sizeClass">
    <!-- Only show image if it has been successfully preloaded -->
    <img
      v-if="showMainImage"
      :src="validatedImageUrl"
      :alt="alt"
      class="rounded-full w-full h-full object-cover"
    />
    <!-- Show initials avatar as fallback -->
    <img
      v-else
      :src="initialsAvatarUrl" 
      :alt="alt" 
      class="rounded-full w-full h-full object-cover"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import MediaService from '@/services/media.service';
interface Props {
  /**
   * The URL of the avatar image
   */
  src?: string | null;
  /**
   * The name of the user (used for generating initials and alt text)
   */
  name: string;
  /**
   * The size of the avatar
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Background color for initials avatar (hex without #)
   */
  bgColor?: string;
  /**
   * Text color for initials avatar (hex without #)
   */
  textColor?: string;
}
const props = withDefaults(defineProps<Props>(), {
  src: null,
  bgColor: '6366f1', // Default indigo color
  textColor: 'ffffff' // White
});
// Track image validation state
const imageIsValid = ref(false);
const validatedImageUrl = ref('');
const isPreloading = ref(false);
// Get the full avatar URL using MediaService
const avatarUrl = computed(() => {
  if (!props.src) return '';
  return MediaService.getAvatarUrl(props.src);
});
// Generate initials avatar as fallback
const initialsAvatarUrl = computed(() => {
  return MediaService.getInitialsAvatar(props.name, props.bgColor, props.textColor);
});
// Only show main image if it has been successfully validated
const showMainImage = computed(() => {
  return imageIsValid.value && validatedImageUrl.value && !isPreloading.value;
});
// Alt text for accessibility
const alt = computed(() => {
  return `Avatar for ${props.name}`;
});
// Preload and validate image
const preloadImage = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url || url.trim() === '') {
      resolve(false);
      return;
    }
    const img = new Image();
    img.onload = () => {
      // Additional validation: check if image has actual dimensions
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        validatedImageUrl.value = url;
        resolve(true);
      } else {
        resolve(false);
      }
    };
    img.onerror = () => {
      resolve(false);
    };
    // Set a timeout to prevent hanging
    setTimeout(() => {
      resolve(false);
    }, 5000); // 5 second timeout
    img.src = url;
  });
};
// Validate current avatar URL
const validateImage = async () => {
  const url = avatarUrl.value;
  if (!url) {
    imageIsValid.value = false;
    validatedImageUrl.value = '';
    return;
  }
  isPreloading.value = true;
  imageIsValid.value = await preloadImage(url);
  isPreloading.value = false;
};
// Watch for changes in src and revalidate
watch(() => props.src, async () => {
  imageIsValid.value = false;
  validatedImageUrl.value = '';
  await validateImage();
}, { immediate: true });
// Initial validation on mount
onMounted(() => {
  validateImage();
});
// Size class mapping
const sizeClass = computed(() => {
  // If no size is provided, return no size classes to respect parent dimensions
  if (props.size === undefined) {
    return '';
  }
  const sizes = {
    'xs': 'w-8 h-8',
    'sm': 'w-12 h-12',
    'md': 'w-16 h-16',
    'lg': 'w-24 h-24',
    'xl': 'w-32 h-32'
  };
  return sizes[props.size] || sizes.md;
});
</script>
<style scoped>
.avatar {
  display: inline-flex;
  position: relative;
  overflow: hidden;
}
/* Ensure object tag behaves like img */
.avatar object {
  display: block;
}
</style>