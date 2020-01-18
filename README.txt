We recommend that you use the cloud server which will save you lots of 
configuration time than running it locally

ways to start the cloud server
1. open "https://goor.me/dtJbU" on browser to open the workspace
2. run "./mongod" in terminal to run the database server
3. click WINDOWS -> NEW TERMINAL to open a new terminal
4. run "node main" in the new terminal
5. open "https://test-ijprr.run-us-west1.goorm.io" to access the web application

ways to run it in local computer
1. install nodeJS
2. install mongoDB
3. open terminal in the current folder
4. run "npm install" to install all packages needed
5. mongoimport --db=cse6242 --collection=hotels --type=csv --headerline --file=./listings-csv.csv
6. start mongoDB server
7. run "node main"
8. open "localhost:3000" on browser to access the web application

ways to use the web application
1. click on the map or use search box to select several places of interest
2. click submit
3. click day1 to get a list of recommendations
4. select a option
5. do so for the other days
6. click submit to get the results