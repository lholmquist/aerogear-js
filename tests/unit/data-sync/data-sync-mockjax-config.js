(function( $ ) {
// Use mockjax to intercept the rest calls and return data to the tests
// Clean up any mocks from previous tests first
$.mockjaxClear();

// read mocks
$.mockjax({
    url: "http://localhost:8080/*",
    type: "GET",
    headers: {
        "Content-Type": "application/json"
    },
    response: function( settings ) {
            var doc = {
                id: settings.url.split('/').splice(-1)[ 0 ],
                content: {
                    model: "bmw",
                    color: "black"
                }
            };

            doc.content = JSON.stringify( doc.content );

            settings.data = doc;

            this.responseText = settings.data;
    }
});

// Update conflict
$.mockjax({
    url: "http://localhost:8080/12345",
    headers: {
        "Content-Type": "application/json"
    },
    type: "PUT",
    response: function( settings ) {
            var data = JSON.parse(settings.data);

            if( data.rev ) {
                // do the conflict here
                this.status = 409;
            } else {
                data.rev = uuid();
            }
            data.content = JSON.stringify( data.content );
            this.responseText = JSON.stringify( data );
    }
});

// Update success
$.mockjax({
    url: "http://localhost:8080/*",
    headers: {
        "Content-Type": "application/json"
    },
    type: "PUT",
    response: function( settings ) {
            var data = JSON.parse(settings.data);

            data.rev = uuid();
            data.content = JSON.stringify( data.content );
            this.responseText = JSON.stringify( data );
    }
});

//Delete
$.mockjax({
    url: "http://localhost:8080/*",
    headers: {
        "Content-Type": "application/json"
    },
    type: "DELETE",
    response: function( settings ) {
            var data = JSON.parse(settings.data);

            data.rev = uuid();
            data.content = JSON.stringify( data.content );
            this.responseText = JSON.stringify( data );
    }
});
})( jQuery );
