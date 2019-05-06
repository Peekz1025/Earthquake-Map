//vars for local storage
let lastLat;
let lastLng;

class Earthquake {
    constructor(mag, place, coord, url, time, id) {
        this.mag = mag;
        this.place = place;
        this.coord = coord;
        this.url = url;
        this.time = new Date(time).toString();
        this.id = id;
    }
}

var app = new Vue({
    el: "#app",
    data: {
        limit: 5,
        magMin: 0,
        earthquakes: [],
        curLat: 43.083848,
        curLng: -77.6799,
        maxRadius: 300,
        radiusCircle: null,
        searchMarker: { position: { lat: 43.083848, lng: -77.6799 } },
        markers: [],
        circles: [],
        search: "",
        ref: null
    },
    methods: {
        initFirebase() {
            // Initialize Firebase
            var config = {
                apiKey: "AIzaSyBKorYy8r68PYwPCK8g4vEdju3H-HOdEaw",
                authDomain: "earthquake-map-f42ca.firebaseapp.com",
                databaseURL: "https://earthquake-map-f42ca.firebaseio.com",
                projectId: "earthquake-map-f42ca",
                storageBucket: "earthquake-map-f42ca.appspot.com",
                messagingSenderId: "1037189925598"
            };

            firebase.initializeApp(config);

            let database = firebase.database();

            this.ref = database.ref('earthquakes');
        },
        initMap() {
            //check for stored Lat and Lng values
            this.curLat = parseFloat(localStorage.getItem("lastLat"));
            this.curLng = parseFloat(localStorage.getItem("lastLng"));
            if (this.curLat == null || this.curLng == null || this.curLat == undefined || this.curLng == undefined || isNaN(this.curLat) || isNaN(this.curLng)) {
                this.curLat = 43.083848;
                this.curLng = -77.6799;
            }

            const mapOptions = {
                center: { lat: this.curLat, lng: this.curLng },
                zoom: 5,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
            this.map.setTilt(45);

            this.searchMarker = new google.maps.Marker({
                position: { lat: this.curLat, lng: this.curLng },
                draggable: true,
                map: this.map
            });

            google.maps.event.addListener(this.map, 'click', function (event) {
                app.curLat = event.latLng.lat();
                app.curLng = event.latLng.lng();
                app.addMarker(event.latLng);
                app.startSearch();
            });
            google.maps.event.addListener(this.searchMarker, 'drag', function (event) {
                app.curLat = this.position.lat();
                app.curLng = this.position.lng();
            });
            google.maps.event.addListener(this.searchMarker, 'mouseup', function (event) {
                app.addMarker(event.latLng);
                app.startSearch();
            });

            this.initFirebase();

            //call to initalize search
            this.startSearch();
        },

        setZoom(zoomLevel) {
            this.map.setZoom(zoomLevel);
        },

        startSearch() {
            //clear results of last search
            this.results = {};
            this.deleteMarkers();

            let hasError = false;

            //make sure lat and lng are in the correct range
            if (this.curLat > 90 || this.curLat < -90 || this.curLat == undefined || isNaN(this.curLat)) {
                this.$refs.latError.style.transform = "translate(0px, 0px)";
                this.$refs.latError.style.opacity = 1;

                hasError = true;
            }
            else {
                this.$refs.latError.style.opacity = 0;
                this.$refs.latError.style.transform = "translate(-700px, 0px)";
            }
            if (this.curLng > 180 || this.curLng < -180 || this.curLng == undefined || isNaN(this.curLng)) {
                this.$refs.lngError.style.transform = "translate(0px, 0px)";
                this.$refs.lngError.style.opacity = 1;

                hasError = true;
            }
            else {
                this.$refs.lngError.style.opacity = 0;
                this.$refs.lngError.style.transform = "translate(-700px, 0px)";
            }

            if (hasError) {
                return;
            }


            if (this.infoWindow) {
                this.infoWindow.close();
            }

            this.addMarker(this.searchMarker.position);

            if ((this.curLat != this.searchMarker.position.lat()) ||
                this.curLng != this.searchMarker.position.lng()) {
                this.addMarker({ lat: this.curLat, lng: this.curLng });
            }

            //set local storage to current position
            localStorage.setItem("lastLat", this.curLat);
            localStorage.setItem("lastLng", this.curLng);

            // url to fetch, data will be returned as an array and the number of results to return in included
            let url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=" + this.limit + "&minmagnitude=" + this.magMin;

            if (this.maxRadius > 0) {
                url += "&latitude=" + this.curLat + "&longitude=" + this.curLng + "&maxradiuskm=" + this.maxRadius;
            }

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw Error(`ERROR: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(json => {
                    let data = json.features;

                    if (data.length == 0) {
                        this.$refs.searchError.style.margin = "0";
                        this.$refs.searchError.style.transform = "scale(1)";
                        this.$refs.searchError.style.opacity = 1;
                    }
                    else {
                        this.$refs.searchError.style.margin = "-18%";
                        this.$refs.searchError.style.transform = "scale(0)";
                        this.$refs.searchError.style.opacity = 0;
                    }

                    for (let i = 0; i < data.length; i++) {
                        let cur = data[i];

                        let lat = cur.geometry.coordinates[1];
                        let lng = cur.geometry.coordinates[0];
                        let coord = { lat: lat, lng: lng };

                        this.earthquakes[i] = new Earthquake(cur.properties.mag, cur.properties.place, coord, cur.properties.url, cur.properties.time, cur.id);

                        this.addQuake(this.earthquakes[i]);

                        firebase.database().ref("earthquakes/" + this.ip.set(this.earthquakes[i]));
                    }
                })
        },

        addQuake(quake) {
            let position = quake.coord;
            let marker = new google.maps.Marker(
                {
                    position: position,
                    map: this.map,
                    icon: "img/earthquake.png"
                }
            );
            marker.setTitle(quake.place);

            this.markers.push(marker);

            //add a listener for the mouseover event
            google.maps.event.addListener(marker, 'mouseover', function (e) {
                app.makeInfoWindow(this.position,
                    "<h6>" + this.title + "</h6>" +
                    "<p> When: " + quake.time + "</p>" +
                    "<p> Magnitude: " + quake.mag + "</p>" +
                    "<p> ID: " + quake.id + "</p>" +
                    "<a href='" + quake.url + "' target='_blank'>Link</a>"
                );
            });

            let quakeCircle = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                map: this.map,
                center: position,
                radius: quake.mag * quake.mag * 10000
            });

            // remove info window when you mouse out of the earthquake "radius"
            google.maps.event.addListener(quakeCircle, 'mouseout', function (e) {
                if (app.infoWindow) { app.infoWindow.close(); }
            });

            this.circles.push(quakeCircle);
        },

        addMarker(position) {
            app.curLat = parseFloat(app.curLat);
            app.curLng = parseFloat(app.curLng);

            if (this.searchMarker) {
                this.searchMarker.setMap(null);
            }
            if (this.radiusCircle) {
                this.radiusCircle.setMap(null);
                this.radiusCircle = null;
            }
            this.searchMarker = new google.maps.Marker(
                {
                    position: position,
                    draggable: true,
                    map: this.map
                }
            );


            google.maps.event.addListener(this.searchMarker, 'drag', function (event) {
                app.curLat = this.position.lat();
                app.curLng = this.position.lng();
            });
            google.maps.event.addListener(this.searchMarker, 'mouseup', function (event) {
                app.addMarker(event.latLng);
                app.startSearch();
            });

            this.radiusCircle = new google.maps.Circle({
                strokeColor: '#FFFFFF',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#CCCCCC',
                fillOpacity: 0.35,
                map: this.map,
                center: position,
                radius: this.maxRadius * 1000
            });

            this.searchMarker.setTitle("Search Marker");

            google.maps.event.addListener(this.radiusCircle, 'mouseout', function (e) {
                if (app.infoWindow) { app.infoWindow.close(); }
            });
        },

        makeInfoWindow(position, msg) {
            //Close old InfoWindow if it exists
            if (this.infoWindow) this.infoWindow.close();

            //Make a new InfoWindow
            this.infoWindow = new google.maps.InfoWindow({
                map: this.map,
                position: position,
                content: "<b>" + msg + "</b>"
            });
        },

        // Sets the map on all markers in the array.
        setMapOnAll(map) {
            for (let i = 0; i < this.markers.length; i++) {
                this.markers[i].setMap(map);
            }
        },

        // Removes the markers from the map, but keeps them in the array.
        clearMarkers() {
            this.setMapOnAll(null);
        },

        // Deletes all markers in the array by removing references to them.
        deleteMarkers() {
            this.clearMarkers();
            this.markers = [];

            for (c of this.circles) {
                c.setMap(null);
                c = null;
            }

            this.circles = [];
        }

    }
});