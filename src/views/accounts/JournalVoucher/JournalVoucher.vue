<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '@/components/DataTable.vue';
import apiClient from '@/config/api';
import { useAuthStore } from '@/stores/auth';
// @ts-ignore composable is JS
import { useNotification } from '@/composables/notification';

// Table config (matches /accounts/list_journal_vouchers)
// Visible columns (in order):
// S/N, JV #, Type, Date, Reference No, Exchange Rate, Amount, Remark, Action
const columns = ref([
  { key: 'sn',                 label: 'S/N', visible: true },
  { key: 'journal_voucher_id', label: 'JV #', visible: true },
  { key: 'transaction_type',   label: 'Type', visible: true },
  { key: 'date',               label: 'Date', visible: true },
  { key: 'reference_number',   label: 'Reference No', visible: true },
  { key: 'exchange_rate',      label: 'Exchange Rate', visible: true },
  { key: 'amount',             label: 'Amount', visible: true },
  { key: 'narration',          label: 'Remark', visible: true },
  { key: 'action',             label: 'Action', visible: true, width: '80px' },
]);

const tableData = ref<Record<string, unknown>[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(15);
const searchQuery = ref('');
const showAdvancedFilters = ref(false);
const showColumnSelector = ref(false);
const showActions = ref(false);
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: 0,
  to: 0,
});

// Auth & notifications
const authStore = useAuthStore();
const { showAlert } = useNotification();

// Router
const router = useRouter();

function openJvModal() {
  // Navigate to form page
  router.push('/accounts/journal-voucher/create');
}

async function loadVouchers() {
  loading.value = true;
  try {
    const res = await apiClient.get('/accounts/list_journal_vouchers', {
      params: {
        page: currentPage.value,
        per_page: pageSize.value,
      },
    });
    const payload = res?.data;
    const data = Array.isArray(payload?.data)
      ? payload.data
      : (Array.isArray(payload) ? payload : []);
    tableData.value = data;
    
    // Extract pagination from API response
    if (payload?.pagination) {
      pagination.value = {
        current_page: payload.pagination.current_page ?? 1,
        last_page: payload.pagination.last_page ?? 1,
        per_page: payload.pagination.per_page ?? pageSize.value,
        total: payload.pagination.total ?? 0,
        from: payload.pagination.from ?? 0,
        to: payload.pagination.to ?? 0,
      };
    }
  } catch (e) {
    console.error('Failed to load journal vouchers:', e);
    tableData.value = [];
    pagination.value = {
      current_page: 1,
      last_page: 1,
      per_page: pageSize.value,
      total: 0,
      from: 0,
      to: 0,
    };
  } finally {
    loading.value = false;
  }
}

const mappedRows = computed(() => {
  const rows = tableData.value as any[];
  const q = (searchQuery.value || '').toLowerCase().trim();

  // Filter by search text (client-side)
  const filtered = !q
    ? rows
    : rows.filter((r) => {
    const jvId = String(r.journal_voucher_id ?? '');
    const ref = String(r.reference_number ?? '');
    const date = String(r.date ?? '');
    const party = String(r.party ?? '');
    const account = String(r.account ?? '');
    const narration = String(r.narration ?? '');
    const transType = String(r.transaction_type ?? '');
    return (
      jvId.toLowerCase().includes(q) ||
      ref.toLowerCase().includes(q) ||
      date.includes(q) ||
      party.toLowerCase().includes(q) ||
      account.toLowerCase().includes(q) ||
      narration.toLowerCase().includes(q) ||
      transType.toLowerCase().includes(q)
    );
  });

  // Add serial number (S/N) based on current page & per-page
  return filtered.map((row, index) => ({
    ...row,
    sn:
      (pagination.value.current_page - 1) * pagination.value.per_page +
      index +
      1,
  }));
});

function handleSearch() {
  // Client-side search only - no API call needed
  // mappedRows computed will automatically filter
}

function goToPage(page: number) {
  if (page < 1 || page > pagination.value.last_page) return;
  currentPage.value = page;
  loadVouchers();
}

function handleActionsDropdown(event: Event) {
  event.stopPropagation();
  showActions.value = !showActions.value;
}
function closeActionsDropdown() {
  showActions.value = false;
}

function formatAmount(val: unknown): string {
  if (val == null || val === '') return '—';
  const n = typeof val === 'number' ? val : parseFloat(String(val));
  return Number.isNaN(n)
    ? String(val)
    : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function exportJvList() {
  // TODO: export journal vouchers (PDF/Excel) when API available
}

async function printJournalVoucher(journalVoucherId: number) {
  if (!journalVoucherId) {
    showAlert('error', 'Invalid journal voucher ID');
    return;
  }
  try {
    console.log('Printing journal voucher ID:', journalVoucherId);
    const res = await apiClient.get(`/accounts/print_journal_voucher/${journalVoucherId}`, {
      responseType: 'blob',
    });
    console.log('PDF response received:', res);
    
    // Check if response is actually a blob
    if (!(res.data instanceof Blob)) {
      console.error('Response is not a blob:', res.data);
      showAlert('error', 'Invalid PDF response from server');
      return;
    }
    
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    console.log('Opening PDF URL:', url);
    
    const newWindow = window.open(url, '_blank', 'noopener');
    if (!newWindow) {
      showAlert('error', 'Popup blocked. Please allow popups for this site.');
      window.URL.revokeObjectURL(url);
      return;
    }
    
    // Clean up URL after window opens (give it time to load)
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  } catch (e: any) {
    console.error('Failed to print journal voucher:', e);
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      'Failed to print journal voucher.';
    showAlert('error', msg);
  }
}

onMounted(() => {
  document.addEventListener('click', closeActionsDropdown);
  loadVouchers();
});
</script>

<template>
<div class="journal-voucher-page">
    <!-- Breadcrumb -->
    <ul class="breadcrumb mb-3">
      <li class="breadcrumb-item">
        <span style="color: #1F4E8C; font-weight: 500;">Home</span>
      </li>
      <li class="breadcrumb-item">
        <router-link to="/accounts/journal-voucher">journal voucher</router-link>
      </li>
      <li class="breadcrumb-item active">Create Voucher</li>
    </ul>

    <!-- Main Card -->
    <div class="card" ref="dataTable">
      <div class="card-body p-0">
        <!-- Controls Row -->
        <div class="row mb-2 align-items-center px-3 pt-3">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text"><i class="fa fa-search"></i></span>
              <input
                type="text"
                class="form-control"
                placeholder="Search vouchers..."
                v-model="searchQuery"
                @input="handleSearch"
              />
            </div>
          </div>
          <div class="col-md-8 text-end">
            <div class="dropdown d-inline-block me-2">
              <button class="btn btn-light rounded-pill btn-sm me-2" type="button" @click="openJvModal">
                <i class="fa fa-plus"></i> Post Journal Voucher
              </button>
              <button class="btn btn-light rounded-pill  btn-sm dropdown-toggle" type="button" @click="handleActionsDropdown">
                <i class="fa fa-cogs"></i> Actions
              </button>
              <ul v-if="showActions" class="dropdown-menu show" style="min-width: 160px;" @click.stop>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="exportJvList">
                    <i class="fa fa-file-pdf-o"></i> Export PDF
                  </a>
                </li>
              </ul>
            </div>
            <button class="btn btn-secondary btn-sm me-2" @click="showAdvancedFilters = !showAdvancedFilters">
              <i class="fa fa-filter"></i> Filters
            </button>
            <button class="btn btn-secondary btn-sm" @click="showColumnSelector = !showColumnSelector">
              <i class="fa fa-columns"></i>
            </button>
          </div>
        </div>

        <!-- Column Selector -->
        <div v-if="showColumnSelector" class="card mb-2 border mx-3">
          <div class="card-body">
            <h6 class="card-title mb-2">Column Visibility</h6>
            <div class="row">
              <div v-for="col in columns" :key="col.key" class="col-md-3 col-sm-4 col-6">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :id="`col-${col.key}`" v-model="col.visible" />
                  <label class="form-check-label" :for="`col-${col.key}`">{{ col.label }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Filters -->
        <div v-if="showAdvancedFilters" class="card mb-2 border mx-3">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3">
                <select class="form-select" v-model.number="pageSize" @change="loadVouchers">
                  <option :value="15">15 per page</option>
                  <option :value="25">25 per page</option>
                  <option :value="50">50 per page</option>
                  <option :value="100">100 per page</option>
                </select>
              </div>
              <div class="col-md-3 d-flex align-items-end">
                <button class="btn btn-secondary w-50" @click="loadVouchers">Apply</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Loading journal vouchers...</p>
        </div>

        <!-- Data Table -->
        <div v-else-if="mappedRows.length > 0" class="table-responsive">
          <DataTable :columns="columns" :rows="mappedRows" idKey="id">
            <template #cell-sn="{ row }">
              {{ row.sn }}
            </template>
            <template #cell-journal_voucher_id="{ row }">
              {{ row.journal_voucher_id ?? '—' }}
            </template>
            <template #cell-date="{ row }">
              {{ row.date ?? '—' }}
            </template>
            <template #cell-transaction_type="{ row }">
              {{ row.transaction_type ?? '—' }}
            </template>
            <template #cell-amount="{ row }">
              {{ formatAmount(row.amount) }}
            </template>
            <template #cell-exchange_rate="{ row }">
              {{ row.exchange_rate ?? '—' }}
            </template>
            <template #cell-reference_number="{ row }">
              {{ row.reference_number ?? '—' }}
            </template>
            <template #cell-narration="{ row }">
              {{ row.narration ?? '—' }}
            </template>
            <template #cell-action="{ row }">
              <button class="btn btn-link p-0 me-2" title="View"><i class="fa fa-eye"></i></button>
              <button
                class="btn btn-link p-0"
                title="Print"
                @click="printJournalVoucher(row.journal_voucher_id)"
              >
                <i class="fa fa-print"></i>
              </button>
            </template>
          </DataTable>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && mappedRows.length > 0 && pagination.total > 0" class="d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-3 border-top">
          <small class="text-muted">
            Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} entries
          </small>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: pagination.current_page <= 1 }">
                <a class="page-link" href="#" @click.prevent="goToPage(pagination.current_page - 1)">
                  Previous
                </a>
              </li>
              <li class="page-item disabled">
                <span class="page-link">Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page >= pagination.last_page }">
                <a class="page-link" href="#" @click.prevent="goToPage(pagination.current_page + 1)">
                  Next
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading" class="text-center py-5">
          <i class="fa fa-inbox fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No Journal Vouchers Found</h5>
          <p class="text-muted">Try adjusting your filters or post a new voucher</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.journal-voucher-page .card {
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.2rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
.breadcrumb {
  padding: 0;
  margin-bottom: 0.5rem;
  background: transparent;
}
</style>

