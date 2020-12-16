<script>
import { gmapApi } from 'vue2-google-maps'

export default {
  name: 'NMapsGeometry',
  props: {
    value: { type: Array, default: () => [] },
    type: { type: String, default: 'polyline' }, // polygon polyline

    color: { type: String, default: '#000' },
    borderColor: { type: String, default: null },

    label: { type: String, default: null },
    hidden: { type: Boolean, default: false },
    editable: { type: Boolean, default: false },
    checkPath: { type: Function, default: null }
  },
  computed: {
    google: gmapApi,
    path: {
      get () {
        let value = this.value
        if (this.hidden && !this.editable && value && value[0]) {
          value = [...value]
          value.push(value[0])
        }
        return value
      },
      set (val) { this.$emit('input', val) }
    },
    polyOptions () {
      return { strokeColor: this.borderColor || this.color, fillColor: this.color, strokeWeight: 3, fillOpacity: 0.4 }
    },
    centerOfGeometry () {
      if (!this.google) return null
      const bounds = new this.google.maps.LatLngBounds()
      this.path.forEach(p => bounds.extend(p))
      const center = bounds.getCenter()
      return { lat: center.lat(), lng: center.lng() }
    }
  },
  methods: {
    // event
    clickFn (event) {
      const marker = this.latLngToMarker(event.latLng)
      const index = this.findIndexMarker(marker)
      if (this.editable && index > -1) {
        if (this.path.length > 2 && index === 0) return this.$emit('finished-editing')
        return this.$Alert(
          'Coordenadas',
          `Latitude: <strong>${marker.lat}</strong><br>Longitude: <strong>${marker.lng}</strong>`,
          { cancel: this.editable ? { label: 'Remover', outline: true } : false, persistent: true }
        )
          .onCancel(() => { if (this.editable) this.findAndRemove(marker) })
      }
      this.$emit('click', { marker, event })
    },
    dblclickFn (event) {},
    rightclickFn (event) {
      const marker = this.latLngToMarker(event.latLng)
      if (!this.editable) return this.$emit('rightclick', { marker, event })
      this.findAndRemove(marker)
    },
    path_changedFn (event) {
      if (!this.editable) return
      const path = event.i.map(i => ({ lat: i.lat(), lng: i.lng() }))
      if (this.checkPath) {
        if (!this.checkPath(path)) {
          this.path = [...this.path]
          return
        }
      }
      this.path = path
    },
    paths_changedFn (event) {},

    // function
    latLngToMarker (latLng) { return { lat: latLng.lat(), lng: latLng.lng() } },
    findIndexMarker (marker) { return this.path.findIndex(p => p.lat === marker.lat && p.lng === marker.lng) },
    findAndRemove (marker) {
      const index = this.findIndexMarker(marker)
      if (index > -1) this.path.splice(index, 1)
    },
    getArea () {
      const latLngs = this.path.map(path => new this.google.maps.LatLng(path.lat, path.lng))
      return this.google.maps.geometry.spherical.computeArea(latLngs)
    },
    isPointInPolygon ({ lat, lng }) {
      let inPoly = false
      let j = this.path.length - 1
      for (var i = 0; i < this.path.length; i++) {
        const vertex1 = this.path[i]
        const vertex2 = this.path[j]

        if ((vertex1.lng < lng && vertex2.lng >= lng) || (vertex2.lng < lng && vertex1.lng >= lng)) {
          if (
            vertex1.lat +
            (lng - vertex1.lng) /
            (vertex2.lng - vertex1.lng) *
            (vertex2.lat - vertex1.lat) <
            lat
          ) {
            inPoly = !inPoly
          }
        }
        j = i
      }
      return inPoly
    }
  }
}
</script>

<template>
  <div class="n-maps-geometry">

    <gmap-polyline :path.sync="path" :options="polyOptions" :editable="editable"
      @click="clickFn" @dblclick="dblclickFn" @rightclick="rightclickFn"
      @path_changed="path_changedFn"
      v-if="type === 'polyline'"/>

    <gmap-polygon :path.sync="path" :options="polyOptions" :editable="editable"
      @click="clickFn" @dblclick="dblclickFn" @rightclick="rightclickFn"
      @path_changed="path_changedFn" @paths_changed="paths_changedFn"
      v-else-if="type === 'polygon'"/>

    <gmap-marker :position="centerOfGeometry" icon="img/marker.svg" @click="clickFn"
      :label="{ text: this.label, color: '#FFF', fontSize: '1.5rem', fontWeight: '500' }" v-if="label"/>

  </div>
</template>

<style lang="stylus">
  .n-maps-geometry
    // NMapsGeometry
</style>
