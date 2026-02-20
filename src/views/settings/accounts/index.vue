<template>
  <div class="d-flex align-items-center">
      <div>
        <ul class="breadcrumb">
          <li class="breadcrumb-item"><a href="#">MASTER DATA</a></li>                  
          <li class="breadcrumb-item"><a href="#">ACCOUNT SETTINGS</a></li>                  
          <li class="breadcrumb-item" :class="showForm? 'text-info':'active'">FISCAL YEAR</li>
          <li v-if="showForm" class="breadcrumb-item active">CREATE</li>
        </ul>
      </div>
  </div>
  <div class="p-4 bg-white rounded shadow-sm"> 
    <!-- Fiscal Year Form -->
    <form v-if="showForm" @submit.prevent="submitForm" class="mb-5 border p-3 rounded">
            <div class="text-center mb-1">
      <h4>Fiscal Year Registration Form</h4>
            </div>
            <hr>
      <div class="row">    
      <div class="col-md-4 mb-3">
        <label class="form-label">Name *</label>
        <input type="text" class="form-control" v-model="form.name" required />
      </div>

      <div class="col-md-4 mb-3">
        <label class="form-label">Code *</label>
        <input type="text" class="form-control" v-model="form.code" required />
      </div>

      <div class="col-md-4 mb-3">
        <label class="form-label">Start Date *</label>
        <Datepicker v-model="form.start_date" :format="'yyyy-MM-dd'" required />
      </div>

      <div class="col-md-4 mb-3">
        <label class="form-label">End Date *</label>
        <Datepicker v-model="form.end_date" :format="'yyyy-MM-dd'" required />
      </div>

      <div class="col-md-4 mb-3">
        <label class="form-label">Status *</label>
        <select v-model="form.status" class="form-select" required>
          <option value="OPEN">OPEN</option>
          <option value="CLOSED">CLOSED</option>
          <option value="LOCKED">LOCKED</option>
        </select>
      </div>

      <div class="col-md-4 mb-3">
        <label class="form-label">Fiscal Period Template</label>
        <select v-model="form.period_template" class="form-select">    
          <option value="QUARTERLY">Quarterly</option>
          <option value="YEARLY">Yearly</option>
        </select>
      </div>

      <div class="form-check mb-3 d-flex justify-content-end">
        <input class="form-check-input" type="checkbox" v-model="form.auto_generate_periods" id="autoGenerate" />
        <label class="form-check-label" for="autoGenerate">Auto Generate Periods</label>
      </div>
       </div>
<div class="d-flex justify-content-end gap-1">
    <button type="button" class="btn btn-secondary " @click="cancelForm">Cancel</button>
  
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Saving...' : (form.id ? 'Update' : 'Save') }}
      </button>
    
</div>
    </form>

 <div v-if="!showForm" class="p-2">
<StandardDataTable
      :columns="columns"
      :data="dataFetched"
      :loading="isLoading"
      :filters="tableFilters"
      :defaultPageSize="tableFilters.pageSize"
      :disablePagination="false"
      :showDateFilters="false"
      :actionButtons="pageActions"
    >
    <template #start_date="{ row }">
  <span class="text-success">
    {{ row.start_date }}
  </span>
</template>
<template #end_date="{ row }">
  <span class="text-danger" >
    {{ row.end_date }}
  </span>
</template>
    <template #status="{ row }">
  <span :class="'badge bg-' + getStatusColor(row.status)">
    {{ row.status }}
  </span>
</template>
      <template #actions="{ row }">
        <div class="d-flex gap-1">
          <!-- <button class="btn btn-info btn-sm" @click="viewFiscalYear(row.rowData)">
            <i class="fa fa-eye"></i>
          </button> -->
          <button class="btn btn-primary btn-sm" @click="generatePeriods(row.rowData)">
            <i class="fa fa-cogs me-1"></i>Generate Periods
          </button>        
          <button class="btn btn-warning btn-sm" @click="openOpeningBalances(row.rowData)">
            <i class="fa fa-money-bill me-1"></i>Open Balances
          </button>         
 
  <div class="dropdown">
  <button 
    class="btn btn-sm btn-secondary dropdown-toggle" 
    type="button" 
    data-bs-toggle="dropdown" 
    data-bs-boundary="viewport"
    data-bs-reference="parent"
    data-bs-auto-close="true"
    aria-expanded="false">
    More
  </button>

  <ul class="dropdown-menu dropdown-menu-end" 
      data-bs-popper="static">
    <li>
      <a class="dropdown-item text-danger"
         href="#"
         @click.prevent="lockFiscalYear(row.rowData)">
        Lock
      </a>      
    </li>
    <li>
      <a class="dropdown-item"
         href="#"
         @click.prevent="editFiscalYear(row.rowData)">
        Edit
      </a>
    </li>
  </ul>
</div>
         
          
        </div>
      </template>
    </StandardDataTable>
 </div>   
    
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { MACARGO_API_URL_2  } from "@/config/config.js";
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import StandardDataTable from '@/components/plugins/StandardDataTable.vue';
import { useNotification } from '@/composables/notification';
import { useRouter  } from 'vue-router';
const router = useRouter();
const { showAlert } = useNotification();
const getStatusColor = (status) => {
  const colors = {
    'OPEN': 'success',
    'CLOSED': 'danger',
    'LOCKED': 'warning',
    'DRAFT': 'warning',
    'VALIDATED': 'info',
    'POSTED': 'success',
    'ACTIVE': 'success',
    'INACTIVE': 'danger',
    'PENDING': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'danger',
    'CANCELLED': 'danger'
  };
  
  return colors[status] || 'secondary';
};

const showForm = ref(false);
const loading = ref(false);
const isLoading = ref(false);
const dataFetched = ref([]);
const tableFilters = ref({ search: '', pageSize: 10, currentPage: 1 });
const pageActions = computed(
   () =>
  {
    const actions = [];
    if (showForm) {
     actions.push({
      label: 'Reflesh',
      icon:  'fa fa-synch-alt text-white',
      class: 'btn btn-secondary',
     method: () => fetchFiscalYears()
     })      
      actions.push({
      label: 'Fiscal Year',
      icon:  'fa fa-plus',
      class: 'btn btn-info',
     method: () => {showForm.value = !showForm.value}
     })     
    }
    else{
      actions.push({
      label: 'close Fiscal Year',
      icon:  'fa fa-plus',
      class: 'btn btn-danger',
      method: () => {showForm.value = !showForm.value}
    })

    }
  
    
    return actions;
  }
)

const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

// const formatDate = (date) => {
//   if (!date) return '-';

//   const d = new Date(date);

//   const options = { 
//     day: 'numeric', 
//     month: 'short', 
//     year: 'numeric' 
//   };

//   return d.toLocaleDateString('en-GB', options);
// };

const form = reactive({
  id: null,
  company_id: 2,
  name: '',
  code: '',
  start_date: '',
  end_date: '',
  status: 'OPEN',
  period_template: 'MONTHLY',
  auto_generate_periods: true,
});

const axiosInstance = axios.create({
  baseURL: MACARGO_API_URL_2,
  headers: { "Content-Type": "application/json" }
});

// Table columns
const columns = ref([
  { key: 'sno', label: 'Sno', visible: true, sortable: false },
  { key: 'name', label: 'Name', visible: true, sortable: false },
  { key: 'fy_code', label: 'Code', visible: true, sortable: false },
  { key: 'start_date', label: 'Start Date', visible: true, sortable: false },
  { key: 'end_date', label: 'End Date', visible: true, sortable: false},
  { key: 'status', label: 'Status', visible: true, sortable: false },
  { key: 'periods_count', label: 'Periods', visible: true, sortable: false },
  { key: 'open_period', label: 'Open Period', visible: true, sortable: false },
  { key: 'opening_balance', label: 'Opening Balance JV', visible: true, sortable: false },
  { key: 'actions', label: 'Actions', visible: true, sortable: false },
]);

// Fetch fiscal years from backend

const fetchFiscalYears = async () => {
  isLoading.value = true;
  try {
    const res = await axiosInstance.get(`fiscal-years`);
    dataFetched.value = res.data.map((fy, index) => {
      const openPeriod = fy.periods.find(p => p.status === 'OPEN');
      return {
        sno: index + 1,
        name :fy.name,
        fy_code: fy.code,
        start_date: formatDate(fy.start_date),
        end_date: formatDate(fy.end_date),
        status: fy.status,
        periods_count: fy.periods.length,
        open_period: openPeriod ? openPeriod.name : '-',
        opening_balance: fy.opening_balance_summary || 'None',
        rowData: fy,
      };
    });
  } catch (error) {
    console.error(error);
    showAlert('error', 'Failed to load fiscal years');
  } finally {
    isLoading.value = false;
  }
};

const editFiscalYear= (data) =>


{  
   console.log(data)
  form.id = data.id,
  form.company_id = 6,
  form.name= data.name,
  form.code= data.code,
  form.start_date = data.start_date,
  form.end_date= data.end_date,
  form.status= data.status,
  form.period_template= data.period_template,
  form.auto_generate_periods = true,
  showForm.value = true;
}

onMounted(() => {
  fetchFiscalYears();
});

// Form submit
const submitForm = async () => {
  loading.value = true;
  try {
    if (form.id) {
      await axiosInstance.put(`fiscal-years/${form.id}`, form);
      showAlert('success', 'Updated successfully');
    } else {
      await axiosInstance.post('fiscal-years', form);
      showAlert('success', 'Created successfully');
    }
    cancelForm();
    fetchFiscalYears();
  } catch (err) {
    console.error(err);
    showAlert('error', 'Failed to save fiscal year');
  } finally {
    loading.value = false;
  }
};

const cancelForm = () => {
  form.id = null;
  form.name = '';
  form.code = '';
  form.start_date = '';
  form.end_date = '';
  form.status = 'OPEN';
  form.period_template = 'MONTHLY';
  form.auto_generate_periods = true;
  showForm.value = false;
};

// Action Methods
const viewFiscalYear = (fy) => {
 
};

const generatePeriods = async (fy) => {
  try {
    await axiosInstance.post(`fiscal-years/${fy.id}/generate-periods`);
    showAlert('success', 'Periods generated');
    fetchFiscalYears();
  } catch (err) {
    showAlert('error', 'Failed to generate periods');
  }
};

const openOpeningBalances = (fy) => {
  router.push(`/settings/accounts/financial-year/${fy.id}`)
};

const closeFiscalYear = async (fy) => {
  try {
    await axiosInstance.put(`fiscal-years/${fy.id}`, { status: 'CLOSED' });
    showAlert('success', 'Fiscal year closed');
    fetchFiscalYears();
  } catch (err) {
    showAlert('error', 'Failed to close FY');
  }
};

const lockFiscalYear = async (fy) => {
  try {
    await axiosInstance.put(`fiscal-years/${fy.id}`, { status: 'LOCKED' });
    showAlert('success', 'Fiscal year locked');
    fetchFiscalYears();
  } catch (err) {
    showAlert('error', 'Failed to lock FY');
  }
};
</script>

<style scoped>
.list-group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.table-responsive) {
    overflow: visible !important;
    overflow-x: visible !important;
    overflow-y: visible !important;
}

</style>
