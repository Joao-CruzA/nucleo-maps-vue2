import * as VueGoogleMaps from 'vue2-google-maps'

import NMaps from './src/maps'
import NMapsGeometry from './src/geometry'

class NucleoMapsVue2 {
  static install (Vue, options = {}) {
    let installComponents = true
    if (options.installComponents === false) installComponents = false

    Vue.use(VueGoogleMaps, {
      load: {
        key: options.key,
        libraries: options.libraries
      },

      installComponents
    })

    if (!installComponents) return
    Vue.component('NMaps', NMaps)
    Vue.component('NMapsGeometry', NMapsGeometry)
  }
}

export { NucleoMapsVue2, NMaps, NMapsGeometry }
export default NucleoMapsVue2
