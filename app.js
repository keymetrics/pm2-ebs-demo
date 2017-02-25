var express = require('express');
var postgraphql = require('postgraphql').postgraphql;
var morgan = require('morgan');
var cors = require('cors');
var compression = require('compression');
var helmet = require('helmet');

var app = express();
app.disable('x-powered-by');
app.use(morgan('combined'));
app.use(cors());
app.use(compression());
app.use(helmet());

app.use(postgraphql(
  (process.env.DATABASE_URL || 'postgres://localhost:5432'),
  (process.env.SCHEMA_NAME || 'public'),
  (process.env.NODE_ENV === 'production' ? { } : { graphiql: true })
));

app.listen(process.env.PORT || 3000, function () {
  console.log('pm2-beanstalk listening!');
});
