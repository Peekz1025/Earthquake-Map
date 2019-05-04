"use strict";
/*
	Make `app` a global by using `var`, now we can ...&callback=app.initMap from the link above
*/
var app = new Vue({
  el: "#app",
  data: {
    URL:
      "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventtype=earthquake&minmagnitude=1.0",
    center: { lat: 43.083848, lng: -77.6799 },
    limit: 10,
    markers: [],
    radius: 250,
    year: 2019
  },
  methods: {
    // <--- GOOGLE MAPS API --->
    initMap() {
      const mapOptions = {
        center: { lat: 43.083848, lng: -77.6799 },
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(
        document.getElementById("map"),
        mapOptions
      );

      let starterMarker = new google.maps.Marker({
        position: this.center,
        map: this.map
      });

    },

    addMarker(latitude, longitude, title) {
      let position = { lat: latitude, lng: longitude };
      let marker = new google.maps.Marker({
        position: position,
        map: this.map
      });

      this.markers.push(marker);

      marker.setTitle(title);
      // Add a listener for the click event
      google.maps.event.addListener(marker, "click", function (e) {
        // `this` doesn't work here - because it refers to the marker that was clicked on - use `app` instead
        app.makeInfoWindow(this.position, this.title);
      });
    },

    makeInfoWindow(position, msg) {
      // Close old InfoWindow if it exists
      if (this.infowindow) this.infowindow.close();

      // Make a new InfoWindow
      this.infowindow = new google.maps.InfoWindow({
        map: this.map,
        position: position,
        content: "<b>" + msg + "</b>"
      });
    },

    setZoom(zoomLevel) {
      this.map.setZoom(zoomLevel);
    },

    // <--- EARTHQUAKE API --->

    search() {
      this.deleteMarkers();

      // end date
      let endDate = new Date(this.year, 11, 31);
      let endYear = endDate.getFullYear();
      let endMonth = endDate.getMonth();
      let endDay = endDate.getDate();

      // start date
      let startDate = new Date(this.year, 1, 1);
      let startYear = startDate.getFullYear();
      let startMonth = startDate.getMonth();
      let startDay = startDate.getDate();

      // build url
      let url = this.URL;
      url += "&latitude=" + this.center.lat;
      url += "&longitude=" + this.center.lng;

      url += "&maxradiuskm=" + document.querySelector("#maxRadius").value;

      // starttime=2016-01-01&endtime=2016-01-02
      url +=
        "&starttime=" + startYear + "-" + startMonth + "-" + startDay;
      url += "&endtime=" + endYear + "-" + endMonth + "-" + endDay;

      let xhr = new XMLHttpRequest();
      xhr.onload = this.jsonLoaded;
      xhr.onprogress = e => {
        let xhr = e.target;
        if (!xhr.loggedHeaders) {
          console.log("HEADERS_RECEIVED: " + xhr.getAllResponseHeaders());
          xhr.loggedHeaders = true; // only log the headers once
        }
        console.log(
          `PROGRESS: xhr.readyState = ${xhr.readyState}, loaded = ${e.loaded}`
        );
      };
      xhr.onerror = e => console.log(`ERROR: ${e}`);

      // xhr.open(method, url, async, user, password)
      xhr.open("GET", url, true);
      xhr.send();
    },

    jsonLoaded(e) {
      let xhr = e.target;
      console.log(
        `LOADED: xhr.readyState = ${xhr.readyState}, loaded = ${e.loaded}`
      );

      if (xhr.readyState != xhr.DONE) return;

      let responseText = xhr.responseText;
      console.log(`HTTP status code: ${xhr.status}`);

      let obj = JSON.parse(responseText);
      let count = obj.metadata.count;

      // bail out if there are no results
      if (!count) {
        // Displays error message when no search results found
        document.querySelector("#searchError").style.margin = "-4%";
        document.querySelector("#searchError").style.transform = "scale(1)";
        document.querySelector("#searchError").style.opacity = 1;

        return;
      }

      // Hides error message
      document.querySelector("#searchError").style.margin = "-15%";
      document.querySelector("#searchError").style.transform = "scale(0)";
      document.querySelector("#searchError").style.opacity = 0;

      //  build up a list of the results
      let earthquakes = obj.features;

      let limitCount = 0;

      for (let quake of earthquakes) {
        if (limitCount == limit.value) {
          return;
        }

        let properties = quake.properties;
        let title = properties.title;
        let url = properties.url;
        let longitude = quake.geometry.coordinates[0];
        let latitude = quake.geometry.coordinates[1];

        this.addMarker(latitude, longitude, title);

        limitCount++;
      }
    },

    // Deletes all markers in the array by removing references to them.
    deleteMarkers() {
      for (let i = 0; i < this.markers.length; i++) {
        this.markers[i].setMap(null);
      }
      this.markers = [];
    }
  }
});
