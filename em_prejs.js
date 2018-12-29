Module['preRun'].push( function() {
        FS.mkdir('/userdata');
        FS.mount(IDBFS, {}, '/userdata');
        FS.syncfs(true, function(err) {
            console.log("Error loading user data from IndexDB");
        });
    });
