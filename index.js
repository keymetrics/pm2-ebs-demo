import newrelic from 'newrelic'
import dotenv from 'dotenv'
dotenv.config()

import http from 'http'
import express from 'express'
import postgraphql from 'postgraphql'
import morgan from 'morgan'
import cors from 'cors'
import compression from 'compression'
import helmet from 'helmet'
import hpp from 'hpp'
import throng from 'throng'
import Raven from 'raven'

const DefaultServerConfig = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  timeout: 60000,
  schemaName: process.env.SCHEMA_NAME,
  databaseUrl: process.env.DATABASE_URL,
  sentryDns: process.env.SENTRY_DSN
}

export const createServer = (config) => {
  const __PROD__ = config.nodeEnv === 'production'
  const __TEST__ = config.nodeEnv === 'test'
  const optionsPostgraph = (__PROD__ ? {} : { graphiql: true })
  const app = express()

  if (__PROD__) {
    Raven.config(config.sentryDns).install()
    app.use(Raven.requestHandler())
  }

  app.disable('x-powered-by')
  app.use(morgan((__PROD__ || __TEST__) ? 'combined' : 'dev'))
  app.use(cors())
  app.use(helmet())
  app.use(hpp())
  app.use(compression())
  app.use(postgraphql(config.databaseUrl, config.schemaName, optionsPostgraph))

  if (__PROD__) { app.use(Raven.errorHandler()) }

  const server = http.createServer(app)

  // Heroku dynos automatically timeout after 30s. Set our
  // own timeout here to force sockets to close before that.
  // https://devcenter.heroku.com/articles/request-timeout
  if (config.timeout) {
    server.setTimeout(config.timeout, (socket) => {
      const message = `Timeout of ${config.timeout}ms exceeded`

      socket.end([
        'HTTP/1.1 503 Service Unavailable',
        `Date: ${(new Date).toGMTString()}`,  // eslint-disable-line
        'Content-Type: text/plain',
        `Content-Length: ${message.length}`,
        'Connection: close',
        '',
        message
      ].join(`\r\n`))
    })
  }

  return server
}

const startServer = (serverConfig) => {
  const config = { ...DefaultServerConfig, ...serverConfig }

  const server = createServer(config)
  server.listen(config.port, (err) => {
    if (err) console.log(err)
    console.log(`server ${config.id} listening on port ${config.port}`)
  })
}

if (require.main === module) {
  throng({
    start: (id) => startServer({ id }),
    workers: process.env.WEB_CONCURRENCY || 1,
    lifetime: Infinity
  })
}
