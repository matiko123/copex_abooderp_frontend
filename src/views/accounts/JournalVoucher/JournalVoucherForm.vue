<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/config/api';
import { useAuthStore } from '@/stores/auth';
import { useAppOptionStore } from '@/stores/app-option';
// @ts-ignore composable is JS
import { useNotification } from '@/composables/notification';
// @ts-ignore vue-select types
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

const authStore = useAuthStore();
const appOption = useAppOptionStore();
const { showAlert } = useNotification();
const router = useRouter();

interface AccountOption {
  id?: number;
  name: string;
  label: string;
  account_group_id?: number;
  code?: string;
  searchText?: string;
  isHeader?: boolean;
  $isDisabled?: boolean;
}
const accountGroups = ref<
  { id: number; name: string; accounts: { id: number; name: string; account_group_id: number; code?: string }[] }[]
>([]);
const costCenters = ref<{ id: number; name: string }[]>([]);
const currencies = ref<{ id: number; code: string }[]>([]);
const partyGroups = ref<{ category: string; parties: { id: number; full_name: string }[] }[]>([]);

interface PartyOption {
  id?: number;
  full_name?: string;
  label: string;
  searchText?: string;
  isHeader?: boolean;
  $isDisabled?: boolean;
}

interface JvLine {
  account_id: number | null;
  cost_center_id: number | null;
  party_id: number | null;
  narration: string;
  cr: string;
  dr: string;
}

const jvForm = ref({
  date: new Date().toISOString().slice(0, 10),
  currency: 'TZS',
  exchange_rate: '1',
  reference_number: '',
});

const jvLines = ref<JvLine[]>([
  { account_id: null, cost_center_id: null, party_id: null, narration: '', cr: '', dr: '' },
]);

async function loadMasterData() {
  try {
    const res = await apiClient.get('/accounts/data');
    const data = res?.data ?? {};
    const raw = Array.isArray(data) ? data : data.accounts;
    accountGroups.value = Array.isArray(raw) ? raw : [];
    costCenters.value = Array.isArray(data.cost_centers) ? data.cost_centers : [];
    currencies.value = Array.isArray(data.currencies) ? data.currencies : [];
    partyGroups.value = Array.isArray(data.parties) ? data.parties : [];

    if (currencies.value.length > 0) {
      const exists = currencies.value.some((c) => c.code === jvForm.value.currency);
      if (!exists) {
        jvForm.value.currency = currencies.value[0].code;
      }
    }
  } catch (e) {
    console.error('Failed to load journal voucher master data:', e);
    accountGroups.value = [];
    costCenters.value = [];
    currencies.value = [];
    partyGroups.value = [];
  }
}

function addJvLine() {
  jvLines.value.unshift({
    account_id: null,
    cost_center_id: null,
    party_id: null,
    narration: '',
    cr: '',
    dr: '',
  });
}

function removeJvLine(index: number) {
  if (jvLines.value.length <= 1) return;
  jvLines.value.splice(index, 1);
}

// Grouped account options: group name as header, then accounts under it (only groups with accounts)
const groupedAccountOptions = computed(() => {
  const list: AccountOption[] = [];
  for (const g of accountGroups.value) {
    const accounts = g.accounts || [];
    if (accounts.length === 0) continue;
    list.push({
      label: g.name,
      name: g.name,
      isHeader: true,
      $isDisabled: true,
      searchText: g.name,
    } as AccountOption);
    for (const a of accounts) {
      const label = a.code ? `${a.name} (${a.code})` : a.name;
      list.push({
        id: a.id,
        name: a.name,
        label,
        account_group_id: a.account_group_id,
        code: a.code,
        searchText: `${g.name} ${a.name} ${a.code || ''}`.toLowerCase(),
      });
    }
  }
  return list;
});

function filterAccountOptions(options: AccountOption[], search: string) {
  const q = (search || '').toLowerCase().trim();
  if (!q) return options;
  return options.filter((opt, index) => {
    if (opt.isHeader) {
      let i = index + 1;
      while (i < options.length && !options[i]?.isHeader) {
        const o = options[i];
        if (o?.id != null && (o.searchText || o.label || o.name || '').toLowerCase().includes(q))
          return true;
        i++;
      }
      return false;
    }
    return (opt.searchText || opt.label || opt.name || '').toLowerCase().includes(q);
  });
}

function isAccountSelectable(opt: AccountOption) {
  return !opt?.isHeader && opt?.id != null;
}

// Grouped party options: category as header, then parties under it (only groups with parties)
const groupedPartyOptions = computed(() => {
  const list: PartyOption[] = [];
  for (const g of partyGroups.value) {
    const items = g.parties || [];
    if (items.length === 0) continue;
    list.push({
      label: g.category,
      isHeader: true,
      $isDisabled: true,
      searchText: g.category,
    } as PartyOption);
    for (const p of items) {
      list.push({
        id: p.id,
        full_name: p.full_name,
        label: p.full_name,
        searchText: `${g.category} ${p.full_name || ''}`.toLowerCase(),
      });
    }
  }
  return list;
});

function filterPartyOptions(options: PartyOption[], search: string) {
  const q = (search || '').toLowerCase().trim();
  if (!q) return options;
  return options.filter((opt, index) => {
    if (opt.isHeader) {
      let i = index + 1;
      while (i < options.length && !options[i]?.isHeader) {
        const o = options[i];
        if (o?.id != null && (o.searchText || o.label || o.full_name || '').toLowerCase().includes(q))
          return true;
        i++;
      }
      return false;
    }
    return (opt.searchText || opt.label || opt.full_name || '').toLowerCase().includes(q);
  });
}

function isPartySelectable(opt: PartyOption) {
  return !opt?.isHeader && opt?.id != null;
}

const totalDr = computed(() =>
  jvLines.value.reduce((sum, line) => sum + (parseFloat(line.dr) || 0), 0)
);
const totalCr = computed(() =>
  jvLines.value.reduce((sum, line) => sum + (parseFloat(line.cr) || 0), 0)
);
const isBalanced = computed(() => Math.abs(totalDr.value - totalCr.value) < 0.01);
const submitting = ref(false);

// Remarks modal for journal line
const remarksModalOpen = ref(false);
const remarksModalLineIndex = ref<number>(0);
const remarksModalText = ref('');

function openRemarksModal(lineIndex: number) {
  remarksModalLineIndex.value = lineIndex;
  remarksModalText.value = jvLines.value[lineIndex]?.narration ?? '';
  remarksModalOpen.value = true;
}

function saveRemarksAndClose(event?: Event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const idx = remarksModalLineIndex.value;
  const text = String(remarksModalText.value ?? '');
  const lines = [...jvLines.value];
  if (idx >= 0 && lines[idx]) {
    lines[idx] = { ...lines[idx], narration: text };
    jvLines.value = lines;
  }

  remarksModalText.value = '';
  remarksModalOpen.value = false;
}

function closeRemarksModal(event?: Event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  remarksModalText.value = '';
  remarksModalOpen.value = false;
}

async function submitJv() {
  if (!isBalanced.value) {
    showAlert('error', 'Total DR must equal Total CR before posting.');
    return;
  }

  const selectedCurrency = currencies.value.find(
    (c) => c.code === jvForm.value.currency || c.id === (jvForm.value as any).currency
  );

  const payload = {
    date: jvForm.value.date,
    user_id: authStore.user?.id,
    currency_id: selectedCurrency?.id ?? jvForm.value.currency,
    exchange_rate: jvForm.value.exchange_rate,
    reference_number: jvForm.value.reference_number,
    lines: jvLines.value.map((line) => ({
      account_id: line.account_id,
      cost_center_id: line.cost_center_id,
      party_id: line.party_id,
      narration: line.narration,
      dr_amount: Number(line.dr) || 0,
      cr_amount: Number(line.cr) || 0,
    })),
  };

  submitting.value = true;
  try {
    await apiClient.post('/accounts/create_journal-voucher', payload);
    showAlert('success', 'Record created successfully');
    // Redirect back to list page after successful creation
    router.push('/accounts/journal-voucher');
  } catch (e: any) {
    console.error('Failed to Create journal voucher:', e);
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      'Failed to Create journal voucher.';
    showAlert('error', msg);
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.push('/accounts/journal-vouchers');
}

onMounted(() => {
  document.body.classList.add('jv-form-active');
  appOption.appSidebarMinified = true;
  loadMasterData();
});
onUnmounted(() => {
  document.body.classList.remove('jv-form-active');
  appOption.appSidebarMinified = false;
});
</script>

<template>
  <div class="journal-voucher-form-page">
    <!-- Breadcrumb -->
    <ul class="breadcrumb mb-3">
      <li class="breadcrumb-item">
        <span style="color: #1F4E8C; font-weight: 500;">Home</span>
      </li>
      <li class="breadcrumb-item">
        <router-link to="/accounts/bills-invoices">Accounts</router-link>
      </li>
      <li class="breadcrumb-item">
        <router-link to="/accounts/journal-voucher">Journal Vouchers</router-link>
      </li>
      <li class="breadcrumb-item active">Create Journal Voucher</li>
    </ul>

    <div class="card bg-white">
      <div class="card-header d-flex justify-content-between align-items-center bg-white">
        <h5 class="mb-0">
          <i class="fa fa-book me-2"></i>Create Journal Voucher
        </h5>
        <button type="button" class="btn rounded-pill btn-sm btn-secondary" @click="goBack">
          <i class="fa fa-arrow-left me-1"></i> Back to List
        </button>
      </div>
      <div class="card-body">
        <!-- Basic details -->
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <label class="form-label">Date <span class="text-danger">*</span></label>
            <input v-model="jvForm.date" type="date" class="form-control" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Currency <span class="text-danger">*</span></label>
            <select v-model="jvForm.currency" class="form-select">
              <option v-for="c in currencies" :key="c.id" :value="c.code">
                {{ c.code }}
              </option>Create Journal Voucher
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Exchange Rate</label>
            <input
              v-model="jvForm.exchange_rate"
              type="number"
              step="0.0001"
              min="0"
              class="form-control"
              placeholder="1"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label">Reference Number</label>
            <input
              v-model="jvForm.reference_number"
              type="text"
              class="form-control"
              placeholder="e.g. JV-001"
            />
          </div>
        </div>

        <!-- Journal lines -->
        <div class="mb-2 d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Journal Lines</h6>
          <button type="button" class="btn btn-outline-primary btn-sm" @click="addJvLine">
            <i class="fa fa-plus me-1"></i> Add Row
          </button>
        </div>
        <div class="table-responsive">
          <table class="table table-bordered table-sm align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="min-width: 180px;">Account (A/C)</th>
                <th style="min-width: 180px;">Cost Center</th>
                <th style="min-width: 160px;">Party</th>
                <th style="width: 44px;" class="text-center" title="Remarks">Remarks</th>
                <th style="width: 110px;">DR</th>
                <th style="width: 110px;">CR</th>
                <th style="width: 44px;"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(line, idx) in jvLines" :key="idx">
                <td>
                  <v-select
                    v-model="line.account_id"
                    :options="groupedAccountOptions"
                    label="label"
                    :reduce="(a: AccountOption) => (a && typeof a.id === 'number' ? a.id : null)"
                    :filter="filterAccountOptions"
                    :selectable="isAccountSelectable"
                    placeholder=" "
                    class="v-select-jv v-select-jv-grouped"
                    clearable
                    append-to-body
                  >
                    <template #option="slotData">
                      <span
                        :class="{
                          'jv-option-group-header': slotData?.option?.isHeader,
                          'text-muted fw-bold small': slotData?.option?.isHeader
                        }"
                      >
                        {{ slotData?.label ?? slotData?.option?.label ?? slotData?.option?.name ?? '—' }}
                      </span>
                    </template>
                  </v-select>
                </td>
                <td>
                  <v-select
                    v-model="line.cost_center_id"
                    :options="costCenters"
                    label="name"
                    :reduce="(c: { id: number }) => c.id"
                    placeholder=" "
                    class="v-select-jv"
                    clearable
                    append-to-body
                  />
                </td>
                <td>
                  <v-select
                    v-model="line.party_id"
                    :options="groupedPartyOptions"
                    label="label"
                    :reduce="(p: PartyOption) => (p && typeof p.id === 'number' ? p.id : null)"
                    :filter="filterPartyOptions"
                    :selectable="isPartySelectable"
                    placeholder=" "
                    class="v-select-jv v-select-jv-grouped"
                    clearable
                    append-to-body
                  >
                    <template #option="slotData">
                      <span
                        :class="{
                          'jv-option-group-header': slotData?.option?.isHeader,
                          'text-muted fw-bold small': slotData?.option?.isHeader
                        }"
                      >
                        {{ slotData?.label ?? slotData?.option?.label ?? slotData?.option?.full_name ?? '—' }}
                      </span>
                    </template>
                  </v-select>
                </td>
                <td class="text-center">
                  <button
                    type="button"
                    class="btn btn-sm py-0 px-1 btn-primary"
                    :class="line.narration ? 'btn-outline-info' : 'btn-outline-secondary'"
                    :title="line.narration ? 'Edit remarks' : 'Add remarks'"
                    @click="openRemarksModal(idx)"
                  >
                    <i class="fa" :class="line.narration ? 'fa-comment' : 'fa-comment-o'"></i>
                  </button>
                </td>
                <td>
                  <input
                    v-model="line.dr"
                    type="number"
                    step="0.01"
                    min="0"
                    class="form-control form-control-sm text-end"
                    placeholder="0.00"
                  />
                </td>
                <td>
                  <input
                    v-model="line.cr"
                    type="number"
                    step="0.01"
                    min="0"
                    class="form-control form-control-sm text-end"
                    placeholder="0.00"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm py-0 px-1"
                    title="Remove row"
                    :disabled="jvLines.length <= 1"
                    @click="removeJvLine(idx)"
                  >
                    <i class="fa fa-times"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-2 text-end">
          <span class="me-3"><strong>Total DR:</strong> {{ totalDr.toFixed(2) }}</span>
          <span class="me-3"><strong>Total CR:</strong> {{ totalCr.toFixed(2) }}</span>
          <span v-if="!isBalanced" class="text-danger small">(DR must equal CR)</span>
          <span v-else class="text-success small">Balanced</span>
        </div>
      </div>
      <div class="card-footer text-end bg-white">
        <button type="button" class="btn btn-secondary me-2" @click="goBack">Cancel</button>
        <button type="button" class="btn btn-secondary" :disabled="!isBalanced || submitting" @click="submitJv">
          <i class="fa fa-check me-1"></i> Create Voucher
        </button>
      </div>
    </div>

    <!-- Remarks modal for journal line: v-if so it unmounts when closed -->
    <div
      v-if="remarksModalOpen"
      class="modal d-block jv-remarks-modal"
      tabindex="-1"
      role="dialog"
      style="background: rgba(0,0,0,0.5);"
      @click.self="closeRemarksModal($event)"
    >
      <div class="modal-dialog modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-primary">
              <i class="fa fa-comment me-2 text-primary"></i>Remarks 
            </h5>
            <button type="button" class="btn-close" aria-label="Close" @click.prevent.stop="closeRemarksModal($event)"></button>
          </div>
          <div class="modal-body">
            <textarea
              v-model="remarksModalText"
              class="form-control"
              rows="3"
              placeholder="Enter remarks for this journal line..."
            ></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click.prevent.stop="closeRemarksModal($event)">Cancel</button>
            <button type="button" class="btn btn-primary" @click.prevent.stop="saveRemarksAndClose($event)">
              <i class="fa fa-check me-1"></i> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.journal-voucher-form-page .card {
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.2rem;
  background-color: #fff;
  
}
.breadcrumb {
  padding: 0;
  margin-bottom: 0.5rem;
  background: transparent;
}

/* Table wrapper: scrollable body, dropdowns append to body so they're visible */
.jv-table-wrapper {
  overflow-x: auto;
  overflow-y: visible;
  max-height: 420px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 6px;
}
.jv-lines-table thead {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f8f9fa;
  box-shadow: 0 1px 0 #dee2e6;
}
.jv-lines-table thead th {
  white-space: nowrap;
  padding: 10px 12px;
}

/* vue-select compact styling for table cells */
.v-select-jv :deep(.vs__dropdown-toggle) {
  min-height: 30px;
  padding: 2px 8px;
}
.v-select-jv :deep(.vs__selected) {
  padding: 0;
  margin: 0;
}
.v-select-jv :deep(.vs__search) {
  padding: 2px 0;
  margin: 0;
}
.v-select-jv :deep(.vs__actions) {
  padding: 2px;
}

/* Grouped account dropdown: group header row */
.v-select-jv-grouped :deep(.vs__dropdown-option) {
  padding: 4px 8px;
}
.v-select-jv-grouped :deep(.vs__dropdown-option .jv-option-group-header) {
  display: block;
  padding: 4px 0 2px;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 2px;
}

/* Remarks modal above dropdowns (in page) */
.journal-voucher-form-page .modal {
  z-index: 1050;
}
.journal-voucher-form-page .modal-dialog {
  z-index: 1055;
}
</style>

<style>
/* Dropdown appended to body - ensure it appears above scroll/modal */
.vs__dropdown-menu {
  z-index: 9999 !important;
}
/* Shorter dropdown list when on Journal Voucher form */
body.jv-form-active .vs__dropdown-menu {
  max-height: 10rem !important;
  overflow-y: auto;
}
/* Remarks modal (teleported to body) - ensure it appears on top */
.jv-remarks-modal {
  z-index: 1060;
}
.jv-remarks-modal .modal-dialog {
  z-index: 1061;
}
</style>
