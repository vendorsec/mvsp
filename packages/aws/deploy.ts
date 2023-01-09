#!/usr/bin/env node
import 'source-map-support/register'

import { App } from 'aws-cdk-lib'
import { SesForwarderStack } from './SesForwarderStack'

const tags = { service: 'mvsp.dev' }
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
}

const app = new App()
new SesForwarderStack(app, 'MvspDevSesForwarder', {
  domain: 'mvsp.dev',
  env,
  tags,
})
