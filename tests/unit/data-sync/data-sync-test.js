(function( $ ) {
    module( "Data Sync Tests" );

    test( "Create a Data Sync Object", function() {
        var dataSync = AeroGear.DataSync( { syncServerUrl: "http://localhost:8080" } );

        equal( typeof dataSync.read, 'function', "Has read method" );
        equal( typeof dataSync.save, 'function', "Has save method" );
        equal( typeof dataSync.remove, 'function', "Has remove method" );
    });

    asyncTest( "Create Document", function() {
        var dataSync = AeroGear.DataSync( { syncServerUrl: "http://localhost:8080" } ),
            doc = {
                id: uuid.v4(),
                content: {
                    model: "bmw",
                    color: "black"
                }
            };

        dataSync.save( doc, {
            success: function( response ) {
                console.log( "success", response );
                equal( response.rev !== undefined, true, "revision property added" );
                start();
            },
            error: function( error ) {
                console.log( "error", error );
                start();
            }
        });
    });

    asyncTest( "Update Document", function() {
        var dataSync = AeroGear.DataSync( { syncServerUrl: "http://localhost:8080" } ),
            doc = {
                id: uuid.v4(),
                content: {
                    model: "bmw",
                    color: "black"
                }
            };

        dataSync.save( doc, {
            success: function( response ) {

                var firstDoc = response;

                firstDoc.content.model = "honda";

                dataSync.save( firstDoc, {
                    success: function( response ) {
                        var secondDoc = response;
                        equal( secondDoc.content.model, "honda", "Model has been updated" );
                        equal( secondDoc.id, firstDoc.id, "Id's should be the same" );
                        notEqual( secondDoc.rev, firstDoc.rev, "revision numbers should be different" );
                        start();
                    },
                    error: function( error ) {
                        console.log( error );
                        start();
                    }
                });
            },
            error: function( error ) {
                console.log( "error", error );
                start();
            }
        });
    });

    asyncTest( "Update Document - with conflict", function() {
        var dataSync = AeroGear.DataSync( { syncServerUrl: "http://localhost:8080" } ),
            doc = {
                id: uuid.v4(),
                content: {
                    model: "bmw",
                    color: "black"
                }
            };

        dataSync.save( doc, {
            success: function( response ) {

                var firstDoc = response;

                doc.content.model = "honda";

                dataSync.save( doc, {
                    success: function( response ) {
                       // shouldnt be here
                        start();
                    },
                    conflict: function( error, currentRev, delta ) {
                        equal( error.status, 409, "Conflict error" );
                        equal( currentRev.id, doc.id, "id's should match" );
                        equal( currentRev.rev, firstDoc.rev, "The latest revision that the server has should be the latest update we made" );
                        console.log( delta );
                        start();
                    }
                });
            },
            error: function( error, currentRev ) {
                start();
            }
        });
    });

    asyncTest( "Update Document - with conflict - with array", function() {
        var dataSync = AeroGear.DataSync( { syncServerUrl: "http://localhost:8080" } ),
            doc = {
                id: uuid.v4(),
                content: [
                    {
                        id: "1",
                        model: "bmw",
                        color: "black"
                    },
                    {
                        id: "2",
                        model: "honda",
                        color: "blue"
                    }
                ]
            };

        dataSync.save( doc, {
            success: function( response ) {

                var firstDoc = response;

                doc.content[ 1 ].model = "volvo";
                doc.content[ 1 ].engine = "v6";

                doc.content[ 0 ].color = "red";

                dataSync.save( doc, {
                    success: function( response ) {
                       // shouldnt be here
                        start();
                    },
                    conflict: function( error, currentRev, delta ) {
                        equal( error.status, 409, "Conflict error" );
                        equal( currentRev.id, doc.id, "id's should match" );
                        equal( currentRev.rev, firstDoc.rev, "The latest revision that the server has should be the latest update we made" );
                        console.log( delta );
                        start();
                    }
                });
            },
            error: function( error, currentRev ) {
                start();
            }
        });
    });

    asyncTest( "Update Document - with conflict - AutoMerge", function() {
        var dataSync = AeroGear.DataSync( { syncServerUrl: "http://localhost:8080" } ),
            doc = {
                id: uuid.v4(),
                content: {
                    model: "bmw",
                    color: "black"
                }
            };

        dataSync.save( doc, {
            success: function( response ) {

                var firstDoc = response;

                doc.content.model = "honda";
                doc.content.engine = "v6";

                dataSync.save( doc, {
                    autoMerge: true,
                    success: function( response ) {
                       var secondDoc = response;
                        equal( secondDoc.content.model, "honda", "Model has been updated" );
                        equal( secondDoc.content.engine, "v6", "Engine property is now here" );
                        equal( secondDoc.id, firstDoc.id, "Id's should be the same" );
                        notEqual( secondDoc.rev, firstDoc.rev, "revision numbers should be different" );
                        start();
                    }
                });
            },
            error: function( error, currentRev ) {
                start();
            }
        });
    });

    asyncTest( "Create Document - as an array", function() {
        var dataSync = AeroGear.DataSync( { syncServerUrl: "http://localhost:8080" } ),
            doc = {
                id: uuid.v4(),
                content: [
                    {
                        model: "bmw",
                        color: "black"
                    },
                    {
                        model: "honda",
                        color: "blue"
                    }
                ]
            };

        dataSync.save( doc, {
            success: function( response ) {
                console.log( "success", response );
                equal( response.rev !== undefined, true, "revision property added" );
                start();
            },
            error: function( error ) {
                console.log( "error", error );
                start();
            }
        });
    });

    asyncTest( "Read Document", function() {
        var dataSync = AeroGear.DataSync( { syncServerUrl: "http://localhost:8080" } ),
            doc = {
                id: uuid.v4(),
                content: {
                    model: "bmw",
                    color: "black"
                }
            };

        dataSync.save( doc, {
            success: function( response ) {
                var newDoc = response;
                equal( newDoc.rev !== undefined, true, "revision property added" );
                dataSync.read( newDoc, {
                    success: function( response ) {
                        var read = response;
                        equal( newDoc.id, read.id, "Id's should be equal" );
                        start();
                    }
                });
            },
            error: function( error ) {
                console.log( "error", error );
                start();
            }
        });
    });

    asyncTest( "Delete Document", function() {
        var dataSync = AeroGear.DataSync( { syncServerUrl: "http://localhost:8080" } ),
            doc = {
                id: uuid.v4(),
                content: {
                    model: "bmw",
                    color: "black"
                }
            };

        dataSync.save( doc, {
            success: function( response ) {
                var newDoc = response;
                dataSync.remove( newDoc, {
                    success: function( response ) {
                        var read = response;
                        notEqual( newDoc.rev, read.rev, "Revision's should be different" );
                        start();
                    },
                    error: function( response ) {
                        console.log( response );
                        start();
                    }
                });
            },
            error: function( error ) {
                console.log( "error", error );
                start();
            }
        });
    });
})( jQuery );
