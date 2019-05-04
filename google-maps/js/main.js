let app = new Vue({
  el: "#root",
  data: {
    map: null,
    infoWindow: null
  },
  methods: {
    worldZoom() {
      map.setZoom(1);
    },
    defaultZoom() {
      map.setZoom(16);
    },
    buildingZoom() {
      map.setZoom(20);
    },
    addMarker(latitude, longitude, title) {
      let position = { lat: latitude, lng: longitude };
      let marker = new google.maps.Marker({
        position: this.position,
        map: this.map
      });
      marker.setTitle(this.title);

      // Add a listener for the click event
      google.maps.event.addListener(marker, "click", function (e) {
        makeInfoWindow(position, title);
      });
    },
    makeInfoWindow(position, msg) {
      // Close old InfoWindow if it exists
      if (this.infowindow) {
        this.infowindow.close();
      }
      // Make a new InfoWindow
      infowindow = new google.maps.InfoWindow({
        map: this.map,
        position: this.position,
        content: "<b>" + this.msg + "</b>"
      });
    },
    initmap() {
      console.log("init");
      let mapOptions = {
        center: { lat: 43.083848, lng: -77.6799 },
        zoom: 16,
        mapTypeId: google.maps.mapTypeId.ROADmap
      };

      this.map = new google.maps.map(
        document.getElementById("map"),
        this.mapOptions
      );

      this.map.mapTypeId = "satellite";
      this.map.setTilt(45);
      console.log("done");
    }
  }
});
