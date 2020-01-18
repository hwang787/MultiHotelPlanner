<!DOCTYPE html>
<html>
  <head>
    <title>Trail</title>
    <meta charset="utf-8">
    <style>
      /*map size, map is a div with id = map*/
      #map {
        height: 100%;  /* The height is 400 pixels */
        width: 800px;  /* The width is the width of the web page, % shows the percentage*/
       }
       html, body {
        height: 100%;
        margin: 0;
        padding: 0;
      }
      #description {
        font-family: Roboto;
        font-size: 15px;
        font-weight: 300;
      }

      #infowindow-content .title {
        font-weight: bold;
      }

      #infowindow-content {
        display: none;
      }

      #map #infowindow-content {
        display: inline;
      }

      .pac-card {
        margin: 10px 10px 0 0;
        border-radius: 2px 0 0 2px;
        box-sizing: border-box;
        -moz-box-sizing: border-box;
        outline: none;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        background-color: #fff;
        font-family: Roboto;
      }

      #pac-container {
        padding-bottom: 12px;
        margin-right: 12px;
      }

      .pac-controls {
        display: inline-block;
        padding: 5px 11px;
      }

      .pac-controls label {
        font-family: Roboto;
        font-size: 13px;
        font-weight: 300;
      }

      #pac-input {
        background-color: #fff;
        font-family: Roboto;
        font-size: 15px;
        font-weight: 300;
        margin-left: 12px;
        padding: 0 11px 0 13px;
        text-overflow: ellipsis;

        width: 400px;
      }

      #pac-input:focus {
        border-color: #4d90fe;
      }

      #title {
        color: #fff;
        background-color: #4d90fe;
        font-size: 25px;
        font-weight: 500;
        padding: 6px 12px;
      }
      #target {
        width: 345px;
      }
      
    </style>
  </head>
  <body>
    <input id="pac-input" class="controls" type="text" placeholder="Search Box">
    <div id= "submitLocation" >
    </div>
    <div id="map"></div>
    <form action="/send_location" method="post" id="send">
        <button type="submit">Submit</button><br>
    </form>
    <div id="current"></div>
    <script> </script>
    <script>

    var latLngList = [];

      // Initialize and add the map
      function initMap() 
      {
          // The location boundary
          var NEW_YORK_BOUNDS = {north: 40.85, south: 40.45, west: -74.3, east: -73.5,};

          var NewYork = {lat: 40.65, lng: -73.7};



          // google.maps.Map construct a new google map object, A.K.A the map, centered at Uluru
          var map = new google.maps.Map(
            // find the element in the page, and load the map into the element
            document.getElementById('map'), 
            // properties: include zoom and center
            {
              center: NewYork,
              restriction: {
                latLngBounds: NEW_YORK_BOUNDS,
                strictBounds: false,
                }, 
                zoom: 11, 
            });

          map.addListener('click', function(e) {placeMarkerAndPanTo(e.latLng, map);});

          var input = document.getElementById('pac-input');
          var searchBox = new google.maps.places.SearchBox(input);
        
          // send out messages after click the submit button, the submit button is added in div with id submitLocation   
          var submit = document.createElement("BUTTON");
          submit.innerHTML = "submit";
          document.getElementById("submitLocation").appendChild(submit);
          // click the button and call sendList Fuction
          submit.onclick = msgTrans;

          // Bias the SearchBox results towards current map's viewport.
          map.addListener('bounds_changed', function() {
            searchBox.setBounds(map.getBounds());
          });

          // Listen for the event fired when the user selects a prediction and retrieve
          // more details for that place.
          searchBox.addListener('places_changed', function() 
          {
            var places = searchBox.getPlaces();

            // if the input is empty, return the function
            if (places.length == 0) 
              return;
            
            // For each place, get the icon, name and location.
            places.forEach(function(place) 
            {
              if (!place.geometry) 
              {
                console.log("Returned place contains no geometry");
                return;
              }
              // Create a marker for each place.
              var marker = new google.maps.Marker({map: map, position: place.geometry.location});

              // add the location of search box into the list
              latLngList.push({lat: place.geometry.location.lat(),lng: place.geometry.location.lng()});

              console.log(latLngList);


              // remove marker
              marker.addListener("click",function(e)
              {

                // delete the marker
                marker.setMap(null);

                // find the index of the element corresponding to the deleted marker
                var index = latLngList.findIndex(function(element){
                  if((element["lat"] == e.latLng.lat())&&(element["lng"] == e.latLng.lng()))
                    return  element;
                })

                // delete the corresponding element in array
                latLngList.splice(index,1);
                // current array output
                console.log(latLngList);

              })
          });
        });
      

          function placeMarkerAndPanTo(latLng, map) 
          {

          	latLngList.push({lat: latLng.lat(),lng: latLng.lng()});

            // The marker, positioned at e.latLng
            var marker = new google.maps.Marker({position: latLng, map: map});   
            // current array output
            console.log(latLngList);

            // remove the marker
            marker.addListener("click",function(e)
            {

            	// delete the marker
            	marker.setMap(null);

            	// find the index of the element corresponding to the deleted marker
            	var index = latLngList.findIndex(function(element){
            		if((element["lat"] == e.latLng.lat())&&(element["lng"] == e.latLng.lng()))
            			return  element;
            	})

            	// delete the corresponding element in array
            	latLngList.splice(index,1);
            	// current array output
            	console.log(latLngList);
            	
            	// delNode = document.getElementById('div'+(index+1));
            	// delNode.parentNode.removeChild(delNode);

            })
          }  
        
      }

      // send msg, encode current latLngList into a json file and then send it to the server, using POST method
      function msgTrans() {
        const Http = new XMLHttpRequest();

        // server address
        const url='http://localhost:8000/send_location';
        Http.open("POST", url);
        // latLngList2 = JSON.parse(JSON.stringify(latLngList));
        // console.log(latLngList2);
        Http.setRequestHeader("Content-Type", "application/json");

        // send msg
        Http.send(JSON.stringify(latLngList));
        
        // msg receiving
        Http.onreadystatechange = (e) => {
            if (Http.readyState == 4 && Http.status == 200)
            	// received msg
            	var json = JSON.parse(Http.responseText);
                window.location.href = "http://localhost:8000" + json["redirect"];
                console.log(json);
                
      	}
      }
      

      // in the script the initMap function is called, note that the callback = initMap
      // async defer: page continue to render while the api is loading
    </script>
    <script 
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD6yfhH9WZ_U3kyVyxIVmnfVnFT9YAAgI4&libraries=places&callback=initMap"async defer>
    </script>
  </body>
</html>
