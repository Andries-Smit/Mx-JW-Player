# JW PLAYER Widget 
Video and audio playback

Sponsor: http://www.endemol.nl/

## Description

JW Player, PLAYS EVERYWHERE, EVERY TIME
The most-used and fastest loading video player on the web, our signature product enables online publishers to deliver and monetize video across all devices in any browser. From the video blogger to the Fortune 100 in need of an enterprise-grade solution, JW Player lets users create the best video experiences for viewers on the web, mobile, and OTT devices.

## Typical usage scenario

* Show Video Content
* Listen to audio Content

## Features and limitations

* Based on the JW player version 7.2
* HTML5 playback
* Flash player
* Open Source, the paid version has more options, but also offers hosting.
* Some formats are not natively supported by the OS or browser. 
* http://support.jwplayer.com/customer/portal/articles/1403635-media-format-reference

## Dependencies

* Mendix 6 or 7 Environment.
* Fallback for some media formats is FLASH.

## Configuration

* Download the Widget from App Store
* Create an entity that contains a video URL
* Place the JW Player widget data view of your video.
* Run, Play and Enjoy!

## Properties
* Video
  * Video URL; Attribute that contains URL to a single video file.
  * Video Fallback URL: Attribute that contains URL to a fallback video file. Primary is stream, Fallback is mp4
 * Image URL; Attribute that contains the URL to a poster image to display before playback starts.
* Behaviour
  * Loop Content; Whether to loop playback of the playlist or not
  * Mute on Start; Whether to have the sound muted on start-up or not.(not on iOS Android
  * Preload; Allows to fetch media information prior to playback.(Mobile browsers never pre-fetch.)
* Appearance
  * Height; Height of the player in pixels.
  * Width; Width of the player in pixels.
  * Skin; Select the themes of the player 
  * Show Controls; Whether to display the video controls (control bar, display icons and dock buttons)
* Settings
  * License Key; Key needed to use the commercial features. http://www.jwplayer.com/pricing
* Events
  * On Event Microflow; Microflow to be called when user triggers an event
  * Event Entity; Event object will be created on a event
  * Event Relation; Relation between video and Event.
  * Event Type; Enumeration Attribute of events, Play, Pause, Stop, Complete
  * Event Position; Position Attribute will contain the playback position at time of the event.
* Logo
  * Logo; Image JPG, PNG or GIF image to be used as watermark.
  * Logo Link; The HTTP URL which will load when your watermark image is clicked.
* Sharing
  * Deeplink; *Deeplink* to this video, if empty no sharing overlay is shown
  * Heading; Short, instructive text to display at the top of the sharing screen. The default is Share Video. This is also is displayed as a tooltip for the sharing icon.
  * Sites; Sites comma seperated. facebook, twitter, email, tumblr, googleplus, reddit, linkedin

## Source

Source and Sample project at GitHub

Please contribute fixes and improvements at
https://github.com/Andries-Smit/Mx-JW-Player


## Bugs, issue or suggestions
Please let me know when there are any issues or suggestions at the GitHub issue tracker:
https://github.com/Andries-Smit/Mx-JW-Player/issues
