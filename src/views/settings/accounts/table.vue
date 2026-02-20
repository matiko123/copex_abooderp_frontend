<!-- OpeningBalanceTable.vue -->
<template>
  <div class="card border-0 shadow-sm">
    <div class="card-header bg-light border-0 py-2">
      <h6 class="fw-bold mb-0">{{ title }}</h6>
    </div>
    <div class="card-body py-3">
      <p class="text-muted small mb-2">{{ description }}</p>
      
      <!-- Alert for AR/AP if needed -->
      <div v-if="showAlert" class="alert alert-info py-1 px-2 mb-2 small">
        <i class="bi bi-info-circle me-1"></i>
        {{ alertMessage }}
      </div>

      <div class="table-responsive">
        <table class="table table-bordered table-hover align-middle mb-0 small">
          <thead class="table-light">
            <tr>
              <th>{{ entityLabel }}</th>
              <th>Currency</th>
              <th>Amount</th>
              <th v-if="showType">Type</th>
              <th>Notes</th>
              <th style="width: 100px">Actions</th> <!-- Changed from 40px to 100px -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in items" :key="row.id || index"
                :class="{ 'table-warning': row._dirty }"> <!-- Added dirty highlight -->
              <td>
                <select 
                  v-if="options.length" 
                  v-model="row[accountField]" 
                  class="form-select form-select-sm"
                  @change="handleAccountChange(row)"
                >
                  <option value="">Select {{ entityLabel }}</option>
                  <option 
                    v-for="opt in filteredOptions(row[accountField])" 
                    :key="opt.id" 
                    :value="opt.id"
                  >
                    {{ opt.name }}
                  </option>
                </select>
                <input v-else type="text" class="form-control form-control-sm" v-model="row.name" readonly>
              </td>
              <td>
                <select v-if="currencies.length"
                  v-model="row.currency"
                  class="form-select form-select-sm"
                  @change="handleFieldChange(row, 'currency')"
                >
                  <option v-for="currency in currencies" :key="currency.id" :value="currency.code">
                    {{ currency.code }}
                  </option>
                </select>
                <input v-else type="text" class="form-control form-control-sm" v-model="row.currency" readonly>
              </td>
              <td>
                <input 
                  type="number" 
                  v-model.number="row.amount" 
                  class="form-control form-control-sm" 
                  step="0.01" 
                  placeholder="0.00" 
                  :min="minAmount"
                  @input="handleFieldChange(row, 'amount')" 
                />
              </td>
              <td v-if="showType">
                <select v-model="row.type"
                  class="form-select form-select-sm"
                  @change="handleFieldChange(row, 'type')">
                  <option value="DEBIT">DEBIT</option>
                  <option value="CREDIT">CREDIT</option>
                </select>
              </td>
              <td>
                <input type="text"
                  v-model="row.notes"
                  class="form-control form-control-sm"
                  placeholder="Notes" 
                  @input="handleFieldChange(row, 'notes')" 
                />
              </td>
              <td>
                <div class="d-flex gap-1">
                  <!-- Save Button with Row-specific Spinner -->
                  <button 
                    class="btn btn-sm btn-success py-0 px-1" 
                    @click="saveRow(row, index)"
                    :disabled="row._saving || !row._dirty"
                    :title="row._dirty ? 'Save changes' : 'No changes to save'"
                  >
                    <span v-if="row._saving">
                      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    </span>
                    <span v-else>
                      <i class="bi bi-plus-circle"></i>
                    </span>
                  </button>
                  
                  <!-- Delete Button -->
                   <button 
      class="btn btn-sm btn-danger py-0 px-1" 
      @click="removeRow(row, index)"
      :disabled="row._deleting || row._saving"
      :title="'Delete this item'"
    >
      <span v-if="row._deleting">
        <span class="spinner-border spinner-border-sm" role="status"></span>
      </span>
      <span v-else>
        <i class="bi bi-trash"></i>
      </span>
    </button>
                </div>
              </td>
            </tr>
            <tr>
             
              <td :colspan="colspan + 1" class="py-2"> <!-- +1 for actions column -->
                 <div class="d-flex justify-content-between ">
                <button class="btn btn-sm btn-outline-primary" @click="$emit('add')">
                  <i class="bi bi-plus-circle me-1"></i>Add {{ entityLabel }}
                </button>    
                    <button 
        class="btn btn-sm btn-warning" 
         @click="updateAll"
        :disabled="!hasDirtyRows || updatingAll"
      >
        <span v-if="updatingAll">
          <span class="spinner-border spinner-border-sm me-1"></span>
          Updating...
        </span>
        <span v-else>
          <i class="bi bi-cloud-upload me-1"></i>Update All ({{ dirtyCount }})
        </span>
      </button>
                </div>         
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Summary Section -->
      <div v-if="showSummary" class="row mt-3">
        <div class="col-md-4" v-for="(total, currency) in totalsByCurrency" :key="currency">
          <div class="bg-light p-2 rounded small">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="fw-semibold">{{ currency }} Summary</span>
              <span :class="'badge bg-' + (total >= 0 ? 'success' : 'danger')">
                {{ total >= 0 ? 'DR' : 'CR' }} {{ formatCurrency(Math.abs(total)) }}
              </span>
            </div>
            <div class="d-flex justify-content-between" v-if="showDebitCredit">
              <div>
                <div>Debits:</div>
                <div>Credits:</div>
              </div>
              <div class="text-end">
                <div class="text-success">{{ formatCurrency(debitsByCurrency[currency] || 0) }}</div>
                <div class="text-danger">{{ formatCurrency(creditsByCurrency[currency] || 0) }}</div>
              </div>
            </div>
            <div v-else class="d-flex justify-content-between">
              <span>Total:</span>
              <span class="fw-bold">{{ formatCurrency(total) }}</span>
            </div>
            <hr v-if="showDebitCredit" class="my-1">
            <div v-if="showDebitCredit" class="d-flex justify-content-between">
              <span>Difference:</span>
              <span :class="'fw-bold ' + (differenceByCurrency[currency] === 0 ? 'text-success' : 'text-danger')">
                {{ formatCurrency(differenceByCurrency[currency]) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed , ref} from 'vue';

const props = defineProps({
  title: String,
  description: String,
  entityLabel: String,
  items: Array,
  options: Array,
  currencies: Array,
  accountField: { type: String, default: 'account_id' },
  showType: { type: Boolean, default: false },
  showAlert: { type: Boolean, default: false },
  alertMessage: { type: String, default: '' },
  showSummary: { type: Boolean, default: true },
  showDebitCredit: { type: Boolean, default: false },
  minAmount: { type: Number, default: 0 },
  type: String // 'bank', 'cash', 'customers', 'suppliers'
});

const emit = defineEmits(['remove', 'add', 'update:items', 'account-change', 'save-row' , 'update-all']);

// Calculate colspan based on showType (plus 1 for actions column)
const colspan = computed(() => {
  return props.showType ? 6 : 5;
});

// Filter options to exclude already selected ones
const filteredOptions = (currentId) => {
  if (!props.options || !props.items) return [];
  
  const selectedIds = props.items
    .map(row => row[props.accountField])
    .filter(id => id && id !== '');
  
  return props.options.filter(opt => 
    !selectedIds.includes(opt.id) || opt.id === currentId
  );
};

// Handle field change - mark row as dirty
const handleFieldChange = (row, field) => {
  // Mark row as dirty (has unsaved changes)
  row._dirty = true;
  emit('update:items', props.items);
};

// Handle account change (special case for currency update)
const handleAccountChange = (row) => {
  row._dirty = true; // FIXED: Added this line
  emit('account-change', row);
  emit('update:items', props.items); // FIXED: Added this line
};

// Check if there are any dirty rows
const hasDirtyRows = computed(() => {
  return props.items.some(row => row._dirty === true);
});

// Count dirty rows
const dirtyCount = computed(() => {
  return props.items.filter(row => row._dirty === true).length;
});

// Add new ref for updating all state
const updatingAll = ref(false);

// Update All method
const updateAll = async () => {
  if (!hasDirtyRows.value) return;
  
  if (!confirm(`Update ${dirtyCount.value} items?`)) {
    return;
  }
  
  updatingAll.value = true;
  
    try {
    const dirtyRows = props.items
      .map((row, index) => ({ row, index }))
      .filter(item => item.row._dirty === true);
    
    await emit('update-all', {
      rows: dirtyRows.map(item => ({
        ...item.row,
        _tempIndex: item.index
      })),
      type: props.type
    });
    
    dirtyRows.forEach(item => {
      item.row._dirty = false;
    });
    
  } catch (error) {
    console.error('Error updating all:', error);
    alert('Failed to update all items. Please try again.');
  } finally {
    updatingAll.value = false;
  }
};

// Save specific row
const saveRow = async (row, index) => {
  if (!row._dirty) return; // No changes to save
  
  // Set saving state for this row only
  row._saving = true;
  
  try {
    // Emit event to parent with row data and index
    await emit('save-row', {
      row: { ...row }, // Send a copy to avoid reference issues
      index,
      type: props.type
    });
    
    // If save successful, mark as not dirty
    row._dirty = false;
  } catch (error) {
    console.error('Error saving row:', error);
    // Keep dirty flag so user can try again
  } finally {
    // Always remove saving state
    row._saving = false;
  }
};

const removeRow = async (row, index) => {

  if (!confirm('Are you sure you want to delete this item?')) {
    return;
  }
  row._deleting = true;  
  try {
   
    await emit('remove', {
      row: { ...row },
      index,
      type: props.type
    });
        
  } catch (error) {
    console.error('Error deleting row:', error);
    alert('Failed to delete. Please try again.');
      }
       finally { 
    row._deleting = false;
  }
};



// Calculate totals by currency
const totalsByCurrency = computed(() => {
  const totals = {};
  props.items.forEach(row => {
    if (row.currency && row.amount) {
      let amount = parseFloat(row.amount || 0);
      if (props.showType && row.type === 'CREDIT') {
        amount = -amount;
      }
      totals[row.currency] = (totals[row.currency] || 0) + amount;
    }
  });
  return totals;
});

// Debits by currency
const debitsByCurrency = computed(() => {
  const debits = {};
  props.items.forEach(row => {
    if (row.type === 'DEBIT' && row.currency && row.amount) {
      debits[row.currency] = (debits[row.currency] || 0) + parseFloat(row.amount || 0);
    }
  });
  return debits;
});

// Credits by currency
const creditsByCurrency = computed(() => {
  const credits = {};
  props.items.forEach(row => {
    if (row.type === 'CREDIT' && row.currency && row.amount) {
      credits[row.currency] = (credits[row.currency] || 0) + parseFloat(row.amount || 0);
    }
  });
  return credits;
});

// Difference by currency
const differenceByCurrency = computed(() => {
  const diff = {};
  const currencies = new Set([
    ...Object.keys(debitsByCurrency.value),
    ...Object.keys(creditsByCurrency.value)
  ]);
  
  currencies.forEach(currency => {
    const debits = debitsByCurrency.value[currency] || 0;
    const credits = creditsByCurrency.value[currency] || 0;
    diff[currency] = debits - credits;
  });
  
  return diff;
});

// Format currency
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0.00';
  return amount.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};
</script>

<style scoped>
/* Add these styles for better UX */
.table-warning {
  background-color: #fff3cd !important;
}

.table-warning td:first-child {
  border-left: 3px solid #ffc107;
}

.btn-success:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Pulse animation for save button when dirty */
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.4); }
  70% { box-shadow: 0 0 0 5px rgba(40, 167, 69, 0); }
  100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
}

.btn-success:not(:disabled) {
  animation: pulse 2s infinite;
}
</style>