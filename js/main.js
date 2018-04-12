$('document').ready(function() {
	
		var map, infowindow, service, latLong, markers = [];
	
		var cityLoaderStr = "<div class='loaderImg text-center'><img src='imgs/rolling.gif'/></div>";
		
		var getNextPage = null;
        var moreButton = document.getElementById('moreResBtn');
		
		if ("geolocation" in navigator) {	
			$('#mapContainer').before(cityLoaderStr);
		
			navigator.geolocation.getCurrentPosition(onSuccess, onFailure);
			//watchId = navigator.geolocation.watchPosition(onSuccess, onFailure);
		}
		else {
			alert("This app requires html5 features. Your browser does not support. please update it to latest version.");
		}
		
		function onSuccess(position)
		{
			saveUserLocation(position.coords.latitude, position.coords.longitude);
		}

		function onFailure(error) {
			console.log("Error in getting current location.");
		}
		
		function saveUserLocation(latitude, longtude)
		{
			latLong = new google.maps.LatLng(latitude, longtude);
			
			map = new google.maps.Map(document.getElementById('placesMap'), {
				center : latLong,
				zoom : 15,
				mapTypeId : google.maps.MapTypeId.ROADMAP
			});
			
			moreButton.onclick = function() {
				moreButton.disabled = true;
				
				getNextPage();
			};
			
			infowindow = new google.maps.InfoWindow();
			
			// prevent user from clickeing p0laces other than highlighted marker
			map.addListener("click", function(e) {
			
				e.stop();
			});
			
			service = new google.maps.places.PlacesService(map);
			
			makeRequest('hospital'); //only one type is supported
		}
		
		function makeRequest(placeType)
		{
			var request = {
				location : latLong,
				radius : 1500,
				type : [placeType]
			};
			
			service.nearbySearch(request, callback);
		}
		
		function callback(results, status, pagination)
		{
			console.log(results);
			
			if (status == google.maps.places.PlacesServiceStatus.OK)
			{
				moreButton.disabled = !pagination.hasNextPage;
				
				getNextPage = function() {
					pagination.nextPage();
				}
				
				for (var i = 0; i < results.length; i++) {
					createMarker(results[i]);
				}
			}
		}
		
		function createMarker(place)
		{
			var placeLoc = place.geometry.location;
			
			var marker = new google.maps.Marker({
				map : map,
				position : place.geometry.location
			});
			
			markers.push(marker);
			
			marker.setMap(map);
			
			google.maps.event.addListener(marker, 'click', function(e) {
				
				service.getDetails({
					
					placeId : place.place_id
					
				}, function(place, status) {
					
					var contentStr = "<div class='col-xs-12'><p><b>" + place.name + "</b></p></div>";
				
					contentStr += "<div class='col-xs-12'><p>" + place.adr_address + "</p></div>";
					
					contentStr += "<div class='col-xs-12'><p><a href='" + place.url + "' target='_blank'>View on Google Maps</a></p></div>";
					
					infowindow.setContent(contentStr);
					
					infowindow.setOptions({
						maxWidth : 250
					});
					
					infowindow.open(map, marker);
				});
			});
		}
		
		function detailsCallbck(place, status)
		{
			if (status == google.maps.places.PlacesServiceStatus.OK)
			{
				var contentStr = "<div>" + place.name + "</div>";
				
				contentStr += "<div>" + place.formatted_address + "</div>";
				
				infowindow.setContent(contentStr);
				
				infowindow.open(map, marker);
			}
		}
		
		$('#placesSelect  ul input[type="radio"]').click(function()
		{
			var selType = this.value;
			
			DeleteMarkers();
			
			makeRequest(selType);
			
		});
		
		function DeleteMarkers() {
			//Loop through all the markers and remove
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(null);
			}
			markers = [];
		}
	});