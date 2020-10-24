# Flashfood

- DevOps project for the course.

- NodeJs Server code for the Falshfood bot.

- This server interacts with the Facebook developer APIs to receive and send messages. It also interacts with the python server to store the user's information, restaurant's information and the user's orders.

- This is a platform where any verified restaurant can come to sell food items. We provide them with our customer base and push offers to customers present in that area that time. Also, a user can come and ask for currently live offers.

- To run the server use the following command - `node Flasbot.js`. There's a dockerfile available for building the image.

- Need to add appropriate facebook page token in `notify.js`, `git.js`.

- `app.js` contains sample menu and sample orders to test the storing and fetching information from the database. To start the sample tests in `app.js` run `apptest.js` file using the following command - `node apptest.js`.

- The modules required by the node server are mentioned in the `package-lock.json` file and installed in the `node_modules` locally i.e., present in the node server.

- `Jenkinsfile` is also present in the root of the repository to start the pipeline in Jenkins if any to ensure CI/CD. The code will be pulled frok git into Jenkins and the pipeline starts to test the server and deploy it using rundeck instance.
