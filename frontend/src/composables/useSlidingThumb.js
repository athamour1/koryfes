import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

/**
 * Ένα «χάπι» που γλιστρά στο ενεργό στοιχείο μιας λίστας/ομάδας, αντί το
 * highlight να εμφανίζεται απότομα στο νέο σημείο.
 *
 * Μετρά όποιο στοιχείο ταιριάζει στον `activeSelector` μέσα στο `root` και
 * ξαναμετρά σε κάθε αλλαγή κλάσης/attribute, παιδιών και μεγέθους. Η πρώτη
 * τοποθέτηση γίνεται χωρίς κίνηση (`ready` = false). Το ίδιο το χάπι το
 * ζωγραφίζει ο καλών (absolute μέσα στο root, με το `thumbStyle`).
 */
export function useSlidingThumb(root, activeSelector) {
  const ready = ref(false);
  const box = ref(null);

  const thumbStyle = computed(() =>
    box.value
      ? {
          transform: `translate(${box.value.x}px, ${box.value.y}px)`,
          width: `${box.value.w}px`,
          height: `${box.value.h}px`,
          opacity: 1,
        }
      : { opacity: 0 },
  );

  let frame = 0;
  function measure() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const host = root.value;
      const active = host?.querySelector(activeSelector);
      if (!host || !active) {
        box.value = null;
        return;
      }
      const a = active.getBoundingClientRect();
      const r = host.getBoundingClientRect();
      // Το root μπορεί να κυλά: μετράμε σε σχέση με το περιεχόμενό του.
      box.value = { x: a.left - r.left + host.scrollLeft, y: a.top - r.top + host.scrollTop, w: a.width, h: a.height };
      if (!ready.value) requestAnimationFrame(() => (ready.value = true));
    });
  }

  let mutations = null;
  let resizes = null;

  function detach() {
    mutations?.disconnect();
    resizes?.disconnect();
    mutations = null;
    resizes = null;
  }

  function attach(el) {
    detach();
    mutations = new MutationObserver(measure);
    resizes = new ResizeObserver(measure);
    mutations.observe(el, { subtree: true, attributes: true, attributeFilter: ['class', 'aria-pressed', 'aria-current'], childList: true });
    resizes.observe(el);
    measure();
  }

  onMounted(() => {
    watch(
      root,
      (el) => {
        if (el) attach(el);
        else {
          detach();
          box.value = null;
          ready.value = false;
        }
      },
      { immediate: true },
    );
  });

  onBeforeUnmount(() => {
    cancelAnimationFrame(frame);
    detach();
  });

  return { thumbStyle, ready, measure };
}
