// p : geolocation object
function geoloc_success(p){
    console.log("We found you! At lat: " + p.coords.latitude + ", lon: " + p.coords.longitude);
    console.log("(Within " + p.coords.accuracy + " meters.)");
}

function geoloc_error(p){
    console.log("Bummer! Geolocation failed: " + p.message);
    if (p.code == p.PERMISSION_DENIED) { // user said no!
        console.log("Aww, sad. The user didn't want to tell us where they are.");
    } else if (p.code == p.POSITION_UNAVAILABLE) {
        console.log("Bummer! A network or GPS error prevented us from discovering user's location.");
    }
}

$(document).ready(function() {

    // Get the Facebook API
    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_US/all.js', function(){
        FB.init({
          appId: '550788961695418',
        });
        FB.login(function() {
            // FB.api(path, method (default: get), params, callback);
            FB.api("/search",
                {type: 'place', center: '33.378766,-111.86182', distance: '1000'},
                function(response) { console.log(response); }
            );
        });

        // later: only run this after we have both location and facebook api (maybe we
        // can assume that getting the fb api takes no-little time?)
        //search?type=place&center=33.378776,-111.861823&distance=1000&access_token
    });

    // What is the user's location?
    if(geoPosition.init()){  // Geolocation Initialisation
            geoPosition.getCurrentPosition(geoloc_success,geoloc_error,{enableHighAccuracy:true});
    } else {
            // You cannot use Geolocation in this device
            //console.log("This device doesn't support Geolocation.");
    }
    // geoPositionSimulator.init();

});
