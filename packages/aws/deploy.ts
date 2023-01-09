#!/usr/bin/env node
import 'source-map-support/register'

import { App } from 'aws-cdk-lib'
import { SesForwarderStack } from './SesForwarderStack'

const tags = { service: 'mvsp.dev' }

const app = new App()
new SesForwarderStack(app, 'MvspDevSesForwarder', {
  domain: 'mvsp.dev',
  tags,
})
