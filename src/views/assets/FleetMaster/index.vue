<template>
  <div class="vehicle-registration-page">
    <div class="d-flex align-items-center">
      <div>
        <ul class="breadcrumb">
          <li class="breadcrumb-item"><a href="#">ASSETS</a></li>                  
          <li class="breadcrumb-item active">FLEET MASTER</li>
        </ul>
      </div>
    </div>
    <div  class="row layout-top-spacing bg-white rounded">
      <VehicleRegisterForm ref="vehicleFormRef" @register-vehicle="handleVehicleRegistration" @select-vehicle="handleVehicleSelection"/>
    </div>
    <!-- Vehicle Registration Modal -->
    <div v-if="showRegistrationModal" class="modal-backdrop">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Register New Vehicle</h5>
            <button  class="btn-close" @click="showRegistrationModal = false">
              <i class="fa fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <VehicleRegisterForm @register-vehicle="handleVehicleRegistration" @select-vehicle="handleVehicleSelection"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VehicleRegisterForm from './VehicleRegisterForm.vue';
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();

const permissions = authStore.permissions ;
  
// Reactive variables for modal states and selected vehicle
const showRegistrationModal = ref(false);
const selectedVehicle = ref(null);

const vehicleFormRef = ref(null);

const handleVehicleRegistration = (vehicleData) => {
  // console.log('Vehicle registered:', vehicleData);
  // Handle vehicle registration success
  showRegistrationModal.value = false; // Close modal after successful registration
};

const assignDriverToSelected = () => {
  if (!selectedVehicle.value) {
    alert('Please select a vehicle first');
    return;
  }
  // console.log('Assigning driver to vehicle:', selectedVehicle.value);
  // Handle driver assignment logic here
  // You can open a driver assignment modal or navigate to assignment page
};

const handleVehicleSelection = (vehicle) => {
  selectedVehicle.value = vehicle;
  // console.log('Vehicle selected:', vehicle);
};

const refreshData = () => {
  if (vehicleFormRef.value && typeof vehicleFormRef.value.refresh === 'function') {
    vehicleFormRef.value.refresh();
  }
};

const testClick = () => {
  alert('Test button works! Vue events are functioning properly.');
};
</script>

<style scoped>
.vehicle-registration-page {
  width: 100%;
}

.vehicle-content {
  margin-top: -9px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 20px;
}

/* Hide default pagination from imported VehicleRegisterForm component */
.vehicle-content ::deep .d-md-flex.align-items-center.mt-3 {
  display: none !important;
}
.vehicle-content ::deep .me-md-auto.text-md-left.text-center.mb-2.mb-md-0 {
  display: none !important;
}
.vehicle-content ::deep .pagination.mb-0.justify-content-center {
  display: none !important;
}
.vehicle-content ::deep .ms-3 {
  display: none !important;
}
.vehicle-content ::deep .form-select {
  display: none !important;
}
.vehicle-content ::deep .page-item {
  display: none !important;
}
.vehicle-content ::deep .page-link {
  display: none !important;
}
.vehicle-content ::deep .pagination {
  display: none !important;
}

/* Additional specific selectors to ensure hiding */
.vehicle-content ::deep div[class*="d-md-flex"] {
  display: none !important;
}
.vehicle-content ::deep div[class*="me-md-auto"] {
  display: none !important;
}
.vehicle-content ::deep ul[class*="pagination"] {
  display: none !important;
}
.vehicle-content ::deep div[class*="ms-3"] {
  display: none !important;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-dialog {
  max-width: 90vw;
  width: 100%;
  margin: 1.75rem auto;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
  max-height: 80vh;
  overflow-y: auto;
}

/* Button Styles */
.btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-outline-primary {
  background: transparent;
  border: 1px solid #3b82f6;
  color: #3b82f6;
}

.btn-outline-primary:hover {
  background: #3b82f6;
  color: #fff;
}

.btn-outline-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: transparent;
  color: #6c757d;
  border-color: #6c757d;
}

/* Header visual tweaks: remove radius and show only bottom border */
.vehicle-registration-page .card {
  border-radius: 0 !important;
  border: none !important;
}

.vehicle-registration-page .card-header {
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
}
</style> 