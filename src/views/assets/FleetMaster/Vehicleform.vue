<template>
  <div class="d-flex align-items-center mb-3">
    <div>
      <ul class="breadcrumb">
        <li class="breadcrumb-item"><a href="#">OPERATION</a></li>
        <li class="breadcrumb-item"><a href="#">FLEET MASTER</a></li>
        <li class="breadcrumb-item active">VEHICLE REGISTRATION</li>
      </ul>
    </div>

    <div class="ms-auto d-flex gap-2">
      <button class="btn btn-outline-info" @click="refreshData" title="Refresh">
        <i class="fa fa-sync-alt"></i>
      </button>
      <div class="dropdown">
        <button
          class="btn btn-outline-info dropdown-toggle"
          type="button"
          id="exportDropdown"
          data-bs-toggle="dropdown"
        >
          <i class="fa fa-download me-1"></i> Export
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <a class="dropdown-item" href="#" @click="exportToClipboard"
              ><i class="fa fa-copy me-2"></i> Copy to Clipboard</a
            >
          </li>
          <li>
            <a class="dropdown-item" href="#" @click="exportToPrint"
              ><i class="fa fa-print me-2"></i> Print</a
            >
          </li>
          <li>
            <a class="dropdown-item" href="#" @click="exportToPDF"
              ><i class="fa fa-file-pdf me-2"></i> PDF</a
            >
          </li>
          <li>
            <a class="dropdown-item" href="#" @click="exportToExcel"
              ><i class="fa fa-file-excel me-2"></i> Excel</a
            >
          </li>
        </ul>
      </div>
    </div>
  </div>

  <card>
    <div class="p-3">
      <div
        class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2"
      >
        <div class="flex-grow-1" style="max-width: 350px">
          <div class="input-group">
            <span class="input-group-text bg-transparent">
              <i class="fa fa-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Search vehicles..."
              v-model="filters.search"
              @keyup.enter="applyFilters"
            />
            <button class="btn btn-outline-secondary" @click="clearSearch">
              <i class="fa fa-times"></i>
            </button>
          </div>
        </div>

        <div class="d-flex gap-2">
          <button
            class="btn btn-outline-info"
            @click="showAdvancedFilters = !showAdvancedFilters"
          >
            <i class="fa fa-filter me-1"></i>
            {{ showAdvancedFilters ? "Hide Filters" : "Filters" }}
          </button>
          <button
            class="btn btn-outline-info"
            @click="showColumnSelector = !showColumnSelector"
            title="Column Visibility"
          >
            <i class="fa fa-columns"></i>
          </button>
          <button class="btn btn-primary" @click="showCreateModal = true">
            <i class="fa fa-plus me-1"></i>
            Register Vehicle
          </button>
        </div>
      </div>

      <!-- Advanced Filters -->
      <div v-if="showAdvancedFilters" class="mb-3 p-3 border rounded bg-light">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Status</label>
            <select class="form-select" v-model="filters.status">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Vehicle Type</label>
            <select class="form-select" v-model="filters.type">
              <option value="">All Types</option>
              <option value="bus">Bus</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Registration Date</label>
            <input type="date" class="form-control" v-model="filters.registrationDate" />
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <button class="btn btn-outline-secondary me-2" @click="clearFilters">
              Clear
            </button>
            <button class="btn btn-primary" @click="applyFilters">
              Apply
            </button>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="table-responsive">
        <vue3-datatable
          :rows="buses"
          :columns="cols"
          :loading="loading_spinner"
          :sortable="true"
          :columnFilter="true"
        >
          <!-- Index Column -->
          <template #index="data">
            {{ data.index }}
          </template>
          
          <!-- Status Column -->
          <template #status="data">
            <button :class="`btn ${data.value ? 'btn-outline-success' : 'btn-outline-danger'}`">
              {{ data.value ? 'Active' : 'Inactive' }}
            </button>
          </template>
          
          <!-- Actions Column -->
          <template #actions="data">
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="fa fa-ellipsis-v"></i>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" @click="viewVehicle(data.row)"><i class="fa fa-eye me-2"></i>View</a></li>
                <li><a class="dropdown-item" href="#" @click="editVehicle(data.row)"><i class="fa fa-edit me-2"></i>Edit</a></li>
                <li><a class="dropdown-item" href="#" @click="openSeatModel(data.row)"><i class="fa fa-chair me-2"></i>Seat Map</a></li>
                <li><a class="dropdown-item" href="#" @click="openServiceModel(data.row)"><i class="fa fa-tools me-2"></i>Services</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#" @click="deleteVehicle(data.row)"><i class="fa fa-trash me-2"></i>Delete</a></li>
              </ul>
            </div>
          </template>
        </vue3-datatable>
      </div>
    </div>
  </card>

  <!-- Create Vehicle Modal -->
  <div v-if="showCreateModal" class="modal-backdrop">
    <div class="modal-content">
      <div class="modal-header">
        <h5><i class="fa fa-plus"></i> Register New Vehicle</h5>
        <button class="btn-close" @click="showCreateModal = false">&times;</button>
      </div>
      <div class="modal-body">
        <!-- Add your vehicle registration form here -->
        <p>Vehicle registration form will be added here...</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="showCreateModal = false">Cancel</button>
        <button class="btn btn-primary">Register Vehicle</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { API_URL2 } from "@/config/config";
import { API_URL3 } from "@/config/config";
import { useNotification } from '@/composables/notification';
import { useRouter } from 'vue-router';
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css';

const { showAlert } = useNotification();
const router = useRouter();

// Reactive data
const buses = ref([]);
const loading_spinner = ref(false);
const showCreateModal = ref(false);
const showAdvancedFilters = ref(false);
const showColumnSelector = ref(false);

// Filters
const filters = ref({
  search: '',
  status: '',
  type: '',
  registrationDate: ''
});

// Datatable columns
const cols = ref([
  { key: 'index', label: '#', sortable: false },
  { key: 'name', label: 'Vehicle Name', sortable: true },
  { key: 'registration_number', label: 'Registration Number', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'capacity', label: 'Capacity', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
]);

// API instances
const axiosInstance = axios.create({
  baseURL: API_URL3,
  headers: {
    "Content-Type": "application/json"
  }
});

// Methods
const fetchBuses = async () => {
  try {
    loading_spinner.value = true;
    const response = await axiosInstance.get('fleet-master/index');
    buses.value = response.data.data || [];
  } catch (error) {
    console.error('Error fetching buses:', error);
    showAlert('error', 'Failed to fetch vehicles');
  } finally {
    loading_spinner.value = false;
  }
};

const refreshData = () => {
  fetchBuses();
};

const applyFilters = () => {
  // Implement filter logic
  // console.log('Applying filters:', filters.value);
};

const clearFilters = () => {
  filters.value = {
    search: '',
    status: '',
    type: '',
    registrationDate: ''
  };
};

const clearSearch = () => {
  filters.value.search = '';
};

const viewVehicle = (vehicle) => {
  router.push(`/fleet/vehicle/${vehicle.id}`);
};

const editVehicle = (vehicle) => {
  // Implement edit functionality
  // console.log('Edit vehicle:', vehicle);
};

const deleteVehicle = async (vehicle) => {
  if (confirm('Are you sure you want to delete this vehicle?')) {
    try {
      await axiosInstance.delete(`fleet-master/${vehicle.id}`);
      showAlert('success', 'Vehicle deleted successfully');
      fetchBuses();
    } catch (error) {
      showAlert('error', 'Failed to delete vehicle');
    }
  }
};

const openSeatModel = (vehicle) => {
  // Implement seat map functionality
  // console.log('Open seat map for:', vehicle);
};

const openServiceModel = (vehicle) => {
  // Implement services functionality
  // console.log('Open services for:', vehicle);
};

// Export functions
const exportToClipboard = () => {
  // Implement clipboard export
};

const exportToPrint = () => {
  // Implement print export
};

const exportToPDF = () => {
  // Implement PDF export
};

const exportToExcel = () => {
  // Implement Excel export
};

onMounted(() => {
  fetchBuses();
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

:deep(.bh-table) {
  border: 1px solid #dee2e6;
}

:deep(.bh-table-row) {
  border-bottom: 1px solid #dee2e6;
}

:deep(.bh-table-head) {
  background-color: #f8f9fa;
  font-weight: 600;
}

:deep(.bh-table-actions) {
  text-align: center;
}
</style> 