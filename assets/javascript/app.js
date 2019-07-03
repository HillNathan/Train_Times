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

$(document).on('click', '.remove-train', function() {
    // Dom listener to listen for any "Remove" button to be clicked. 
    // When it detects a click, it pulls the key info from the attribute "data-key" 
    //   and then calls into the firebase database to delete that key and all of it's 
    //   child attributes. 
    var keyToRemove = $(this).attr('data-key');
    database.ref(keyToRemove).remove();
})

$("#clear-alert").on('click', function() {
    // Click listener for the "OK" button in the alert box to be clicked. 
    // When it is cleared, this hides the alert until it is needed again.
    event.preventDefault();
    $(".my-alert").hide();
});

// Timer to refresh the list of trains once every second. 
var refreshTimer = setInterval(dataSnapshot, 1000 );

}); 
//------------------------------------------------------------|
//// end of document onload function for DOM manipulation     |
//------------------------------------------------------------|

database.ref().on("child_added", function(snapshot) {
    // Listener function for a new child node to be added to the firebase database. 
    // When a child node is added, this function will redraw the train table with 
    //   all of the prior data nodes as well as the new node. 

    // Here are the initial variables to draw the table row and calculate the cells
    //   that need to be calculated. 
    var newRow = $("<tr>");
    var tempCell = $("<td>");
    var freq = parseInt(snapshot.val().frequency);
    var currentTime = makeInt(moment().format("HH:mm"));

    // console.log(snapshot.key)

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
         
    // setting initial variables to do time calculations
    var tempTime = makeInt(snapshot.val().startTime);
    var timeToArrival = 0;

    // Calculating the next arrival time, without using moment (except for setting the current time)
    //   because I could not - for the life of me - get moment.js to do what I wanted it to do. I ended
    //   up changing all of the times to integers and doing the calculations with the times as integers 
    //   and then figuring out how that time parses out into minutes and hours after all of the 
    //   calculations are done. 
    if (tempTime < currentTime) {
        // for start time before current time, need to work backwards from now until we get to the next train.
        while (tempTime < currentTime) {
            tempTime = tempTime + freq;
        }
        timeToArrival =  tempTime - currentTime
    }
    else {
        // for start time after current time, need to work forward from now until we get to the next train. 
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

    // If the minutes to arrival is equal to zero, display a special message. 
    if (timeToArrival === 0) {
        tempCell.html("<span class='now'>Arriving Now</span>");
    }
    // otherwise, show the minutes to arrival. 
    else {tempCell.text(timeToArrival);}
    
    newRow.append(tempCell);
    tempCell = $("<td>");

    // Make the "Remove" button for the last cell in the table. 
    var newButton = $("<button>");
    // pull in the node key and put into the attribute 'data-key' so that the button functions properly
    //   when it is clicked. 
    newButton.attr('data-key', snapshot.key);
    // give appropriate classes to display and allow dom click listener to recognize when the button is clicked.
    newButton.addClass('btn btn-secondary p-1 remove-train');
    newButton.text('Remove').$

    // append the button to the row
    tempCell.append(newButton);
    newRow.append(tempCell);

    // append the new row into our table
    $("#train-table").append(newRow);
});

function parseTime(int) {
    // This is a self-written function to parse the time into a readable format from an integer that represents 
    //   the total minutes that have elapsed since midnight. This data is already validated, so the format will 
    //   either be in "H:mm" or "HH:mm" format, and this function will return in the same format. 
    var hrs = Math.floor(int / 60);
    var min = int % 60;
    if (hrs > 23) {
        // if we have gone over to the next day, remove 24 hours from the time
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
    // put the time together into a string
    var returnString = hrsTxt + ":" + minStr;

    //return the string to complete the function. 
    return returnString; 
}

function makeInt(timeString) {
    // take a time and change it into an integer 
    var hrs;
    var min;
    if (timeString.length === 4) {
        // if the time is in "H:mm" format
        hrs = parseInt(timeString.substr(0,1))
        min = parseInt(timeString.substr(2,2))
    } else {
        // if the time is in "HH:mm" format
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
        // if the string is a correct legth, determine if it is an integer, colon, and integer
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
        // if the string is a correct legth, determine if it is an integer, colon, and integer
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
        // fail for everything else
        validTime = false;
    }
    return validTime;
}

function showAlert(alertText) {
    // This function shows a modal alert div, and places the alertText into the display div. 

    // define the variables that center the div on the page based on the height and width of the page
    var alertTop = Math.floor((($(window).height())/2)-50);
    var alertLeft = Math.floor((($(window).width())/2) - 175);

    // set the alert text
    $(".alert-text").text(alertText);

    // set the left and top attributes of the div to re-center the div in the wondow
    $(".my-alert").css('top', alertTop);
    $(".my-alert").css('left', alertLeft);

    //show the div as a modal alert
    $(".my-alert").show();
}

function dataSnapshot() {
    // do a one-time call onto the database and take a snapshot of the whole thing
    database.ref().once('value').then(function(snapshot) {
        // empty the train div to allow for re-writing all of the table rows
        $("#train-table").empty();
        snapshot.forEach(function(childSnap) {
            // loop through each key value in the database, and write each row. 
            buildRow(childSnap)
        })
    })

}

function buildRow(snapshot) {
    var newRow = $("<tr>");
    var tempCell = $("<td>");
    var freq = parseInt(snapshot.val().frequency);
    var currentTime = makeInt(moment().format("HH:mm"));

    // console.log(snapshot.key)

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
    tempCell.addClass('text-center');
    tempCell = $("<td>");   // cell must be reset for the next cell to be built

    // build and append the frequency cell
    tempCell.text(freq);
    newRow.append(tempCell);
    tempCell.addClass('text-center');
    tempCell = $("<td>");   // cell must be reset for the next cell to be built
         
    // setting initial variables to do time calculations
    var tempTime = makeInt(snapshot.val().startTime);
    var timeToArrival = 0;

    // Calculating the next arrival time, without using moment (except for setting the current time)
    //   because I could not - for the life of me - get moment.js to do what I wanted it to do. I ended
    //   up changing all of the times to integers and doing the calculations with the times as integers 
    //   and then figuring out how that time parses out into minutes and hours after all of the 
    //   calculations are done. 
    if (tempTime < currentTime) {
        // for start time before current time, need to work backwards from now until we get to the next train.
        while (tempTime < currentTime) {
            tempTime = tempTime + freq;
        }
        timeToArrival =  tempTime - currentTime
    }
    else {
        // for start time after current time, need to work forward from now until we get to the next train. 
        timeToArrival =  tempTime - currentTime
        while (timeToArrival > freq){
            tempTime -= freq;
            timeToArrival =  tempTime - currentTime
        }
    }

    // build and append the next arrival cell
    tempCell.text(parseTime(tempTime));
    tempCell.addClass('text-center');
    newRow.append(tempCell);
    tempCell = $("<td>");   // cell must be reset for the next cell to be built

    // If the minutes to arrival is equal to zero, display a special message. 
    if (timeToArrival === 0) {
        tempCell.html("<span class='now'>Arriving Now</span>");
    }
    // otherwise, show the minutes to arrival. 
    else {tempCell.text(timeToArrival);}

    newRow.append(tempCell);
    tempCell.addClass('text-center');
    tempCell = $("<td>");

    // Make the "Remove" button for the last cell in the table. 
    var newButton = $("<button>");
    // pull in the node key and put into the attribute 'data-key' so that the button functions properly
    //   when it is clicked. 
    newButton.attr('data-key', snapshot.key);
    // give appropriate classes to display and allow dom click listener to recognize when the button is clicked.
    newButton.addClass('btn btn-secondary p-1 remove-train');
    newButton.text('Remove').$

    // append the button to the row
    tempCell.append(newButton);
    tempCell.addClass('text-center');
    newRow.append(tempCell);

    // append the new row into our table
    $("#train-table").append(newRow);
}