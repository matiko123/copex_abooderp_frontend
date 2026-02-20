<script setup>
import { ref, onMounted, computed, watch } from 'vue';

// Modal Imstances
const filtersModal = ref(null);
const columnsModal = ref(null);

// Filter 
const filters = ref({
    date_from: '',
    date_to: '',
    search: '',
    status: '0',
    limit: 10,
    page: 1
});

// Pagination
const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
});

const applyFilters = () => {
    filters.value.page = 1;
    loadTenders();
};

const clearSearch = () => {
    filters.value.search = '';
    applyFilters();
};

onMounted(() => {
    filtersModal.value = new Modal(document.getElementById('filtersModal'));
    columnsModal.value = new Modal(document.getElementById('columnsModal'));

});
</script>

<template>
    <!-- Search and Filter Controls -->
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div class="flex-grow-1" style="max-width: 350px">
            <div class="input-group">
                <span class="input-group-text bg-transparent">
                    <i class="fa fa-search"></i>
                </span>
                <input type="text" class="form-control" placeholder="Search Query Types..." v-model="filters.search"
                    @keyup.enter="applyFilters" />
                <button class="btn btn-outline-secondary" @click="clearSearch">
                    <i class="fa fa-times"></i>
                </button>
            </div>
        </div>

        <div class="d-flex gap-2">
            <button class="btn btn-outline-info" @click="filtersModal.show()">
                <i class="fa fa-filter me-1"></i>
                Filters
            </button>
            <button class="btn btn-outline-info" @click="columnsModal.show()" title="Column Visibility">
                <i class="fa fa-columns"></i>
            </button>
        </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingInitialData" class="text-center py-5">
        <!-- <img src="/assets/images/Aboodloader.gif" alt="Loading..." style="width: 200px; height: auto;" />
                <p class="mt-2">Loading Query Types...</p> -->
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
    <!-- Filters Modal -->
    <div class="modal fade modal-blur" id="filtersModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-light">
                    <h5 class="modal-title">Advanced Filters</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label">Date From</label>
                            <input type="date" class="form-control" v-model="filters.date_from" />
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Date To</label>
                            <input type="date" class="form-control" v-model="filters.date_to" />
                        </div>
                        <div class="col-md-6">

                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Items Per Page</label>
                            <select class="form-select" v-model="filters.limit">
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Done</button>
                    <!-- <button type="button" class="btn btn-primary" @click="applyFilters" data-bs-dismiss="modal">
                        Apply Filters
                    </button> -->
                </div>
            </div>
        </div>
    </div>

    <!-- Column Selector Modal -->
    <div class="modal fade modal-blur" id="columnsModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-light">
                    <h5 class="modal-title">Column Visibility</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6" v-for="(col, index) in columns" :key="index">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" v-model="col.visible"
                                    :id="'col-' + index" />
                                <label class="form-check-label" :for="'col-' + index">
                                    {{ col.label }}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Done</button>
                </div>
            </div>
        </div>
    </div>
</template>