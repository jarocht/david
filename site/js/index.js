var baseUrl = "http://david:3000/api/sprinkler";
var modes;


function startWatch() {
    getState();
    setInterval(function(){ 
        getState(); 
    }, 100);
}

function getState() {
    get(baseUrl + "status", function(data){
        modes = data.modes;
        for (var i = 0; i < data.pinCount; i++) {
            var element = document.getElementById(i);
            if (element)
            {
                if (data.pinStatus[i] == 0) {
                    element.classList.remove('btn-primary');
                    element.classList.add('btn-success');
                } else {          
                    element.classList.remove('btn-success');
                    element.classList.add('btn-primary');
                }
            }
        }
        for (var i = 0; i < data.modes.length; i++) {
            var elementMode = data.modes[i];
            var element = document.getElementById(elementMode);
            if (element) {
                if (elementMode === data.mode) {
                    element.classList.remove('btn-primary');
                    element.classList.add('btn-success');
                } else {
                    element.classList.remove('btn-success');
                    element.classList.add('btn-primary');
                }
            } else {
                console.log("ERROR, unable to select mode DOM element.")
            }
        }
    });
}

function toggleSidebar() {
    var element = document.getElementById("sidebar");
    if (element) {
        if (element.classList.contains('hide')) {
            element.classList.remove('hide');
        } else {
            element.classList.add('hide');
        }
    }
}

function toggle(id) {
    var element = document.getElementById(id);
    get(baseUrl + "manual/" + id, function(response) {
        if (!response.success) {
            $('#myModal').modal('show');
        }
    });
}

function toggleMode(id) {
    var element = document.getElementById(id);
    get(baseUrl + "set/" + id, function(response) {
        //TODO: error handling
        /*if (!response.success) {
            $('#myModal').modal('show');
        }*/
    });
}

function stop() {
    //TODO: error handling
    get(baseUrl + "stop");
}

function get(url, callback) {
    getAjax(url, function(data){ 
        //TODO: remove logging
        //console.log(JSON.parse(data));
        if (callback) {
            callback(JSON.parse(data));
        }
    });
}

function getAjax(url, success) {
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) success(xhr.responseText);
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();
    return xhr;
}