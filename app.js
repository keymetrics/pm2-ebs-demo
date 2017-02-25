var express = require('express');
var postgraphql = require('postgraphql').postgraphql;

var app = express();

app.use(postgraphql(
  (process.env.DATABASE_URL || 'postgres://localhost:5432'),
  (process.env.SCHEMA_NAME || 'public'),
  (process.env.NODE_ENV === 'production' ? { } : { graphiql: true })
));

app.listen(process.env.PORT || 3000, function () {
  console.log('pm2-beanstalk listening!');
});
