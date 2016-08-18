Using PM2/Keymetrics in AWS Elastic Beanstalk

 * Clone the repo and change directory to it
 * Log in with the AWS Elastic Beanstalk CLI, select a region, and create an app: `eb init`
 * Create an environment and pass in Keymetrics public/secret key: eb create --envvars KEYMETRICS_PUBLIC=<replace with public key>,KEYMETRICS_SECRET=<replace with secret key>
