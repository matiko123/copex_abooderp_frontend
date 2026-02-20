<template>
   <div class="d-flex align-items-center">
      <div>
        <ul class="breadcrumb">
          <li class="breadcrumb-item"><a href="#">MASTER DATA</a></li>                  
          <li class="breadcrumb-item"><a href="#">ACCOUNT SETTINGS</a></li>                  
          <li class="breadcrumb-item active">CHART OF ACCOUNTS</li>
          
        </ul>
      </div>
  </div>
  <div class="ps-page chart-of-accounts-page">
    <main class="content">    

      <!-- Main Content -->
      <div class="row layout-top-spacing">
        <div class="col-xl-12">
          <div class="panel">
            <!-- Header Section -->
            <div class="panel-header">
              <div class="panel-title">
                <h5>Account Tree View</h5>
              </div>
              <div class="panel-actions">

                <button class="btn btn-header" type="button" @click="exportToPDF">
                  <span class="btn-icon"><i class="fa fa-file-pdf"></i></span>
                  <span>PDF</span>
                </button>
                <button class="btn btn-header" type="button" @click="exportToExcel">
                  <span class="btn-icon"><i class="fa fa-file-excel"></i></span>
                  <span>Excel</span>
                </button>
                <button class="btn btn-header btn-header-primary" type="button" @click="toggleAddAccountForm">
                  <span class="btn-icon"><i class="fa fa-plus"></i></span>
                  <span>Add Account</span>
                </button>
                <button class="btn btn-header btn-header-primary" type="button" @click="toggleAddAccountGroupForm">
                  <span class="btn-icon"><i class="fa fa-plus"></i></span>
                  <span>Account Group</span>
                </button>
                
                <button class="btn btn-header btn-header-ghost" type="button" @click="goBack">
                  <span class="btn-icon"><i class="fa fa-arrow-left"></i></span>
                  <span>Reflesh</span>
                </button>
              </div>
            </div>

            <!-- Content Section -->
            <div class="panel-body">
              <!-- Loading State -->
              <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading accounts...</p>
              </div>

              <!-- Error State -->
              <div v-else-if="error" class="alert alert-danger" role="alert">
                <i class="fa fa-exclamation-circle me-2"></i>
                <strong>Error loading accounts:</strong> {{ error }}
              </div>

              <!-- Add Account Form (Inline) -->
              <div v-if="showAddAccountForm" class="add-account-form-wrapper">
                <div class="add-account-form-row">
                  <div class="form-group">
                    <label>Account Name <span class="required">*</span></label>
                    <input v-model="newAccountForm.name" type="text" class="form-control" placeholder="Enter account name" />
                  </div>
                  <div class="form-group">
                    <label>Account Code</label>
                    <input v-model="newAccountForm.code" type="text" class="form-control" placeholder="Optional" />
                  </div>
                  <div class="form-group">
                    <label>Account Group <span class="required">*</span></label>
                    <select v-model="newAccountForm.account_group_id" class="form-control">
                      <option value="">Select account group</option>
                      <option v-for="group in accountGroups" :key="group.id" :value="group.id">
                        {{ group.name }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Currency <span class="required">*</span></label>
                    <select v-model="newAccountForm.currency_id" class="form-control">
                      <option :value="null">Select currency</option>
                      <option v-for="currency in currencies" :key="currency.id" :value="currency.id">
                        {{ currency.code }} - {{ currency.currency }}
                      </option>
                    </select>
                  </div>
                  <div class="form-actions">
                    <button type="button" class="btn btn-add" @click="handleCreateAccountInline">
                      <i class="fa fa-check"></i> Add
                    </button>
                    <button type="button" class="btn btn-cancel" @click="toggleAddAccountForm">
                      <i class="fa fa-times"></i> Cancel
                    </button>
                  </div>
                </div>
              </div>

              <!-- Add Account Group Form (Inline) -->
              <div v-if="showAddAccountGroupForm" class="add-account-form-wrapper">
                <div class="add-account-form-row">
                  <div class="form-group">
                    <label>Group Name <span class="required">*</span></label>
                    <input v-model="newAccountGroupForm.name" type="text" class="form-control" placeholder="Enter account group name" />
                  </div>
                  <div class="form-group">
                    <label>Parent Group</label>
                    <select v-model="newAccountGroupForm.parent_id" class="form-control">
                      <option :value="null">No parent (Root group)</option>
                      <option v-for="group in accountGroups" :key="group.id" :value="group.id">
                        {{ group.name }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Group Code</label>
                    <input v-model="newAccountGroupForm.code" type="text" class="form-control" placeholder="Optional" />
                  </div>
                  <div class="form-actions">
                    <button type="button" class="btn btn-add" @click="handleCreateAccountGroupInline">
                      <i class="fa fa-check"></i> Add Group
                    </button>
                    <button type="button" class="btn btn-cancel" @click="toggleAddAccountGroupForm">
                      <i class="fa fa-times"></i> Cancel
                    </button>
                  </div>
                </div>
              </div>

              <!-- Tree View -->
              <div v-if="!loading && !error" class="account-tree-wrapper">
                <div v-if="accountTree.length > 0" class="tree-panel">
                  <!-- @ts-expect-error: AccountTreeSearch component -->
                  <AccountTreeSearch
                    :accounts="accountTree"
                    @select="selectAccount"
                  />
                </div>
                <div v-else class="alert alert-info">
                  No accounts available
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios';
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AccountTreeSearch from './AccountTreeSearch.vue'
import { COPEX_API_URL  } from "@/config/config.js";
import { accountService } from '@/services/macargo/accountService'
import Swal from 'sweetalert2'


const axiosInstance = axios.create({
  baseURL: COPEX_API_URL,
  headers: { "Content-Type": "application/json" }
});
interface Account {
  id: number | string
  code: string
  name: string
  parent_account_id: number | string | null
  children?: Account[]
}

interface AccountGroup {
  id: number
  parent_id: number | null
  name: string
  code: string | null
}

const router = useRouter()
const authStore = useAuthStore()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const accountTree = ref<Account[]>([])
const accountGroups = ref<AccountGroup[]>([])
const currencies = ref<Array<{ id: number; currency: string; code: string }>>([])
const selectedAccount = ref<Account | null>(null)
const showAddAccountForm = ref(false)
const showAddAccountGroupForm = ref(false)
const exportLoading = ref(false)
const creatingAccount = ref(false)

// Form data for inline add account
const newAccountForm = ref({
  name: '',
  code: '',
  account_group_id: '' as string | number,
  currency_id: null as number | null
})

// Form data for inline add account group
const newAccountGroupForm = ref({
  name: '',
  code: '',
  parent_id: null as number | null
})

// Computed property for company_id
// For Chart of Accounts we always use company_id = 1
const companyId = computed(() => 1)

// Methods
const fetchAccounts = async () => {
  loading.value = true
  error.value = null

  try {
    // Build URL with company_id parameter
    const baseUrl = (COPEX_API_URL || 'http://localhost:8000/api/v1/').replace(/\/$/, '')
    const url = new URL(`${baseUrl}/chart-of-accounts/tree`)
    url.searchParams.set('company_id', String(companyId.value))

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    // Handle both direct array and nested response structure
    accountTree.value = Array.isArray(data) ? data : data.data || []
    
    if (accountTree.value.length === 0) {
      error.value = 'No accounts found for this company'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load accounts'
    console.error('Error fetching accounts:', err)
  } finally {
    loading.value = false
  }
}

const fetchAccountGroups = async () => {
  try {
    accountGroups.value = await accountService.fetchAccountGroups()
  } catch (err) {
    console.error('Error fetching account groups:', err)
  }
}

const fetchCurrencies = async () => {
  try {
    const response = await axiosInstance.get('/form-data')
    console.log('Currencies API response:', response.data)
    // Handle response structure: { success: true, data: [...] }
    const data = response?.data?.currencies ??  []
    currencies.value = Array.isArray(data) ? data : []
    console.log('Currencies loaded:', currencies.value)
  } catch (err) {
    console.error('Error fetching currencies:', err)
    currencies.value = []
  }
}

const selectAccount = (account: Account) => {
  selectedAccount.value = account
}

const toggleAddAccountForm = () => {
  showAddAccountForm.value = !showAddAccountForm.value
  if (showAddAccountForm.value) {
    // Ensure only one inline form is visible at a time
    showAddAccountGroupForm.value = false
  }
  // Reset form when toggling
  if (!showAddAccountForm.value) {
    newAccountForm.value = {
      name: '',
      code: '',
      account_group_id: '',
      currency_id: null
    }
  }
}

const toggleAddAccountGroupForm = () => {
  showAddAccountGroupForm.value = !showAddAccountGroupForm.value
  if (showAddAccountGroupForm.value) {
    // Ensure only one inline form is visible at a time
    showAddAccountForm.value = false
  }
  if (!showAddAccountGroupForm.value) {
    newAccountGroupForm.value = { name: '', code: '', parent_id: null }
  }
}

const handleCreateAccountInline = async () => {
  try {
    // Validate form
    if (!newAccountForm.value.name || !newAccountForm.value.account_group_id || !newAccountForm.value.currency_id) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all required fields (Name, Account Group, Currency)',
        confirmButtonColor: '#2563eb'
      })
      return
    }

    creatingAccount.value = true
    const payload = {
      name: newAccountForm.value.name,
      code: newAccountForm.value.code?.trim() || null,
      account_group_id: Number(newAccountForm.value.account_group_id),
      company_id: companyId.value,
      currency_id: newAccountForm.value.currency_id
    }

    await accountService.createAccount(payload);
    
    // Refresh the tree
    await fetchAccounts()

    // Close form and reset
    showAddAccountForm.value = false
    const accountName = newAccountForm.value.name
    const accountCode = newAccountForm.value.code?.trim()
    newAccountForm.value = {
      name: '',
      code: '',
      account_group_id: '',
      currency_id: null
    }

    // Show success alert
    await Swal.fire({
      icon: 'success',
      title: 'Account Created!',
      text: `Account "${accountCode ? accountCode + ' - ' : ''}${accountName}" has been created successfully.`,
      confirmButtonColor: '#2563eb',
      timer: 3000,
      timerProgressBar: true
    })

    error.value = null
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to create account'
    error.value = errorMessage
    
    // Show error alert
    await Swal.fire({
      icon: 'error',
      title: 'Error Creating Account',
      text: errorMessage,
      confirmButtonColor: '#2563eb'
    })
    
    console.error('Error creating account:', err)
  } finally {
    creatingAccount.value = false
  }
}

const handleCreateAccountGroupInline = async () => {
  try {
    // Validate form - only name is required
    if (!newAccountGroupForm.value.name?.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please enter the account group name',
        confirmButtonColor: '#2563eb'
      })
      return
    }

    creatingAccount.value = true

    const payload = {
      type: 'ACCOUNT_GROUP' as const,
      name: newAccountGroupForm.value.name.trim(),
      parent_id: newAccountGroupForm.value.parent_id || null,
      code: newAccountGroupForm.value.code?.trim() || null
    }

    await accountService.createAccountGroup(payload)


    // const res = await axiosInstance.post()

    // Refresh account groups dropdown and tree
    await Promise.all([
      fetchAccountGroups(),
      fetchAccounts()
    ])

    // Close form and reset
    showAddAccountGroupForm.value = false
    const groupName = newAccountGroupForm.value.name
    newAccountGroupForm.value = { name: '', code: '', parent_id: null }

    await Swal.fire({
      icon: 'success',
      title: 'Account Group Created!',
      text: `Account group "${groupName}" has been created successfully.`,
      confirmButtonColor: '#2563eb',
      timer: 3000,
      timerProgressBar: true
    })

    error.value = null
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to create account group'
    error.value = errorMessage

    await Swal.fire({
      icon: 'error',
      title: 'Error Creating Account Group',
      text: errorMessage,
      confirmButtonColor: '#2563eb'
    })

    console.error('Error creating account group:', err)
  } finally {
    creatingAccount.value = false
  }
}

const openAddAccountModal = () => {
  // Deprecated - using inline form now
}

const handleCreateAccount = async () => {
  // Deprecated - using inline form now
}

const exportToPDF = () => {
  // Open PDF in new tab instead of downloading
  const baseUrl = COPEX_API_URL.replace(/\/$/, '')
  const url = new URL(`${baseUrl}/chart-of-accounts/print`)
  url.searchParams.set('format', 'pdf')
  url.searchParams.set('company_id', String(companyId.value))
  window.open(url.toString(), '_blank', 'noopener,noreferrer')
}

const exportToExcel = async () => {
  try {
    exportLoading.value = true
    await accountService.exportExcel(companyId.value as number)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to export Excel'
    console.error('Error exporting Excel:', err)
  } finally {
    exportLoading.value = false
  }
}


function openPdfReport() {
  window.open('https://peta.abooderp.com/api/v1/chart-of-accounts/pdf', '_blank');
}

const goBack = () => {
  fetchAccounts()  
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchAccounts(),
    fetchAccountGroups(),
    fetchCurrencies()
  ])
})
</script>

<style scoped>
.chart-of-accounts-page {
  padding: 1rem 0;
}

/* Page Header Styles */
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: .5rem;
  flex-wrap: wrap;
}

.page-head-left {
  flex: 1;
}

.crumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-weight: 400;
  margin-bottom: 8px;
}

.crumbs span {
  font-weight: 700;
  color: #2563eb;
}

.crumb-icon {
  font-size: 14px;
}

h1 {
  margin: 6px 0 4px;
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.subtitle {
  margin: 0;
  color: #475569;
  font-size: 14px;
}

.head-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  border: 1px solid #d0d0d0;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  background: #f5f7fa;
  border-color: #999;
}

.btn.ghost {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  border: none;
  color: white;
  padding: 10px 18px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.btn.ghost:hover {
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.5);
  transform: translateY(-2px);
}

.btn.ghost:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.btn-icon {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.btn-header {
  border-radius: 9999px; /* pill */
  padding: 6px 14px;
  font-size: 13px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  gap: 6px;
}

.btn-header-primary {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
}

.btn-header-primary:hover {
  background: #1e40af;
  border-color: #1e40af;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.45);
}

.btn-header-ghost {
  background: #f3f4f6;
  border-color: #e5e7eb;
  color: #374151;
}

.btn-header-ghost:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

/* Panel Styles */
.panel {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.panel-title h5 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.panel-title p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #64748b;
}

.panel-body {
  padding: 20px;
}

/* Tree View */
.account-tree-wrapper {
  max-height: 600px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

/* Add Account Form */
.add-account-form-wrapper {
  background: #f8fafc;
  border: 2px solid #dbeafe;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.add-account-form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  align-items: flex-end;
}

.add-account-form-row .form-group {
  display: flex;
  flex-direction: column;
}

.add-account-form-row label {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.add-account-form-row label .required {
  color: #dc2626;
}

.add-account-form-row .form-control {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.add-account-form-row .form-control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  outline: none;
}

.form-actions {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  padding-top: 8px;
}

.btn-add {
  background: #2563eb;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-add:hover {
  background: #1e40af;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.5);
  transform: translateY(-2px);
}

.btn-add:active {
  transform: translateY(0);
}

.btn-cancel {
  background: #e5e7eb;
  border: none;
  color: #374151;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-cancel:hover {
  background: #d1d5db;
}

.tree-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tree-container {
  padding: 0;
  border-collapse: collapse;
}

/* Loading & Error States */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

.alert {
  margin: 0;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
}

.alert-danger {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.alert-info {
  background: #dbeafe;
  border: 1px solid #bfdbfe;
  color: #1e40af;
}

/* Details Section */
.detail-item {
  margin-bottom: 16px;
}

.detail-item label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
  color: #0f172a;
  font-weight: 500;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.bg-success {
  background: #d1fae5;
  color: #065f46;
}

.bg-secondary {
  background: #e5e7eb;
  color: #374151;
}

/* Scrollbar */
.account-tree-wrapper::-webkit-scrollbar {
  width: 8px;
}

.account-tree-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.account-tree-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.account-tree-wrapper::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 768px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }

  h1 {
    font-size: 24px;
  }

  .account-tree-wrapper {
    max-height: 400px;
  }
}
</style>
