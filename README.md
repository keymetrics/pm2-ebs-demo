#Using PM2/Keymetrics in AWS Elastic Beanstalk

 * Clone the repo and change directory to it
 * Log in with the AWS Elastic Beanstalk CLI, select a region, and create an app: `eb init`
 * Create an environment and pass in Keymetrics public/secret key: `eb create --envvars KEYMETRICS_PUBLIC=<replace with public key>,KEYMETRICS_SECRET=<replace with secret key>`


You should have an express app running and saying `Hello World!` and printing a message to the console via pm2.

In the Beanstalk logs, you should see pm2 starting and streaming the application startup output: `pm2-beanstalk listening!`.

The application appears in your Keymetrics dashboard with the ip of the machine as server name.
