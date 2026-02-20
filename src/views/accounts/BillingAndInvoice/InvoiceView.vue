<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

// Define tab types
type TabType = 'dashboard' | 'invoices' | 'payments' | 'leases' | 'documents';

// Mock data for invoices (same as your image)
const mockInvoices = [
  {
    invoice_number: 'INV-0012/26',
    property_lease: 'KARIAKOO - APARTMENT Lease: LS0009',
    status: 'DRAFT',
    amount: 'USD 3,000.00',
    paid: '0.00',
    balance: '3,000.00',
    invoice_date: '01 Feb 2026',
    due_date: '31 Jul 2026',
  },
  {
    invoice_number: 'INV-0024/26',
    property_lease: 'KARIAKOO - APARTMENT Lease: LS0009',
    status: 'DRAFT',
    amount: 'TZS 900,000.00',
    paid: '0.00',
    balance: '900,000.00',
    invoice_date: '01 Feb 2026',
    due_date: '31 Jul 2026',
  },
  {
    invoice_number: 'INV-0013/26',
    property_lease: 'KARIAKOO - APARTMENT Lease: LS0010',
    status: 'DRAFT',
    amount: 'USD 3,000.00',
    paid: '0.00',
    balance: '3,000.00',
    invoice_date: '01 Feb 2026',
    due_date: '31 Jul 2026',
  },
  {
    invoice_number: 'INV-0025/26',
    property_lease: 'KARIAKOO - APARTMENT Lease: LS0010',
    status: 'DRAFT',
    amount: 'TZS 900,000.00',
    paid: '0.00',
    balance: '900,000.00',
    invoice_date: '01 Feb 2026',
    due_date: '31 Jul 2026',
  }
];

// Reactive state
const activeTab = ref<TabType>('dashboard');
const searchQuery = ref('');
const isLoading = ref(false);
const showFilters = ref(false);

// Tenant information
const tenantInfo = ref({
  name: 'ASHA ABDALLAH',
  business: 'TNT-0009',
  email: 'zarnub@hotmel.com'
});

// Dashboard statistics
const stats = ref({
  totalInvoices: 12,
  totalAmount: 'USD 25,000.00',
  overdueInvoices: 2,
  paidInvoices: 8,
  pendingPayments: 'USD 5,000.00',
  activeLeases: 2
});

// Tabs configuration
const tabs = ref([
  { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
  { id: 'invoices', label: 'All Invoices', icon: 'fas fa-file-invoice' },
  { id: 'payments', label: 'Payments', icon: 'fas fa-money-check-alt' },
  { id: 'leases', label: 'Leases', icon: 'fas fa-file-contract' },
  { id: 'documents', label: 'Documents', icon: 'fas fa-folder' }
]);

// Filtered invoices based on search
const filteredInvoices = computed(() => {
  if (!searchQuery.value.trim()) return mockInvoices;
  
  const query = searchQuery.value.toLowerCase();
  return mockInvoices.filter(inv => 
    inv.invoice_number.toLowerCase().includes(query) ||
    inv.property_lease.toLowerCase().includes(query) ||
    inv.status.toLowerCase().includes(query)
  );
});

// Simulate loading
const fetchData = async () => {
  isLoading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
  } finally {
    isLoading.value = false;
  }
};

// Switch tabs
const switchTab = (tabId: TabType) => {
  activeTab.value = tabId;
  fetchData();
};

// View invoice details
const viewInvoice = (invoiceNumber: string) => {
  alert(`Viewing invoice: ${invoiceNumber}`);
  // In real app: $router.push(`/invoices/${invoiceNumber}`)
};

// Export to PDF
const exportToPDF = () => {
  alert('Exporting to PDF...');
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  
  <div class="tenant-dashboard">
    <!-- Tenant Header -->
    <div class="tenant-header mb-4">
      <div class="row align-items-center">
        <div class="col-md-8">
          <h1 class="tenant-name mb-2">{{ tenantInfo.name }}</h1>
          <div class="tenant-details">
            <span class="me-4">
              <strong>Business:</strong> 
              <span class="ms-1 business-code">{{ tenantInfo.business }}</span>
            </span>
            <span>
              <strong>Email:</strong> 
              <span class="ms-1">{{ tenantInfo.email }}</span>
            </span>
          </div>
        </div>
        <div class="col-md-4 text-end">
          <div class="dropdown d-inline-block me-2">
            <button class="btn btn-outline-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i class="fas fa-cog me-1"></i> Settings
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#"><i class="fas fa-edit me-2"></i> Edit Profile</a></li>
              <li><a class="dropdown-item" href="#"><i class="fas fa-envelope me-2"></i> Contact Tenant</a></li>
            </ul>
          </div>
          <button class="btn btn-primary btn-sm" @click="exportToPDF">
            <i class="fas fa-file-pdf me-1"></i> Export
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-navigation mb-4">
      <ul class="nav nav-tabs">
        <li class="nav-item" v-for="tab in tabs" :key="tab.id">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === tab.id }"
            @click="switchTab(tab.id as TabType)"
          >
            <i :class="tab.icon + ' me-2'"></i>
            {{ tab.label }}
          </button>
        </li>
      </ul>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- DASHBOARD TAB -->
      <div v-if="activeTab === 'dashboard'" class="dashboard-tab">
        <!-- Quick Stats -->
        <div class="row mb-4">
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-icon bg-primary">
                <i class="fas fa-file-invoice"></i>
              </div>
              <div class="stat-info">
                <h6>Total Invoices</h6>
                <h3>{{ stats.totalInvoices }}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-icon bg-success">
                <i class="fas fa-money-bill-wave"></i>
              </div>
              <div class="stat-info">
                <h6>Total Amount</h6>
                <h3>{{ stats.totalAmount }}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-icon bg-warning">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-info">
                <h6>Pending Payments</h6>
                <h3>{{ stats.pendingPayments }}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-icon bg-info">
                <i class="fas fa-file-contract"></i>
              </div>
              <div class="stat-info">
                <h6>Active Leases</h6>
                <h3>{{ stats.activeLeases }}</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity & Quick Actions -->
        <div class="row">
          <div class="col-md-8">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Recent Invoices</h5>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>INVOICE #</th>
                        <th>AMOUNT</th>
                        <th>DUE DATE</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="invoice in mockInvoices.slice(0, 3)" :key="invoice.invoice_number">
                        <td>{{ invoice.invoice_number }}</td>
                        <td>{{ invoice.amount }}</td>
                        <td>{{ invoice.due_date }}</td>
                        <td>
                          <span class="badge bg-warning">{{ invoice.status }}</span>
                        </td>
                        <td>
                          <button class="btn btn-sm btn-outline-primary" @click="viewInvoice(invoice.invoice_number)">
                            <i class="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="card-footer text-end">
                <button class="btn btn-sm btn-link" @click="switchTab('invoices')">
                  View All Invoices <i class="fas fa-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Quick Actions</h5>
              </div>
              <div class="card-body">
                <div class="d-grid gap-2">
                  <button class="btn btn-outline-primary text-start">
                    <i class="fas fa-plus-circle me-2"></i> Create New Invoice
                  </button>
                  <button class="btn btn-outline-success text-start">
                    <i class="fas fa-money-check me-2"></i> Record Payment
                  </button>
                  <button class="btn btn-outline-info text-start">
                    <i class="fas fa-file-contract me-2"></i> New Lease Agreement
                  </button>
                  <button class="btn btn-outline-warning text-start">
                    <i class="fas fa-envelope me-2"></i> Send Reminder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- INVOICES TAB (Exactly like your image) -->
      <div v-if="activeTab === 'invoices'" class="invoices-tab">
        <!-- Invoices Header -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h4 mb-0">All Invoices</h2>
          <div class="d-flex gap-2">
            <div class="input-group input-group-sm" style="width: 250px;">
              <span class="input-group-text"><i class="fas fa-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search invoices..."
                v-model="searchQuery"
              />
            </div>
            <button class="btn btn-outline-secondary btn-sm" @click="showFilters = !showFilters">
              <i class="fas fa-filter me-1"></i> Filter
            </button>
            <button class="btn btn-primary btn-sm">
              <i class="fas fa-plus me-1"></i> New Invoice
            </button>
          </div>
        </div>

        <!-- Filters Section -->
        <div v-if="showFilters" class="card mb-3">
          <div class="card-body py-3">
            <div class="row g-2">
              <div class="col-md-3">
                <select class="form-select form-select-sm">
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select form-select-sm">
                  <option value="">All Properties</option>
                  <option value="KARIAKOO">KARIAKOO</option>
                </select>
              </div>
              <div class="col-md-3">
                <input type="date" class="form-control form-control-sm" placeholder="From Date">
              </div>
              <div class="col-md-3">
                <input type="date" class="form-control form-control-sm" placeholder="To Date">
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

        <!-- Invoices Table (EXACTLY like your image) -->
        <div v-else class="card">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>INVOICE #</th>
                    <th>PROPERTY / LEASE</th>
                    <th>STATUS</th>
                    <th>AMOUNT</th>
                    <th>PAID</th>
                    <th>BALANCE</th>
                    <th>INVOICE DATE</th>
                    <th>DUE DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="invoice in filteredInvoices" :key="invoice.invoice_number">
                    <td><strong>{{ invoice.invoice_number }}</strong></td>
                    <td>{{ invoice.property_lease }}</td>
                    <td>
                      <span class="badge bg-warning">{{ invoice.status }}</span>
                    </td>
                    <td><strong>{{ invoice.amount }}</strong></td>
                    <td>{{ invoice.paid }}</td>
                    <td><strong>{{ invoice.balance }}</strong></td>
                    <td>{{ invoice.invoice_date }}</td>
                    <td>{{ invoice.due_date }}</td>
                    <td>
                      <button 
                        class="btn btn-sm btn-outline-primary"
                        @click="viewInvoice(invoice.invoice_number)"
                        title="View Invoice"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div v-if="filteredInvoices.length === 0" class="text-center py-5">
              <i class="fas fa-receipt fa-3x text-muted mb-3"></i>
              <h5 class="text-muted">No invoices found</h5>
              <p class="text-muted">Try adjusting your search</p>
            </div>

            <!-- Summary -->
            <div v-if="filteredInvoices.length > 0" class="border-top p-3">
              <div class="row">
                <div class="col-md-6">
                  <small class="text-muted">
                    Showing {{ filteredInvoices.length }} invoice(s)
                  </small>
                </div>
                <div class="col-md-6 text-end">
                  <small class="text-muted">
                    Total Balance: 
                    <strong style="color: #1F4E8C;">
                      {{ 
                        filteredInvoices.reduce((sum, inv) => {
                          const balance = parseFloat(inv.balance.replace(/[^\d.-]/g, ''));
                          return sum + (isNaN(balance) ? 0 : balance);
                        }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      }}
                    </strong>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PAYMENTS TAB -->
      <div v-if="activeTab === 'payments'" class="payments-tab">
        <div class="text-center py-5">
          <i class="fas fa-money-check-alt fa-4x text-muted mb-3"></i>
          <h4 class="text-muted">Payments Overview</h4>
          <p class="text-muted">Payment history and tracking will appear here</p>
        </div>
      </div>

      <!-- LEASES TAB -->
      <div v-if="activeTab === 'leases'" class="leases-tab">
        <div class="text-center py-5">
          <i class="fas fa-file-contract fa-4x text-muted mb-3"></i>
          <h4 class="text-muted">Lease Agreements</h4>
          <p class="text-muted">Active and past leases will appear here</p>
        </div>
      </div>

      <!-- DOCUMENTS TAB -->
      <div v-if="activeTab === 'documents'" class="documents-tab">
        <div class="text-center py-5">
          <i class="fas fa-folder fa-4x text-muted mb-3"></i>
          <h4 class="text-muted">Documents</h4>
          <p class="text-muted">Uploaded documents and contracts will appear here</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tenant-dashboard {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 20px;
}

.tenant-header {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.tenant-name {
  color: #1a1a1a;
  font-weight: 600;
  margin: 0;
}

.tenant-details {
  color: #666;
  font-size: 0.95rem;
}

.business-code {
  color: #1F4E8C;
  font-weight: 500;
}

/* Tabs Navigation */
.tabs-navigation .nav-tabs {
  border-bottom: 2px solid #dee2e6;
}

.tabs-navigation .nav-link {
  color: #6c757d;
  border: none;
  padding: 12px 20px;
  font-weight: 500;
  border-bottom: 3px solid transparent;
}

.tabs-navigation .nav-link:hover {
  color: #1F4E8C;
  border-bottom: 3px solid rgba(31, 78, 140, 0.3);
}

.tabs-navigation .nav-link.active {
  color: #1F4E8C;
  background-color: transparent;
  border-bottom: 3px solid #1F4E8C;
}

/* Stat Cards */
.stat-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  height: 100px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
}

.stat-icon.bg-primary { background-color: #1F4E8C; }
.stat-icon.bg-success { background-color: #28a745; }
.stat-icon.bg-warning { background-color: #ffc107; }
.stat-icon.bg-info { background-color: #17a2b8; }

.stat-info h6 {
  color: #6c757d;
  font-size: 0.85rem;
  margin-bottom: 5px;
}

.stat-info h3 {
  color: #1a1a1a;
  font-weight: 600;
  margin: 0;
}

/* Table Styling */
.table {
  font-size: 0.9rem;
}

.table thead th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  padding: 12px 16px;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.table tbody td {
  padding: 12px 16px;
  vertical-align: middle;
  border-bottom: 1px solid #e9ecef;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.table tbody tr:hover {
  background-color: rgba(31, 78, 140, 0.04);
}

.badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
}

.bg-warning {
  background-color: #ffc107 !important;
  color: #000;
}

.btn-outline-primary {
  border-color: #1F4E8C;
  color: #1F4E8C;
}

.btn-outline-primary:hover {
  background-color: #1F4E8C;
  color: white;
}

.btn-primary {
  background-color: #1F4E8C;
  border-color: #1F4E8C;
}

.btn-primary:hover {
  background-color: #17406f;
  border-color: #17406f;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 0.875rem;
}

.card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid #e9ecef;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 15px 20px;
}

.card-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  padding: 12px 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .tenant-details {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .tabs-navigation .nav-link {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .stat-card {
    height: 80px;
    padding: 10px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }
  
  .stat-info h3 {
    font-size: 1.5rem;
  }
}
</style>