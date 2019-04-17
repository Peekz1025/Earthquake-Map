var infowindow;
var map;

let app = new Vue({
	el: '#root',
	data: {
		newName: "",
		title: "Guest List"
	},
	methods:{
		worldZoom(){
			map.setZoom(1);
		},
		defaultZoom(){
			map.setZoom(16);
		},
		buildingZoom(){
			map.setZoom(20);
		},
		addMarker(latitude, longitude, title) {
			let position = {lat:latitude,lng:longitude};
			let marker = new google.maps.Marker({position: position, map:map});
			marker.setTitle(title);

			// Add a listener for the click event
			google.maps.event.addListener(marker, 'click', function(e){
			makeInfoWindow(this.position,this.title);
			})
		},
		
		makeInfoWindow(position,msg){
			// Close old InfoWindow if it exists
			if(infowindow){
				infowindow.close();
			}

			// Make a new InfoWindow
			infowindow = new google.maps.InfoWindow({
				map: map,
				position: position,
				content: "<b>" + msg + "</b>"
			});
		},
		initMap() {
			let mapOptions = {
				center: {lat: 43.083848, lng: -77.6799},
				zoom: 16,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			map = new google.maps.Map(document.getElementById('map'), mapOptions);

			for(let i =0;i < coffeeShops.length;i++){
				addMarker(coffeeShops[i].latitude, coffeeShops[i].longitude, coffeeShops[i].title);
			}

			map.mapTypeId = 'satellite';
			map.setTilt(45);
		}
		

	}
});