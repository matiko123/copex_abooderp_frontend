
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { usePetaApi } from '@/composables/usePetaApi';
import DataTable from '@/components/DataTable.vue';
import { useRouter, useRoute } from 'vue-router';

const $router = useRouter();
const $route = useRoute();
const api = usePetaApi();

const columns = ref([
  { key: 'invoice_number', label: 'Invoice #', visible: true },
  { key: 'invoice_type', label: 'Type', visible: true },
  { key: 'tenant_name', label: 'Tenant', visible: true },
  { key: 'unit_name', label: 'Unit', visible: true },
  { key: 'invoice_amount', label: 'Amount', visible: true },
  // { key: 'paid_amount', label: 'Paid Amount', visible: true },
  { key: 'invoice_date', label: 'Start Date', visible: true },
  { key: 'due_date', label: 'End Date', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'action', label: 'Action', visible: true, width: '100px' }
]);

const invoicesData = ref<any[]>([]);
const allInvoicesData = ref<any[]>([]); // Store all invoices for frontend filtering
const pagination = ref<any>({ total: 0, page: 1, per_page: 15, last_page: 1, from: 0, to: 0 });
const isLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(15);
const statusFilter = ref('');
const showAdvancedFilters = ref(false);
const showColumnSelector = ref(false);
const showActions = ref(false);
const searchQuery = ref('');

function formatAmountWithCurrency(amount: unknown, currency: string | null | undefined): string {
  if (amount == null || amount === '') return '—';
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount));
  if (Number.isNaN(num)) return String(amount);
  const formatted = num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${formatted} ${currency}` : formatted;
}

// Frontend filtering and pagination
const filteredInvoices = computed(() => {
  let filtered = allInvoicesData.value || [];
  
  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter((inv: any) => {
      const status = String(inv.status || '').toLowerCase().trim();
      return status === statusFilter.value.toLowerCase();
    });
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    filtered = filtered.filter((inv: any) => {
      return (
        String(inv.invoice_number || '').toLowerCase().includes(q) ||
        String(inv.invoice_type || '').toLowerCase().includes(q) ||
        String(inv.tenant?.name || '').toLowerCase().includes(q) ||
        String(inv.property?.name || '').toLowerCase().includes(q) ||
        String(inv.unit?.name || '').toLowerCase().includes(q)
      );
    });
  }
  
  return filtered;
});

const mappedInvoices = computed(() => {
  // Apply frontend pagination
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  const paginated = filteredInvoices.value.slice(start, end);
  
  return paginated.map((inv: any) => ({
    id: inv.id,
    invoice_number: inv.invoice_number,
    invoice_type: inv.invoice_type,
    invoice_date: inv.invoice_date,
    due_date: inv.due_date,
    invoice_amount: inv.invoice_amount,
    // paid_amount: inv.paid_amount,
    balance_amount: inv.balance_amount,
    currency: inv.currency ?? 'TZS',
    status: inv.status,
    property_name: inv.property?.name,
    tenant_name: inv.tenant?.name,
    unit_name: inv.unit?.name,
    payments_count: inv.payments_count,
    action: inv // pass the whole invoice for action column
  }));
});

const frontendPagination = computed(() => {
  const total = filteredInvoices.value.length;
  const lastPage = total === 0 ? 1 : Math.ceil(total / pageSize.value);
  const from = total === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1;
  const to = Math.min(currentPage.value * pageSize.value, total);
  
  return {
    total,
    page: currentPage.value,
    per_page: pageSize.value,
    last_page: lastPage,
    from,
    to
  };
});

const fetchInvoices = async () => {
  isLoading.value = true;
  try {
    const filters: any = {};
    // Don't send status filter to API - filter on frontend
    // Apply report filters from route query (from Reports page sidebar)
    const q = $route.query;
    if (q.date_from) filters.date_from = q.date_from;
    if (q.date_to) filters.date_to = q.date_to;
    if (q.tenant_id) filters.tenant_id = q.tenant_id;
    if (q.property_id) filters.property_id = q.property_id;
    // Fetch all invoices (large page size) for frontend filtering
    const result = await api.getInvoicesList(1, 1000, filters);
    if (result) {
      allInvoicesData.value = result.data || [];
      invoicesData.value = result.data || [];
      pagination.value = result.pagination || { total: 0, page: 1, per_page: 15, last_page: 1, from: 0, to: 0 };
      // Reset to page 1 when data changes
      currentPage.value = 1;
    }
  } finally {
    isLoading.value = false;
  }
};




const viewInvoice = (id: number | string) => {
  $router.push(`/accounts/bills-invoices/${id}`);
};

/** Background class for the Type cell only (to differentiate Service Charge vs Rent) */
function getInvoiceTypeBadgeClass(invoiceType?: string): string {
  const t = String(invoiceType || '').toUpperCase().trim();
  if (t.includes('SERVICE') && t.includes('CHARGE')) return 'invoice-type-badge service-charge';
  if (t.includes('RENT')) return 'invoice-type-badge rent';
  return 'invoice-type-badge other';
}

/** Background class for the Status cell (paid = success, pending = warning) */
function getStatusBadgeClass(status?: string): string {
  const s = String(status || '').toLowerCase().trim();
  if (s === 'paid') return 'status-badge paid';
  if (s === 'pending') return 'status-badge pending';
  if (s === 'overdue') return 'status-badge overdue';
  return 'status-badge other';
}

const handleSearch = () => {
  currentPage.value = 1;
  // No need to fetch - filtering happens in computed property
};

function goToPage(page: number) {
  const lastPage = frontendPagination.value.last_page;
  if (page < 1 || page > lastPage) return;
  currentPage.value = page;
  // No need to fetch - pagination happens in computed property
}

function handleActionsDropdown(event: Event) {
  event.stopPropagation();
  showActions.value = !showActions.value;
}
function closeActionsDropdown() {
  showActions.value = false;
}
onMounted(() => {
  document.addEventListener('click', closeActionsDropdown);
  fetchInvoices();
});

watch(() => $route.query, () => {
  currentPage.value = 1;
  fetchInvoices();
}, { deep: true });

function exportToPDF() {
  window.open('/api/v1/invoices?is_count=0', '_blank');
}
</script>

<template>
  <div class="bills-invoices-page">
    <!-- Breadcrumb -->
    <ul class="breadcrumb mb-3">
      <li class="breadcrumb-item">
        <span style="color: #1F4E8C; font-weight: 500;">Home</span>
      </li>
      <li class="breadcrumb-item active">Bills & Invoices</li>
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
                placeholder="Search invoices..." 
                v-model="searchQuery"
                @input="handleSearch"
              />
            </div>
          </div>
          <div class="col-md-8 text-end">
            <div class="dropdown d-inline-block me-2">
              <button class="btn btn-light rounded-pill p-2 btn-sm me-2" type="button" >
                <i class="fa fa-plus"></i> New Invoice
              </button>
              <button class="btn btn-light rounded-pill p-2 btn-sm dropdown-toggle" type="button" @click="handleActionsDropdown">
                <i class="fa fa-cogs"></i> Actions
              </button>
              <ul v-if="showActions" class="dropdown-menu show" style="min-width: 160px;" @click.stop>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="exportToPDF"><i class="fa fa-file-pdf-o"></i> Export PDF</a>
                </li>
              </ul>
            </div>
            <button class="btn btn-light p-2 rounded-pill btn-sm me-2" @click="showAdvancedFilters = !showAdvancedFilters">
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
                  <input class="form-check-input" type="checkbox" :id="`col-${col.key}`" v-model="col.visible">
                  <label class="form-check-label" :for="`col-${col.key}`">{{ col.label }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Filters -->
        <div v-if="showAdvancedFilters" class="card mb-2 border mx-3">
          <div class="card-body">
            <div class="row g-3 align-items-end">
              <div class="col-md-3">
                <label class="form-label small mb-1">Per page</label>
                <select class="form-select" v-model.number="pageSize" @change="currentPage = 1">
                  <option :value="15">15 per page</option>
                  <option :value="25">25 per page</option>
                  <option :value="50">50 per page</option>
                  <option :value="100">100 per page</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label small mb-1">Status</label>
                <select class="form-select" v-model="statusFilter" @change="currentPage = 1">
                  <option value="">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="draft">Draft</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Loading invoices...</p>
        </div>

        <!-- Data Table (Reusable Component) -->
        <div v-else-if="mappedInvoices.length > 0" class="table-wrapper">
          <div class="table-responsive">
            <DataTable :columns="columns" :rows="mappedInvoices" idKey="invoice_number">
              <template #cell-invoice_type="{ row }">
                <span :class="getInvoiceTypeBadgeClass(row.invoice_type)">{{ row.invoice_type || '—' }}</span>
              </template>
              <template #cell-invoice_amount="{ row }">
                {{ formatAmountWithCurrency(row.invoice_amount, row.currency) }}
              </template>
              <template #cell-paid_amount="{ row }">
                {{ formatAmountWithCurrency(row.paid_amount, row.currency) }}
              </template>
              <template #cell-status="{ row }">
                <span :class="getStatusBadgeClass(row.status)">{{ row.status || '—' }}</span>
              </template>
              <template #cell-action="{ row }">
                <button class="btn btn-link p-0 me-2" title="View" @click="viewInvoice(row.id )"><i class="fa fa-eye"></i></button>
                <button class="btn btn-link p-0" title="Print"><i class="fa fa-print"></i></button>
              </template>
            </DataTable>
          </div>
          <!-- Pagination footer -->
          <div class="d-flex justify-content-between align-items-center px-3 py-2 border-top small">
            <div class="text-muted">
              Showing
              <strong>{{ frontendPagination.from || 0 }}</strong>
              -
              <strong>{{ frontendPagination.to || 0 }}</strong>
              of
              <strong>{{ frontendPagination.total || 0 }}</strong>
              invoices
            </div>
            <div class="btn-group btn-group-sm">
              <button
                class="btn btn-outline-secondary"
                :disabled="currentPage <= 1"
                @click="goToPage(currentPage - 1)"
              >
                <i class="fa fa-chevron-left me-1"></i> Prev
              </button>
              <span class="btn btn-outline-secondary disabled py-2">
                Page {{ currentPage }} of {{ frontendPagination.last_page || 1 }}
              </span>
              <button
                class="btn btn-outline-secondary"
                :disabled="currentPage >= frontendPagination.last_page"
                @click="goToPage(currentPage + 1)"
              >
                Next <i class="fa fa-chevron-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-5">
          <i class="fa fa-inbox fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No Invoices Found</h5>
          <p class="text-muted">Try adjusting your filters</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.contracts-page {
  padding: 0;
}

.breadcrumb {
  padding: 0;
  margin-bottom: 0.5rem;
  background: transparent;
}

.page-header {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--bs-body-color);
}

.card {
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.2rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;
}
.sortable:hover {
  background-color: rgba(0, 0, 0, 0.075);
}

.table-hover tbody tr {
  transition: background-color 0.15s ease;
}
.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.035);
}

/* Invoice type badge – background only on the Type cell text */
:deep(.invoice-type-badge) {
  display: inline-block;
  padding: 0.2em 0.5em;
  border-radius: 0.25rem;
  font-size: 0.85em;
}
:deep(.invoice-type-badge.service-charge) {
  background-color: var(--bs-primary, #0d6efd);
  color: #fff;
}
:deep(.invoice-type-badge.rent) {
  background-color: var(--bs-warning, #ffc107);
  color: #000;
}
:deep(.invoice-type-badge.other) {
  background-color: #ffecb3;
  color: #f57f17;
}

/* Status badge – paid = success (green), pending = warning */
:deep(.status-badge) {
  display: inline-block;
  padding: 0.2em 0.5em;
  border-radius: 0.25rem;
  font-size: 0.85em;
}
:deep(.status-badge.paid) {
  background-color: var(--bs-success, #198754);
  color: #fff;
}
:deep(.status-badge.pending) {
  background-color: var(--bs-warning, #ffc107);
  color: #000;
}
:deep(.status-badge.draft) {
  background-color: var(--bs-secondary, #6c757d);
  color: #fff;
}
:deep(.status-badge.overdue) {
  background-color: var(--bs-danger, #dc3545);
  color: #fff;
}
:deep(.status-badge.other) {
  background-color: #e9ecef;
  color: #495057;
}

/* Table */

.table th {
  font-size: 0.35rem;
  font-weight: 500;
  padding: 2px !important;
}

.table td {
  font-size: 0.25rem !important;
}

code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  color: var(--bs-code-color);
}

.badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.375em 0.75em;
  border-radius: 0.25rem;
}

.pagination {
  margin: 0;
}
.pagination .page-link {
  color: var(--bs-primary);
  border-color: var(--bs-border-color);
}
.pagination .page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: white;
}
.pagination .page-item.disabled .page-link {
  color: var(--bs-secondary);
  pointer-events: none;
  background-color: var(--bs-light);
}

.btn-outline-theme {
  border-color: var(--bs-primary);
  color: var(--bs-primary);
}
.btn-outline-theme:hover {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: white;
}

.input-group-text {
  background-color: var(--bs-light);
  border-color: var(--bs-border-color);
}

.form-check-input:checked {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.text-dark {
  color: #212529 !important;
}

@media (max-width: 768px) {
  .page-header {
    font-size: 1.5rem;
  }
  .d-flex.gap-2 {
    flex-wrap: wrap;
  }
}
</style>
