<template>
  <div class="vehicle-register-form">
    <div class="form-header">
      <div class="header-title">
        <i class="fa fa-list"></i>
        <!-- <span>Registered Vehicles</span> -->
      </div>
      <!-- <div class="header-actions">
        <button v-if="permissions.includes('CAN_ASSIGN_DRIVERS')" class="btn btn-outline-primary me-2"
          @click="assignDriverToSelected" :disabled="!selectedVehicle">
          <i class="fa fa-user"></i> Assign Driver
        </button>
        <button v-if="permissions.includes('CAN_REGISTER_VEHICLES')" class="add-vehicle-btn" @click="showModal = true">
          <i class="fa fa-plus"></i> Register Vehicle
        </button>
      </div> -->

    </div>
    <div class="server-table">
      <StandardDataTable
       :columns="columns"
        :data="vehicles" 
        :loading="loading"
        :serverSide="true"
         :filters="tableFilters"
        :defaultPageSize="tableFilters.pageSize"
         :disablePagination="true"
          :showDateFilters="false"
        @update:filters="onTableFiltersUpdate" 
         :actionButtons="pageActions"
          :custom-filters="[
                  { key: 'date_from', label: 'Date From', type: 'date' },
                  { key: 'date_to', label: 'Date To', type: 'date' },
                  { key: 'model', label: 'Model', type: 'text' },
                  { key: 'make', label: 'Make', type: 'text' }
                ]">
        <template #select="{ row }">
          <input type="checkbox" class="form-check-input" :checked="selectedVehicles.find(i => i.id === row.id)"
            @change="toggleMultiSelect(row)" />
        </template>
        <template  #actions="{ row }">
          <button class="btn  btn-sm btn-outline-dark" title="View" @click="edit(row._rawData)"><i class="fa fa-pen"></i></button>
          <button v-if="permissions.includes('CAN_VIEW_FLEET_DETAILS')" class="btn  btn-sm btn-outline-primary" title="View" @click="viewVehicle(row)"><i class="fa fa-eye"></i></button>
               </template>
      </StandardDataTable>
    </div>
<!-- 
    Server-side Pagination Controls -->
    <div class="d-flex justify-content-between align-items-center mt-3 server-pager mb-3">
      <div class="text-muted small">
        Showing {{ pagination.from }} - {{ pagination.to }} of {{ pagination.total }} vehicles
      </div>

      <nav aria-label="Vehicle pagination">
        <ul class="pagination pagination-sm mb-0">

          <li class="page-item" :class="{ disabled: pagination.currentPage <= 1 }">
            <button class="page-link" @click="prevPage" :disabled="pagination.currentPage <= 1">
              <i class="fa fa-angle-left"></i> 
            </button>
          </li>                   
          <li v-if="pagination.currentPage > 3" class="page-item">
            <button class="page-link" @click="goToPage(1)">1</button>
          </li>         
          <li v-if="pagination.currentPage > 3" class="page-item disabled">
            <span class="page-link">...</span>
          </li>          
          <li v-for="page in visiblePageNumbers" :key="page" class="page-item"
            :class="{ active: page === pagination.currentPage }">
            <button class="page-link" @click="goToPage(page)">{{ page }}</button>
          </li> 

          <li v-if="pagination.currentPage < pagination.lastPage - 2" class="page-item disabled">
            <span class="page-link">...</span>
          </li>

          <li v-if="pagination.currentPage < pagination.lastPage - 2" class="page-item">
            <button class="page-link" @click="goToPage(pagination.lastPage)">{{ pagination.lastPage }}</button>
          </li>
                    
          <li class="page-item" :class="{ disabled: pagination.currentPage >= pagination.lastPage }">
            <button class="page-link" @click="nextPage" :disabled="pagination.currentPage >= pagination.lastPage">
             <i class="fa fa-angle-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <div v-if="showModal" class="modal fade show" style="display: block; background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-xl modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-light d-flex justify-content-between align-items-center text-white">
            <h5 class="modal-title mb-0">
              <span v-if="form?.id === null">Register Vehicle</span>
               <span v-else>Update Vehicle</span>
              <span v-if="formDataLoading" class="text-muted small ms-2">
                (Loading…)
              </span>
            </h5>
            <button type="button" @click="showModal = false"
              class="border-0 bg-transparent p-1 d-flex align-items-center justify-content-center"
              style="width: 24px; height: 24px;">
              <i class="fa fa-x text-dark" style="font-size: 12px;"></i>
            </button>


          </div>
          <div class="modal-body">
            <form @submit.prevent="onSubmit">
              <!-- Basic Information Section -->
              <div class="form-section">
                <h6 class="section-title">Basic Information</h6>
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Registration Number *</label>
                    <input v-model="form.name" type="text" class="form-control" required maxlength="7"
                      style="text-transform:uppercase" placeholder="e.g. T456DXJ"
                      @input="form.name = form.name.toUpperCase().slice(0, 7)" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Code</label>
                    <input v-model="form.code" type="text" class="form-control" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Group</label>
                    <select v-model="form.group" class="form-select" :disabled="formDataLoading">
                      <option value="">Select Vehicle Group</option>
                      <option v-for="g in vehicleGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
                    </select>
                    <small v-if="formDataLoading" class="form-text text-muted">Loading vehicle groups...</small>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Ownership</label>
                    <select v-model="form.ownership" class="form-select">
                      <option value="">Select Ownership</option>
                      <option v-for="data in formData.ownership_types" :value=data>{{ data }}</option>                      
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">First Registration</label>
                    <input v-model="form.firstRegistration" type="date" class="form-control" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Manufacture Year</label>
                    <select v-model="form.manufactureYear" class="form-select">
                      <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Color</label>
                    <input v-model="form.color" type="text" class="form-control" />
                  </div>
                  <!-- <div class="col-md-3">
                    <label class="form-label">Size</label>
                    <select v-model="form.size" class="form-select" :disabled="formDataLoading">
                      <option value="">Select Size</option>
                      <option v-for="sz in sizeGroups" :key="sz.id" :value="sz.id">{{ sz.size }}</option>
                    </select>
                    <small v-if="formDataLoading" class="form-text text-muted">Loading sizes...</small>
                  </div> -->
                </div>
              </div>

              <!-- Vehicle Details Section -->
              <div class="form-section">
                <div class="row g-3">
                  <div class="col-md-3">
                    <label class="form-label">Model</label>
                    <select v-model="form.model" class="form-select" :disabled="formDataLoading">
                      <option value="">Select Vehicle Model</option>
                      <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }} - {{ m.make }}</option>
                    </select>
                    <small v-if="formDataLoading" class="form-text text-muted">Loading models...</small>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Make</label>
                    <input v-model="form.make" type="text" class="form-control" disabled />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Body Type</label>
                    <input v-model="form.bodyType" type="text" class="form-control" disabled />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Chassis Number</label>
                    <input v-model="form.chassisNumber" type="text" class="form-control" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Engine Number</label>
                    <input v-model="form.engineNumber" type="text" class="form-control" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Engine Capacity</label>
                    <input v-model="form.engineCapacity" type="number" class="form-control" />
                  </div>                 
                  <div class="col-md-3">
                    <label class="form-label">Tank Capacity</label>
                    <input v-model="form.tankCapacity" type="number" class="form-control" min="1" step="0.1"
                      placeholder="e.g. 200" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Fuel Used</label>
                     <select v-model="form.fuel_item" class="form-select" :disabled="formDataLoading">
                      <option value="">Select Fuels Used</option>
                      <option v-for="m in formData.fuel_items" :key="m.id" :value="m.id">{{ m.name }}</option>
                    </select>
                  </div>
                  <!-- <div class="col-md-3">
                    <label class="form-label">Width</label>
                    <input v-model="form.width" type="number" class="form-control" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Height</label>
                    <input v-model="form.height" type="number" class="form-control" />
                  </div> -->
                </div>
              </div>

              <!-- Technical Specifications Section -->
              <div class="form-section">
                <h6 class="section-title">Technical Specifications</h6>
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Axle Count</label>
                    <input v-model="form.axleCount" type="number" class="form-control" />
                  </div>
                  <!-- <div class="col-md-3">
                    <label class="form-label">Axle Distance</label>
                    <input v-model="form.axleDistance" type="number" class="form-control" />
                  </div> -->
                  <div class="col-md-4">
                    <label class="form-label">Tear Weight</label>
                    <input v-model="form.tearWeight" type="number" class="form-control" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Gross Weight</label>
                    <input v-model="form.grossWeight" type="number" class="form-control" />
                  </div>
                </div>
              </div>              
              <!-- Description Section -->
              <div class="form-section">
                <div class="row g-3">
                  <div class="col-md-12">
                    <label class="form-label">Description</label>
                    <textarea v-model="form.description" class="form-control" style="min-height:64px;"
                      placeholder="Enter any additional details about the vehicle..."></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="showModal = false"
                  :disabled="submittingForm">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="submittingForm">
                  <span v-if="submittingForm">
                    <i class="fa fa-spinner fa-spin"></i> Registering...
                  </span>
                  <span v-else>Submit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>



    <div v-if="showDriverModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-xl" style="height: 100vh; margin: 0 auto;">
        <div class="modal-content d-flex flex-column" style="height: 100%;">

          <!-- Header (fixed) -->
          <div class="modal-header bg-light text-dark flex-shrink-0 d-flex justify-content-between">
            <h5 class="modal-title">Assign Driver to Vehicle(s)</h5>
            <button class="btn-close me-3 d-flex align-items-center justify-content-center"
              @click="showDriverModal = false; clearDriver();"><i class="fa fa-times text-secondary"></i>
            </button>
          </div>

          <!-- Body (scrollable) -->
          <div class="modal-body flex-grow-1 overflow-auto p-3">
            <div class="table-responsive">
              <table class="table table-sm align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Vehicle</th>
                    <th>Type</th>
                    <th>Driver</th>
                    <th>Notes</th>
                    <th class="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="vehicle in selectedVehicles" :key="vehicle.id">
                    <!-- Vehicle row -->
                    <tr class="table-secondary">
                      <td colspan="5">
                        <div class="d-flex align-items-end">
                          <!-- <i class="fas fa-bus text-danger me-2"></i>
                          <strong class="me-2">{{ vehicle.registration }}</strong>
                          <span class="badge bg-primary">{{ vehicle.driverAssignments.length }}</span> -->
                          <button type="button" class="btn btn-outline-primary btn-sm ms-auto py-0"
                            @click="addDriver(vehicle.id)">
                            <i class="fas fa-plus"></i> Add Driver
                          </button>
                        </div>
                      </td>
                    </tr>

                    <!-- Driver rows -->
                    <tr v-for="(driver, index) in vehicle.driverAssignments" :key="index">
                      <td v-if="index === 0" :rowspan="vehicle.driverAssignments.length" class="border-end text-center">
                        <i class="fas fa-bus fa-lg text-danger d-block mb-1"></i>
                        <small class="fw-bold">{{ vehicle.registration }}</small>
                      </td>
                      <td>
                        <select class="form-select form-select-sm" v-model="driver.driver_type">
                          <option value="PRIMARY">PRIMARY</option>
                          <option value="SECONDARY">SECONDARY</option>
                          <option value="TRAINING">TRAINING</option>
                        </select>
                      </td>
                      <td style="position: relative;">
                        <button class="btn btn-sm btn-outline-secondary w-100 text-start text-dark border" type="button"
                          @click="toggleDriverDropdown(vehicle.id, index)">
                          {{ driver.driver_name || 'Select driver...' }}
                          <i class="fas fa-chevron-down float-end"></i>
                        </button>

                        <!-- Dropdown absolutely positioned relative to body -->
                        <div v-if="showDriverDropdown[vehicle.id + '-' + index]" class="driver-dropdown shadow p-1"
                          style="position: fixed;              
              min-width: 200px; 
              max-height: 200px; 
              overflow-y: auto; 
              z-index: 3000;">

                          <!-- Search Input -->
                          <div class="px-2 mb-1">
                            <input type="text" class="form-control form-control-sm" placeholder="Search..."
                              v-model="driverSearch[vehicle.id + '-' + index]"
                              @input="filterDrivers(vehicle.id, index)">
                          </div>

                          <!-- Driver List -->
                          <div class="options-container">
                            <div class="option" v-for="d in filteredDrivers[vehicle.id + '-' + index]"
                              :key="d.employee_id" @click.prevent="selectDriver(vehicle.id, index, d)">
                              {{ d.name }}
                            </div>


                            <div v-if="filteredDrivers[vehicle.id + '-' + index]?.length === 0"
                              class="dropdown-item text-muted">
                              No drivers
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <input type="text" class="form-control form-control-sm" v-model="driver.notes"
                          placeholder="Notes...">
                        <input type="text" class="form-control form-control-sm" v-model="driver.assignment_date" hidden>
                      </td>
                      <td class="text-end">
                        <button type="button" class="btn btn-sm btn-outline-danger"
                          @click="removeDriver(vehicle.id, index)" :disabled="vehicle.driverAssignments.length <= 1">
                          <i class="fas fa-times"></i>
                        </button>
                      </td>
                    </tr>

                    <!-- Empty state -->
                    <tr v-if="vehicle.driverAssignments.length === 0">
                      <td colspan="5" class="text-center py-2">
                        <small class="text-muted">No drivers assigned</small>
                        <button type="button" class="btn btn-link btn-sm" @click="addDriver(vehicle.id)">
                          <i class="fas fa-plus"></i> Add driver
                        </button>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Footer (fixed at bottom) -->
          <div class="modal-footer flex-shrink-0 d-flex justify-content-end gap-2 p-2 border-top">
            <button type="button" class="btn btn-secondary btn-sm"
              @click="showDriverModal = false; clearDriver();">Cancel</button>
            <button type="button" @click="assignDriver" class="btn btn-primary btn-sm">Assign Driver</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, defineExpose, reactive } from 'vue';
import StandardDataTable from '@/components/plugins/StandardDataTable.vue';
import { useRouter } from 'vue-router';
import { COPEX_API_URL } from '@/config/config.js';
import { useNotification } from '@/composables/notification';

import { useAuthStore } from "@/stores/auth";
const authStore = useAuthStore();

const pageActions = computed(() => {
  const actions = [];

  if (
    authStore.permissions.includes("CAN_ASSIGN_DRIVERS") && 
    selectedVehicles.value.length > 0
  ) {
    actions.push({
      label: "Assign Driver",
      icon: "fa fa-user",
      class: "btn btn-info",
      method: () => assignDriverToSelected()
    });
  }
    if (true) {
    actions.push({
      label: "Reflesh",
      icon: "fa fa-sync-alt ",
      class: "btn btn-secondary",
      method: () => fetchVehicles()
    });
  }    
  if (1 == 1) {
    actions.push({
      label: "Register Vehicle",
      icon: "fa fa-plus text-white",
      class: "btn btn-primary",
      method: () => register()
    });
  }

  return actions;
});

const formData = ref({});
const permissions = authStore.permissions;
const driver_type = ref("");
const router = useRouter();
const { showAlert } = useNotification();
const showModal = ref(false);
const showDriverModal = ref(false);
const loading = ref(true);
const formDataLoading = ref(true);
const submittingForm = ref(false);
const error = ref('');
const vehicles = ref([]);
const pagination = ref({ currentPage: 1, lastPage: 1, total: 0, from: 0, to: 0, perPage: 10 });
const drivers = ref([]);
const selectedVehicle = ref(null);
const assigningDriver = ref(false);
const selectedBuses = ref([]);

// Table filters/state for StandardDataTable
const tableFilters = ref({
  search: '',
  pageSize: 10,
  currentPage: 1,
  sortField: '',
  sortDirection: 'asc',
  showAdvancedFilters: false,
  date_from: '',
  date_to: '',  
});

// // Custom select for driver
// const showDriverDropdown = ref(false);
// const driverSearch = ref('');
const selectedDriverName = ref('');
// const filteredDrivers = ref([]);
const driverSearchInput = ref(null);
const driverAssignments = ref([]);
// Form data from API

const showDriverDropdown = reactive({});
const driverSearch = reactive({});
const filteredDrivers = reactive({});
const ownership = ref([]);
const vehicleGroups = ref([]);
const sizeGroups = ref([]);
const vehicleClasses = ref([]);
const models = ref([]);

const years = ref([]);
const currentYear = new Date().getFullYear();
for (let y = currentYear; y >= 1980; y--) years.value.push(y);



const form = ref({
  id: null,
  name: '',
  code: '',
  group: '', // Will store vehicle group ID
  firstRegistration: '',
  manufactureYear: '',
  color: '',
  ownership: '',
  chassisNumber: '',
  model: '', // Will store model ID
  engineNumber: '',
  engineCapacity: '',
  seatCapacity: '',
  tankCapacity: '',
  axleCount: '',
  axleDistance: '',
  tearWeight: '',
  grossWeight: '',
  make: '',
  fuel_item: '',
  bodyType: '', // Will store body type ID
  width: '',
  height: '',
  size: '', // Will store size group ID
  description: '',
});

const driverAssignment = ref({
  driver_id: '',
  assignment_date: new Date().toISOString().split('T')[0],
  notes: ''
});

const columns = ref([
  { key: 'select', label: '', visible: true, sortable: false, width: '50px' },
  { key: 'registration', label: 'Registration', visible: true, sortable: false },
  { key: 'make', label: 'Make', visible: true, sortable: false },
  { key: 'model', label: 'Model', visible: true, sortable: false },
  { key: 'chassis_number', label: 'Chassis', visible: true, sortable: false },
  { key: 'body_type', label: 'Body Type', visible: true, sortable: false },
  { key: 'driver', label: 'Driver', visible: true, sortable: false },
  { key: 'actions', label: 'Actions', visible: true, sortable: false },
]);


const selectedVehicles = ref([]);

function toggleMultiSelect(row) {
  const id = row.id;
  if (selectedVehicles.value.find(i => i.id === id)) {
    // remove
    selectedVehicles.value = selectedVehicles.value.filter(i => i.id !== id);
  } else {
    // add
    selectedVehicles.value.push(row);
  }


}

const register = () => {
   fetchFormData(); 
  showModal.value = true;
}

const edit = (data) => {
  fetchFormData();

  // Basic asset fields
  form.value.id = data.id || '';
  form.value.name = data.registration || '';  // previously data.name
  form.value.code = data.code || '';
  form.value.group = data.asset_group_id || '';
  form.value.ownership = data.ownership || '';
  form.value.description = data.description || '';

  // Dates
  form.value.firstRegistration = data.acquisition_date
    ? data.acquisition_date.split('T')[0]
    : '';

  // Motor vehicle specific fields (flat now)
  form.value.chassisNumber = data.chassis_number || '';
  form.value.engineNumber = data.engine_number || '';
  form.value.manufactureYear = data.year || '';
   form.value.fuel_item = data.fuel_used_id || '';
  form.value.color = data.color || '';
  form.value.engineCapacity = data.engine_capacity_cc || '';
  form.value.tankCapacity = data.tank_capacity_liters || '';
  form.value.axleCount = data.axle_count || '';
  form.value.grossWeight = data.gross_weight || '';
  form.value.tearWeight = data.tare_weight || '';

  // Model and Make (flat)
  form.value.model = data.model_id || '';
  form.value.make = data.make || '';
  form.value.bodyType = data.body_type || '';

  showModal.value = true;
};


const fetchFormData = async () => {
  formDataLoading.value = true;
  try {
    const res = await fetch(`${COPEX_API_URL}/vehicle-assets/metadata`);
    const data = await res.json();
    if (data.success) {
      formData.value = data.data;
      vehicleGroups.value = data.data.asset_groups;
      sizeGroups.value = data.data.size_groups;
      models.value = data.data.vehicle_models;
      ownership.value = data.data.ownership_types;
    }
  } catch (e) {
    console.error('Error fetching form data:', e);
    showAlert('error', 'Failed to load form data. Please refresh the page.');
  } finally {
    formDataLoading.value = false;
  }
};

// Helper functions to get display names from IDs
const getVehicleGroupName = (id) => {
  const group = vehicleGroups.value.find(g => g.id === id);
  return group ? group.name : '';
};

const getSizeGroupName = (id) => {
  const size = sizeGroups.value.find(s => s.id === id);
  return size ? size.size : '';
};

const getModelName = (id) => {
  const model = models.value.find(m => m.id === id);
  return model ? model.name : '';
};



onMounted(() => {
  fetchVehicles(); 
});

watch(() => form.value.model, (modelId) => {
  const model = models.value.find(m => m.id === modelId);
  if (model) {
    form.value.make = model.make;
    form.value.bodyType = model.type; // Set body type from model.type
  } else {
    form.value.make = '';
    form.value.bodyType = '';
  }
});

const fetchVehicles = async (page = pagination.value.currentPage) => {
  loading.value = true;
  error.value = '';
  try {
    const url = new URL(`${COPEX_API_URL}/vehicle-assets`);
    url.searchParams.set('page', String(page));
    const perPage = tableFilters.value.pageSize || pagination.value.perPage || 10;
    pagination.value.perPage = perPage;
    url.searchParams.set('per_page', String(perPage));
    if (tableFilters.value.search) {
      url.searchParams.set('search', tableFilters.value.search);
    }        
    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.success) {
      const p = data.data || {};
      console.log(p);
      
      vehicles.value = Array.isArray(p.data)
  ? p.data.map((v) => ({
      ...v,
      _rawData:v,    
    }))
  : [];
      pagination.value.currentPage = p.current_page || 1;
      pagination.value.lastPage = p.last_page || 1;
      pagination.value.total = p.total || vehicles.value.length;
      pagination.value.from = p.from || (vehicles.value.length ? 1 : 0);
      pagination.value.to = p.to || vehicles.value.length;

    } else {
      error.value = 'Failed to load vehicles.';
    }
  } catch (e) {
    console.error('❌ Error fetching vehicles:', e);
    error.value = 'Error loading vehicles.';
  } finally {
    loading.value = false;
  }
};

function onTableFiltersUpdate(newFilters) {
  console.log(newFilters);  
  tableFilters.value = { ...tableFilters.value, ...newFilters };
  // Keep server-side pagination in sync with table's page size and search
  pagination.value.perPage = newFilters.pageSize || pagination.value.perPage;
  fetchVehicles(newFilters.currentPage || 1);
}

function nextPage() {
  if (pagination.value.currentPage < pagination.value.lastPage) {
    fetchVehicles(pagination.value.currentPage + 1);
  }
}

function prevPage() {
  if (pagination.value.currentPage > 1) {
    fetchVehicles(pagination.value.currentPage - 1);
  }
}

function goToPage(page) {
  if (page >= 1 && page <= pagination.value.lastPage) {
    fetchVehicles(page);
  }
}

const visiblePageNumbers = computed(() => {
  const pages = [];
  const current = pagination.value.currentPage;
  const last = pagination.value.lastPage;

  if (last <= 5) {
    for (let i = 1; i <= last; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 3; i++) {
        pages.push(i);
      }
    } else if (current >= last - 2) {
      for (let i = current - 2; i <= current; i++) {
        pages.push(i);
      }
    } else {
      pages.push(current - 1);
      pages.push(current);
      pages.push(current + 1);
    }
  }

  return pages;
});

const onSubmit = async () => {
  // Validate registration name
  if (!/^[A-Z0-9]{1,7}$/.test(form.value.name)) {
    showAlert('error', 'Registration number must be up to 7 uppercase letters/numbers.');
    return;
  }

  // Validate required fields
  if (!form.value.name.trim()) {
    showAlert('error', 'Registration number is required');
    return;
  }

  // Additional validation for important fields
  if (!form.value.group) {
    showAlert('error', 'Vehicle group is required');
    return;
  }

  if (!form.value.model) {
    showAlert('error', 'Vehicle model is required');
    return;
  }


  try {
    submittingForm.value = true;

    // Prepare the payload for the API
    const payload = {
  created_by: authStore.user?.id,

  asset_group_id: form.value.group,   // must be asset_group_id
  code: form.value.code,
  name: form.value.name,
  created_by : 1,
  acquisition_date: form.value.firstRegistration,
  acquisition_cost: form.value.acquisitionCost,
  salvage_value: form.value.salvageValue || 0,
  ownership: form.value.ownership,
  description: form.value.description,
  motor_vehicle: {
    vehicle_model_id: form.value.model,  // MUST be vehicle_model_id
    registration_number: form.value.name,
    chassis_number: form.value.chassisNumber,
    engine_number: form.value.engineNumber,
    fuel_used_id: form.value.fuel_item,
    manufacture_year: form.value.manufactureYear,
    color: form.value.color,
    engine_capacity_cc: form.value.engineCapacity,
    tank_capacity_liters: form.value.tankCapacity,
    axle_count: form.value.axleCount,
    gross_weight: form.value.grossWeight,
    tare_weight: form.value.tearWeight,
  }
};

 let  response = ''
 if(form.value.id === null) {
    response = await fetch(`${COPEX_API_URL}/vehicle-assets/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
 }
 else{
   response = await fetch(`${COPEX_API_URL}/vehicle-assets/${form.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
 }  
 
 
    const result = await response.json();
     
    if (result.success === true || result.status === 'success') {
      showAlert('success', 'Vehicle registered successfully!');
      showModal.value = false;
      // Clear form and refresh list
      form.value = {
        name: '', code: '', group: '', firstRegistration: '', manufactureYear: '', color: '', ownership: '',
        chassisNumber: '', model: '', engineNumber: '', engineCapacity: '', seatCapacity: '', tankCapacity: '', axleCount: '', axleDistance: '',
        tearWeight: '', grossWeight: '', make: '', fuel_item: '', bodyType: '', width: '', height: '', size: '', description: ''
      };
      fetchVehicles();
    } else {
      showAlert('error', 'Failed to register vehicle: ' + (result.message || result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error registering vehicle:', error);
    showAlert('error', 'Error registering vehicle. Please try again.');
  } finally {
    submittingForm.value = false;
  }
};

function viewVehicle(vehicle) {
  console.log(vehicle);  
  router.push(`/macargo/assets/details/${vehicle.id}`);
}

function selectVehicle(vehicle) {
  selectedVehicle.value = vehicle;
}

function assignDriverToSelected() {
  if (!selectedVehicles.value || selectedVehicles.value.length === 0) {
    showAlert('error', 'Please select a vehicle first');
    return;
  }
  openDriverAssignment();
}

function addDriver(vehicleId) {
  const vehicle = selectedVehicles.value.find(v => v.id === vehicleId);
  if (!vehicle) return;

  // Max 3 drivers
  if (vehicle.driverAssignments.length >= 3) return;

  // Ongeza driver mpya, default type SECONDARY
  vehicle.driverAssignments.unshift({
    driver_id: '',
    driver_name: '',
    driver_type: 'SECONDARY',
    assignment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });


  // Ensure first driver is PRIMARY
  // normalizeDriverTypes(vehicleId);
}

// Helper to ensure first driver is PRIMARY, rest can be SECONDARY or TRAINING
function normalizeDriverTypes(vehicleId) {
  const vehicle = selectedVehicles.value.find(v => v.id === vehicleId);
  if (!vehicle) return;

  vehicle.driverAssignments.forEach((d, i) => {
    if (i === 0) {
      d.driver_type = 'PRIMARY';
    } else if (d.driver_type === 'PRIMARY') {
      d.driver_type = 'SECONDARY';
    }
  });

}


function clearDriver() {
  selectedVehicles.value.forEach(vehicle => {
    if (vehicle.driverAssignments && vehicle.driverAssignments.length > 0) {
      // Keep only the first driver
      vehicle.driverAssignments = [vehicle.driverAssignments[0]];
      // Ensure the remaining driver is PRIMARY
      vehicle.driverAssignments[0].driver_type = 'PRIMARY';
      vehicle.driverAssignments[0].driver_id = '';
      vehicle.driverAssignments[0].notes = '';
    }
  });
}



function removeDriver(vehicleId, index) {
  // Pata vehicle husika
  const vehicle = selectedVehicles.value.find(v => v.id === vehicleId);
  if (!vehicle) return;

  // Ondoa driver kwa index
  vehicle.driverAssignments.splice(index, 1);
  // normalizeDriverTypes(vehicleId);
}


function openDriverAssignment() {
  selectedVehicles.value = selectedVehicles.value.map(v => ({
    ...v,
    driverAssignments: v.driverAssignments || [
      {
        driver_id: '',
        driver_name: '',
        driver_type: 'PRIMARY',
        assignment_date: new Date().toISOString().split('T')[0],
        notes: ''
      }
    ]
  }));

  showDriverModal.value = true;
}





async function fetchDrivers() {
  try {
    const response = await fetch(`${COPEX_API_URL}/driver-master/driver_list`);
    const data = await response.json();

    if (data.driver && Array.isArray(data.driver)) {
      // Map the data to match our expected structure
      drivers.value = data.driver.map(driver => ({
        employee_id: driver.id, // Use the 'id' field from the API
        name: driver.name      // Use the 'name' field from the API
      }));
      filteredDrivers.value = drivers.value; // Initialize filtered drivers

    }
  } catch (error) {
    console.error('Error fetching drivers:', error);
  }
}

function toggleDriverDropdown(vehicleId, index) {
  const key = `${vehicleId}-${index}`;
  showDriverDropdown[key] = !showDriverDropdown[key];

  if (showDriverDropdown[key]) {
    nextTick(() => {
      const input = document.getElementById(`driver-search-${key}`);
      if (input) input.focus();
    });
  }
}


function filterDrivers(vehicleId, index) {
  const key = `${vehicleId}-${index}`;
  const searchTerm = (driverSearch[key] || '').toLowerCase();

  const alreadySelected = [];
  selectedVehicles.value.forEach(v => {
    v.driverAssignments.forEach(d => {
      if (d.driver_id) alreadySelected.push(d.driver_id);
    });
  });

  filteredDrivers[key] = drivers.value.filter(d =>
    d.name.toLowerCase().includes(searchTerm) &&
    !alreadySelected.includes(d.employee_id)
  );
}


function selectDriver(vehicleId, index, driver) {
  const key = `${vehicleId}-${index}`;
  const vehicle = selectedVehicles.value.find(v => v.id === vehicleId);
  if (!vehicle) return;

  vehicle.driverAssignments[index].driver_id = driver.employee_id;
  vehicle.driverAssignments[index].driver_name = driver.name;

  showDriverDropdown[key] = false;
  driverSearch[key] = '';
  filterDrivers(vehicleId, index);
}



async function assignDriver() {

  function preparePayload() {
    // Map through all selected vehicles
    return selectedVehicles.value.map(vehicle => {
      return {
        vehicle_id: vehicle.id,
        drivers: vehicle.driverAssignments.map(driver => ({
          driver_id: driver.driver_id,
          driver_type: driver.driver_type,
          assignment_date: driver.assignment_date,
          notes: driver.notes
        }))
      };
    });
  }

  assigningDriver.value = true;
  try {
    // const payload = {
    //   vehicle_id: selectedVehicle.value.id,
    //   driver_id: driverAssignment.value.driver_id,
    //   assignment_date: driverAssignment.value.assignment_date,
    //   notes: driverAssignment.value.notes,
    //   driver_type: driver_type.value
    // };

    const payload = preparePayload();

    const response = await fetch('https://abserp.iosuite.org/api/v1/drivers/assignment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload)
    });



    const result = await response.json();
    if (result.success === true || result.status === 'success') {
      showAlert('success', 'Driver assigned successfully!');
      showDriverModal.value = false;
      selectedVehicles.value = [];
      fetchVehicles(); // Refresh the vehicle list
    } else {
      showAlert('error', 'Failed to assign driver: ' + (result.message || result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('❌ Error assigning driver:', error);
    showAlert('error', 'Error assigning driver: ' + error.message);
  } finally {
    assigningDriver.value = false;
  }
}

// Expose a refresh method for parent components to trigger data reload
defineExpose({
  refresh: () => fetchVehicles(1)
});
</script>

<style scoped>
.vehicle-register-form {
  width: 100%;
  /* padding: 24px 12px 18px 12px; */
  background: #fff;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
}


.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}






.form-check-input {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
}

/* Custom Select Styles */
.custom-select {
  position: relative;
  width: 100%;
}

.select-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  min-height: 38px;
}

.select-display:hover {
  border-color: #adb5bd;
}

.placeholder {
  color: #6c757d;
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.search-container {
  padding: 10px;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
}

.search-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: #fff;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(248, 249, 250, );
}

.options-container {
  max-height: 150px;
  overflow-y: auto;
  background-color: #fff;
}

.option {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  border-bottom: 1px solid #f1f3f4;
  color: #333;
  transition: background-color 0.2s;
}

.option:hover {
  background-color: #f8f9fa;
  color: #000;
}

.option:last-child {
  border-bottom: none;
}

.no-results {
  padding: 8px 12px;
  color: #6c757d;
  font-style: italic;
  text-align: center;
}

.form-header i {
  color: #f6f9ff;
  font-size: 0.5em;
}

.add-vehicle-btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 6px 12px;
  font-size: 0.55em;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 1px 4px rgba(59, 130, 246, 0.08);
  cursor: pointer;
  transition: background 0.2s;
  margin-left: auto;
}

.add-vehicle-btn:hover {
  background: #2563eb;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.vehicle-list-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.vehicle-list-table th,
.vehicle-list-table td {
  padding: 7px 10px;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  font-size: 0.97em;
}

.vehicle-list-table th {
  background: #f4f6fa;
  font-weight: 600;
  color: #3b82f6;
}

.vehicle-list-table tbody tr:nth-child(even) {
  background: #f8fafc;
}

.vehicle-list-table tbody tr:hover {
  background: #e3e9f7;
  transition: background 0.2s;
}

.action {
  margin-right: 2px;
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  background: #3b82f6;
  color: #fff;
  cursor: pointer;
  font-size: 0.97em;
  transition: background 0.2s;
}

.action:last-child {
  margin-right: 0;
}

.action:hover {
  background: #2563eb;
}

.loading {
  color: #3b82f6;
  font-size: 1em;
  padding: 12px;
}

.error {
  color: #e74c3c;
  font-size: 1em;
  padding: 12px;
}

/* Modal Styles */





/* Custom Vehicle Registration Modal - EASILY ADJUSTABLE */
.vehicle-registration-modal {
  max-width: 800px;
  /* ← ADJUST THIS VALUE TO YOUR NEEDS */
  width: 95vw;
  min-width: 800px;
  /* ← MINIMUM WIDTH */
}



.modal-body::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
}

/* Improve close button styling */
.btn-close {
  background: #325d87;
  color: #2f8cea !important;
  cursor: pointer;
  padding: 0;
}

.btn-close:hover {
  color: #2173c6;
  border-color: #adb5bd;
}







.btn-close {
  background: none;
  border: none;
  font-size: 1.5em;
  color: #fff;
  cursor: pointer;
  margin-left: 10px;
}


/* Form section styling */
.form-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 6px;
  border: 1px solid #eee;
}

.form-section:last-child {
  margin-bottom: 10px;
}

.section-title {
  color: #333;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

/* Optimize for 4-column layout */


/* Reduce spacing for better form density */


/* Ensure consistent spacing for form sections */
.form-section {
  margin-bottom: 20px;
}

/* Better spacing for the last row in each section */






.btn-primary {
  background: #3b82f6;
  color: #fff;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #888;
  color: #fff;
}



.col-md-4 {
  padding-left: 8px;
  padding-right: 8px;
  margin-bottom: 10px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #333;
}

.form-control,
.form-select {
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: #fff;
  height: 38px;
  min-height: 38px;
  box-sizing: border-box;
}

textarea.form-control {
  min-height: 80px;
  max-height: 120px;
  resize: vertical;
}



/* Responsive adjustments for medium screens */
@media (max-width: 1200px) and (min-width: 901px) {
  .col-md-4 {
    flex: 0 0 50%;
    max-width: 50%;
  }
}

/* Ensure proper spacing on all screen sizes */
@media (max-width: 768px) {
  .form-section {
    margin-bottom: 20px;
  }

  .col-md-4 {
    margin-bottom: 12px;
  }
}

/* Reduce font size for vehicle data table headings */
:deep(.table thead th) {
  font-size: 0.7rem !important;
  font-weight: 600;
  padding: 8px 6px;
  text-align: center;
  vertical-align: middle;
  color: #495057;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

:deep(.table tbody td) {
  font-size: 0.7rem;
  padding: 8px 6px;
  text-align: left;
  vertical-align: left;
}

/* Loading state styles */
.form-text.text-muted {
  font-style: italic;
  color: #6c757d;
}

/* Improve select dropdowns */
.form-select {
  cursor: pointer;
}

.form-select:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

/* Loading indicator */
.loading-indicator {
  font-size: 0.8em;
  color: #6c757d;
  font-weight: normal;
  margin-left: 8px;
}

/* 3-column layout improvements */
.col-md-4 {
  margin-bottom: 15px;
}

/* Ensure consistent spacing for form sections */
.form-section {
  margin-bottom: 25px;
}

/* Better spacing for the last row in each section */
.form-section .row:last-child .col-md-4:last-child {
  margin-bottom: 0;
}

/* Button loading states */




.btn-secondary:disabled {
  background: #9ca3af;
}

/* Loading spinner */
.fa-spinner {
  margin-right: 6px;
}

/* Hide built-in vue3-datatable footer pagination for this view */
.server-table ::deep .bh-table-footer {
  display: none !important;
}

.server-table ::deep .bh-pagination {
  display: none !important;
}

.server-table ::deep .bh-table-info {
  display: none !important;
}

.server-table ::deep .bh-table-length {
  display: none !important;
}

.server-table ::deep .bh-table-paginate {
  display: none !important;
}

.server-table ::deep .bh-table-processing {
  display: none !important;
}

.server-table ::deep .bh-table-wrapper {
  margin-bottom: 0 !important;
}

.server-pager {
  margin-top: 8px;
}
</style>
<style scoped>
/* Custom styles for the table */
.vehicle-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.driver-row:hover {
  background-color: #f8f9fa;
}

.custom-select-wrapper {
  position: relative;
}

.dropdown-menu {
  z-index: 1050;
}

.dropdown-list {
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.border-primary {
  border-color: #0d6efd !important;
}

.border-warning {
  border-color: #ffc107 !important;
}

.border-info {
  border-color: #0dcaf0 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .table-responsive {
    border: 0;
  }

  .driver-row td {
    display: block;
    width: 100%;
  }

  .driver-row td[colspan] {
    display: table-cell;
  }
}
</style>
