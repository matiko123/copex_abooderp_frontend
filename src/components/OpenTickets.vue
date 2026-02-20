<template>
  <div class="d-flex align-items-center mb-3">
    <div>
      <ul class="breadcrumb">
        <li class="breadcrumb-item"><a href="#">OPERATIONS</a></li>
        <li class="breadcrumb-item"><a href="#">BOOKINGS</a></li>
        <li class="breadcrumb-item active">OPEN TICKETS</li>
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

  <div v-if="!loading && openTicketsList.length === 0" class="text-center py-5">
    <EmptyState
      :title="'No Open Tickets Found!'"
      :subtitle="'There are no open tickets to display.'"
      :icon="'fa-solid fa-ticket-alt'"
      :colorClass="'text-warning'"
      :showButton="true"
      :buttonTitle="'Refresh'"
      @click="fetchOpenTickets"
    />
  </div>

  <Card v-else>
    <div class="p-3">
      <StandardDataTable
        :columns="tableColumns"
        :data="openTicketsList"
        :loading="loading"
        :disableSearch="false"
        :filters="tableFilters"
        :customFilters="tableFiltersConfig"
        :pagination="pagination"
        :serverSide="true"
        @update:filters="handleFiltersUpdate"
      >
        <template #reference="{ row }">
          <router-link
            v-if="row.reference"
            :to="
              permissions.includes('CAN_RESCHEDULE')
                ? {
                    path: '/ticket/search-booking',
                    query: { reference: row.reference },
                  }
                : '#'
            "
            class="text-decoration-none"
          >
            <span class="badge bg-primary bg-opacity-10 text-info">
              {{ row.reference }}
            </span>
          </router-link>
        </template>

        <template #passenger="{ row }">
          <div class="fw-semibold">{{ row.passenger_name || "N/A" }}</div>
        </template>

        <template #type="{ row }">
          <span class="badge bg-warning bg-opacity-15 text-warning">
            <i class="fa fa-ticket-alt me-1"></i> OPEN TICKET
          </span>
        </template>

        <template #date="{ row }">
          <div class="text-nowrap">{{ formatDate(row.date) }}</div>
        </template>

        <template #created_by="{ row }">
          <div class="d-flex align-items-center">
            <div class="avatar avatar-xs me-2">
              <span
                class="avatar-title rounded-circle bg-primary bg-opacity-10 text-info"
              >
                {{ getInitials(row.created_by_name) }}
              </span>
            </div>
            <div>
              <div class="small fw-semibold">{{ row.created_by_name }}</div>
              <small class="text-muted">{{ row.created_by_email }}</small>
            </div>
          </div>
        </template>

        <template #updated_by="{ row }">
          <div class="d-flex align-items-center">
            <div class="avatar avatar-xs me-2">
              <span
                class="avatar-title rounded-circle bg-primary bg-opacity-10 text-info"
              >
                {{ getInitials(row.updated_by_name) }}
              </span>
            </div>
            <div>
              <div class="small fw-semibold">{{ row.updated_by_name }}</div>
              <small class="text-muted">{{ row.updated_by_email }}</small>
            </div>
          </div>
        </template>

        <template #actions="{ row }">
          <div class="d-flex gap-2">
            <button
              v-if="permissions.includes('CAN_BOOK_TICKETS') && row.is_reusable"
              class="btn btn-sm rounded-pill d-flex align-items-center justify-content-center btn-info"
              style="border: 1px solid white; padding: 6px 12px"
              @click="handleBookFromOpenTicket(row)"
              :title="row.is_reusable ? 'Book Ticket' : 'Ticket completed'"
            >
              {{ row.is_reusable ? "Book Ticket" : "Complete" }}
            </button>
            <span
              v-if="!permissions.includes('CAN_BOOK_TICKETS')"
              class="badge btn-success"
              title="No permission"
            >
              <i class="fa fa-ban me-1"></i> N/A
            </span>
          </div>
        </template>
      </StandardDataTable>
    </div>
  </Card>

  <StandardModal
    id="ticketDetailModal"
    title="Open Ticket Details"
    size="xl"
    :backdrop="'static'"
    :keyboard="false"
    :centered="true"
    ref="detailsModalRef"
  >
    <div v-if="selectedTicket">
      <!-- Policy Section -->
      <div class="card border-0 mb-3">
        <div class="card-body">
          <h5><strong>Bus Ticketing Policy</strong></h5>
          <div
            v-if="selectedTicket.policy?.reuse?.routes?.same_route?.enabled"
            class="alert alert-success"
          >
            <i class="fa fa-check-circle me-2"></i>
            {{
              selectedTicket.policy?.reuse?.description ||
              "Ticket is eligible for reuse."
            }}
          </div>
          <div v-else class="alert alert-warning">
            <i class="fa fa-exclamation-triangle me-2"></i>
            {{
              selectedTicket.policy?.reuse?.description ||
              "Ticket reuse may be restricted."
            }}
          </div>

          <!-- Policy Details -->
          <div v-if="selectedTicket.policy" class="row mt-3">
            <div class="col-md-6">
              <h6 class="text-muted mb-2">Route Options:</h6>
              <div class="mb-2">
                <span
                  class="badge"
                  :class="
                    selectedTicket.policy.reuse?.routes?.same_route?.enabled
                      ? 'bg-success'
                      : 'bg-secondary'
                  "
                >
                  <i class="fa fa-route me-1"></i>
                  Same Route:
                  {{
                    selectedTicket.policy.reuse?.routes?.same_route?.enabled
                      ? "Enabled"
                      : "Disabled"
                  }}
                </span>
              </div>
              <div>
                <span
                  class="badge"
                  :class="
                    selectedTicket.policy.reuse?.routes?.start_new_route
                      ? 'bg-info'
                      : 'bg-secondary'
                  "
                >
                  <i class="fa fa-plus-circle me-1"></i>
                  New Route:
                  {{
                    selectedTicket.policy.reuse?.routes?.start_new_route
                      ? "Allowed"
                      : "Not Allowed"
                  }}
                </span>
              </div>
            </div>

            <div class="col-md-6">
              <h6 class="text-muted mb-2">Route Details:</h6>
              <div v-if="selectedTicket.policy.reuse?.routes?.same_route">
                <small class="d-block text-muted">From:</small>
                <strong>{{
                  selectedTicket.policy.reuse.routes.same_route.boarding_points
                    ?.name || "N/A"
                }}</strong>

                <small class="d-block text-muted mt-2">To:</small>
                <strong>{{
                  selectedTicket.policy.reuse.routes.same_route.dropping_points
                    ?.name || "N/A"
                }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ticket Information -->
      <div class="row mb-3">
        <div class="col-md-6">
          <div class="card border-0 bg-light">
            <div class="card-body">
              <h6 class="card-title text-primary mb-3">
                <i class="fa fa-ticket-alt me-2"></i>Ticket Information
              </h6>
              <div class="row">
                <div class="col-6 mb-2">
                  <small class="text-muted">Reference</small><br />
                  <strong>{{ selectedTicket.reference }}</strong>
                </div>
                <div class="col-6 mb-2">
                  <small class="text-muted">Status</small><br />
                  <span
                    class="badge"
                    :class="
                      selectedTicket.is_reusable ? 'bg-success' : 'bg-secondary'
                    "
                  >
                    {{ selectedTicket.is_reusable ? "Reusable" : "Used" }}
                  </span>
                </div>
                <div class="col-6 mb-2">
                  <small class="text-muted">Passenger</small><br />
                  <strong>{{ selectedTicket.passenger_name }}</strong>
                </div>
                <div class="col-6 mb-2">
                  <small class="text-muted">Phone</small><br />
                  <strong>{{ selectedTicket.phone }}</strong>
                </div>
                <div class="col-6 mb-2">
                  <small class="text-muted">Created Date</small><br />
                  <strong>{{ formatDate(selectedTicket.date) }}</strong>
                </div>
                <div class="col-6 mb-2">
                  <small class="text-muted">Original Fare</small><br />
                  <strong class="text-success">
                    {{ formatAmount(selectedTicket.original_fare) }}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card border-0 bg-light">
            <div class="card-body">
              <h6 class="card-title text-primary mb-3">
                <i class="fa fa-user me-2"></i>User Information
              </h6>
              <div class="row">
                <div class="col-6 mb-2">
                  <small class="text-muted">Created By</small><br />
                  <strong>{{ selectedTicket.created_by_name }}</strong
                  ><br />
                  <small class="text-muted">{{
                    selectedTicket.created_by_email
                  }}</small>
                </div>
                <!-- <div class="col-6 mb-2">
                  <small class="text-muted">Updated By</small><br />
                  <strong>{{ selectedTicket.updated_by_name }}</strong
                  ><br />
                  <small class="text-muted">{{
                    selectedTicket.updated_by_email
                  }}</small>
                </div> -->
                <div class="col-12 mb-2">
                  <small class="text-muted">Reason for Open Ticket</small><br />
                  <p class="mb-0">
                    {{ selectedTicket.reason || "No reason provided" }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Passenger Details -->
      <div
        v-if="selectedTicket.ticket_data?.bookings?.length > 0"
        class="card border-0"
      >
        <div class="card-header bg-info bg-opacity-10 border-0">
          <h6 class="card-title mb-0 text-info">
            <i class="fa fa-users me-2"></i>
            Passenger Details
          </h6>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>National ID</th>
                  <th>Nationality</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(passenger, index) in selectedTicket.ticket_data
                    .bookings"
                  :key="index"
                >
                  <td>{{ index + 1 }}</td>
                  <td>
                    <strong>{{ passenger.full_name }}</strong>
                  </td>
                  <td>{{ passenger.passenger_phone_number }}</td>
                  <td>
                    <span class="badge bg-primary bg-opacity-10 text-primary">
                      {{ passenger.gender_id === 1 ? "Male" : "Female" }}
                    </span>
                  </td>
                  <td>
                    <span
                      class="badge bg-secondary bg-opacity-10 text-secondary"
                    >
                      {{ passenger.age_id === 1 ? "Adult" : "Child" }}
                    </span>
                  </td>
                  <td>{{ passenger.nationalId || "N/A" }}</td>
                  <td>{{ passenger.nationality || "N/A" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="mt-4 d-flex justify-content-between">
        <button
          v-if="
            permissions.includes('CAN_BOOK_TICKETS') &&
            selectedTicket.is_reusable
          "
          class="btn btn-success"
          @click="showBookingOptionsModal"
        >
          <i class="fa fa-ticket-alt me-2"></i>Book This Ticket
        </button>
        <button
          class="btn btn-secondary ms-auto"
          @click="detailsModalRef?.hide()"
        >
          Close
        </button>
      </div>
    </div>
    <div v-else>
      <EmptyState title="No ticket selected" />
    </div>
  </StandardModal>

  <StandardModal
    id="bookingOptionsModal"
    title="Book Open Ticket"
    size="md"
    :backdrop="'static'"
    :keyboard="false"
    :centered="true"
    ref="bookingModalRef"
  >
    <div v-if="selectedTicket">
      <div class="mb-3">
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            v-model="acceptedTerms"
            id="acceptTerms"
          />
          <label
            class="form-check-label"
            for="acceptTerms"
            style="font-size: 0.875rem"
          >
            I accept the terms and will proceed with booking.
          </label>
        </div>
        <small class="text-muted d-block mt-1" style="font-size: 0.75rem">
          By proceeding, you understanding and accept responsibility for any
          changes after initiating this open ticket booking.
        </small>
      </div>

      <!-- Booking Options -->
      <h6 class="mb-2" style="font-size: 0.9rem">Select Booking Option:</h6>
      <div class="d-flex flex-column gap-2">
        <!-- Same Route Option -->
        <div
          v-if="selectedTicket.policy?.reuse?.routes?.same_route?.enabled"
          class="card border p-2 border-success"
          @click="acceptedTerms && handleSameRouteBooking()"
          :style="{
            cursor: acceptedTerms ? 'pointer' : 'not-allowed',
            opacity: acceptedTerms ? 1 : 0.6,
          }"
        >
          <div class="d-flex align-items-center mb-2">
            <i
              class="fas fa-route text-success"
              style="font-size: 1.5rem; margin-right: 0.5rem"
            ></i>
            <div class="flex-grow-1">
              <h6 class="mb-1" style="font-size: 0.875rem">SAME ROUTE</h6>
              <p class="text-muted mb-0" style="font-size: 0.75rem">
                Continue with original route
              </p>
              <small class="text-success">
                From:
                {{
                  selectedTicket.policy.reuse.routes.same_route
                    ?.boarding_point_name
                }}
                → To:
                {{
                  selectedTicket.policy.reuse.routes.same_route
                    ?.dropping_point_name
                }}
              </small>
            </div>
          </div>
          <div class="text-end">
            <button class="btn btn-sm btn-success" :disabled="!acceptedTerms">
              Continue <i class="fas fa-arrow-right ms-1"></i>
            </button>
          </div>
        </div>

        <!-- New Route Option -->
        <div
          v-if="selectedTicket.policy?.reuse?.routes?.start_new_route"
          class="card border p-2 border-info"
          @click="acceptedTerms && handleNewRouteBooking()"
          :style="{
            cursor: acceptedTerms ? 'pointer' : 'not-allowed',
            opacity: acceptedTerms ? 1 : 0.6,
          }"
        >
          <div class="d-flex align-items-center mb-2">
            <i
              class="fas fa-route text-info"
              style="font-size: 1.5rem; margin-right: 0.5rem"
            ></i>
            <div class="flex-grow-1">
              <h6 class="mb-1" style="font-size: 0.875rem">NEW ROUTE</h6>
              <p class="text-muted mb-0" style="font-size: 0.75rem">
                Start with new departure and destination
              </p>
            </div>
          </div>
          <div class="text-end">
            <button class="btn btn-sm btn-info" :disabled="!acceptedTerms">
              Start New <i class="fas fa-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </StandardModal>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useNotification } from "@/composables/notification";
import { useAuthStore } from "@/stores/auth";
import { encryptData } from "@/utils/encryption";
import axios from "axios";
import StandardDataTable from "@/components/plugins/StandardDataTable.vue";
import StandardModal from "@/components/plugins/StandardModal.vue";
import EmptyState from "@/components/bootstrap/emptyState.vue";
import Card from "@/components/bootstrap/Card.vue";

const { showAlert } = useNotification();
const authStore = useAuthStore();
const router = useRouter();

const permissions = computed(() => authStore.permissions);

const absCompanyId = authStore.getCompanyId("abs_id");
const absAgentId = authStore.getCompanyId("abs_agent_id");
const absTicketId = authStore.getCompanyId("abs_ticket_id");

// Loading State
const loading = ref(false);

// Reactive Variables
const openTicketsList = ref([]);
const selectedTicket = ref(null);
const acceptedTerms = ref(false);

// Modal refs
const detailsModalRef = ref(null);
const bookingModalRef = ref(null);

// FIX: Add modal state tracking
const isDetailsModalVisible = ref(false);
const isBookingModalVisible = ref(false);

const pagination = ref({
  current_page: 1,
  per_page: 10,
  last_page: 1,
  total: 0,
  from: 1,
  to: 10,
});

const tableFilters = ref({
  search: "",
  per_page: 10,
  page: 1,
});

// Table configuration
const tableColumns = ref([
  { key: "reference", label: "Reference", visible: true, sortable: true },
  { key: "passenger", label: "Passenger", visible: true, sortable: true },
  { key: "phone", label: "Phone", visible: true, sortable: true },
  { key: "type", label: "Type", visible: true, sortable: true },
  { key: "date", label: "Date", visible: true, sortable: true },
  { key: "created_by", label: "Created By", visible: true, sortable: true },
  { key: "actions", label: "Actions", visible: true, sortable: false },
]);

const axiosInstance = axios.create({
  baseURL: "https://197-250-2-138.sslip.io/api/v1/agency/",
  headers: {
    "Content-Type": "application/json",
    Authorization: authStore.token ? `Bearer ${authStore.token}` : "",
    "X-User-Id": absTicketId || "",
    "X-Username": authStore.user?.username || "",
  },
});

const formatAmount = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "N/A";
  }
  return Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const handleFiltersUpdate = async (newFilters) => {
  const nf = { ...newFilters };

  if (nf.limit !== undefined) {
    nf.per_page = Number(nf.limit) || undefined;
    delete nf.limit;
  } else if (nf.per_page !== undefined) {
    nf.per_page = Number(nf.per_page) || undefined;
  }

  if (nf.page !== undefined) nf.page = Number(nf.page) || undefined;

  Object.keys(nf).forEach((k) => {
    const v = nf[k];
    if (v === undefined || v === null) delete nf[k];
    if (typeof v === "string" && v.trim() === "") delete nf[k];
  });

  tableFilters.value = { ...tableFilters.value, ...nf };
  await fetchOpenTickets();
};

const fetchOpenTickets = async () => {
  const params = {
    type: "OPEN_TICKET",
    ...tableFilters.value,
  };

  Object.keys(params).forEach((k) => {
    const v = params[k];
    if (v === undefined || v === null) delete params[k];
    if (typeof v === "string" && v.trim() === "") delete params[k];
  });

  loading.value = true;
  try {
    const response = await axiosInstance.get("amendments/open-tickets", {
      params,
    });

    const data = response.data?.data || [];

    const rows = data.map((item, idx) => {
      const passenger = item.ticket_data?.bookings?.[0] || {};
      const amendment = item.amendment || {};

      return {
        id: item.id,
        reference: item.reference || `TKT-${item.id}`,
        passenger_name: passenger.full_name || "N/A",
        phone: passenger.passenger_phone_number || "N/A",
        date: amendment.date || item.created_at,
        created_by_name: amendment.user?.name || "Unknown",
        created_by_email: amendment.user?.email || "",
        updated_by_name: amendment.updated_by?.name || "Unknown",
        updated_by_email: amendment.updated_by?.email || "",
        is_reusable: item.isReusable || false,
        reason: amendment.narrations || "No reason provided",
        original_fare: passenger.fare || 0,
        policy: item.policy || null,
        ticket_data: item.ticket_data || {},
        amendment: amendment,
        _raw: item,
      };
    });

    openTicketsList.value = rows;

    const paginationData = response.data?.pagination || {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: rows.length,
    };

    pagination.value = {
      current_page: paginationData.current_page,
      last_page: paginationData.last_page,
      per_page: paginationData.per_page,
      total: paginationData.total,
      from:
        paginationData.from ||
        (paginationData.current_page - 1) * paginationData.per_page + 1,
      to:
        paginationData.to ||
        Math.min(
          paginationData.current_page * paginationData.per_page,
          paginationData.total
        ),
    };
  } catch (error) {
    console.error("Error fetching open tickets:", error);
    showAlert(
      "error",
      error.response?.data?.message ||
        error.message ||
        "Error fetching open tickets"
    );
  } finally {
    loading.value = false;
  }
};

const viewTicketDetails = (row) => {
  selectedTicket.value = row._raw || row;
  nextTick(() => {
    detailsModalRef.value?.show();
    isDetailsModalVisible.value = true;
  });
};

const handleBookFromOpenTicket = (row) => {
  selectedTicket.value = row._raw || row;
  showBookingOptionsModal();
};

const showBookingOptionsModal = () => {
  acceptedTerms.value = false;

  // FIX: Wait for details modal to be hidden completely
  if (detailsModalRef.value && isDetailsModalVisible.value) {
    // Hide the details modal first
    detailsModalRef.value.hide();
    isDetailsModalVisible.value = false;

    // Wait for the modal to be hidden (300ms for transition)
    setTimeout(() => {
      if (bookingModalRef.value) {
        bookingModalRef.value.show();
        isBookingModalVisible.value = true;
      }
    }, 300);
  } else {
    // If details modal is not visible, just show booking modal
    nextTick(() => {
      if (bookingModalRef.value) {
        bookingModalRef.value.show();
        isBookingModalVisible.value = true;
      }
    });
  }
};

// FIX: Add modal hide handlers
const handleDetailsModalHide = () => {
  isDetailsModalVisible.value = false;
};

const handleBookingModalHide = () => {
  isBookingModalVisible.value = false;
  acceptedTerms.value = false;
};

const handleSameRouteBooking = () => {
  if (!selectedTicket.value || !acceptedTerms.value) return;

  const ticket = selectedTicket.value;
  const policy = ticket.policy?.reuse?.routes?.same_route || {};
  const passenger = ticket.ticket_data?.bookings?.[0] || {};

  const bookingData = {
    ticket_id: ticket.id,
    reference: ticket.reference,
    booking_type: "same_route",
    passenger_name: passenger.full_name || "",
    phone: passenger.passenger_phone_number || "",
    original_fare: passenger.fare || 0,
    departure_id: policy.boarding_point_id,
    departure_name: policy.boarding_point_name,
    destination_id: policy.dropping_point_id,
    destination_name: policy.dropping_point_name,
    can_change_route: false,
    ticket_data: ticket.ticket_data || {},
    passenger_data: {
      age_id: passenger.age_id,
      gender_id: passenger.gender_id,
      full_name: passenger.full_name,
      phone_number: passenger.passenger_phone_number,
      nationalId: passenger.nationalId,
      nationality: passenger.nationality,
    },
    timestamp: Date.now(),
    expires_at: Date.now() + 30 * 60 * 1000,
  };

  const encryptedData = encryptData(bookingData);

  if (!encryptedData) {
    showAlert("error", "Failed to prepare booking data");
    return;
  }

  // Hide booking modal before navigation
  if (bookingModalRef.value && isBookingModalVisible.value) {
    bookingModalRef.value.hide();
    isBookingModalVisible.value = false;
  }

  router.push({
    path: "/abs/open-ticket/book",
    query: { data: encryptedData },
  });
};

const handleNewRouteBooking = () => {
  if (!selectedTicket.value || !acceptedTerms.value) return;

  const ticket = selectedTicket.value;
  const passenger = ticket.ticket_data?.bookings?.[0] || {};

  const bookingData = {
    ticket_id: ticket.id,
    reference: ticket.reference,
    booking_type: "new_route",
    passenger_name: passenger.full_name || "",
    phone: passenger.passenger_phone_number || "",
    original_fare: passenger.fare || 0,
    can_change_route: true,
    ticket_data: ticket.ticket_data || {},
    passenger_data: {
      age_id: passenger.age_id,
      gender_id: passenger.gender_id,
      full_name: passenger.full_name,
      phone_number: passenger.passenger_phone_number,
      nationalId: passenger.nationalId,
      nationality: passenger.nationality,
    },
    timestamp: Date.now(),
    expires_at: Date.now() + 30 * 60 * 1000,
  };

  const encryptedData = encryptData(bookingData);

  if (!encryptedData) {
    showAlert("error", "Failed to prepare booking data");
    return;
  }

  // Hide booking modal before navigation
  if (bookingModalRef.value && isBookingModalVisible.value) {
    bookingModalRef.value.hide();
    isBookingModalVisible.value = false;
  }

  router.push({
    path: "/abs/open-ticket/book",
    query: { data: encryptedData },
  });
};

const exportToClipboard = async () => {
  try {
    const data = openTicketsList.value.map((item) => ({
      Reference: item.reference,
      Passenger: item.passenger_name,
      Phone: item.phone,
      Type: "OPEN TICKET",
      Date: formatDate(item.date),
      "Created By": item.created_by_name,
      Status: item.is_reusable ? "Reusable" : "Used",
    }));

    const text = data.map((row) => Object.values(row).join("\t")).join("\n");
    await navigator.clipboard.writeText(text);
    showAlert("success", "Data copied to clipboard");
  } catch (error) {
    showAlert("error", "Failed to copy data");
    console.error("Copy failed:", error);
  }
};

const exportToPrint = () => {
  window.print();
};

const exportToPDF = () => {
  import("html2pdf.js").then((html2pdf) => {
    const element = document.querySelector(".card");
    const opt = {
      margin: 1,
      filename: "open-tickets-report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(element).set(opt).save();
  });
};

const exportToExcel = () => {
  import("xlsx").then((XLSX) => {
    const data = openTicketsList.value.map((item) => ({
      Reference: item.reference,
      Passenger: item.passenger_name,
      Phone: item.phone,
      Type: "OPEN TICKET",
      Date: formatDate(item.date),
      "Created By": item.created_by_name,
      Status: item.is_reusable ? "Reusable" : "Used",
      "Original Fare": item.original_fare,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Open Tickets");
    XLSX.writeFile(workbook, "open-tickets-report.xlsx");
  });
};

const refreshData = () => {
  tableFilters.value = {
    search: "",
    per_page: 10,
    page: 1,
  };
  fetchOpenTickets();
};

watch(bookingModalRef, (newModal) => {
  if (newModal) {
    acceptedTerms.value = false;
  }
});

onMounted(async () => {
  await fetchOpenTickets();
});
</script>

<style scoped>
.table-responsive {
  min-height: 300px;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.fullscreen-table .table-responsive {
  min-height: calc(100vh - 200px);
  max-height: calc(100vh - 200px);
  overflow: auto;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
  font-weight: 500;
}

.page-link {
  min-width: 40px;
  text-align: center;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.avatar-xs {
  width: 28px;
  height: 28px;
  font-size: 0.75rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.input-group-text {
  transition: all 0.2s;
}

.table-hover tbody tr {
  transition: all 0.2s;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.dropdown-menu {
  z-index: 1050;
}
</style>
