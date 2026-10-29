Elanco Tick Tracker

Author: Ethan Blackshaw

About the project

This is a tick tracker website that lets users view tick sightings and look at where they have been found. It includes a search bar, a map and a chart to make it easier to explore the data.

Features

A table showing tick sightings.

A search bar to find sightings by location or tick species.

An interactive map showing sightings.

A chart to display data.

A form for reporting tick sightings.

A tick guide with information and prevention tips.

Technologies used

React and JavaScript for building the website and making it interactive.

Vite to run the website during development.

React Leaflet and Leaflet for the map.

Chart.js for the chart.

CSS for styling the website.

Design choices

I used React because the website has several interactive features. React state allows parts of the website to update when the user searches or interacts with different features.

The website gets tick sighting data from an API using fetch(). The response is converted from JSON into data that JavaScript can use.

I used JavaScript's filter() function to find sightings that match the search. The map() function is then used to display the results in the table.

I used React Leaflet for the interactive map and Chart.js to display the data as a chart.

How to run the project

You will need Node.js and npm installed.

Download or clone this repository from GitHub.

Open a terminal in the project folder.

Install the dependencies by running:

npm install

Start the website using:

npm run dev

Open the local address shown in the terminal.

The website may also need access to the API used to retrieve the tick sighting data.

Limitations

The report form currently stores submitted reports in the website's state rather than permanently saving them to a database. This means reports can be lost when the page is refreshed.

Author

Ethan Blackshaw
