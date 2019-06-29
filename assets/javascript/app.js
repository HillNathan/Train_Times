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

    var name = $("#name-input").val().trim();
    var destination = $("#destination-input").val().trim();
    var startTime = $("#first-time-input").val().trim();
    var frequency = parseInt($("#frequency-input").val().trim());
    console.log("startTime: " + startTime)

    var newTime = moment(startTime, 'HH:mm');
    var theHours = moment(newTime).format('HH');

    
    if (!moment(newTime).isValid()) {
        alert("please enter a valid time");
    }
    if (typeof(frequency) !== "number"){
        alert("please enter a number for the frequency");
    }

    console.log("name: " + name);
    console.log("destination: " + destination);
    console.log("start time: " + startTime);
    console.log("frequency: " + frequency);


    console.log(temp);

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
});

});

database.ref().on("child_added", function(snapshot) {
    var newRow = $("<tr>");
    var tempCell = $("<td>");
    var freq = parseInt(snapshot.val().frequency);

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

    // var temp2 = addMinutes(snapshot.val().startTime, snapshot.val().frequency) ;
    // console.log(temp2);

    var momentNow = moment().format('HH:mm:ss');
    var tempStrtTim = snapshot.val().startTime;
    var intervalTime = moment(tempStrtTim,'HH:mm:ss');

    console.log(tempStrtTim);
    console.log(momentNow);
    console.log(intervalTime);

    while (moment(intervalTime).isBefore(momentNow)) {
        intervalTime.add(freq, 'minutes');
    };

    // var timeToArrival = moment(intervalTime).diff(momentNow, 'minutes');

    // console.log(timeToArrival);
    console.log(intervalTime);




    // build and append the next arrival cell
    tempCell.text(50);
    newRow.append(tempCell);
    tempCell = $("<td>");   // cell must be reset for the next cell to be built

    tempCell.text(134);
    newRow.append(tempCell);

    // append the data into our table
    $("#train-table").append(newRow);

});

function addMinutes (startTime, freq) {
    var newTime = moment(startTime, 'HH:mm');
    var Hours = moment(newTime).format('HH');
    var minutes = moment(newTime).format('mm');
    minutes += freq;
    while (minutes >= 60) {
        minutes -= 60;
        Hours++
    }
    if (Hours > 23) {
        Hours -= 24;
    }
    if (minutes < 10) {
        return Hours + ":0" + minutes;
    }
    else  {
        return Hours + ":" + minutes;
    }   
}

