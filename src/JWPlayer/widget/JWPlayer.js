/*jslint browser: true, devel:true, nomen:true, unparam:true*/
/*global mx, mxui, require, define, logger*/
/*
 JWPlayer
 ========================
 
 @file      : JWPlayer.js
 @version   : 1.1.0
 @author    : Andries Smit
 @date      : 2017-04-06
 @copyright : Flock of Birds International BV
 @license   : Apache License, Version 2.0
 
 Documentation
 ========================
 Mendix Widget 
 JW Player, PLAYS EVERYWHERE, EVERY TIME
 The most-used and fastest loading video player on the web, our signature product 
 enables online publishers to deliver and monetize video across all devices in
 any browser. From the video blogger to the Fortune 100 in need of an 
 enterprise-grade solution, JW Player lets users create the best video 
 experiences for viewers on the web, mobile, and OTT devices.

 */

// Required module list.
define(["dojo/_base/declare", "mxui/widget/_WidgetBase", "dojo/_base/lang",
    "dojo/dom-style", "dojo/_base/array"],
    function (declare, _WidgetBase, dojoLang, dojoStyle, dojoArray, widgetTemplate) {
        "use strict";

        // Declare widget's prototype.
        return declare("JWPlayer.widget.JWPlayer", [_WidgetBase], {
            templateString: widgetTemplate,
            // Modeler Variables
            // video
            videoUrlAttr: "",
            imageUrlAttr: "",
            videoFallbackUrlAttr: "",
            mimeType: "",
            mimeTypeFallback: "",
            // Appearance
            skin: "glow",
            videoHeight: "270",
            videoWidth: "480",
            aspectRatio: "fixed",
            //Behaviour
            autoStart: false,
            muteOnStart: false,
            loopContent: false,
            preload: false,
            // Display
            showControls: true,
            // Settings
            licenseKey: "",
            // Events
            onEventMF: "",
            playerEventEntity: "",
            playerEventRel: "",
            eventTypeAttr: "",
            eventPositionAttr: "",
            // Logo
            logoFile: "",
            logoLink: "",
            // Sharing
            shareLinkAttr: "",
            shareHeading: "",
            shareSites: "",
            // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
            _handles: null,
            playerInstance: null,
            _contextObj: null,
            mapLogoPosition: [],
            // force loading to wait for jwlibs to load async
            autoLoad: false,

            // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
            constructor: function () {
                this._handles = [];
                this.playerInstance = null;
                this.mapLogoPosition.tr = "top-right";
                this.mapLogoPosition.tl = "top-left";
                this.mapLogoPosition.br = "bottom-right";
                this.mapLogoPosition.bl = "bottom-left";
            },
            // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
            postCreate: function () {
                logger.debug(this.id + ".postCreate");
                mxui.dom.addCss(require.toUrl("JWPlayer/lib/licensed/skins/" + this.skin + ".css"));
                // for popups in mx 5.14 needed.
                //dojoStyle.set(this.domNode, "height", this.videoHeight + "px");
                //dojoStyle.set(this.domNode, "width", this.videoWidth + "px"); // todo better set this with update form.

                var playNode = mxui.dom.create("div", {id: this.id + "_player"}); // need child element else the jw player replace domNode element
                if (this.licenseKey !== "") {
                    dojoDynamicRequire(["JWPlayer/lib/licensed/jwplayer"], dojoLang.hitch(this, function (jwplayerLicensed) {
                        this.domNode.appendChild(playNode);
                        this.playerInstance = jwplayerLicensed(playNode);
                        this.playerInstance.key = this.licenseKey;
                        this._setupEvents();
                        window.jwplayer = jwplayerLicensed; // need to register to global space. else Flash is failing....
                        this.set("loaded", true);
                    }));
                } else {
                    dojoDynamicRequire(["JWPlayer/lib/free/jwplayer"], dojoLang.hitch(this, function (jwplayerFree) {
                        this.domNode.appendChild(playNode);
                        this.playerInstance = jwplayerFree(playNode);
                        this._setupEvents();
                        window.jwplayer = jwplayerFree; // need to register to global space. else Flash is failing....
                        this.set("loaded", true);
                    }));
                }
            },
            // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
            update: function (obj, callback) {
                logger.debug(this.id + ".update");
                this._contextObj = obj;
                this._resetSubscriptions();
                this._updateRendering();
                callback();
            },
            // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
            uninitialize: function() {
                logger.debug(this.id + ".uninitialize");
                // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
                this.playerInstance.remove();
            },
            // re-render the interface.
            _updateRendering: function () {
                logger.debug(this.id + "._updateRendering");
                if (this.playerInstance && this.playerInstance.getState() === "playing") {
                    this._handleEvent("Stop");
                }
                if (this._contextObj !== null) {
                    var options = this._getOptions();
                    this.playerInstance.setup(options)
                        .onReady(dojoLang.hitch(this, function () {
                            this.playerInstance.on("play", dojoLang.hitch(this,
                                function () {
                                    this._handleEvent("Play");
                                }
                                ));
                            this.playerInstance.on("pause", dojoLang.hitch(this,
                                function () {
                                    this._handleEvent("Pause");
                                }
                                ));
                            this.playerInstance.on("complete", dojoLang.hitch(this,
                                function () {
                                    this._handleEvent("Complete");
                                }
                                ));
                            this.playerInstance.on("idle", dojoLang.hitch(this,
                                function () {
                                    this._handleEvent("Stop");
                                }
                                ));
                            this.playerInstance.on("seek", dojoLang.hitch(this,
                                function () {
                                    this._handleEvent("Stop");
                                }
                                ));
                            this.playerInstance.on("seeked", dojoLang.hitch(this,
                                function () {
                                    this._handleEvent("Play");
                                }
                                ));
                        }));
                    // store mx Guid in instance, so events after context reload are still using the correct video 
                    this.playerInstance.mxObjId = this._contextObj.getGuid();
                    dojoStyle.set(this.domNode, "display", "");
                } else {
                    if (this.playerInstance) {
                        this.playerInstance.stop();
                    }
                    dojoStyle.set(this.domNode, "display", "none");
                }
            },
            _handleEvent: function (eventType) {
                logger.debug("Event :" + eventType + " pos:" + this.playerInstance.getPosition());
                
                var position = this.playerInstance.getPosition(),
                    videoId = this.playerInstance.mxObjId;
                if (this.playerEventRel && this.onEventMF) {
                    mx.data.create({
                        entity: this.playerEventEntity,
                        callback: dojoLang.hitch(this, function (eventObj) {
                            logger.debug(this.id + " Event object created on server");
                            eventObj.set(this.eventTypeAttr, eventType);
                            eventObj.set(this.eventPositionAttr, position);
                            eventObj.addReference(this.playerEventRel.split("/")[0], videoId);
                            this.executeEventMf(eventObj);
                        }),
                        error: function (e) {
                            console.error(this.id + "an error occurred creating player event: " + e);
                        }
                    });
                }
            },
            executeEventMf: function (eventObj) {
                logger.debug(this.id + ".executeEventMf " + this.onEventMF);
                var self = this;
                mx.data.action({
                    params: {
                        applyto: "selection",
                        actionname: this.onEventMF,
                        guids: [eventObj.getGuid()]
                    },
                    origin: this.mxform,
                    callback: function () {
                        logger.debug(self.id + ".executeEventMf successfully");
                    },
                    error: function (error) {
                        console.error(self.id + ".executeEventMf with error ", error);
                    }
                });
            },
            _getOptions: function () {
                logger.debug(this.id + "._getOptions");
                var link,
                    jwBase = require.toUrl("JWPlayer/lib/licensed/").split("?")[0], // remove cache salt param
                    flashPlayerUrl = require.toUrl("JWPlayer/lib/licensed/jwplayer.flash.swf"),
                    options = {
                        //file: this._contextObj.get(this.videoUrlAttr), 
                        sources: [{
                            file: this._contextObj.get(this.videoUrlAttr),
                            type: this.mimeType
                        }, {
                            file: this._contextObj.get(this.videoFallbackUrlAttr),
                            type: this.mimeTypeFallback
                        }],
                        preload : this.preload,
                        controls: this.showControls,
                        skin: {name: this.skin},
                        height: this.videoHeight,
                        width: this.aspectRatio === "fixed" ? this.videoWidth : this.videoWidth + "%",
                        image: this._contextObj.get(this.imageUrlAttr),
                        key: this.licenseKey,
                        androidhls: true,
                        base: jwBase,
                        flashplayer: flashPlayerUrl,
                        autostart: this.autoStart,
                        mute: this.muteOnStart,
                        repeat: this.loopContent,
                        primary: "html5"
                    };
                if (this.logoFile !== "") {
                    options.logo = {
                        file: this.logoFile,
                        link: this.logoLink
                    };
                }
                if (this.shareLinkAttr !== "") {
                    link = this._contextObj.get(this.shareLinkAttr);
                    if (link) {
                        options.sharing = {
                            link: link,
                            heading: this.shareHeading,
                            sites: this.shareSites.replace(/ /g, "").split(",")
                        };
                    }
                }
                return options;
            },
            _setupEvents: function () {
                this.connect(this.mxform, "onBeforeHide", dojoLang.hitch(this, function () {
                    //logger.debug(this.id + ".onAfterHide pause");
                    this.playerInstance.pause(true);
                }));
            },
            // Reset subscriptions.
            _resetSubscriptions: function () {
                // Release handles on previous object, if any.
                if (this._handles) {
                    dojoArray.forEach(this._handles, function (handle) {
                        mx.data.unsubscribe(handle);
                    });
                    this._handles = [];
                }
                // When a mendix object exists create subscriptions. 
                if (this._contextObj) {
                    this._handles.push(this.subscribe({
                        guid: this._contextObj.getGuid(),
                        callback: dojoLang.hitch(this, function (guid) {
                            this._updateRendering();
                        })
                    }));
                    this._handles.push(this.subscribe({
                        guid: this._contextObj.getGuid(),
                        attr: this.videoUrlAttr,
                        callback: dojoLang.hitch(this, function (guid, attr, attrValue) {
                            this._updateRendering();
                        })
                    }));
                }
            }
        });
    });

require(["JWPlayer/widget/JWPlayer"]);
