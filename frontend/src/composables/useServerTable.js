import { ref, computed, watch } from 'vue';
import { api } from '@/api';

/**
 * QTable with paging, sorting and search on the server. `params` returns the
 * page's filters (a change reloads from page 1). Pass to the table:
 *   v-model:pagination="pagination" :rows="rows" :loading="loading" @request="onRequest"
 * While loading, `rows` holds placeholder rows for a skeleton body.
 */
export function useServerTable(url, { params = () => ({}), rowsPerPage = 10, sortBy = null, onError = null } = {}) {
  const pagination = ref({ page: 1, rowsPerPage, sortBy, descending: false, rowsNumber: 0 });
  const items = ref([]);
  const loading = ref(false);
  let requestId = 0;

  const placeholders = computed(() => Array.from(
    { length: Math.min(pagination.value.rowsPerPage || rowsPerPage, 10) },
    (_, i) => ({ id: `skeleton-${i}` }),
  ));
  const rows = computed(() => (loading.value ? placeholders.value : items.value));

  const onRequest = async ({ pagination: next }) => {
    const id = ++requestId;
    loading.value = true;
    try {
      const { data } = await api.get(url, {
        params: {
          ...params(),
          page: next.page,
          // rowsPerPage 0 is QTable's «all»; the server caps a page at 100
          limit: next.rowsPerPage || 100,
          sortBy: next.sortBy || undefined,
          descending: next.sortBy ? next.descending : undefined,
        },
      });
      // a newer request (filter typed meanwhile) wins
      if (id !== requestId) return;
      // the last row of the last page was deleted: show the page before it
      if (!data.items.length && data.total > 0 && next.page > 1) {
        const lastPage = Math.ceil(data.total / (next.rowsPerPage || 100));
        return onRequest({ pagination: { ...next, page: Math.min(next.page - 1, lastPage) } });
      }
      items.value = data.items;
      pagination.value = { ...next, rowsNumber: data.total };
    } catch (error) {
      console.error(`Fetch ${url} failed`, error);
      if (id === requestId) {
        items.value = [];
        onError?.(error);
      }
    } finally {
      if (id === requestId) loading.value = false;
    }
  };

  const refresh = () => onRequest({ pagination: pagination.value });

  // a new filter starts from the first page
  watch(params, () => onRequest({ pagination: { ...pagination.value, page: 1 } }), { deep: true });

  return { pagination, rows, items, loading, onRequest, refresh };
}
