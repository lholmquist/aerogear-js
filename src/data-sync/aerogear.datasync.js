/* AeroGear JavaScript Library
* https://github.com/aerogear/aerogear-js
* JBoss, Home of Professional Open Source
* Copyright Red Hat, Inc., and individual contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
(function( AeroGear, $, undefined ) {
    /**
        The DataSync object
        @status Experimental
        @constructs AeroGear.DataSync
        @param {Object} options
        @param {String} options.syncServerUrl - the URL of the Sync server.
        @returns {Object} The created DataSync Object
        @example
     */
    AeroGear.DataSync = function( options ) {
        // Allow instantiation without using new
        if ( !( this instanceof AeroGear.DataSync ) ) {
            return new AeroGear.DataSync( options );
        }

        options = options || {};

        var serverUrl = options.syncServerUrl;

        /**
            Read Method
            @param {Object|Array} data
            @param {Object} settings
            @param {AeroGear~errorCallbackREST} [settings.error] - callback to be executed if the AJAX request results in an error
            @param {AeroGear~successCallbackREST} [settings.success] - callback to be executed if the AJAX request results in success
            @returns {Object}
            @example
        */
        this.read = function( data, settings ) {
            settings = settings || {};

            var success;

            success = function( data, status, jqXHR ) {
                if( settings.success ) {
                    data.content = JSON.parse( data.content );
                    settings.success.call( this, data, status, jqXHR );
                }
            };

            return $.ajax({
                url: serverUrl + "/" + data.id,
                contentType: "application/json",
                dataType: "json",
                type: "GET",
                success: success,
                error: settings.error
            });
        };

        /**
            Save/Update Method
            @param {Object|Array} data
            @param {Object} settings
            @param {String} [settings.autoMerge = false] - if true, will auto merge the conflicting data
            @param {AeroGear~errorCallbackREST} [settings.conflict] - callback to be executed if the AJAX request results in a conflict
            @param {AeroGear~errorCallbackREST} [settings.error] - callback to be executed if the AJAX request results in an error
            @param {AeroGear~successCallbackREST} [settings.success] - callback to be executed if the AJAX request results in success
            @returns {Object}
            @example
        */
        this.save = function( data, settings ) {
            settings = settings || {};

            var success, error, conflict, doc,
                that = this,
                id = data.id || uuid(),
                rev = data.rev,
                content = data.content || data;

            doc = {
                id: id,
                rev: rev,
                content: content
            };

            success = function( data, status, jqXHR ) {
                if( settings.success ) {
                    data.content = JSON.parse( data.content );
                    settings.success.call( this, data, status, jqXHR );
                }
            };

            error = function( error ) {
                var model = {},
                    delta;

                if( error.status === 409 ) {
                    model = error.responseJSON;
                    model.content = JSON.parse( model.content );
                    jsondiffpatch.config.objectHash = function(obj) { return obj.id || JSON.stringify(obj); };
                    delta = jsondiffpatch.diff( model.content, content ); //The model returned, original content trying to get updated

                    if( settings.autoMerge ) {
                        jsondiffpatch.patch( model.content, delta );
                        that.save( model, settings );
                        return;
                    }

                    if( settings.conflict ) {
                        settings.conflict.call( this, error, model, delta );
                    }
                }

                if( settings.error ) {
                    settings.error.apply( this, arguments );
                }
            };

            return $.ajax({
                url: serverUrl + "/" + id,
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify( doc ),
                type: "PUT",
                success: success,
                error: error
            });
        };

        /**
            Remove Method
            @param {Object|Array} data
            @param {Object} settings
            @param {AeroGear~errorCallbackREST} [settings.error] - callback to be executed if the AJAX request results in an error
            @param {AeroGear~successCallbackREST} [settings.success] - callback to be executed if the AJAX request results in success
            @returns {Object}
            @example
        */
        this.remove = function( data, settings ) {
            settings = settings || {};

            return $.ajax({
                url: serverUrl + "/" + data.id,
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify( { rev: data.rev } ),
                type: "DELETE",
                success: settings.success,
                error: settings.error
            });
        };
    };
})( AeroGear || {}, jQuery );
