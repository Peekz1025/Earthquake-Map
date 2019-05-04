"use strict";
/*
	Make `app` a global by using `var`, now we can ...&callback=app.initMap from the link above
*/
var app = new Vue({
  el: "#root",
  data: {
    URL:
      "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventtype=earthquake&minmagnitude=1.0",
    center: { lat: 43.083848, lng: -77.6799 }
  },
  methods: {
    // <--- GOOGLE MAPS API --->
    initMap() {
      const mapOptions = {
        center: { lat: 43.083848, lng: -77.6799 },
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(
        document.getElementById("map"),
        mapOptions
      );
      this.map.mapTypeId = "satellite";
      this.map.setTilt(45);
    },

    addMarker(latitude, longitude, title) {
      let position = { lat: latitude, lng: longitude };
      let marker = new google.maps.Marker({
        position: position,
        map: this.map
      });
      marker.setTitle(title);
      // Add a listener for the click event
      google.maps.event.addListener(marker, "click", function(e) {
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
      // Zoom out on map according to distance
      if(document.querySelector("#distance").value == 5000){
        this.map.setZoom(3);
      }
      else if(document.querySelector("#distance").value == (1000 || 2000)){
        this.map.setZoom(4);
      }
      else if(document.querySelector("#distance").value == (600 || 800)){
        this.map.setZoom(6);
      }
      else if(document.querySelector("#distance").value == (200 || 400)){
        this.map.setZoom(8);
      }
      
      // today's date
      let now = new Date();
      let nowYear = now.getFullYear();
      let nowMonth = now.getMonth() + 1;
      let nowDate = now.getDate();

      // yesterday's date
      let lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      let lastWeekYear = lastWeek.getFullYear();
      let lastWeekMonth = lastWeek.getMonth() + 1;
      let lastWeekDate = lastWeek.getDate();

      // build url
      let url = this.URL;
      url += "&latitude=" + this.center.lat;
      url += "&longitude=" + this.center.lng;

      url += "&maxradiuskm=" + document.querySelector("#distance").value;

      // starttime=2016-01-01&endtime=2016-01-02
      url +=
        "&starttime=" + lastWeekYear + "-" + lastWeekMonth + "-" + lastWeekDate;
      url += "&endtime=" + nowYear + "-" + nowMonth + "-" + nowDate;

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
      if (!count) return;

      //  build up a list of the results
      let earthquakes = obj.features;

      for (let quake of earthquakes) {
        let properties = quake.properties;
        let title = properties.title;
        let url = properties.url;
        let longitude = quake.geometry.coordinates[0];
        let latitude = quake.geometry.coordinates[1];

        this.addMarker(latitude, longitude, title);
      }
    }
  }
});
