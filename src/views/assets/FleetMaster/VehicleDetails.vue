<template>
    <div class="vehicle-profile-page">
        <!-- Breadcrumb -->
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <ul class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#">ASSETS</a></li>
                    <li class="breadcrumb-item"> <router-link to="/macargo/assets/fleet-master">FLEET
                            MASTER</router-link></li>
                    <li class="breadcrumb-item active">{{ vehicle.name }}</li>
                </ul>
            </div>
            <button @click="$router.back()" class="btn btn-outline-secondary text-nowrap btn-sm  rounded-pill">
                <i class="fa fa-arrow-left me-1"></i> Back
            </button>
        </div>
        <div class="row">
            <div class="col-lg-12">
                <div class="card">
                    <!-- HEADER -->
                    <div class="card-header d-flex align-items-center bg-light fw-400">
                        <div class="d-flex align-items-center">
                            <div class="vehicle-icon me-2">
                                <i class="fa fa-bus fa-3x text-primary"></i>
                            </div>
                            <div>
                                <h4 class="mb-0">
                                    {{ vehicleUuid ? vehicle.name || "Loading..." : "Select a Vehicle" }}
                                </h4>
                                <small class="text-muted">
                                </small>
                            </div>
                        </div>

                        <div class="ms-auto d-flex align-items-center gap-2">
                            <button @click="refreshData" class="btn btn-outline-secondary"
                                :disabled="loading || !vehicleUuid">
                                <i class="fa fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i>
                                Refresh
                            </button>

                            <button v-if="permissions.includes('CAN_EDIT_FLEET_VEHICLE')"
                                class="btn btn-outline-primary" :disabled="!vehicleUuid" @click="editVehicleDetails">
                                <span v-if="formDataLoading">
                                    <div class="spinner-border spinner-border-sm text-dark"></div>
                                </span>
                                <span v-else>Edit</span>
                            </button>

                            <button v-if="permissions.includes('CAN_ADD_FLEET_VEHICLE')" class="btn btn-success btn-sm"
                                :disabled="!vehicleUuid">
                                + Add
                            </button>
                        </div>
                    </div>

                    <!-- TABS -->
                    <div class="card-header p-0 border-bottom">
                        <ul class="nav nav-tabs w-100 overflow-auto flex-nowrap mt-2">
                            <li v-for="tab in tabs.filter(t => permissions.includes(t.permission))" :key="tab.key"
                                class="nav-item flex-fill text-center">
                                <a :href="'#' + tab.key" class="nav-link" :class="{ active: activeTab === tab.key }"
                                    @click="onTabClick(tab)" data-bs-toggle="tab">
                                    <i :class="tab.icon"></i> {{ tab.label }}
                                </a>
                            </li>

                        </ul>

                    </div>

                    <!-- TAB CONTENT -->
                    <div class="tab-content p-4">
                        <div class="tab-pane fade show active" id="overview">
                            <div class="row">
                                <!-- Left Column (Details) -->
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">Vehicle Details</div>
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-md-6" v-for="spec in vehicleSpecs" :key="spec.key">
                                                    <div class="d-flex mb-3 border-bottom pb-2">
                                                        <i :class="spec.icon + ' text-primary me-2 mt-1'"></i>
                                                        <div>
                                                            <div class="text-muted small">{{ spec.label }}</div>
                                                           <div class="fw-semibold">
  <div v-if="loading">
    <div class="spinner-border spinner-border-sm text-info"></div>
  </div>
  <div v-else>
    {{ vehicle?.[spec.key] || "N/A" }}
  </div>
</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Special Row: Seat Map -->
                                            <div class="row mt-3">
                                                <div class="col-md-12">
                                                    <div class="d-flex mb-3 border-bottom pb-2">
                                                        <i class="fa fa-th-large text-primary me-2 mt-1"></i>
                                                        <div>
                                                            <div class="text-muted small">Seat Map Assigned</div>

                                                            <div v-if="vehicle.seatMapId">
                                                                <router-link :to="permissions.includes('CAN_EDIT_SEAT_MAP')
                                                                    ? `/abs/seat-management/details/${vehicle.seatMapId}`
                                                                    : '#'" class="fw-semibold text-decoration-none">
                                                                    {{ vehicle.seatMap || "View Seat Map" }}
                                                                </router-link>
                                                            </div>

                                                            <div v-else class="fw-semibold">Not Assigned</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="card">
                                       
                                    </div>
                                </div>
 </div>
                            <slot></slot>
                        </div>

                        <div class="tab-pane fade" id="specs">
                            <div class="d-flex flex-column justify-content-center align-items-center text-center"
                                style="height: 300px;">
                                <!-- Image / Icon -->
                                <img src="https://cdn-icons-png.flaticon.com/512/2910/2910762.png" alt="Coming Soon"
                                    style="width: 100px; height: 100px; object-fit: contain;" class="mb-3">

                                <!-- Main Text -->
                                <h2 class="fw-bold">Coming Soon</h2>

                                <!-- Subtext -->
                                <p class="text-muted">This section is still under progress.</p>
                        </div>

                        </div>
                        <div class="tab-pane fade" id="route">
                            <div class="d-flex flex-column justify-content-center align-items-center text-center"
                                style="height: 300px;">
                                <!-- Image / Icon -->
                                <img src="https://cdn-icons-png.flaticon.com/512/2910/2910762.png" alt="Coming Soon"
                                    style="width: 100px; height: 100px; object-fit: contain;" class="mb-3">

                                <!-- Main Text -->
                                <h2 class="fw-bold">Coming Soon</h2>

                                <!-- Subtext -->
                                <p class="text-muted">This section is still under progress.</p>
                            </div>

                        </div>
                        <div class="tab-pane fade" id="fuels">
                            <div class="d-flex flex-column justify-content-center align-items-center text-center"
                                style="height: 300px;">
                                <!-- Image / Icon -->
                                <img src="https://cdn-icons-png.flaticon.com/512/2910/2910762.png" alt="Coming Soon"
                                    style="width: 100px; height: 100px; object-fit: contain;" class="mb-3">

                                <!-- Main Text -->
                                <h2 class="fw-bold">Coming Soon</h2>

                                <!-- Subtext -->
                                <p class="text-muted">This section is still under progress.</p>
                            </div>

                        </div>
                        <div class="tab-pane fade" id="service">
                            <div class="d-flex flex-column justify-content-center align-items-center text-center"
                                style="height: 300px;">
                                <!-- Image / Icon -->
                                <img src="https://cdn-icons-png.flaticon.com/512/2910/2910762.png" alt="Coming Soon"
                                    style="width: 100px; height: 100px; object-fit: contain;" class="mb-3">

                                <!-- Main Text -->
                                <h2 class="fw-bold">Coming Soon</h2>

                                <!-- Subtext -->
                                <p class="text-muted">This section is still under progress.</p>
                            </div>

                        </div>
                        <div class="tab-pane fade" id="workorders">
                            <div class="d-flex flex-column justify-content-center align-items-center text-center"
                                style="height: 300px;">
                                <!-- Image / Icon -->
                                <img src="https://cdn-icons-png.flaticon.com/512/2910/2910762.png" alt="Coming Soon"
                                    style="width: 100px; height: 100px; object-fit: contain;" class="mb-3">

                                <!-- Main Text -->
                                <h2 class="fw-bold">Coming Soon</h2>

                                <!-- Subtext -->
                                <p class="text-muted">This section is still under progress.</p>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="more">
                            <div class="d-flex flex-column justify-content-center align-items-center text-center"
                                style="height: 300px;">
                                <!-- Image / Icon -->
                                <img src="https://cdn-icons-png.flaticon.com/512/2910/2910762.png" alt="Coming Soon"
                                    style="width: 100px; height: 100px; object-fit: contain;" class="mb-3">

                                <!-- Main Text -->
                                <h2 class="fw-bold">Coming Soon</h2>

                                <!-- Subtext -->
                                <p class="text-muted">This section is still under progress.</p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="editModal" class="modal-backdrop show"></div>
    <div v-if="editModal" class="modal show d-block" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Edit Cell</h5>
                    <button type="button" class="btn-close" @click="editModal = false"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Type</label>
                        <select class="form-select" v-model="cellData.type">
                            <option v-for="type in seatType" :key="type.id" :value="type.name">
                                {{ type.name }}
                            </option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Label</label>
                        <input type="text" class="form-control" v-model="cellData.label" :maxlength="currentMaxLength"
                            @input="cellData.label = $event.target.value.toUpperCase()"
                            :placeholder="`Max ${currentMaxLength} characters`" />
                        <small class="text-muted">
                            Maximum {{ currentMaxLength }} characters for {{ cellData.type }}
                        </small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="editModal = false">
                        Cancel
                    </button>
                    <button type="button" class="btn btn-primary" @click="appplyChanges">
                        Apply Changes
                    </button>

                    <button type="button" class="btn btn-danger" @click="seatActivation(cellData)">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- edit vehicle details  -->

    <div v-if="showModal" class="modal-backdrop show"></div>
    <div v-if="showModal" class="modal show d-block" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        Editing Form for vehicle {{ form.name ? form.name.toUpperCase().slice(0, 7) : "" }}
                    </h5>
                    <button type="button" class="btn-close" @click="closeModel()"></button>
                </div>
                <form @submit.prevent="updateVehicleDetails">
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="form-section">
                                    <h6 class="section-title mb-3">Basic Information</h6>
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <label class="form-label">Registration Number *</label>
                                            <input v-model="form.name" type="text" class="form-control" required
                                                maxlength="7" style="text-transform: uppercase"
                                                placeholder="e.g. T456DXJ"
                                                @input="form.name = form.name.toUpperCase().slice(0, 7)" />
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label">Group</label>
                                            <select v-model="form.group" class="form-select"
                                                :disabled="formDataLoading">
                                                <option value="">Select Vehicle Group</option>
                                                <option v-for="g in vehicleGroups" :key="g.id" :value="g.id">
                                                    {{ g.name }}
                                                </option>
                                            </select>
                                            <small v-if="formDataLoading" class="form-text text-muted">
                                                Loading vehicle groups...
                                            </small>
                                            <small v-else-if="currentGroupName" class="form-text text-success">
                                            </small>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label">First Registration</label>
                                            <input v-model="form.firstRegistration" type="date" class="form-control" />
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label">Manufacture Year</label>
                                            <select v-model="form.manufactureYear" class="form-select">
                                                <option v-for="y in years" :key="y" :value="y">
                                                    {{ y }}
                                                </option>
                                            </select>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label">Color</label>
                                            <input v-model="form.color" type="text" class="form-control"
                                                placeholder="Enter Color" readonly />
                                        </div>

                                        <div class="col-md-4">
                                            <label class="form-label">Size</label>
                                            <select v-model="form.size" class="form-select" :disabled="formDataLoading">
                                                <option value="">Select Size</option>
                                                <option v-for="sz in sizeGroups" :key="sz.id" :value="sz.id">
                                                    {{ sz.size }}
                                                </option>
                                            </select>
                                            <small v-if="formDataLoading" class="form-text text-muted">
                                                Loading sizes...
                                            </small>
                                            <small v-else-if="currentSizeName" class="form-text text-success">
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <hr class="my-4" />

                                <div class="form-section">
                                    <h6 class="section-title mb-3">Vehicle Details</h6>
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <label class="form-label">Model</label>
                                            <select v-model="form.model" class="form-select"
                                                :disabled="formDataLoading">
                                                <option value="">Select Vehicle Model</option>
                                                <option v-for="m in models" :key="m.id" :value="m.id">
                                                    {{ m.name }} - {{ m.make }}
                                                </option>
                                            </select>
                                            <small v-if="formDataLoading" class="form-text text-muted">
                                                Loading models...
                                            </small>
                                            <small v-else-if="currentModelName" class="form-text text-success">
                                            </small>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label">Make</label>
                                            <input v-model="form.make" type="text" class="form-control" disabled />
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label">Body Type</label>
                                            <input v-model="form.bodyType" type="text" class="form-control" disabled />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Chassis Number</label>
                                            <input v-model="form.chassisNumber" type="text" class="form-control" />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold">Seat Map</label>
                                            <select v-model="bus_seat_map" class="form-select"
                                                :disabled="formDataLoading" @change="fetchSeatMap">
                                                <option value="">Select Seat Map</option>
                                                <option v-for="m in seatMapType" :key="m.id" :value="m.id">
                                                    {{ m.name }}
                                                    <span v-if="m.id === vehicle.seatMapId">(Current)</span>
                                                </option>
                                            </select>
                                            <small v-if="currentSeatMapName" class="form-text text-success">
                                            </small>
                                            <small v-else-if="
                                                !vehicle.seatMapId || vehicle.seatMapId === 'N/A'
                                            " class="form-text text-warning">
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-4">
                                <div v-if="loading_spinner"
                                    class="d-flex justify-content-center align-items-center card h-100"
                                    style="height: 150px">
                                    <div class="spinner-border text-primary" role="status"></div>
                                    <span class="ms-2">Loading seat map...</span>
                                </div>

                                <div v-else-if="
                                    !bus_seat_map &&
                                    (!vehicle.seatMapId || vehicle.seatMapId === 'N/A')
                                " class="card h-100">
                                    <div class="card-header bg-light py-2">
                                        <h6 class="card-title mb-0 small">
                                            <i class="fas fa-map me-1"></i>Seat Map Preview
                                        </h6>
                                    </div>
                                    <div class="card-body p-3 text-center">
                                        <i class="fas fa-bus fa-2x text-muted mb-2"></i>
                                        <p class="text-muted small mb-0">
                                            No seat map assigned to this vehicle
                                        </p>
                                        <small class="text-muted">Choose a seat map from the dropdown to see the
                                            layout</small>
                                    </div>
                                </div>

                                <div v-else-if="bus_seat_map && seatMapData.length === 0" class="card h-100">
                                    <div class="card-header bg-light py-2">
                                        <h6 class="card-title mb-0 small">
                                            <i class="fas fa-map me-1"></i>Seat Map Preview -
                                            {{ currentSeatMapName }}
                                        </h6>
                                    </div>
                                    <div class="card-body p-3 text-center">
                                        <i class="fas fa-exclamation-triangle text-warning fa-2x mb-2"></i>
                                        <p class="text-muted small mb-0">
                                            No seat layout data available
                                        </p>
                                        <small class="text-muted">This seat map template exists but has no layout
                                            defined</small>
                                    </div>
                                </div>

                                <div v-else-if="bus_seat_map && seatMapData.length > 0" class="card h-100">
                                    <div class="card-header bg-light py-2">
                                        <h6 class="card-title mb-0 small">
                                            <i class="fas fa-map me-1"></i>Seat Map Preview -
                                            {{ currentSeatMapName }}
                                        </h6>
                                    </div>
                                    <div class="card-body p-2">
                                        <div class="bus-layout-container">
                                            <div class="seat-map p-1">
                                                <div v-for="(row, rowIndex) in seatMapData" :key="rowIndex"
                                                    class="seat-row d-flex justify-content-center mb-1">
                                                    <div v-for="(item, colIndex) in row" :key="colIndex"
                                                        class="seat mx-1 d-flex align-items-center justify-content-center"
                                                        :class="{
                                                            'seat-available': item.type === 'SEAT',
                                                            'seat-selected': selectedSeat?.id === item.id,
                                                            'seat-toilet': item.type === 'TOILET',
                                                            'seat-door': item.type === 'DOOR',
                                                            'seat-fridge': item.type === 'FRIDGE',
                                                            'seat-cabinet': item.type === 'CABINET',
                                                            'seat-aisle':
                                                                [2, 3].includes(item.position_x) &&
                                                                item.type === 'EMPTY',
                                                        }">
                                                        <span v-if="
                                                            item.type === 'SEAT' || item.type === 'STAFF'
                                                        " class="seat-label small">{{ item.label }}</span>
                                                        <i v-else-if="item.type === 'TOILET'"
                                                            class="fas fa-toilet text-info small"></i>
                                                        <i v-else-if="item.type === 'DOOR'"
                                                            class="fas fa-door-open text-warning small"></i>
                                                        <i v-else-if="item.type === 'FRIDGE'"
                                                            class="fas fa-snowflake text-info small"></i>
                                                        <i v-else-if="item.type === 'CABINET'"
                                                            class="fas fa-archive text-info small"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- Compact Legend -->
                                        <div class="mt-2">
                                            <h6 class="text-muted mb-1 small">Legend:</h6>
                                            <div class="d-flex flex-wrap gap-1 small">
                                                <span class="badge bg-success py-1 px-2">Seat</span>
                                                <span class="badge bg-info py-1 px-2">
                                                    <i class="fas fa-toilet me-1"></i>Toilet
                                                </span>
                                                <span class="badge bg-warning py-1 px-2">
                                                    <i class="fas fa-door-open me-1"></i>Door
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Show when vehicle has seat map but none selected in dropdown -->
                                <div v-else-if="
                                    vehicle.seatMapId &&
                                    vehicle.seatMapId !== 'N/A' &&
                                    !bus_seat_map
                                " class="card h-100">
                                    <div class="card-header bg-light py-2">
                                        <h6 class="card-title mb-0 small">
                                            <i class="fas fa-map me-1"></i>Seat Map Preview
                                        </h6>
                                    </div>
                                    <div class="card-body p-3 text-center">
                                        <i class="fas fa-bus fa-2x text-muted mb-2"></i>
                                        <p class="text-muted small mb-0">
                                            Current seat map: {{ currentSeatMapName }}
                                        </p>
                                        <small class="text-muted">Select a different seat map from dropdown to
                                            preview</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModel()"
                            :disabled="submittingForm">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary" :disabled="submittingForm">
                            <span v-if="submittingForm">
                                <i class="fa fa-spinner fa-spin"></i> Updating...
                            </span>
                            <span v-else>Update</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";

import { COPEX_API_URL } from "@/config/config.js";
import { useRoute } from "vue-router";
import axios from "axios";
import { useNotification } from "@/composables/notification";
import { useAuthStore } from "@/stores/auth";
import { PerfectScrollbar } from "vue3-perfect-scrollbar";
const authStore = useAuthStore();
const permissions = authStore.permissions;
const axiosInstance = axios.create({
     baseURL: COPEX_API_URL,
    // baseURL: "http://127.0.0.1:8000/api/v1/",
    headers: {
        "Content-Type": "application/json",
    },
});
const axiosInstance1 = axios.create({
    baseURL: COPEX_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const realVehicleuuid = ref(null);
const realVehicleid = ref(null);
const selectedSeat = ref(null);
const showModal = ref(false);
const formDataLoading = ref(false);
const currentCell = ref(null);
const cancel = ref(false);
const seat_mode = ref(null);
const seatType = ref([]);
const editModal = ref(false);
const route = useRoute();
const { showAlert } = useNotification();



// API Service functions
const vehicleService = {

async  getVehicleDetails() {
  try {
    const response = await fetch(
      `${COPEX_API_URL}/vehicle-assets/${route.params.id}`
    );

    const result = await response.json();

    if (result.success && result.data) {
      const data = result.data;

      realVehicleuuid.value = data.uuid;
      realVehicleid.value = data.id;

     const extractedData = {
  // Raw data (optional kama unahitaji)
  data: data,
  // Basic Info
  name: data.name || "",
  details: data.description || "",
  meter: "", // haipo kwenye response
  status: data.status || "",
  group: data.asset_group_name || "",
  operator: "", // haipo kwenye response
  type: data.type || "",
  vin: data.chassis_number || "",
  plate: data.registration_number || "",
  year: data.manufacture_year || "",
  make: data.make || "",
  model: data.model || "",
  trim: data.variant || "",
  // Specifications
  chassisNumber: data.chassis_number || "",
  engineNumber: data.engine_number || "",
  engineCapacity: data.engine_capacity_cc || "",
  fuelType: data.fuel_used_id || "", // kama backend ita-return fuel name better
  axleCount: data.axle_count || "",
  axleDistance: "", // haipo kwenye response
  tearWeight: data.tare_weight || "",
  grossWeight: data.gross_weight || "",
  tankCapacity: data.tank_capacity_liters || "",
  bodyType: data.type || "",
  seatCapacity: "", // haipo kwenye response
  length: "", // haipo
  width: "", // haipo
  height: "", // haipo
  costCenter: "", // haipo kwenye response
};


      return extractedData;
    }

    return null;
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    return null;
  }
}
,


    getVehicleServices(uuid) {
        try {
          
        } catch (error) {
            console.error("Error fetching vehicle services:", error);
            return [];
        }
    },
};

const form = ref({
    name: "",
    code: "",
    group: "", // Will store vehicle group ID
    firstRegistration: "",
    manufactureYear: "",
    color: "",
    ownership: "",
    chassisNumber: "",
    model: "", // Will store model ID
    engineNumber: "",
    engineCapacity: "",
    seatCapacity: "",
    tankCapacity: "",
    axleCount: "",
    axleDistance: "",
    tearWeight: "",
    grossWeight: "",
    make: "",
    color: "",
    ownership: "",
    bodyType: "", // Will store body type ID
    width: "",
    height: "",
    size: "", // Will store size group ID
    description: "",
});


const editVehicleDetails = async () => {
    try {
        formDataLoading.value = true;

        await fetchFormData();
        await fetchMap();

        form.value.name = vehicle.value.name || "";
        form.value.code = vehicle.value.code || "";
        form.value.color = vehicle.value.color || "";

        if (vehicle.value.group && vehicleGroups.value.length > 0) {
            const group = vehicleGroups.value.find(
                (g) => g.name === vehicle.value.group
            );
            form.value.group = group ? group.id : "";
        } else {
            const busGroup = vehicleGroups.value.find((g) => g.name === "BUS");
            form.value.group = busGroup ? busGroup.id : "";
        }

        form.value.firstRegistration =
            vehicle.value.firstRegistrationDate ||
            vehicle.value.specifications?.first_registration_date ||
            "";

        form.value.manufactureYear = vehicle.value.year || "";

        form.value.color =
            vehicle.value.color || vehicle.value.specifications?.color || "";

        form.value.ownership =
            vehicle.value.ownership || vehicle.value.specifications?.ownership || "";
        form.value.chassisNumber =
            vehicle.value.chassisNumber ||
            vehicle.value.specifications?.chassis_number ||
            "";

        if (vehicle.value.model && models.value.length > 0) {
            const model = models.value.find(
                (m) =>
                    m.name === vehicle.value.model ||
                    `${m.name} - ${m.make}` === vehicle.value.model
            );
            form.value.model = model ? model.id : "";

            if (model) {
                form.value.make = model.make || "";
                form.value.bodyType = model.type || "";
            }
        } else {
            const modelName = vehicle.value.specifications?.model;
            if (modelName && models.value.length > 0) {
                const model = models.value.find(
                    (m) =>
                        m.name === modelName ||
                        m.name.includes(modelName) ||
                        modelName.includes(m.name)
                );
                if (model) {
                    form.value.model = model.id;
                    form.value.make = model.make || "";
                    form.value.bodyType = model.type || "";
                }
            }
        }

        form.value.engineNumber =
            vehicle.value.engineNumber ||
            vehicle.value.specifications?.engine_number ||
            "";
        form.value.engineCapacity =
            vehicle.value.engineCapacity ||
            vehicle.value.specifications?.engine_capacity ||
            "";
        form.value.seatCapacity =
            vehicle.value.seatCapacity ||
            vehicle.value.specifications?.seat_capacity ||
            "";
        form.value.tankCapacity =
            vehicle.value.tankCapacity ||
            vehicle.value.specifications?.tank_capacity ||
            "";
        form.value.axleCount =
            vehicle.value.axleCount ||
            vehicle.value.specifications?.axle?.number_of_axle ||
            "";
        form.value.axleDistance =
            vehicle.value.axleDistance ||
            vehicle.value.specifications?.axle?.axle_distance ||
            "";
        form.value.tearWeight =
            vehicle.value.tearWeight ||
            vehicle.value.specifications?.weights?.tear_weight ||
            "";
        form.value.grossWeight =
            vehicle.value.grossWeight ||
            vehicle.value.specifications?.weights?.gross_weight ||
            "";
        form.value.make =
            vehicle.value.make || vehicle.value.specifications?.make || "";
        form.value.bodyType =
            vehicle.value.bodyType || vehicle.value.specifications?.body_type || "";
        form.value.width =
            vehicle.value.width ||
            vehicle.value.specifications?.body_dimensions?.width ||
            "";
        form.value.height =
            vehicle.value.height ||
            vehicle.value.specifications?.body_dimensions?.height ||
            "";

        if (vehicle.value.size && sizeGroups.value.length > 0) {
            const size = sizeGroups.value.find(
                (sz) => sz.size === vehicle.value.size
            );
            form.value.size = size ? size.id : "";
        } else {
            if (sizeGroups.value.length > 0) {
                form.value.size = sizeGroups.value[0].id;
            }
        }

        form.value.description = vehicle.value.description || "";

        if (vehicle.value.seatMapId && vehicle.value.seatMapId !== "N/A") {
            bus_seat_map.value = vehicle.value.seatMapId;
            setTimeout(() => {
                fetchSeatMap();
            }, 100);
        } else {
            seatMapData.value = [];
        }

        showModal.value = true;
    } catch (error) {
        console.error("Error in editVehicleDetails:", error);
        showAlert("error", "Failed to load edit form data");
    } finally {
        formDataLoading.value = false;
    }
};
const currentSeatMapName = computed(() => {
    if (!vehicle.value.seatMapId || vehicle.value.seatMapId === "N/A") return "";
    const map = seatMapType.value.find((m) => m.id === vehicle.value.seatMapId);
    return map ? map.name : "";
});
// Add these computed properties
const currentGroupName = computed(() => {
    if (!form.value.group) return "";
    const group = vehicleGroups.value.find((g) => g.id === form.value.group);
    return group ? group.name : "";
});

const currentModelName = computed(() => {
    if (!form.value.model) return "";
    const model = models.value.find((m) => m.id === form.value.model);
    return model ? `${model.name} - ${model.make}` : "";
});

const currentSizeName = computed(() => {
    if (!form.value.size) return "";
    const size = sizeGroups.value.find((sz) => sz.id === form.value.size);
    return size ? size.size : "";
});
const showSeatData = async (data) => {
    fetchSeatType();
    currentCell.value = data;
    cellData.value = {
        id: data.id,
        type: data.type,
        label: data.label,
        position_x: data.X,
        position_y: data.Y,
        status: data.status,
    };
    editModal.value = true;
    // console.log("cellData", cellData.value);
};
const closeModel = () => {
    showModal.value = false;
    seatMapData.value = [];
};
// Stateconst
const cellData = ref({
    id: "",
    label: "",
    type: "",
    position_x: "",
    position_y: "",
    status: "",
});

const loading = ref(false);
const activeTab = ref("overview");
const vehicleUuid = route.params.id; // Get vehicle ID from route (can be accessed via /abs/fleet/vehicle/:id)
const hasConflict = ref(false);
// Tabs configuration
const tabs = ref([
    {
        key: "overview",
        label: "Overview",
        icon: "fa fa-home",
        permission: "CAN_VIEW_FLEET",
        action: () => fetchBusSeatMap(vehicle.value.name),
    },
    {
        key: "specs",
        label: "Specifications",
        icon: "fa fa-cogs",
        permission: "CAN_VIEW_FLEET_SPECS",
        // action: () => fetchBusSeatMap(vehicle.value.id),

    },
    {
        key: "route",
        label: "Route",
        icon: "fa fa-route",
        permission: "CAN_VIEW_FLEET_ROUTES",
    },
    {
        key: "fuels",
        label: "Fuel",
        icon: "fa fa-gas-pump",
        permission: "CAN_VIEW_FLEET_FUEL",
    },
    {
        key: "service",
        label: "Service History",
        icon: "fa fa-wrench",
        permission: "CAN_VIEW_FLEET_SERVICES",
    },
    {
        key: "workorders",
        label: "Work Orders",
        icon: "fa fa-tasks",
        permission: "CAN_VIEW_FLEET_WORK_ORDERS",
    },
    {
        key: "more",
        label: "More",
        icon: "fa fa-ellipsis-h",
        permission: "CAN_VIEW_FLEET_MORE",
    },
]);

const vehicleSpecs = [
    { label: "Name", key: "name", icon: "fa fa-bus" },
    { label: "Make", key: "make", icon: "fa fa-industry" },
    { label: "Model", key: "model", icon: "fa fa-car" },
    { label: "Year", key: "year", icon: "fa fa-calendar" },
    { label: "Body Type", key: "bodyType", icon: "fa fa-shapes" },
    { label: "Engine Capacity", key: "engineCapacity", icon: "fa fa-cog" },
    { label: "Seat Capacity", key: "seatCapacity", icon: "fa fa-chair" },
    { label: "Fuel Type", key: "fuelType", icon: "fa fa-gas-pump" },
    { label: "Chassis Number", key: "chassisNumber", icon: "fa fa-hashtag" },
    { label: "Cost Center", key: "costCenter", icon: "fa fa-building" },
];




// Vehicle data
const vehicle = ref({
    name: "",
    details: "",
    meter: "",
    status: "",
    group: "",
    operator: "",
    type: "",
    vin: "",
    plate: "",
    year: "",
    make: "",
    color: "",
    ownership: "",
    model: "",
    trim: "",
    // New fields from specifications
    chassisNumber: "",
    engineNumber: "",
    engineCapacity: "",
    fuelType: "",
    axleCount: "",
    axleDistance: "",
    tearWeight: "",
    grossWeight: "",
    tankCapacity: "",
    bodyType: "",
    seatCapacity: "",
    length: "",
    width: "",
    height: "",
    costCenter: "",
    seatMap: "",
    seatMapId: "",
});

const seatMapData = ref([]);
const bus_seat_map = ref([]);
const seatMapType = ref([]);
const vehicleGroups = ref([]);
const sizeGroups = ref([]);
const vehicleClasses = ref([]);
const models = ref([]);
const years = ref([]);
const loading_spinner = ref(false);
const submittingForm = ref(false);
const currentYear = new Date().getFullYear();
for (let y = currentYear; y >= 1980; y--) years.value.push(y);
const absErpId =
    authStore.companies.abs_id ??
    (() => {
        authStore.loadCompanies();
        return authStore.companies.abs_id ?? null;
    })();

const updateVehicleDetails = async () => {
    try {
        submittingForm.value = true;

        const payload = {
            registration_number: form.value.name,
            code: form.value.code,
            vehicle_group: form.value.group,
            first_registration: form.value.firstRegistration,
            manufacture_year: form.value.manufactureYear,
            color: form.value.color,
            ownership: form.value.ownership,
            chassis_number: form.value.chassisNumber,
            model: form.value.model,
            // model: selectedModelName.value,
            engine_number: form.value.engineNumber,
            engine_capacity: form.value.engineCapacity,
            seat_capacity: form.value.seatCapacity,
            tank_capacity: form.value.tankCapacity,
            axle_count: form.value.axleCount,
            axle_distance: form.value.axleDistance,
            tear_weight: form.value.tearWeight,
            gross_weight: form.value.grossWeight,
            make: form.value.make,
            body_type: form.value.bodyType,
            width: form.value.width,
            height: form.value.height,
            size: form.value.size,
            description: form.value.description,
            user_id: authStore.user?.id ?? "",
            abs_erp_id: absErpId,
            seat_map_id: bus_seat_map.value || null,
            seats: seatMapData.value
                .flat()
                .filter((a) => a.type !== "SPACE")
                .map((seat) => ({
                    label: seat.label || seat.type,
                    position_x: seat.position_x,
                    position_y: seat.position_y,
                    status: 1,
                })),
        };      

        const response = await fetch(
            `${COPEX_API_URL}vehicle-master/fleet/vehicles/update/${realVehicleid.value}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        const result = await response.json();
        // console.log("API Response:", result);

        if (result.success) {
            showAlert("success", result.message || "Vehicle updated successfully!");
            showModal.value = false;

            form.value = {
                name: "",
                code: "",
                group: "",
                firstRegistration: "",
                manufactureYear: "",
                color: "",
                ownership: "",
                chassisNumber: "",
                model: "",
                engineNumber: "",
                engineCapacity: "",
                seatCapacity: "",
                tankCapacity: "",
                axleCount: "",
                axleDistance: "",
                tearWeight: "",
                grossWeight: "",
                make: "",
                bodyType: "",
                width: "",
                height: "",
                size: "",
                description: "",
            };
            await refreshData();
        } else {
            showAlert(
                "error",
                "Failed to update vehicle: " + (result.message || "Unknown error")
            );
        }
    } finally {
        submittingForm.value = false;
    }
};


const fetchFormData = async () => {
    formDataLoading.value = true;
    try {
        const res = await fetch(
            "https://abserp.iosuite.org/api/v1/form_data_group"
        );
        const data = await res.json();
        if (data.success) {
            vehicleGroups.value = data.data.vehicle_group;
            sizeGroups.value = data.data.size_groups;
            models.value = data.data.models;
            // console.log("Form data loaded:", data.data);
        }
    } catch (e) {
        console.error("Error fetching form data:", e);
        showAlert("error", "Failed to load form data. Please refresh the page.");
    } finally {
        formDataLoading.value = false;
    }
};



const serviceReminders = ref([
    { id: 1, title: "Tire Rotation", due: "3 months from now" },
    { id: 2, title: "Engine Oil & Filter Replacement", due: "3 months from now" },
]);

// Methods
const refreshData = async () => {
    try {
        loading.value = true;

        if (!vehicleUuid) {
            showAlert(
                "warning",
                "No vehicle ID provided. Please navigate to a specific vehicle."
            );
            return;
        }

        // Fetch vehicle details and services
        const [vehicleDetails, vehicleServices] = await Promise.all([
            vehicleService.getVehicleDetails(vehicleUuid),
            vehicleService.getVehicleServices(vehicleUuid),
        ]);

        if (vehicleDetails) {
            vehicle.value = vehicleDetails;           
        } else {
            showAlert("error", "Failed to load vehicle details");
        }

        // Update service reminders based on API data
        if (vehicleServices && vehicleServices.length > 0) {
            serviceReminders.value = vehicleServices.map((service) => ({
                id: service.id || Math.random(),
                title: service.service_type || "Service Due",
                due: service.due_date || "Due soon",
            }));
        }
        // showAlert('success', 'Vehicle profile data refreshed successfully!');
        // console.log('✅ Vehicle profile data refreshed!');
    } catch (error) {
        console.error("❌ Error refreshing vehicle profile:", error);
        showAlert(
            "error",
            "Failed to refresh vehicle profile data: " + error.message
        );
    } finally {
        loading.value = false;
    }
};



// Watch for route changes (when navigating between different vehicles)
watch(
    () => route.params.id,
    (newId, oldId) => {
        if (newId && newId !== oldId) {
            // console.log(
            //     "🔄 Route changed - New Vehicle ID:",
            //     newId,
            //     "Old ID:",
            //     oldId
            // );
            // Reset vehicle data and fetch new vehicle
            vehicle.value = {
                name: "",
                details: "",
                meter: "",
                status: "",
                group: "",
                operator: "",
                type: "",
                vin: "",
                plate: "",
                year: "",
                make: "",
                model: "",
                trim: "",
                // New fields from specifications
                chassisNumber: "",
                engineNumber: "",
                engineCapacity: "",
                fuelType: "",
                axleCount: "",
                axleDistance: "",
                tearWeight: "",
                grossWeight: "",
                tankCapacity: "",
                bodyType: "",
                seatCapacity: "",
                length: "",
                width: "",
                height: "",
                costCenter: "",
            };
            refreshData();
        }
    }
);

// Lifecycle
onMounted(() => {
    // Automatically fetch vehicle data if UUID is provided
    if (vehicleUuid) {
        refreshData();

    } else {
        showAlert(
            "info",
            "Please select a vehicle from the fleet list to view its details."
        );
    }
});
</script>

<style scoped>
.vehicle-profile-page {
    width: 100%;
}
.card {
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    border-radius: 8px;
}

/* Remove border radius from tabs card */
.tabs-card {
    border-radius: 0 !important;
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
}

.card-header {
    background: #f8f9fa !important;
    border-bottom: 1px solid #e9ecef;
    font-weight: 600;
    color: #2c3e50;
}

.vehicle-icon {
    width: 100px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border-radius: 8px;
    border: 2px solid #e9ecef;
}

.vehicle-icon i {
    color: #007bff;
}



.tab-panel {
    min-height: 400px;
}

.list-group-item {
    border: 1px solid #e9ecef;
    border-radius: 0.375rem;
    margin-bottom: 0.5rem;
}

.badge {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
}

/* Specification Cards Styling */
.spec-label {
    font-weight: 500;
    color: #6c757d;
    font-size: 0.85rem;
    min-width: 120px;
    display: inline-block;
}

.spec-value {
    color: #495057;
    font-size: 0.85rem;
    margin-left: 10px;
}

/* Bus Seat Map Styling */
/* .seat-map-container {
  text-align: center; */
/* } */

.driver-area {
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 15px;
}

.driver-seat {
    display: inline-block;
    padding: 15px;
    background: #e7f5ef;
    border: 2px solid #0f5132;
    border-radius: 8px;
    color: #0f5132;
    font-weight: 600;
}

.driver-seat i {
    font-size: 1.2rem;
    display: block;
    margin-bottom: 5px;
}

.passenger-seats {
    margin-top: 20px;
}

/* .seat-row {
  display: flex;
  justify-content: center;
  gap: 8px;
} */

/* .seat {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
} */

/* .seat:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.seat i {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 2px;
} */

/* .seat small {
  font-size: 0.7rem;
  color: #495057;
  font-weight: 600;
} */

.seat-legend {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #e9ecef;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
}

.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    border: 1px solid #dee2e6;
}

.legend-color.available {
    background: #d4edda;
    border-color: #c3e6cb;
}

.legend-color.occupied {
    background: #f8d7da;
    border-color: #f5c6cb;
}

.legend-color.reserved {
    background: #fff3cd;
    border-color: #ffeaa7;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .card-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .ms-auto {
        margin-left: 0 !important;
        width: 100%;
    }

    .nav-tabs {
        flex-wrap: wrap;
    }

    .nav-tabs .nav-link {
        font-size: 0.8rem;
        padding: 0.5rem 0.75rem;
    }
}

/* //seat map styles */
.seat-map {
    background-color: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #dee2e6;
}

.seat {
    width: 30px;
    height: 30px;
    border-radius: 3px;
    font-size: 10px;
    transition: all 0.2s;
}

.seat-available {
    background-color: #28a745;
    color: white;
    cursor: pointer;
}

.seat-selected {
    background-color: #007bff;
    color: white;
    transform: scale(1.1);
}

.seat-toilet {
    background-color: #17a2b8;
    color: white;
}

.seat-door {
    background-color: #ffc107;
    color: #212529;
}

.seat-cabinet {
    background-color: #6c757d;
    color: #212529;
}

.seat-fridge {
    background-color: #e2ecf5;
    color: #212529;
}

.seat-aisle {
    background-color: transparent;
    width: 40px;
}

.modal-dialog-scrollable .modal-body {
    overflow-y: auto !important;
    max-height: calc(100vh - 200px) !important;
}
</style>
