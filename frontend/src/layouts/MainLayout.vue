<template>
  <q-layout view="hHh Lpr fFf">
    <q-header class="bg-klados text-klados-on" :class="{ 'is-scrolled': scrolled }" v-if="!isAuthPage">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="drawer = !drawer"
          class="q-mr-sm"
          v-if="authStore.isAuthenticated"
        />

        <q-toolbar-title class="text-weight-medium">
          {{ pageTitle }}
        </q-toolbar-title>

        <!-- Dark Mode Toggle -->
        <q-btn
          flat
          dense
          round
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          @click="toggleDarkMode"
          class="q-ml-sm"
        >
          <q-tooltip>{{ $q.dark.isActive ? $t('navigation.toggleLight') : $t('navigation.toggleDark') }}</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Side Drawer -->
    <!-- Σε μεγάλες οθόνες το συρτάρι «αιωρείται» (app.scss, «Πλωτά πάνελ»):
         τα 12px επιπλέον πλάτος είναι το κενό αριστερά του. -->
    <q-drawer
      ref="drawerRef"
      v-model="drawer"
      :width="$q.screen.lt.md ? 272 : 284"
      :breakpoint="1023"
      show-if-above
      bordered
      v-if="authStore.isAuthenticated && !isAuthPage"
    >
      <!-- Ο περιέκτης του μενού είναι το σημείο αναφοράς του «χαπιού» που
           γλιστρά στο ενεργό στοιχείο (useSlidingThumb). -->
      <div ref="menuEl" class="drawer-menu" :class="{ 'drawer-menu--ready': menuReady }">
        <span class="drawer-menu__thumb" :style="menuThumb" aria-hidden="true" />
      <q-list padding>
        <q-item-label header>{{ $t('navigation.header') }}</q-item-label>

        <template v-if="authStore.isAuthenticated">
          <q-item clickable v-ripple to="/my-progress" active-class="klados-active" v-if="!authStore.isAdmin" data-cy="nav-my-progress">
            <q-item-section avatar>
              <q-icon name="emoji_events" />
            </q-item-section>
            <q-item-section>{{ $t('navigation.myProgress') }}</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/catalog" active-class="klados-active" data-cy="nav-catalog">
            <q-item-section avatar>
              <q-icon name="menu_book" />
            </q-item-section>
            <q-item-section>{{ $t('navigation.progress') }}</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/users" active-class="klados-active" :class="{ 'klados-active': detailOf === '/users' }" data-cy="nav-users">
            <q-item-section avatar>
              <q-icon name="people" />
            </q-item-section>
            <q-item-section>{{ $t('navigation.users') }}</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/my-unit" active-class="klados-active" v-if="authStore.user?.role === 'user' && authStore.user?.unit?.id">
            <q-item-section avatar>
              <q-icon name="groups" />
            </q-item-section>
            <q-item-section>{{ $t('navigation.myUnit') }}</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/profile" active-class="klados-active" data-cy="nav-profile">
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>{{ $t('navigation.profile') }}</q-item-section>
          </q-item>

          <!-- Admin Section -->
          <template v-if="authStore.isAdmin">
            <q-separator class="q-my-md" />
            <q-item-label header>{{ $t('navigation.administration') }}</q-item-label>

            <q-item clickable v-ripple to="/admin/dashboard" active-class="klados-active" data-cy="nav-admin-dashboard">
              <q-item-section avatar>
                <q-icon name="dashboard" />
              </q-item-section>
              <q-item-section>{{ $t('navigation.dashboard') }}</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/admin/units" active-class="klados-active" :class="{ 'klados-active': detailOf === '/admin/units' }" data-cy="nav-admin-units">
              <q-item-section avatar>
                <q-icon name="groups" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('navigation.units') }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/admin/users" active-class="klados-active" data-cy="nav-admin-users">
              <q-item-section avatar>
                <q-icon name="admin_panel_settings" />
              </q-item-section>
              <q-item-section>{{ $t('navigation.adminUsers') }}</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/admin/locations" active-class="klados-active" v-if="authStore.isSuperAdmin" data-cy="nav-admin-locations">
              <q-item-section avatar>
                <q-icon name="location_on" />
              </q-item-section>
              <q-item-section>{{ $t('navigation.locations') }}</q-item-section>
            </q-item>
          </template>

          <q-separator />

          <!-- User Info Header -->
          <q-item-label header class="text-weight-bold">{{ authStore.user?.username || 'User' }}</q-item-label>

          <q-item clickable v-ripple @click="logout" class="text-negative" data-cy="nav-logout">
            <q-item-section avatar>
              <q-icon name="logout" color="negative" />
            </q-item-section>
            <q-item-section>{{ $t('navigation.logout') }}</q-item-section>
          </q-item>
        </template>

        <template v-else>
          <q-item clickable v-ripple to="/login" active-class="klados-active">
            <q-item-section avatar>
              <q-icon name="login" />
            </q-item-section>
            <q-item-section>{{ $t('navigation.login') }}</q-item-section>
          </q-item>
        </template>
      </q-list>
      </div>
    </q-drawer>

    <q-page-container ref="pageContainer">
      <!-- Μικρή μετάβαση ανάμεσα σε σελίδες: fade με ελαφρύ ανέβασμα, 160ms.
           Every page needs a single root element: a comment above it makes it
           a fragment in dev, the out-in leave never ends and the next page stays blank. -->
      <router-view v-slot="{ Component, route: viewRoute }">
        <transition name="tf-page" mode="out-in">
          <component :is="Component" :key="String(viewRoute.params.id ?? viewRoute.name ?? viewRoute.path)" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- PWA Install Prompt -->
    <PWAInstallPrompt />

    <!-- γιορτή για νέο ορόσημο (Υπόσχεση, Κορυφή, πτυχίο μετά τη Γ') -->
    <CelebrationDialog :celebration="celebrations.current.value" @done="celebrations.next" />
  </q-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import PWAInstallPrompt from '@/components/PWAInstallPrompt.vue';
import CelebrationDialog from '@/components/CelebrationDialog.vue';
import { useCelebrations } from '@/composables/useCelebrations';
import { useSlidingThumb } from '@/composables/useSlidingThumb';
import { useThemeColor } from '@/composables/useThemeColor';
import { usePwaUpdatePrompt } from '@/composables/usePwaUpdatePrompt';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const { t } = useI18n();

// Open drawer by default on desktop (>768px), closed on mobile
const drawer = ref($q.screen.gt.sm);

/**
 * Σελίδες λεπτομέρειας → ο σύνδεσμος του μενού στον οποίο «ανήκουν», ώστε το
 * χάπι να μένει εκεί (προφίλ μέλους → Χρήστες, ενωμοτία → Ενωμοτίες).
 */
const detailOf = computed(() => {
  if (route.path.startsWith('/user/')) return '/users';
  if (route.path.startsWith('/units/')) return '/admin/units';
  return null;
});

/** Το χάπι του ενεργού στοιχείου στο μενού. */
const menuEl = ref(null);
const { thumbStyle: menuThumb, ready: menuReady } = useSlidingThumb(menuEl, '.klados-active');

/**
 * «Ζελέ» στο άνοιγμα του συρταριού: η κλάση μπαίνει μόνο όσο κρατά η κίνηση,
 * ώστε το overshoot να μην αγγίζει αλλαγές μεγέθους παραθύρου. Απευθείας στο
 * DOM, γιατί η QDrawer δεν περνά `class` στο root της.
 */
const drawerRef = ref(null);
let drawerBounceTimer = null;
watch(drawer, (open) => {
  const el = drawerRef.value?.$el;
  if (!el) return;
  clearTimeout(drawerBounceTimer);
  el.classList.toggle('drawer-bounce', open);
  el.classList.toggle('drawer-bounce-out', !open);
  drawerBounceTimer = setTimeout(() => el.classList.remove('drawer-bounce', 'drawer-bounce-out'), 900);
});

/**
 * Η μπάρα βαθαίνει τη σκιά της μόλις το περιεχόμενο κυλήσει από κάτω της. Το
 * scroll ζει στον q-page-container (ή στην κάρτα της σελίδας σε μεγάλες
 * οθόνες), γι' αυτό ακούμε εκεί με capture.
 */
const scrolled = ref(false);
const pageContainer = ref(null);
onMounted(() => {
  pageContainer.value?.$el?.addEventListener(
    'scroll',
    (event) => { scrolled.value = event.target.scrollTop > 4; },
    { passive: true, capture: true },
  );
});

// Check if current route is the login page
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/';
});

// η μπάρα του συστήματος ακολουθεί ό,τι φαίνεται στην κορυφή (header ή φόντο)
useThemeColor(computed(() => !isAuthPage.value), computed(() => $q.dark.isActive));
usePwaUpdatePrompt();

// Οι Οδηγοί βλέπουν γιορτή για ό,τι νέο τους απονεμήθηκε, με το άνοιγμα της
// εφαρμογής και όταν αυτή επιστρέφει στο προσκήνιο
const celebrations = useCelebrations();
const checkCelebrations = () => {
  if (authStore.user?.role === 'user' && document.visibilityState === 'visible') celebrations.check();
};
watch(() => authStore.user?.id, checkCelebrations, { immediate: true });
document.addEventListener('visibilitychange', checkCelebrations);
onBeforeUnmount(() => document.removeEventListener('visibilitychange', checkCelebrations));

// Watch for authentication changes and open drawer on login
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated && !isAuthPage.value) {
    drawer.value = true;
  }
});

// Τίτλος μπάρας: «Οδηγοί · Σελίδα» (στο κινητό μόνο η σελίδα).
const pageTitle = computed(() => {
  const page = route.meta.titleKey ? t(route.meta.titleKey) : null;
  if (!page) return t('navigation.title');
  return $q.screen.lt.sm ? page : `${t('navigation.title')} · ${page}`;
});

// Initialize dark mode from localStorage
const savedDarkMode = localStorage.getItem('darkMode');
if (savedDarkMode !== null) {
  $q.dark.set(savedDarkMode === 'true');
}

const toggleDarkMode = () => {
  $q.dark.toggle();
  localStorage.setItem('darkMode', $q.dark.isActive);
};

const logout = () => {
  authStore.logout();
  router.push('/login');
  drawer.value = false;
};
</script>
