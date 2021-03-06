'use strict';

/* DOM */
var pages = document.querySelector("#pages"),
    place_selector = document.querySelector("select"),
    go_button = document.querySelector(".go").querySelector(".button"),
    reset_button = document.querySelector(".reset"),
    metric_buttons = document.querySelector(".metrics").querySelectorAll(".button");



/* Events */

place_selector.addEventListener("change", onPlaceChanged); 
go_button.addEventListener("click", onGoBtnClick);
reset_button.addEventListener("click", onResetBtnClick);
[].forEach.call(metric_buttons, function(btn){
    btn.addEventListener("click", onMetricBtnClick());
});



/* Event handlers */

function onPlaceChanged(){
    if (this.value) { go_button.classList.remove("hidden"); } 
    else { go_button.classList.add("hidden"); }
}

function onGoBtnClick(){
    pages.classList.toggle("active");
}

function onResetBtnClick(){
    if (confirm("Are you sure ?")) {
        location.reload(true);
    }
}

function onMetricBtnClick(){
    /* Should use a closure with this one, 
       that way we dont loose the time pointer */
    var updater;
    return function(){
        if (this.classList.contains("done")) { return; }
        if (this.classList.contains("waiting")) { 
            /* Timer is alredy running */
            clearInterval(updater);
            this.classList.add("done");
            this.innerHTML = "Done!"
            if (measurmentsDone()) { postMetricsData(); }
            return; 
        }

        /* First time click */
        updater = counter(new Date(), this.previousElementSibling);
        this.classList.toggle("waiting");
        this.innerHTML = "End";
    }
}



/* General use function declarations */

function counter(startTime, el){
    return setInterval(function(){
        var timeDiff = new Date() - startTime;
        el.innerHTML = convertTime(timeDiff);
    }, 1000);
}

function convertTime(timestamp){
    /* strip ms */
    timestamp /= 1000;
    var seconds = Math.round(timestamp % 60);

    /* remove seconds */
    timestamp = Math.floor(timestamp / 60);
    var minutes = Math.round(timestamp % 60);

    /* remove minutes */
    timestamp = Math.floor(timestamp / 60);
    var hours = Math.round(timestamp % 24);

    return (hours < 10 ? "0" + hours : hours) + 
        ":" + (minutes < 10 ? "0" + minutes : minutes) + 
        ":" + (seconds  < 10 ? "0" + seconds : seconds);
}

function postJSON(data){
    var request = new XMLHttpRequest();
    request.open("POST", "/metrics", true);
    request.setRequestHeader("Content-type", "application/json;");
    request.send(data);
}

function postMetricsData(){
    var data = {
        date: Date(),
        timestamp: Date.now(),
        place: place_selector.value,
        metrics: {}
    };

    [].forEach.call(document.querySelector(".metrics").children, function(m){
        data.metrics[m.dataset.role] = m.querySelector(".time").innerHTML;
    });

    postJSON(JSON.stringify(data));
}

function measurmentsDone() {
    return [].every.call(metric_buttons, function(btn){
        return btn.classList.contains("done");
    });
}