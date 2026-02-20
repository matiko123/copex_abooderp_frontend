<template>
  <div class="seat-container">
    <template v-if="seat && seat.type">
      <!-- Passenger Seat -->
      <template v-if="seat.type === 'passenger_seat'">
        <svg 
          width="50" 
          height="50" 
          viewBox="0 0 100 125"
          class="seat-svg passenger"
          :class="{ 
            'selected': seat.selected, 
            'disabled': seat.disabled 
          }"
          @click="$emit('seat-click', seat)"
        >
          <!-- Your original seat SVG path -->
          <path d="M76.531,40.06c-1.672,0-3.026,1.355-3.026,3.027v20.687c-0.187,0.063-0.374,0.116-0.555,0.204
            c-0.053,0.025-2.895,1.385-7.482,2.655c-1.46-1.023-3.315-1.48-5.205-1.115c-6.939,1.345-13.673,1.363-20.605,0.043
            c-1.869-0.353-3.704,0.095-5.154,1.101c-4.572-1.268-7.404-2.633-7.488-2.674c-0.17-0.084-0.345-0.134-0.519-0.194V43.086
            c0-1.671-1.355-3.027-3.027-3.027c-1.671,0-3.026,1.355-3.026,3.027v24.717c0,0.145,0.022,0.282,0.042,0.422
            c0.063,1.605,0.955,3.13,2.495,3.896c0.261,0.129,3.791,1.856,9.425,3.388c0.943,1.727,2.622,3.034,4.706,3.432
            c4.262,0.811,8.542,1.223,12.722,1.223c4.277,0,8.659-0.43,13.022-1.275c2.061-0.399,3.722-1.69,4.664-3.394
            c5.624-1.524,9.164-3.234,9.426-3.363c1.434-0.704,2.321-2.063,2.496-3.539c0.068-0.253,0.117-0.515,0.117-0.789V43.086
            C79.558,41.415,78.203,40.06,76.531,40.06z M30.802,41.573l-0.001,19.084c0.602,0.234,1.334,0.506,2.211,0.797
            c2.347-1.188,5.09-1.592,7.712-1.097c6.316,1.206,12.261,1.191,18.604-0.04c2.646-0.513,5.384-0.109,7.736,1.076
            c0.808-0.27,1.493-0.521,2.068-0.742l0.01-19.079c0-3.41,2.526-6.215,5.801-6.708v-9.227c0-1.671-1.264-2.46-3.026-3.027
            c0,0-9.594-2.775-21.756-2.775c-12.164,0-22.132,2.775-22.132,2.775c-1.718,0.534-3.027,1.355-3.027,3.027v9.227
            C28.276,35.357,30.802,38.163,30.802,41.573z" 
            fill="#FFFFFF" 
            stroke="#000000" 
            stroke-width="2"
          />
          <text 
            x="50%" 
            y="35%" 
            font-size="14" 
            text-anchor="middle" 
            fill="black"
            font-family="Arial"
          >
            {{ seat.label }}
          </text>
        </svg>
      </template>

      <!-- Toilet -->
      <template v-else-if="seat.type === 'toilet'">
        <svg 
          width="50" 
          height="50" 
          viewBox="0 0 100 125"
          class="seat-svg toilet"
        >
          <rect x="20" y="30" width="60" height="60" rx="5" fill="#a5d8ff" stroke="#1971c2"/>
          <text x="50%" y="60%" text-anchor="middle" fill="#1971c2" font-size="14">TOILET</text>
        </svg>
      </template>

      <!-- Door -->
      <template v-else-if="seat.type === 'door'">
        <svg 
          width="50" 
          height="50" 
          viewBox="0 0 100 125"
          class="seat-svg door"
        >
          <rect x="15" y="20" width="70" height="80" fill="#ffec99" stroke="#f08c00"/>
          <text x="50%" y="60%" text-anchor="middle" fill="#f08c00" font-size="14">DOOR</text>
        </svg>
      </template>
    </template>
    <div v-else class="empty-seat"></div>
  </div>
</template>

<script>
export default {
  props: {
    seat: {
      type: Object,
      required: true
    }
  },
  emits: ['seat-click']
}
</script>

<style scoped>
.seat-container {
  display: inline-block;
  margin: 5px;
}

.seat-svg {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 5px;
  overflow: visible;
}

.seat-svg.passenger {
  background: #e9ecef;
  border: 2px solid #adb5bd;
}

.seat-svg.passenger.selected {
  background: #4CAF50;
  box-shadow: 0 0 0 2px #2E7D32;
}

.seat-svg.passenger.selected text {
  fill: white;
}

.seat-svg.passenger.disabled {
  background: #f44336;
  cursor: not-allowed;
  opacity: 0.7;
}

.seat-svg.toilet {
  background: #a5d8ff;
  border: 2px dashed #1971c2;
}

.seat-svg.door {
  background: #ffec99;
  border: 2px dashed #f08c00;
}

.empty-seat {
  width: 50px;
  height: 50px;
  visibility: hidden;
}
</style>