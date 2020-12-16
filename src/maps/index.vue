<script>
// import * as VueGoogleMaps from 'vue2-google-maps'
import { gmapApi } from 'vue2-google-maps'

export default {
  name: 'NMaps',
  props: {
    type: { type: String, default: 'hybrid' } // satellite roadmap terrain
  },
  data: () => ({
    zoom: 4,
    start: false,
    center: { lat: -15.7942287, lng: -47.8821658 }, // Brasília

    options: {
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      backgroundColor: '#F0F0F0'
    }
  }),
  computed: {
    google: gmapApi,
    maps () { return this.$refs.maps }
  },
  methods: {
    // options
    setOptions (options = {}) {
      this.options = {
        ...this.options,
        ...options
      }
    },
    setZoom (zoom) { this.zoom = zoom },

    // functions
    panTo ({ lat, lng }) {
      const latLng = new this.google.maps.LatLng(lat, lng)
      this.maps.panTo(latLng)
    },
    geolocate (zoom = 12) {
      navigator.geolocation.getCurrentPosition(position => {
        this.setZoom(zoom)
        this.panTo({ lat: position.coords.latitude, lng: position.coords.longitude })
      })
    },
    zoomCenter (points) {
      if (!points || !points.length) return this.geolocate()
      const bounds = new this.google.maps.LatLngBounds()
      points.forEach(p => bounds.extend(p))
      this.maps.fitBounds(bounds)
      this.maps.panToBounds(bounds)
    },

    // events
    clickFn (event) {
      const marker = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      }
      this.$emit('click', { marker, event })
    },
    tilesloadedFn () {
      if (this.start) return
      this.start = true
      this.$emit('start')
    }
  }
}
</script>

<template>
  <div class="n-maps">
    <gmap-map ref="maps" :map-type-id="type" :center="center" :zoom="zoom" :options="options"
       @click="clickFn" @tilesloaded="tilesloadedFn"
       style="width: 100%; height: 100%">
      <slot></slot>
    </gmap-map>
  </div>
</template>

<style lang="stylus">
  .n-maps
    width 100%
    height 100%
</style>
