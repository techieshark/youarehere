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
