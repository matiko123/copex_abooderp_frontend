<template>
  <div class="data-table">
    <table class="table table-hover table-bordered align-middle mb-0">
      <thead>
        <tr>
          <th v-for="col in (columns ? columns.filter(c => c.visible) : [])" :key="col.key || col">
            {{ col.label || col }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows || rows.length === 0">
          <td :colspan="columns.length" class="text-center text-muted">
            No data
          </td>
        </tr>

        <tr v-else v-for="row in rows" :key="row[idKey]" :class="rowClass ? rowClass(row) : undefined">
          <td
            v-for="col in columns.filter(c => c.visible !== false)"
            :key="col.key || col"
          >
            
            <slot
              :name="'cell-' + (col.key || col)"
              :row="row"
            >
              {{ row[col.key || col] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface Column {
  key: string;
  label?: string;
}

export default defineComponent({
  name: 'DataTable',
  props: {
    columns: {
      type: Array as PropType<Array<Column | string>>,
      required: true
    },
    rows: {
      type: Array as PropType<Array<Record<string, any>>> ,
      required: true
    },
    idKey: {
      type: String,
      default: 'id'
    },
    rowClass: {
      type: Function as PropType<(row: Record<string, any>) => string | undefined>,
      default: undefined
    }
  }
});
</script>

<style scoped>
.data-table table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th {
  background: #e4e8ec;
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
  
}

.data-table td {
  border: 1px solid #ddd;
  padding: 8px;
  font-size: 10px;
  
}
</style>
