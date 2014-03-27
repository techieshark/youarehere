var pos; // DEBUG

function get_location() {
    if (Modernizr.geolocation) {
        navigator.geolocation.getCurrentPosition(use_position, handle_geoloc_error);

    } else {
        // no native support; maybe try a fallback?
    }
}

function use_position(position) {
    pos = position;
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    console.log("lat: " + latitude + ", lon: " + longitude);
    // let's show a map or do something interesting!
}

function handle_geoloc_error(position_error) {
    console.log(position_error);
    if (err.code == 1) { //PERMISSION_DENIED
        // user said no!
        console.log("Aww, sad. The user didn't want to tell us where they are.");
    } else if (err.code == 2) { //POSITION_UNAVAILABLE
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
        // $('#loginbutton,#feedbutton').removeAttr('disabled');
        // FB.getLoginStatus(updateStatusCallback);
    });

    // get_location();

    // What is the user's location?
    if(geoPosition.init()){  // Geolocation Initialisation
            geoPosition.getCurrentPosition(success_callback,error_callback,{enableHighAccuracy:true});
    } else {
            // You cannot use Geolocation in this device
            //console.log("This device doesn't support Geolocation.");
    }
    // geoPositionSimulator.init();

    // p : geolocation object
    function success_callback(p){

        console.log("We found you! At lat: " + p.coords.latitude + ", lon: " + p.coords.longitude);
        console.log("(Within " + p.coords.accuracy + " meters.)");
        // p.latitude : latitude value
        // p.longitude : longitude value
    }

    function error_callback(p){
        console.log("Bummer! Geolocation failed: " + p.message);
        if (p.code == p.PERMISSION_DENIED) { //PERMISSION_DENIED
            // user said no!
            console.log("Aww, sad. The user didn't want to tell us where they are.");
        } else if (p.code == p.POSITION_UNAVAILABLE) { //POSITION_UNAVAILABLE
            console.log("Bummer! A network or GPS error prevented us from discovering user's location.");
        }

        // p.message : error message
    }

});
