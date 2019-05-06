"use strict";
/*
	Make `app` a global by using `var`, now we can ...&callback=app.initMap from the link above
*/

// Local storage variables
let lastLat;
let lastLng;

class Earthquake {
  constructor(mag, place, position, url, date) {
    this.mag = mag;
    this.place = place;
    this.position = position;
    this.url = url;
    this.date = new Date(date).toString();
  }
}

var app = new Vue({
  el: "#app",
  data: {
    URL:
      "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventtype=earthquake&minmagnitude=1.0",
    currentLat: 43.083848,
    currentLng: -77.6799,
    searchMarker: {
      position: { lat: 43.083848, lng: -77.6799 }
    },
    limit: 10,
    earthquakes: [],
    markers: [],
    circles: [],
    radius: 250,
    year: 2019,
    ref: null,
    ip: null
  },
  methods: {
    initFirebase() {
      var config = {
        apiKey: "AIzaSyCclwHiZUCm9IhXiPE8VzweeM5NRubgspc",
        authDomain: "project2-1f1b6.firebaseapp.com",
        databaseURL: "https://project2-1f1b6.firebaseio.com",
        projectId: "project2-1f1b6",
        storageBucket: "project2-1f1b6.appspot.com",
        messagingSenderId: "418974804103",
        appId: "1:418974804103:web:39479a4a73216262"
      }

      firebase.initializeApp(config);

      let database = firebase.database();

      this.ref = database.ref("searches/");

    },
    initMap() {
      this.currentLat = parseFloat(localStorage.getItem("lastLat"));
      this.currentLng = parseFloat(localStorage.getItem("lastLng"));

      if (this.currentLat == null || this.currentLng == null || this.currentLat == undefined || this.currentLng == undefined || isNaN(this.currentLat) || isNaN(this.currentLng)) {
        this.currentLat = 43.083848;
        this.currentLng = -77.6799;
      }

      const mapOptions = {
        center: { lat: this.currentLat, lng: this.currentLng },
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(
        document.getElementById("map"),
        mapOptions
      );

      this.searchMarker = new google.maps.Marker({
        position: { lat: this.currentLat, lng: this.currentLng },
        draggable: true,
        map: this.map
      });

      google.maps.event.addListener(this.searchMarker, 'mouseup', function (event) {
        this.currentLat = event.latLng.lat();
        this.currentLng = event.latLng.lng();

        localStorage.setItem("lastLat", this.currentLat);
        localStorage.setItem("lastLng", this.currentLng);

        app.search();
      });

      this.initFirebase();

      this.search();

    },

    getIP(json) {
      this.ip = json.ip;
    },

    addMarker(quake) {
      let marker = new google.maps.Marker({
        position: quake.position,
        map: this.map
      });

      this.markers.push(marker);

      //marker.setTitle(title);
      // Add a listener for the click event
      google.maps.event.addListener(marker, 'mouseover', function (e) {
        app.makeInfoWindow(this.position,
          "<h6><a href='" + quake.url + "' target='_blank'>" + quake.place + "</a></h6>" +
          "<p><b>Date: </b> " + quake.date + "</p>" +
          "<p><b> Magnitude: </b>" + quake.mag + "</p>"
        );
      });

      // remove info window when you mouse out of the earthquake "radius"
      google.maps.event.addListener(marker, 'mouseout', function (e) {
        if (this.infoWindow) { this.infoWindow.close(); }
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

      url += "&latitude=" + parseFloat(localStorage.getItem("lastLat"));
      url += "&longitude=" + parseFloat(localStorage.getItem("lastLng"));

      console.log(this.radius);

      url += "&maxradiuskm=" + this.radius;

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
        this.$refs.searchError.style.margin = "-4%";
        this.$refs.searchError.style.transform = "scale(1)";
        this.$refs.searchError.style.opacity = 1;
        return;
      }

      // Hides error message
      this.$refs.searchError.style.margin = "-15%";
      this.$refs.searchError.style.transform = "scale(0)";
      this.$refs.searchError.style.opacity = 0;

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

        let position = { lat: latitude, lng: longitude };

        this.earthquakes[limitCount] = new Earthquake(earthquakes[limitCount].properties.mag, earthquakes[limitCount].properties.place, position, earthquakes[limitCount].properties.url, earthquakes[limitCount].properties.time, earthquakes[limitCount].id);

        this.addMarker(this.earthquakes[limitCount]);

        console.log(this.ip);

        this.ref.push("searches/").set({earthquake: this.earthquakes[limitCount], ip: this.ip});

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
