import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'
import { aws_route53 as route53 } from 'aws-cdk-lib'

interface HostedZoneStackProps extends StackProps {
  zoneName: string
}

export class HostedZoneStack extends Stack {
  public readonly zone: route53.IHostedZone

  constructor(scope: Construct, id: string, props: HostedZoneStackProps) {
    super(scope, id, props)

    this.zone = new route53.HostedZone(this, 'MvspDevHostedZone', {
      zoneName: props.zoneName,
      comment: `DNS Zone for ${props.zoneName}`,
    })
  }
}
