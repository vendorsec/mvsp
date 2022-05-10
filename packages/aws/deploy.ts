#!/usr/bin/env node
import 'source-map-support/register'

import { App } from 'aws-cdk-lib'
import { HostedZoneStack } from './HostedZoneStack'
import { WebStack } from './WebStack'
import { TokensStack } from './TokensStack'
import { CICDStack } from './CICDStack'
import {SesForwarderStack} from './SesForwarderStack'

const ZONE_NAME = 'mvsp.dev'
const tags = { service: 'mvsp.dev' }
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
}

const app = new App()

const zoneStack = new HostedZoneStack(app, 'MvspDevRoute53Zone', {
  zoneName: ZONE_NAME,
  terminationProtection: true,
  tags,
})

const webstack = new WebStack(app, 'MvspDevWebStack', {
  zone: zoneStack.zone,
  aliases: ['mvsp.dev', 'www.mvsp.dev'],
  tags,
})

const tokenStack = new TokensStack(app, 'MvspDevGitHubToken', {
  githubSecretName: '/mvsp/github',
  tags,
})

new CICDStack(app, 'MvspDevCICDStack', {
  codeBuildImage: 'public.ecr.aws/docker/library/node:18-bullseye',
  github: {
    owner: 'vendorsec',
    repo: 'mvsp',
    branch: 'master',
    secret: tokenStack.githubSecret,
  },
  websiteBucket: webstack.websiteBucket,
  tags,
})


new SesForwarderStack(app, 'MvspDevSesForwarder', {
  domain: 'mvsp.dev',
  env,
  tags,
})