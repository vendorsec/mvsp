import { Construct } from 'constructs'
import { Stack, StackProps, Duration } from 'aws-cdk-lib'
import {
  aws_s3 as s3,
  aws_route53 as route53,
  aws_certificatemanager as acm,
  aws_route53_targets as targets,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_lambda_nodejs as lambda,
} from 'aws-cdk-lib'

interface WebStackProps extends StackProps {
  zone: route53.IHostedZone
  aliases: string[]
}

export class WebStack extends Stack {
  public readonly websiteBucket: s3.IBucket
  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props)

    this.websiteBucket = new s3.Bucket(this, 'WebsiteBucket')
    this.websiteBucket.grantPublicAccess()

    const certificate = new acm.Certificate(this, 'WebsiteCertificate', {
      domainName: props.aliases[0],
      subjectAlternativeNames: props.aliases.slice(1),
      validation: acm.CertificateValidation.fromDns(props.zone),
    })

    const headersFunction = new cloudfront.Function(this, 'ResponseFunction', {
      code: cloudfront.FunctionCode.fromFile({
        filePath: './aws/functions/response.js',
      }),
    })

    const uriFunction = new cloudfront.Function(this, 'RequestFunction', {
      code: cloudfront.FunctionCode.fromFile({
        filePath: './aws/functions/request.js',
      }),
    })

    const distribution = new cloudfront.Distribution(
      this,
      'WebsiteDistribution',
      {
        defaultBehavior: {
          origin: new origins.S3Origin(this.websiteBucket),
          functionAssociations: [
            {
              function: uriFunction,
              eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            },
            {
              function: headersFunction,
              eventType: cloudfront.FunctionEventType.VIEWER_RESPONSE,
            },
          ],
        },
        domainNames: props.aliases,
        certificate,
        defaultRootObject: 'index.html',
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 404,
            responsePagePath: '/404.html',
            ttl: Duration.minutes(1),
          },
        ],
      }
    )

    for (const domain of props.aliases) {
      const pascalized = pascalize(domain)

      new route53.ARecord(this, `WebsiteARecord${pascalized}`, {
        zone: props.zone,
        recordName: domain,
        target: route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(distribution)
        ),
      })

      new route53.AaaaRecord(this, `WebsiteAAAARecord${pascalized}`, {
        zone: props.zone,
        recordName: domain,
        target: route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(distribution)
        ),
      })

      new route53.CaaAmazonRecord(this, `WebsiteCAARecord${pascalized}`, {
        zone: props.zone,
        recordName: domain,
      })
    }
  }
}

export function pascalize(text: string): string {
  const result = text
    .replace(/^[_. -]+/, '')
    .toLocaleLowerCase()
    .replace(/[_. -]+([\p{Alpha}\p{N}_]|$)/gu, (_, p1) =>
      p1.toLocaleUpperCase()
    )
    .replace(/\d+([\p{Alpha}\p{N}_]|$)/gu, (m) => m.toLocaleUpperCase())
  return result.charAt(0).toLocaleUpperCase() + result.slice(1)
}
