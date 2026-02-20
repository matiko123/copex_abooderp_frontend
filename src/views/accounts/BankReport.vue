<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import apiClient from '@/config/api';

const router = useRouter();
const route = useRoute();

const reportType = computed(() => (route.query.report_type as string) || 'SUMMARY');
const dateFrom = computed(() => (route.query.date_from as string) || '');
const dateTo = computed(() => (route.query.date_to as string) || '');
const accountId = computed(() => (route.query.account_id as string) || '');
const isDetailed = computed(() => reportType.value === 'DETAILED');
const missingAccountForDetailed = computed(() => isDetailed.value && !accountId.value);

const reportData = ref<Record<string, unknown> | unknown[] | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function fetchReport() {
  loading.value = true;
  error.value = null;
  reportData.value = null;
  try {
    const params: Record<string, string> = {
      report_type: reportType.value === 'DETAILED' ? 'DETAILED' : 'SUMMARY',
    };
    if (dateFrom.value) params.date_from = dateFrom.value;
    if (dateTo.value) params.date_to = dateTo.value;
    if (isDetailed.value && accountId.value) params.account_id = accountId.value;

    const res = await apiClient.get('/banks/balance', { params });
    const data = res?.data;
    reportData.value = (data?.data !== undefined ? data.data : data) ?? null;
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number }; message?: string };
    error.value = err?.response?.data?.message || err?.message || 'Failed to load bank report.';
    reportData.value = null;
  } finally {
    loading.value = false;
  }
}

const printingPdf = ref(false);

async function printReport() {
  printingPdf.value = true;
  try {
    const params: Record<string, string> = {
      report_type: reportType.value === 'DETAILED' ? 'DETAILED' : 'SUMMARY',
      format: 'pdf',
    };
    if (dateFrom.value) params.date_from = dateFrom.value;
    if (dateTo.value) params.date_to = dateTo.value;
    if (isDetailed.value && accountId.value) params.account_id = accountId.value;

    const res = await apiClient.get('/banks/balance', { params, responseType: 'blob' });
    const url = URL.createObjectURL(res.data as Blob);
    window.open(url, '_blank', 'noopener');
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string };
    error.value = err?.response?.data?.message || err?.message || 'Failed to open PDF.';
  } finally {
    printingPdf.value = false;
  }
}

onMounted(() => {
  if (!missingAccountForDetailed.value) fetchReport();
});

watch(
  () => ({ ...route.query }),
  () => {
    if (!missingAccountForDetailed.value) fetchReport();
  },
  { deep: true }
);

const reportRows = computed(() => {
  const d = reportData.value;
  if (Array.isArray(d)) return d as Record<string, unknown>[];
  if (d && typeof d === 'object' && !Array.isArray(d)) {
    const obj = d as Record<string, unknown>;
    if (Array.isArray(obj.rows)) return obj.rows as Record<string, unknown>[];
    if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[];
    if (Array.isArray(obj.balances)) return obj.balances as Record<string, unknown>[];
  }
  return [];
});

const reportTableKeys = computed(() => {
  const rows = reportRows.value;
  if (rows.length === 0) return [];
  const keys = new Set<string>();
  rows.forEach((r) => Object.keys(r || {}).forEach((k) => keys.add(k)));
  return Array.from(keys);
});

const hasReportContent = computed(() => {
  if (reportRows.value.length > 0) return true;
  const d = reportData.value;
  return d !== null && typeof d === 'object' && Object.keys(d as object).length > 0;
});
</script>

<template>
  <div class="bank-report-page">
    <ul class="breadcrumb mb-3 no-print">
      <li class="breadcrumb-item">
        <span style="color: #1F4E8C; font-weight: 500;">Home</span>
      </li>
      <li class="breadcrumb-item">
        <router-link to="/reports">Reports</router-link>
      </li>
      <li class="breadcrumb-item active">Bank Report</li>
    </ul>

    <div class="card">
      <div class="card-body">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 no-print">
          <div>
            <h5 class="card-title mb-2">Bank Report</h5>
            <p class="text-muted mb-0 small">View bank balances and bank-related reports.</p>
          </div>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-outline-primary btn-sm" @click="router.push('/reports')">
              <i class="fa fa-arrow-left me-1"></i> Back to Reports
            </button>
            <button type="button" class="btn btn-primary btn-sm" @click="printReport" :disabled="loading || printingPdf || missingAccountForDetailed">
              <i class="fa fa-print me-1"></i> {{ printingPdf ? 'Opening PDF…' : 'Print Report' }}
            </button>
          </div>
        </div>

        <div v-if="reportType || isDetailed" class="small text-muted mb-3 report-meta">
          <span class="badge bg-primary me-2">Report type: {{ reportType }}</span>
          <template v-if="dateFrom || dateTo">
            <span class="me-2">Date: {{ dateFrom || '—' }} to {{ dateTo || '—' }}</span>
          </template>
          <template v-if="isDetailed">
            <span v-if="accountId">Account ID: {{ accountId }}</span>
            <span v-else>All accounts</span>
          </template>
        </div>

        <div v-if="missingAccountForDetailed" class="alert alert-warning mb-0">
          <strong>Account required.</strong> For a detailed report you must select one account. Go back to Reports and choose Report type “DETAILED”, then select an account before viewing or printing.
          <div class="mt-2">
            <button type="button" class="btn btn-sm btn-outline-primary" @click="router.push('/reports')">
              <i class="fa fa-arrow-left me-1"></i> Back to Reports
            </button>
          </div>
        </div>

        <div v-else-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted mb-0">Loading bank report...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-else-if="reportRows.length > 0" class="table-responsive report-content">
          <table class="table table-bordered table-sm">
            <thead class="table-light">
              <tr>
                <th v-for="key in reportTableKeys" :key="key" class="text-nowrap">{{ key }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in reportRows" :key="i">
                <td v-for="key in reportTableKeys" :key="key">{{ row[key] != null ? String(row[key]) : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="hasReportContent && reportData" class="report-content">
          <pre class="mb-0 p-3 bg-light rounded small">{{ JSON.stringify(reportData, null, 2) }}</pre>
        </div>

        <div v-else-if="!loading && !error" class="text-center py-5">
          <i class="fa fa-university fa-3x text-muted mb-3"></i>
          <p class="text-muted mb-0">No report data. Apply filters from Reports and open “Print Report” or “View Report”.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.breadcrumb {
  padding: 0;
  margin-bottom: 0.5rem;
  background: transparent;
}
.card {
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.2rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
.report-content {
  break-inside: avoid;
}
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
