<template>
  <div>
    <!-- Breadcrumb & Back Button -->
    <div class="d-flex align-items-center justify-content-between w-100 mb-3">
      <ul class="breadcrumb mb-0">
        <li class="breadcrumb-item"><a href="#">MASTER DATA</a></li>
        <li class="breadcrumb-item"><a href="#">ACCOUNT SETTINGS</a></li>
        <li class="breadcrumb-item"><a href="#">FISCAL YEAR</a></li>
        <li class="breadcrumb-item"><a href="#" @click.prevent>OPENING BALANCE</a></li>
        <li class="breadcrumb-item active">{{ fiscalYear?.code || '...' }}</li>
      </ul>
      <div class="d-flex gap-2">
        <button type="button" class="btn btn-sm btn-outline-dark" @click="fetchFiscalYears">
        Refresh
      </button>
    <button type="button" class="btn btn-sm btn-outline-danger" @click="goBack">
        Back
      </button>
      </div>  
    </div>

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary mb-3" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted">Loading fiscal year data...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="container-fluid px-0">
      <!-- Fiscal Year Header -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <div class="d-flex align-items-baseline gap-2">
            <span class="fw-semibold fs-6">Fiscal Year:</span>
            <h6 class="fw-bold mb-0">{{ fiscalYear?.code || 'FY2025-2026' }}</h6>
            <span class="text-muted small ms-2">
              Period: {{ fiscalYear?.period || '01' }} | 
              Start: {{ formatDate(fiscalYear?.start_date) }}
            </span>
          </div>
        </div>
        <div>
          <div class="d-flex align-items-center gap-2">
            <span class="small fw-semibold">Status:</span>
            <span :class="'badge bg-' + getStatusBadge(openingStatus)" class="px-2 py-1">
              {{ openingStatus }}
            </span>
            <select v-model="openingStatus" class="form-select form-select-sm w-auto" :disabled="openingStatus === 'POSTED'">
              <option value="DRAFT">Draft</option>
              <option value="VALIDATED">Validated</option>
              <option value="POSTED">Posted</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-tabs mb-3">
        <li v-for="tab in tabs" :key="tab.key" class="nav-item">
          <a href="#" class="nav-link py-2" :class="{ active: activeTab === tab.key }" @click.prevent="activeTab = tab.key">
            {{ tab.label }}
          </a>
        </li>
      </ul>

      <!-- ============ SUMMARY TAB ============ -->
      <div v-if="activeTab === 'summary'">
        <!-- Summary Cards kutoka Backend -->
        <div class="card border-0 mb-3">
          <div class="card-header bg-light border-0 py-2">
            <h6 class="fw-bold mb-0">Opening Balance Summary</h6>
          </div>
          <div class="card-body py-3">
            <div class="row g-3">
              <div class="col-md-6 col-lg-4" v-for="card in summaryCards" :key="card.label">
                <div class="card border-0 shadow-sm h-100 bg-light">
                  <div class="card-body p-3">
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <div class="bg-white rounded-circle p-3 d-flex align-items-center justify-content-center" 
                           style="width: 50px; height: 50px;">
                        <i :class="card.icon" :style="{ color: card.color }" class="fs-2"></i>
                      </div>
                      <div>
                      <span class="text-muted text-uppercase small fw-semibold">{{ card.label }}</span> 
                      <div class="d-flex flex-wrap gap-1">
                      <span v-for="(item, idx) in card.total" :key="idx"
                            class="badge bg-white text-dark p-1 border small">
                        <span class="fw-normal">{{ item.currency }}</span>
                        <span class="fw-bold ms-1 fs-6" :style="{color:card.color}">{{ formatCurrency(item.amount) }}</span>
                      </span>
                      <span v-if="!card.total || card.total.length === 0" class="text-muted small">
                        No balances
                      </span>
                    </div>
                  </div> 
                      </div>
                                         
                    </div>
                   
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Grand Totals Debit/Credit -->
        <div class="row g-3">
          <!-- DEBIT Total -->
          <div class="col-md-6">
            <div class="card border-0 bg-light shadow-sm">
              <div class="card-header bg-success bg-opacity-10 border-0 py-2">
                <span class="fw-semibold text-success small">TOTAL DEBIT</span>
              </div>
              <div class="card-body py-2">
                <div class="d-flex flex-wrap gap-2 justify-content-center">
                  <div v-for="(amount, currency) in totalDebitsByCurrency" :key="currency" 
                       class="d-flex align-items-center gap-1 bg-white rounded px-2 py-1 border">
                    <span class="fw-bold">{{ currency }}:</span>
                    <span class="text-success fw-bold">{{ formatCurrency(amount) }}</span>
                  </div>
                  <div v-if="Object.keys(totalDebitsByCurrency).length === 0" class="text-muted small">
                    No debit entries
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- CREDIT Total -->
          <div class="col-md-6">
            <div class="card border-0 bg-light shadow-sm">
              <div class="card-header bg-danger bg-opacity-10 border-0 py-2">
                <span class="fw-semibold text-danger small">TOTAL CREDIT</span>
              </div>
              <div class="card-body py-2">
                <div class="d-flex flex-wrap gap-2 justify-content-center">
                  <div v-for="(amount, currency) in totalCreditsByCurrency" :key="currency" 
                       class="d-flex align-items-center gap-1 bg-white rounded px-2 py-1 border">
                    <span class="fw-bold">{{ currency }}:</span>
                    <span class="text-danger fw-bold">{{ formatCurrency(amount) }}</span>
                  </div>
                  <div v-if="Object.keys(totalCreditsByCurrency).length === 0" class="text-muted small">
                    No credit entries
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Differences & Balance Status -->
        <div class="row mt-3">
          <div class="col-12">
            <div class="card border-0 bg-light">
              <div class="card-body py-2">
                <div class="row">
                  <div class="col-md-6">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="small fw-semibold">Differences by Currency:</span>
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                      <div v-for="(diff, currency) in differencesByCurrency" :key="currency"
                           class="d-flex align-items-center gap-1 bg-white rounded px-2 py-1 border">
                        <span class="fw-bold">{{ currency }}:</span>
                        <span :class="diff === 0 ? 'text-success' : 'text-danger'" class="fw-bold">
                          {{ formatCurrency(diff) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="d-flex flex-column align-items-end">
                      <div class="d-flex align-items-center gap-2">
                        <span class="small fw-semibold">Balance Status:</span>
                        <span :class="'badge bg-' + (isBalanced ? 'success' : 'warning')">
                          {{ isBalanced ? 'BALANCED' : 'NOT BALANCED' }}
                        </span>
                      </div>
                      <div v-if="!isBalanced" class="text-danger small mt-1">
                        <i class="bi bi-exclamation-triangle me-1"></i>
                        Total Difference: {{ formatCurrency(totalDifference) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- ============ BANK ACCOUNTS TAB ============ -->
<div v-if="activeTab === 'bank'">
  <OpeningBalanceTable
    title="Bank Accounts Opening Balances"
    description="Enter opening balances for bank accounts. Select DEBIT or CREDIT from dropdown."
    entity-label="Bank Account"
    :items="bankAccounts"
    :options="bankAccountsData"
    :currencies="currencies"
    account-field="account_id"
    :show-type="true"
    :show-debit-credit="true"
    type="bank"
    @add="addBankRow"
     @remove="removeRow"   
    @account-change="updateBankCurrency"
    @save-row="saveRow"
     @update-all="updateAll"
  />
  
  <!-- Show differences -->
  <div class="d-flex justify-content-center mt-3">
    <div>
      <p class="text-center">Accounts Difference by currencies</p>
      <div class="d-flex flex-wrap gap-2">
        <div v-for="(diff, currency) in differencesByCurrency" :key="currency"
             class="d-flex align-items-center gap-1 bg-white rounded px-2 py-1 border">
          <span class="fw-bold">{{ currency }}:</span>
          <span :class="diff === 0 ? 'text-success' : 'text-danger'" class="fw-bold">
            {{ formatCurrency(diff) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ============ CASH ACCOUNTS TAB ============ -->
<div v-if="activeTab === 'cash'">
  <OpeningBalanceTable
    title="Cash Accounts Opening Balances"
    description="Enter opening balances for cash accounts. Select DEBIT or CREDIT from dropdown."
    entity-label="Cash Account"
    :items="cashAccounts"
    :options="cashAccountsData"
    :currencies="currencies"
    account-field="account_id"
    :show-type="true"
    :show-debit-credit="true"
    type="cash"
    @add="addCashRow"
     @remove="removeRow"   
    @account-change="updateCashCurrency"
     @save-row="saveRow"
      @update-all="updateAll"
  />
  
  <!-- Show differences -->
  <div class="d-flex justify-content-center mt-3">
    <div>
      <p class="text-center">Accounts Difference by currencies</p>
      <div class="d-flex flex-wrap gap-2">
        <div v-for="(diff, currency) in differencesByCurrency" :key="currency"
             class="d-flex align-items-center gap-1 bg-white rounded px-2 py-1 border">
          <span class="fw-bold">{{ currency }}:</span>
          <span :class="diff === 0 ? 'text-success' : 'text-danger'" class="fw-bold">
            {{ formatCurrency(diff) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ============ CUSTOMERS TAB ============ -->
<div v-if="activeTab === 'customers'">
  <OpeningBalanceTable
    title="Customers Opening Balances (Receivables)"
    description="Enter opening balances for customers. All amounts are DEBIT."
    entity-label="Customer"
    :items="customerBalances"
    :options="customersData"
    :currencies="currencies"
    account-field="customer_id"
    :show-type="false"
    :show-alert="true"
    alert-message="Accounts Receivable: Accounts Receivable"
    type="customers"
    @add="addCustomerRow"
     @remove="removeRow"   
     @save-row="saveRow"
      @update-all="updateAll"
  />
  
  <!-- Show differences -->
  <div class="d-flex justify-content-center mt-3">
    <div>
      <p class="text-center">Accounts Difference by currencies</p>
      <div class="d-flex flex-wrap gap-2">
        <div v-for="(diff, currency) in differencesByCurrency" :key="currency"
             class="d-flex align-items-center gap-1 bg-white rounded px-2 py-1 border">
          <span class="fw-bold">{{ currency }}:</span>
          <span :class="diff === 0 ? 'text-success' : 'text-danger'" class="fw-bold">
            {{ formatCurrency(diff) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ============ SUPPLIERS TAB ============ -->
<div v-if="activeTab === 'suppliers'">
  <OpeningBalanceTable
    title="Suppliers Opening Balances (Payables)"
    description="Enter opening balances for suppliers. All amounts are CREDIT."
    entity-label="Supplier"
    :items="supplierBalances"
    :options="suppliersData"
    :currencies="currencies"
    account-field="supplier_id"
    :show-type="false"
    :show-alert="true"
    alert-message="Accounts Payable: Accounts Payable"
    type="suppliers"
    @add="addSupplierRow"
    @remove="removeRow"
    @save-row="saveRow"
    @update-all="updateAll"
  />
  
  <!-- Show differences -->
  <div class="d-flex justify-content-center mt-3">
    <div>
      <p class="text-center">Accounts Difference by currencies</p>
      <div class="d-flex flex-wrap gap-2">
        <div v-for="(diff, currency) in differencesByCurrency" :key="currency"
             class="d-flex align-items-center gap-1 bg-white rounded px-2 py-1 border">
          <span class="fw-bold">{{ currency }}:</span>
          <span :class="diff === 0 ? 'text-success' : 'text-danger'" class="fw-bold">
            {{ formatCurrency(diff) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</div>
    
      <!-- ============ LOANS TAB ============ -->

      <div v-if="activeTab === 'loans'">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light border-0 py-2">
            <h6 class="fw-bold mb-0">Loans Opening Balances</h6>
          </div>
          <div class="card-body py-3">
            <p class="text-muted small mb-2">
              Enter opening balances for loan accounts. Use positive for DEBIT, negative for CREDIT.
            </p>

            <div class="table-responsive">
              <table class="table table-bordered table-hover align-middle mb-0 small">
                <thead class="table-light">
                  <tr>
                    <th>Loan Account</th>
                    <th>Currency</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Notes</th>
                    <th style="width: 40px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in loans" :key="index">
                    <td>
                      <select v-model="row.account_id" class="form-select form-select-sm">
                        <option value="">Select</option>
                        <option v-for="acc in loanAccountsData" :key="acc.id" :value="acc.id">
                          {{ acc.name }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <select v-model="row.currency" class="form-select form-select-sm">
                        <option v-for="currency in currencies" :key="currency.id" :value="currency.code">
                          {{ currency.code }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <input type="number" v-model.number="row.amount" class="form-control form-control-sm" 
                             step="0.01" placeholder="0.00" />
                    </td>
                    <td>
                      <span :class="'badge bg-' + (row.amount >= 0 ? 'success' : 'danger') + ' p-1'">
                        {{ row.amount >= 0 ? 'DEBIT' : 'CREDIT' }}
                      </span>
                    </td>
                    <td>
                      <input type="text" v-model="row.notes" class="form-control form-control-sm" placeholder="Notes" />
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-danger py-0 px-1" @click="removeRow('loans', index)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="6" class="py-2">
                      <button class="btn btn-sm btn-outline-primary" @click="addLoanRow">
                        <i class="bi bi-plus-circle me-1"></i>Add Loan Balance
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
             <hr>
            <div class="d-flex justify-content-center">
                     <div >
                      <p class="text-center">Accounts Difference by currencies</p>
                      <div class="d-flex flex-wrap gap-2">
                      <div v-for="(diff, currency) in differencesByCurrency" :key="currency"
                           class="d-flex align-items-center gap-1 bg-white rounded px-2 py-1 border">
                        <span class="fw-bold">{{ currency }}:</span>
                        <span :class="diff === 0 ? 'text-success' : 'text-danger'" class="fw-bold">
                          {{ formatCurrency(diff) }}
                        </span>
                </div>
             </div>
                     </div>
                 
            </div>
          </div>
        </div>
      </div>

      <!-- ============ RETAINED EARNINGS TAB ============ -->
      <div v-if="activeTab === 'retained'">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light border-0 py-2">
            <h6 class="fw-bold mb-0">Retained Earnings</h6>
          </div>
          <div class="card-body py-3">
            <p class="text-muted small mb-2">
              Enter opening balance for retained earnings. Positive = DEBIT, Negative = CREDIT.
            </p>

            <div class="alert alert-info py-1 px-2 mb-2 small">
              <i class="bi bi-info-circle me-1"></i>
              Suggested amount to balance: 
              <span class="fw-bold">{{ formatCurrency(suggestedRetainedEarnings) }}</span>
            </div>

            <div class="table-responsive">
              <table class="table table-bordered table-hover align-middle mb-0 small">
                <thead class="table-light">
                  <tr>
                    <th>Account</th>
                    <th>Currency</th>
                    <th>Amount</th>
                    <th>Notes</th>
                    <th style="width: 40px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in retainedEarnings" :key="index">
                    <td>
                      <span class="fw-semibold">{{ row.account_name || 'Retained Earnings' }}</span>
                    </td>
                    <td>
                      <select v-model="row.currency" class="form-select form-select-sm">
                        <option v-for="currency in currencies" :key="currency.id" :value="currency.code">
                          {{ currency.code }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <input type="number" v-model.number="row.amount" class="form-control form-control-sm" 
                             step="0.01" placeholder="0.00" min="0" />
                    </td>
                    <td>
                      <input type="text" v-model="row.notes" class="form-control form-control-sm" placeholder="Notes" />
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-danger py-0 px-1" @click="removeRow('retained', index)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="5" class="py-2">
                      <button class="btn btn-sm btn-outline-primary" @click="addRetainedRow">
                        <i class="bi bi-plus-circle me-1"></i>Add Retained Earnings
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
             <hr>
            <div class="d-flex justify-content-center">
                     <div >
                      <p class="text-center">Accounts Difference by currencies</p>
                      <div class="d-flex flex-wrap gap-2">
                      <div v-for="(diff, currency) in differencesByCurrency" :key="currency"
                           class="d-flex align-items-center gap-1 bg-white rounded px-2 py-1 border">
                        <span class="fw-bold">{{ currency }}:</span>
                        <span :class="diff === 0 ? 'text-success' : 'text-danger'" class="fw-bold">
                          {{ formatCurrency(diff) }}
                        </span>
                </div>
               </div>
              </div>                 
            </div>

            <!-- Retained Earnings Totals -->
            <div class="row mt-3">
              <div class="col-md-4">
                <div class="bg-light p-2 rounded small">
                  <span class="fw-semibold">Retained Earnings by Currency</span>
                  <div v-for="(total, currency) in retainedEarningsTotalsByCurrency" :key="currency" 
                       class="d-flex justify-content-between mt-1">
                    <span>{{ currency }}:</span>
                    <span :class="'fw-bold ' + (total >= 0 ? 'text-success' : 'text-danger')">
                      {{ formatCurrency(total) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      
      <!-- ============ GLOBAL ACTION BUTTONS ============ -->
      <div class="mt-4 pt-3 border-top">
        <div class="d-flex flex-column align-items-center gap-2">
          <!-- STATUS MESSAGE -->
          <div v-if="isBalanced" class="text-success fw-semibold small">
            <i class="bi bi-check-circle-fill me-1"></i>
            Opening balances are balanced! Total Debits = Total Credits
          </div>
          <div v-else class="text-danger fw-semibold small">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>
            <!-- Opening balances are not balanced. Total difference: {{ formatCurrency(totalDifference) }} -->
            Opening balances are not balanced.         
          </div>

          <!-- ACTION BUTTONS -->
          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm" @click="saveDraft">
              <i class="bi bi-save me-1"></i> Save Draft
            </button>
            <button class="btn btn-primary btn-sm" @click="validate" :disabled="!isBalanced">
              <i class="bi bi-check-circle me-1"></i> Validate
            </button>
            <button class="btn btn-success btn-sm" @click="post" :disabled="!isBalanced || isPost">
              <span v-if="isPost"><div class="spinner-border spinner-border-sm text-white"></div></span>
             <span v-else><i class="bi bi-send me-1"></i> Post</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import OpeningBalanceTable from './table.vue'

import { COPEX_API_URL  } from "@/config/config.js";
import { useNotification } from '@/composables/notification';
import { useRouter, useRoute } from 'vue-router';

const route = useRoute();
const router = useRouter();
const { showAlert } = useNotification();

// ==================== STATE ====================
const activeTab = ref('summary');
const isLoading = ref(true);
const openingStatus = ref('DRAFT');
const fiscalYear = ref({});
const isPost = ref(false);
// Master data
const currencies = ref([]);
const bankAccountsData = ref([]);
const cashAccountsData = ref([]);
const loanAccountsData = ref([]);
const customersData = ref([]);
const suppliersData = ref([]);

// Default accounts
const defaultARAccount = ref({ id: 1100, name: 'Accounts Receivable' });
const defaultAPAccount = ref({ id: 2100, name: 'Accounts Payable' });

// Opening balance entries
const bankAccounts = ref([]);
const cashAccounts = ref([]);
const customerBalances = ref([]);
const supplierBalances = ref([]);
const loans = ref([]);
const retainedEarnings = ref([]);

// Summary cards kutoka backend
const summaryCards = ref([]);

// ==================== TABS ====================
const tabs = [
  { key: 'summary', label: 'Summary' },
  { key: 'bank', label: 'Bank' },
  { key: 'cash', label: 'Cash' },
  { key: 'customers', label: 'Customers(Receivables)' },
  { key: 'suppliers', label: 'Suppliers(Payables)' },
  { key: 'loans', label: 'Loans' },
  { key: 'retained', label: 'Retained Earnings'},
];

// ==================== COMPUTED ====================
// TOTAL DEBITS - Grand totals + User entries (Bank/Cash kwa type=DEBIT)
const totalDebitsByCurrency = computed(() => {
  const totals = {};

  const addAmount = (row) => {
    const amount = parseFloat(row.amount || 0);
    totals[row.currency] = (totals[row.currency] || 0) + amount;
  };

  bankAccounts.value.forEach(row => {
    if (row.type === 'DEBIT' && row.currency) addAmount(row);
  });

  cashAccounts.value.forEach(row => {
    if (row.type === 'DEBIT' && row.currency) addAmount(row);
  });

  customerBalances.value.forEach(row => {
    if (row.currency) addAmount(row);
  });

  loans.value.forEach(row => {
    if (row.currency && row.amount > 0) addAmount(row);
  });

  retainedEarnings.value.forEach(row => {
    if (row.currency && row.amount > 0) addAmount(row);
  });

  return totals;
});

// TOTAL CREDITS - Grand totals + User entries (Bank/Cash kwa type=CREDIT)
const totalCreditsByCurrency = computed(() => {
  const totals = {};

  const addAmount = (currency, amount) => {
    const value = parseFloat(amount || 0);
    totals[currency] = (totals[currency] || 0) + value;
  };

  // BANK
  bankAccounts.value.forEach(row => {
    if (row.type === 'CREDIT' && row.currency) {
      addAmount(row.currency, row.amount);
    }
  });

  // CASH
  cashAccounts.value.forEach(row => {
    if (row.type === 'CREDIT' && row.currency) {
      addAmount(row.currency, row.amount);
    }
  });

  // SUPPLIERS
  supplierBalances.value.forEach(row => {
    if (row.currency) {
      addAmount(row.currency, row.amount);
    }
  });

  // LOANS (negative = credit)
  loans.value.forEach(row => {
    if (row.currency && parseFloat(row.amount) < 0) {
      addAmount(row.currency, Math.abs(row.amount));
    }
  });

  // RETAINED (negative = credit)
  retainedEarnings.value.forEach(row => {
    if (row.currency && parseFloat(row.amount) < 0) {
      addAmount(row.currency, Math.abs(row.amount));
    }
  });

  return totals;
});



// DIFFERENCES BY CURRENCY
const differencesByCurrency = computed(() => {
  const diff = {};
  const allCurrencies = new Set([
    ...Object.keys(totalDebitsByCurrency.value),
    ...Object.keys(totalCreditsByCurrency.value)
  ]);

  allCurrencies.forEach(currency => {
    const debit = totalDebitsByCurrency.value[currency] || 0;
    const credit = totalCreditsByCurrency.value[currency] || 0;
    diff[currency] = debit - credit;
  });

  return diff;
});

// BALANCE CHECK
const isBalanced = computed(() => {
  return Object.values(differencesByCurrency.value).every(diff => Math.abs(diff) < 0.01);
});

const totalDifference = computed(() => {
  return Object.values(differencesByCurrency.value).reduce((sum, diff) => sum + diff, 0);
});

// ============ BANK TOTALS ============
const bankDebitsByCurrency = computed(() => {
  const totals = {};
  bankAccounts.value.forEach(row => {
    if (row.type === 'DEBIT' && row.currency && row.amount) {
      totals[row.currency] = (totals[row.currency] || 0) + parseFloat(row.amount || 0);
    }
  });
  return totals;
});

const bankCreditsByCurrency = computed(() => {
  const totals = {};
  bankAccounts.value.forEach(row => {
    if (row.type === 'CREDIT' && row.currency && parseFloat(row.amount || 0)) {
      totals[row.currency] = (totals[row.currency] || 0) + parseFloat(row.amount || 0);
    }
  });
  return totals;
});


const bankTotalsByCurrency = computed(() => {
  const totals = {};
  bankAccounts.value.forEach(row => {
    if (row.currency && row.amount) {
      if (row.type === 'DEBIT') {
        totals[row.currency] = (totals[row.currency] || 0) + parseFloat(row.amount || 0);
      } else if (row.type === 'CREDIT') {
        totals[row.currency] = (totals[row.currency] || 0) - parseFloat(row.amount || 0);
      }
    }
  });
  return totals;
});

const bankDifferenceByCurrency = computed(() => {
  const diff = {};
  const currencies = new Set([
    ...Object.keys(bankDebitsByCurrency.value),
    ...Object.keys(bankCreditsByCurrency.value)
  ]);
  
  currencies.forEach(currency => {
    const debits = bankDebitsByCurrency.value[currency] || 0;
    const credits = bankCreditsByCurrency.value[currency] || 0;
    diff[currency] = debits - credits;
  });
  
  return diff;
});





// ============ CASH TOTALS ============
const cashDebitsByCurrency = computed(() => {
  const totals = {};
  cashAccounts.value.forEach(row => {
    if (row.type === 'DEBIT' && row.currency && parseFloat(row.amount || 0)) {
      totals[row.currency] = (totals[row.currency] || 0) + parseFloat(row.amount || 0);
    }
  });
  return totals;
});

const cashCreditsByCurrency = computed(() => {
  const totals = {};
  cashAccounts.value.forEach(row => {
    if (row.type === 'CREDIT' && row.currency && parseFloat(row.amount || 0)) {
      totals[row.currency] = (totals[row.currency] || 0) + parseFloat(row.amount || 0);
    }
  });
  return totals;
});

const cashTotalsByCurrency = computed(() => {
  const totals = {};
  cashAccounts.value.forEach(row => {
    if (row.currency && row.amount) {
      if (row.type === 'DEBIT') {
        totals[row.currency] = (totals[row.currency] || 0) + parseFloat(row.amount || 0);
      } else if (row.type === 'CREDIT') {
        totals[row.currency] = (totals[row.currency] || 0) - parseFloat(row.amount || 0);
      }
    }
  });
  return totals;
});

const cashDifferenceByCurrency = computed(() => {
  const diff = {};
  const currencies = new Set([
    ...Object.keys(cashDebitsByCurrency.value),
    ...Object.keys(cashCreditsByCurrency.value)
  ]);
  
  currencies.forEach(currency => {
    const debits = cashDebitsByCurrency.value[currency] || 0;
    const credits = cashCreditsByCurrency.value[currency] || 0;
    diff[currency] = debits - credits;
  });  
  return diff;
});

// ============ CUSTOMER TOTALS ============
const receivablesByCurrency = computed(() => {
  const totals = {};
  customerBalances.value.forEach(row => {
    if (row.amount > 0 && row.currency) {
      totals[row.currency] = (totals[row.currency] || 0) + parseFloat(row.amount || 0);
    }
  });
  return totals;
});

// ============ SUPPLIER TOTALS ============
const payablesByCurrency = computed(() => {
  const totals = {};
  supplierBalances.value.forEach(row => {
    if (row.amount > 0 && row.currency) {
      totals[row.currency] = (totals[row.currency] || 0) + parseFloat(row.amount || 0);
    }
  });
  return totals;
});

// ============ RETAINED EARNINGS TOTALS ============
const retainedEarningsTotalsByCurrency = computed(() => {
  const totals = {};
  retainedEarnings.value.forEach(row => {
    if (row.currency && row.amount) {
      totals[row.currency] = (totals[row.currency] || 0) + parseFloat(row.amount || 0);
    }
  });
  return totals;
});

// ============ SUGGESTED RETAINED EARNINGS ============
const suggestedRetainedEarnings = computed(() => {
  return totalDifference.value;
});

// ==================== METHODS ====================
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0.00';
  return amount.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

const formatDate = (date) => {
  if (!date) return '01/01/2025';
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};

const getStatusBadge = (status) => {
  const badges = { DRAFT: 'warning', VALIDATED: 'info', POSTED: 'success' };
  return badges[status] || 'warning';
};

const goBack = () => {
  router.back();
};

const saveRow = async (payload) => {
  console.log('Saving row:', payload);  
  
  try {
    // Prepare data in the format you want
    const requestData = {
      action: 'UPDATE',
      data: [{
        ...payload.row,     
      }],
      fiscal_year_id: fiscalYear.value.id,
      type: payload.type.toUpperCase()  // 'bank', 'cash', etc.
    };  

    console.log('Sending request:', requestData);
    
    const response = await axiosInstance.post(
      `/fiscal-years/opening-balances/update`,
      requestData  // Send the whole object with action, data, etc.
    );
    if (response.data.success) {
    requestData.data[0]._dirty;
    delete requestData.data[0]._saving;
    delete requestData.data[0]._deleting;
      showAlert('success', 'Saved successfully!');
      return true;
    } else {
      throw new Error(response.data.message || 'Save failed');
    }

  } catch (error) {
    showAlert('error', 'Failed to save: ' + (error.message || 'Unknown error'));
    console.error(error);    
    throw error;
  }
};



// Row management
const addBankRow = () => {
  fetchFormData('BANK');
  bankAccounts.value.push({ 
    journal_account_id: null,
    account_id: '', 
    currency: currencies.value[0]?.code || 'USD', 
    amount: 0,
    type: 'DEBIT',
    notes: '' ,
    _dirty: false,
    _saving: false
  });
};

const addCashRow = () => {
   fetchFormData('CASH');
  cashAccounts.value.push({ 
    journal_account_id: null,
    account_id: '', 
    currency: currencies.value[0]?.code || 'USD', 
    amount: 0,
    type: 'DEBIT',
    notes: '' ,
    _dirty: false,
    _saving: false
  });
};

const addCustomerRow = () => {
   fetchFormData('CLIENTS');
 customerBalances.value.push({ 
    journal_account_id: null,
    customer_id: '', 
    currency: currencies.value[0]?.code || 'USD', 
    amount: 0,     
    notes: '' ,
    _dirty: false,
    _saving: false
  });
};

const addSupplierRow = () => {
   fetchFormData('SUPPLIERS');
  supplierBalances.value.push({ 
    journal_account_id: null,
    supplier_id: '', 
    currency: currencies.value[0]?.code || 'USD', 
    amount: 0,     
    notes: '' ,
    _dirty: false,
    _saving: false
  });
};

const addLoanRow = () => {
  fetchFormData('LOAN');
  loans.value.push({ 
    journal_account_id: null,
    account_id: '', 
    currency: currencies.value[0]?.code || 'USD', 
    amount: 0, 
    notes: '' ,
    _dirty: false,
    _saving: false
  });
};

const addRetainedRow = () => {
   fetchFormData('RETAIN');
  retainedEarnings.value.push({ 
    journal_account_id: null,
    account_name: 'Retained Earnings', 
    currency: currencies.value[0]?.code || 'USD', 
    amount: 0, 
    notes: '' ,
    _dirty: false,
    _saving: false
  });
};

// ==================== REMOVE ROW METHOD (PARENT) ====================
const removeRow = async (payload) => {
  console.log('Removing row:', payload);  
  try {    
    const params = {
      ...payload, 
      fiscal_year_id: fiscalYear.value.id,
      type: payload.type ,
      action:'DELETE'
    };
    
    if (!params.id || params.id.toString().startsWith('temp_')) {      
      removeRowFromArray(payload.type, payload.index);
      showAlert('success', 'Removed successfully!');
      return;
    }
      
    const response = await axiosInstance.delete(
      `fiscal-years/opening-balances/update`,
      { data: params }
    );
    
    if (response.data.success) {
      // Remove from local array
      removeRowFromArray(payload.type, payload.index);
      showAlert('success', 'Deleted successfully!');
    } else {
      throw new Error(response.data.message || 'Delete failed');
    }

  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to delete';
    showAlert('error', errorMsg);
    console.error('Delete error:', error);
    throw error; 
  }
};

// Helper function to remove row from specific array
const removeRowFromArray = (type, index) => {
  switch(type) {
    case 'bank':
      bankAccounts.value.splice(index, 1);
      break;
    case 'cash':
      cashAccounts.value.splice(index, 1);
      break;
    case 'customers':
      customerBalances.value.splice(index, 1);
      break;
    case 'suppliers':
      supplierBalances.value.splice(index, 1);
      break;
    default:
      console.warn('Unknown type:', type);
  }
};

const updateBankCurrency = (row) => {
  const account = bankAccountsData.value.find(a => a.id === row.account_id);
  if (account) {
    row.currency = account.currency || currencies.value[0]?.code || 'USD';
  }
};

const updateCashCurrency = (row) => {
  const account = cashAccountsData.value.find(a => a.id === row.account_id);
  if (account) {
    row.currency = account.currency || currencies.value[0]?.code || 'USD';
  }
};

// ==================== UPDATE ALL METHOD ====================
const updateAll = async (payload) => {
  console.log('Updating all rows:', payload);  
  try {
    // Prepare all dirty rows for API
    const rowsToUpdate = payload.rows.map(row => ({
      ...row,
      fiscal_year_id: fiscalYear.value.id,      
    }));
    
    console.log('Updating all REady rows:', rowsToUpdate);  
    // Remove temporary flags   
    
    // Send to backend
    const response = await axiosInstance.post(
      `/fiscal-years/opening-balances/update`,
      {
        data: rowsToUpdate,
        type: payload.type.toUpperCase(),
        fiscal_year_id: fiscalYear.value.id,
        action:'UPDATE'
      }
    );
    console.log("UPDATED DATA" , response.data);    
    if (response.data.success) {
      rowsToUpdate.forEach(row => {
      delete row._dirty;
      delete row._saving;
      delete row._deleting;
      delete row._tempIndex;
    });
      showAlert('success', `Updated ${rowsToUpdate.length} items successfully!`);
      if (response.data.updatedRows) {
        response.data.updatedRows.forEach((updatedRow, index) => {
          const originalIndex = rowsToUpdate[index]._tempIndex;
          if (originalIndex !== undefined) {
            // Update the specific row in the appropriate array
            updateRowInArray(payload.type, originalIndex, updatedRow);
          }
        });
      }
      
      return true;
    } else {
      throw new Error(response.data.message || 'Batch update failed');
    }
    
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to update';
    showAlert('error', errorMsg);
    console.error('Batch update error:', error);
    throw error;
  }
};

// Helper to update specific row
const updateRowInArray = (type, index, newData) => {
  switch(type) {
    case 'bank':
      if (bankAccounts.value[index]) {
        Object.assign(bankAccounts.value[index], newData);
      }
      break;
    case 'cash':
      if (cashAccounts.value[index]) {
        Object.assign(cashAccounts.value[index], newData);
      }
      break;
    case 'customers':
      if (customerBalances.value[index]) {
        Object.assign(customerBalances.value[index], newData);
      }
      break;
    case 'suppliers':
      if (supplierBalances.value[index]) {
        Object.assign(supplierBalances.value[index], newData);
      }
      break;
  }
};

// Actions
const saveDraft = async () => {
  try {
    const payload = {
      fiscal_year_id: fiscalYear.value.id,
      status: 'DRAFT',
      bank_accounts: bankAccounts.value,
      cash_accounts: cashAccounts.value,
      customer_balances: customerBalances.value,
      supplier_balances: supplierBalances.value,
      loans: loans.value,
      retained_earnings: retainedEarnings.value
    };

    await axiosInstance.post(`/fiscal-years/${fiscalYear.value.id}/opening-balances/save-draft`, payload);
    showAlert('success', 'Draft saved successfully!');
    openingStatus.value = 'DRAFT';
  } catch (error) {
    showAlert('error', 'Failed to save draft.');
    console.error(error);
  }
};


const validate = async () => {
  if (isBalanced.value) {
    try {
      const payload = {
        fiscal_year_id: fiscalYear.value.id,
        status: 'VALIDATED'
      };
      
      await axiosInstance.post(`/fiscal-years/${fiscalYear.value.id}/opening-balances/validate`, payload);
      showAlert('success', 'Validation successful!');
      openingStatus.value = 'VALIDATED';
    } catch (error) {
      showAlert('error', 'Failed to validate.');
      console.error(error);
    }
  } else {
    showAlert('error', 'Cannot validate: Debits and Credits must be equal for all currencies.');
  }
};


const post = async () => {
  if (isBalanced.value) {
    isPost.value = true;
    try {
       const payload = {
      fiscal_year_id: fiscalYear.value.id,
      status: 'POSTED',     
      bank_accounts: bankAccounts.value.map(acc => ({
        ...acc,
        amount: Math.abs(acc.amount) 
      })),
      cash_accounts: cashAccounts.value.map(acc => ({
        ...acc,
        amount: Math.abs(acc.amount) 
      })),
      customer_balances: customerBalances.value,
      supplier_balances: supplierBalances.value,
      loans: loans.value,
      retained_earnings: retainedEarnings.value
    };

     const res= await axiosInstance.post(`/fiscal-years/open-balance/post`, payload);
     if(res.data.success){
      showAlert('success', 'Opening balances posted successfully!');
      clearData()
      fetchFiscalYears();
      activeTab.value = 'summary'
      openingStatus.value = 'POSTED';
     }     
     
    } catch (error) {
      showAlert('error', 'Failed to post.');
      console.error(error);
    }
    finally{
      isPost.value = false;
    }
  }
};


const clearData = () => {
 bankAccounts.value = '';
 cashAccounts.value = '';
 customerBalances.value = '';
 supplierBalances.value = '';
 loans.value = ref([]);
 retainedEarnings.value = '';
}

// ==================== API ====================

const axiosInstance = axios.create({
  baseURL: COPEX_API_URL,
  headers: { "Content-Type": "application/json" }
});

const fetchFiscalYears = async () => {
  isLoading.value = true;
  try {
    const fiscalYearId = route.params?.id;
    const res = await axiosInstance.get(`/fiscal-years/${fiscalYearId}`);
    
    fiscalYear.value = res.data;
    openingStatus.value = res.data.opening_status || 'DRAFT';
    
    // SUMMARY CARDS KUTOKA BACKEND - USIIONDOE!
    summaryCards.value = res.data.summary || [];
    
    // Load existing opening balances
    bankAccounts.value = (res.data.bank_accounts || []).map(acc => ({
      ...acc,
      type: acc.type || 'DEBIT'
    }));
    
    cashAccounts.value = (res.data.cash_accounts || []).map(acc => ({
      ...acc,
      type: acc.type || 'DEBIT'
    }));
    
    customerBalances.value = res.data.customer_balances || [];
    supplierBalances.value = res.data.supplier_balances || [];
    loans.value = res.data.loans || [];
    retainedEarnings.value = res.data.retained_earnings || [];

  } catch (error) {
    console.error('Error fetching fiscal year:', error);
    showAlert('error', 'Failed to load fiscal year data.');
    // Add default rows
    addBankRow();
    addCashRow();
    addRetainedRow();
  } finally {
    isLoading.value = false;
  }
};


const fetchFormData = async (type) => {

  try {

    // prevent reloading specific type if already loaded
    if (type === 'BANK' && bankAccountsData.value.length) return;
    if (type === 'CASH' && cashAccountsData.value.length) return;
    if (type === 'SUPPLIERS' && suppliersData.value.length) return;
    if (type === 'CLIENTS' && customersData.value.length) return;

    const res = await axiosInstance.get('/form-data', {
      params: { type }
    });

    // load currencies once
    if (!currencies.value.length) {
      currencies.value = res.data.currencies || [];
    }

    const responseData = res.data.data || [];

    // assign data based on type
    switch (type) {
      case 'BANK':
        bankAccountsData.value = responseData;
        break;

      case 'CASH':
        cashAccountsData.value = responseData;
        break;

      case 'SUPPLIERS':
        suppliersData.value = responseData;
        break;

      case 'CLIENTS':
        customersData.value = responseData;
        break;

      default:
        break;
    }

  } catch (error) {
    console.error('Error fetching form data:', error);
  }
};



onMounted(() => {
  // fetchFormData();
  fetchFiscalYears();
});
</script>

<style>
/* No custom CSS - Bootstrap only */
</style>