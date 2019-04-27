# Running the web application
*When running the web application be sure that you are using an updated, modern web browser like Google Chrome.*

1. Use any static web server to host the files in the web-app folder (index.html, javascript/, styles/).

*I prefer using the "http-server" NPM module.  If you have Node.js and NPM installed on your machine, then you can simply install http-server by using `npm install -g http-server`.  Then you can run http-server by typing `http-server` in the terminal while in the directory of your choice.  The files in that directory will be hosted on localhost on a port that is displayed in the terminal.  This will probably be [http://localhost:8080](http://localhost:8080).*

Alternatively, if you don't want to serve the files with a static web server, then you can open index.html directly into a web browser, however, it's not guaranteed that everything will function correctly.

2. After you have chosen how you want to serve the web app files, then simply navigate to the appropriate URL in your browser and you will see the web app.  Click the 'Play' button to connect to the IBM cloud and start receiving values.  Now you can start toggling sounds on and off.
