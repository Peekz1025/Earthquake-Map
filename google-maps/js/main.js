let app = new Vue({
  el: "#root",

  data: {
    map: null,
    infoWindow: null
  },
  components: {
	worldZoom:{

	},
    Gmaps: () => {
      return new Promise((resolve, reject) => {
        let script = document.createElement("script");
        script.async = true;
        script.src =
          "https://maps.googleapis.com/maps/api/js?key=AIzaSyBV7nXkls3Zy6AZ4MoLqvNMMZLKyp5jvLI";
        document.head.appendChild(script);
      });
      initmap();
    }
  },
  methods: {
    worldZoom:function() {
      map.setZoom(1);
    },
    defaultZoom:function() {
      map.setZoom(16);
    },
    buildingZoom:function() {
      map.setZoom(20);
    },
    addMarker:function(latitude, longitude, title) {
      let position = { lat: latitude, lng: longitude };
      let marker = new google.maps.Marker({
        position: this.position,
        map: this.map
      });
      marker.setTitle(this.title);

      // Add a listener for the click event
      google.maps.event.addListener(marker, "click", function(e) {
        makeInfoWindow(position, title);
      });
    },
    makeInfoWindow:function(position, msg) {
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
    initmap:function() {
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
    }
  }
});
