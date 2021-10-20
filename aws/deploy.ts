#!/usr/bin/env node
import 'source-map-support/register'

import { App, Aspects } from 'aws-cdk-lib'
import { HostedZoneStack } from './HostedZoneStack'
import { WebStack } from './WebStack'
import { TokensStack } from './TokensStack'
import { CICDStack } from './CICDStack'
import { PermissionsBoundaryAspect } from './PermissionsBoundaryAspect'

const ZONE_NAME = 'mvsp.dev'
const tags = { mvsp: 'mvsp', p_confidentiality: 'Public' }
const permBoundary = 'arn:aws:iam::036627352396:policy/PCSKPermissionsBoundary'

const app = new App()

const zoneStack = new HostedZoneStack(app, 'MvspDevRoute53Zone', {
  zoneName: ZONE_NAME,
  terminationProtection: true,
  tags,
})
Aspects.of(zoneStack).add(new PermissionsBoundaryAspect(permBoundary))

const webstack = new WebStack(app, 'MvspDevWebStack', {
  zone: zoneStack.zone,
  aliases: ['mvsp.dev', 'www.mvsp.dev'],
  tags,
})
Aspects.of(webstack).add(new PermissionsBoundaryAspect(permBoundary))

const tokenStack = new TokensStack(app, 'MvspDevGitHubToken', {
  githubSecretName: '/mvsp/github',
  tags,
})
Aspects.of(tokenStack).add(new PermissionsBoundaryAspect(permBoundary))

const ciCdStack = new CICDStack(app, 'MvspDevCICDStack', {
  codeBuildImage: 'public.ecr.aws/bitnami/node:14',
  github: {
    owner: 'sfdc-entsec',
    repo: 'mvsp',
    branch: 'master',
    secret: tokenStack.githubSecret,
  },
  websiteBucket: webstack.websiteBucket,
  tags,
})
Aspects.of(ciCdStack).add(new PermissionsBoundaryAspect(permBoundary))
