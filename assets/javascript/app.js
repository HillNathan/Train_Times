  // Your web app's Firebase configuration
var firebaseConfig = {
authDomain: "traintimes-2a979.firebaseapp.com",
databaseURL: "https://traintimes-2a979.firebaseio.com",
projectId: "traintimes-2a979",
storageBucket: "",
messagingSenderId: "20008059544",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var database = firebase.database();

$( document ).ready(function() {

$("#add-train").on("click", function(event) {
    event.preventDefault();
    var goodInfo = true;
    // var startTime = moment().format("HH:mm");
    // console.log(startTime)

    var name = $("#name-input").val().trim();
    var destination = $("#destination-input").val().trim();
    var startTime = $("#first-time-input").val().trim();
    var frequency = parseInt($("#frequency-input").val().trim());

    // console.log("startTime");
    // console.log(startTime)
    // console.log("-------------------------");
    // console.log("newTime");
    // console.log(newTime)
    
    // console.log(moment().invalidAt(newTime));
    if (!isValidTime(startTime)) {
        goodInfo = false;
        showAlert("Please enter a valid time");
    }
    console.log(frequency);
    if (!frequency) {
        console.log("bad frequency")
        goodInfo = false;
        showAlert("Please enter a number for the frequency");
    }

    if (goodInfo) {
        database.ref().push({
            name,
            destination,
            startTime,
            frequency,
        });
        $("#name-input").val('');
        $("#destination-input").val('');
        $("#first-time-input").val('');
        $("#frequency-input").val('');
    }
});


$("#clear-alert").on('click', function() {
    event.preventDefault();
    $(".my-alert").hide();
});



});

database.ref().on("child_added", function(snapshot) {
    var newRow = $("<tr>");
    var tempCell = $("<td>");
    var freq = parseInt(snapshot.val().frequency);
    var currentTime = moment().format("HH:mm");

    // build and append the Train Name cell
    tempCell.text(snapshot.val().name);
    newRow.append(tempCell);
    tempCell = $("<td>");   // cell must be reset for the next cell to be built

    // build and append the Train destination cell
    tempCell.text(snapshot.val().destination);
    newRow.append(tempCell);
    tempCell = $("<td>");   // cell must be reset for the next cell to be built

    //build and append the start time cell
    tempCell.text(snapshot.val().startTime);
    newRow.append(tempCell);
    tempCell = $("<td>");   // cell must be reset for the next cell to be built

    // build and append the frequency cell
    tempCell.text(snapshot.val().frequency);
    newRow.append(tempCell);
    tempCell = $("<td>");   // cell must be reset for the next cell to be built

    // NONE OF THIS CODE WORKS
            // var temp2 = addMinutes(snapshot.val().startTime, snapshot.val().frequency) ;
            // console.log(temp2);
            // while (moment(intervalTime).isBefore(momentNow)) {
            //     intervalTime.add(freq, 'minutes');
            // };

            // var timeToArrival = moment(intervalTime).diff(momentNow, 'minutes');

            // console.log(timeToArrival);
            // console.log(intervalTime);

    var tempTime = snapshot.val().startTime;
    // console.log("start tempTime: " + tempTime);
    // console.log("--------------------------");
    while (myIsBefore(tempTime,currentTime)) {
        // console.log("Temp time: " + tempTime);
        // console.log("current time: " + currentTime);
        tempTime = addMinutes(tempTime,freq);
    }
    // console.log(tempTime);


    // build and append the next arrival cell
    tempCell.text(tempTime);
    newRow.append(tempCell);
    tempCell = $("<td>");   // cell must be reset for the next cell to be built

    var temp = findDiff(currentTime,tempTime);

    tempCell.text(temp);
    newRow.append(tempCell);

    // append the data into our table
    $("#train-table").append(newRow);

});

function addMinutes (startTime, freq) {
    // startTime should be a string of length 5 with format HH:mm 
    // freq should be an integer
    var totalMin = makeInt(startTime);
    totalMin += freq;
    // console.log("Total Minutes");
    // console.log(totalMin);
    var returnString = parseTime(totalMin)
    return returnString;
}

function parseTime(int) {
    var hrs = Math.floor(int / 60);
    var min = int % 60;
    if (hrs > 23) {
        hrs -= 24;
    }

    if (hrs < 10){
        hrsTxt = "0" + hrs
    }
    else {
        hrsTxt = hrs;
    }

    if (min < 10) {
        var minStr = "0" + min;
    }
    else  {
        var minStr = min;
    }   
    var returnString = hrsTxt + ":" + minStr;
    // console.log("return from ParseTime: " + returnString);
    return returnString; 
}

function makeInt(timeString) {
    // console.log("timeString in makeint: " + timeString);
    var hrs = parseInt(timeString.substring(0,2));
    var min = parseInt(timeString.substring(3));
    // console.log(hrs);
    // console.log(min);
    return ((hrs * 60) + min);
}

function myIsBefore(time1, time2) {
    // console.log("--- CALL OF ISBEFORE ---")
    var time1int = makeInt(time1);
    var time2int = makeInt(time2);
    // asks if time1 is before time2, both arguments are passed as strings
    if (time1int < time2int) {
        return true;
    }
    else {
        return false;
    }
}

function findDiff(time1, time2) {
    // function finds the difference between the times, regardless of whether the higher value is passed 
    //    in the first or second argument. 
    var timeInt1 = makeInt(time1);
    var timeInt2 = makeInt(time2);

    var diff;
    if (timeInt1 < timeInt2) {
        diff = timeInt2 - timeInt1;
    }
    else if (timeInt2 > timeInt1) {
        diff = timeInt1 - timeInt2;
    }
    else {
        diff = 0;
    }
    return diff;
}

function isValidTime(testString){
    // will determine if the testString argument is a valid time. 
    // valid times are in the following two formats:
    //    #1 - "HH:mm"
    //    #2 - "H:mm"
    // all other formats will be rejected. 
    var validTime;

    // if string is too long or too short
    if((testString.length < 4) ||(testString.length > 5) ){
        validTime = false;
    }
    else if(testString.length === 4) {
        if (typeof(parseInt(testString.substr(0,1))) === 'number' && 
            testString.substr(1,1) === ":" && 
            typeof(parseInt(testString.substr(2,2))) === 'number' ) {
                validTime = true;
            }
        else {
            validTime = false;
        }
    }
    else if(testString.length === 5) {
        if (typeof(parseInt(testString.substr(0,2))) === 'number' && 
            testString.substr(2,1) === ":" && 
            typeof(parseInt(testString.substr(3,2))) === 'number' ) {
                validTime = true;
            }
        else {
            validTime = false;
        } 
    }
    else {
        validTime = false;
    }
    return validTime;
}

function showAlert(alertText) {
    console.log("showAlert is called");
    $(".alert-text").text(alertText);
    $(".my-alert").show();
}

