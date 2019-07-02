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
    var name = $("#name-input").val().trim();
    var destination = $("#destination-input").val().trim();
    var startTime = $("#first-time-input").val().trim();
    var frequency = parseInt($("#frequency-input").val().trim());

    if (!isValidTime(startTime)) {
        goodInfo = false;
        showAlert("Please enter a valid time");
    }
    else if (!frequency) {
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

var refreshTimer = setInterval(dataSnapshot, 1000 );



}); 
//// end of document onload function for DOM manipulation

database.ref().on("child_added", function(snapshot) {
    $("#train-table").empty();
    buildRow(snapshot);
});

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
    return returnString; 
}

function makeInt(timeString) {
    var hrs;
    var min;
    if (timeString.length === 4) {
        hrs = parseInt(timeString.substr(0,1))
        min = parseInt(timeString.substr(2,2))
    } else {
        hrs = parseInt(timeString.substr(0,2));
        min = parseInt(timeString.substr(3,2));
    }
    return ((hrs * 60) + min);
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
    var alertTop = Math.floor((($(window).height())/2)-50);
    var alertLeft = Math.floor((($(window).width())/2) - 175);
    $(".alert-text").text(alertText);
    $(".my-alert").css('top', alertTop);
    $(".my-alert").css('left', alertLeft);
    $(".my-alert").show();
}

function dataSnapshot() {
    database.ref().once('value').then(function(snapshot) {
        $("#train-table").empty();
        snapshot.forEach(function(childSnap) {
            buildRow(childSnap)
        })
    })

}

function buildRow(snapshot) {
    var newRow = $("<tr>");
    var tempCell = $("<td>");
    var freq = parseInt(snapshot.val().frequency);
    var currentTime = makeInt(moment().format("HH:mm"));

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
    tempCell.text(freq);
    newRow.append(tempCell);
    tempCell = $("<td>");   // cell must be reset for the next cell to be built
         
    var tempTime = makeInt(snapshot.val().startTime);
    var timeToArrival = 0;

    if (tempTime < currentTime) {
        // for start time before current time
        while (tempTime < currentTime) {
            tempTime = tempTime + freq;
        }
        timeToArrival =  tempTime - currentTime
    }
    // for start time after current time
    else {
        timeToArrival =  tempTime - currentTime
        while (timeToArrival > freq){
            tempTime -= freq;
            timeToArrival =  tempTime - currentTime
        }
    }

    // build and append the next arrival cell
    tempCell.text(parseTime(tempTime));
    newRow.append(tempCell);
    tempCell = $("<td>");   // cell must be reset for the next cell to be built

    if (timeToArrival === 0) {
        tempCell.html("<span class='now'>Arriving Now</span>");
    }
    else {tempCell.text(timeToArrival);}
    
    newRow.append(tempCell);

    // append the data into our table
    $("#train-table").append(newRow);
}