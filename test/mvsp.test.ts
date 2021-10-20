import { expect, matchTemplate, MatchStyle } from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import { HostedZoneStack } from '../aws/HostedZoneStack'

describe('mvsp.dev hosted zone stack', () => {
  it('has exactly one route53 zone', () => {
    const app = new cdk.App()
    const stack = new HostedZoneStack(app, 'HostedZoneTestStack', {
      zoneName: 'example.com',
    })
    expect(stack).to(
      matchTemplate(
        {
          Resources: {
            MvspDevHostedZone3CB72C89: {
              Type: 'AWS::Route53::HostedZone',
              Properties: {
                Name: 'example.com.',
                HostedZoneConfig: {
                  Comment: 'DNS Zone for example.com',
                },
              },
            },
          },
        },
        MatchStyle.EXACT
      )
    )
  })
})
