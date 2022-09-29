A Single-page app for buying event tickets from Kide.app

The project was made in an afternoon for fun
The logic does not flood kide.app API too much, and only allows purchasing of 1 ticket per each
variant in any given event.

Usage:

1. Git clone the project
2. run "npm install" on root
3. run "npm start" to launch the app
4. find your Bearer token after logging in to kide.app
    1 On Google Chrome, press F12 on your keyboard
    2 Navigate to "Network" tab
    3 Add an event ticket to your cart
    4 Find "reservations" POST request from "Network" tab
    5 Look for "authorization" in "Request Headers"
    6 Copy the value of the token minus the "Bearer" text
5. Input the Bearer token to the App's field
6. Navigate to your desired event in Kide.app
7. Copy the event ID from URL, e.g. https://kide.app/events/this-is-event-ID-only-copy-this
8. Input the event ID in the App and you're good to go!
