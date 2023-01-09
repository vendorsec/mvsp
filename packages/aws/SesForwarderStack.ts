import * as path from 'path'

const FUNCTION_PATH = path.dirname(require.resolve('@mvsp/forwarder'))

import {
  Stack,
  StackProps,
  Duration,
  CfnOutput,
  aws_s3 as s3,
  aws_ses as ses,
  aws_dynamodb as dynamodb,
  aws_ses_actions as sesActions,
  aws_logs as logs,
  aws_iam as iam,
  aws_lambda as lambda,
} from 'aws-cdk-lib'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'

interface SesForwarderStackProps extends StackProps {
  domain: string
  ruleset?: string
}

export class SesForwarderStack extends Stack {
  constructor(scope: Construct, id: string, props: SesForwarderStackProps) {
    super(scope, id, props)

    const mailBucket = new s3.Bucket(this, 'MailBucket', {})

    const aliasTable = new dynamodb.Table(this, 'AliasTable', {
      partitionKey: {
        name: 'in',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: false,
    })

    const forwarder = new NodejsFunction(this, 'ForwarderFunction', {
      logRetention: logs.RetentionDays.INFINITE,
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(FUNCTION_PATH, 'index.ts'),
      bundling: {
        mainFields: ['module', 'main'],
      },
      environment: {
        BUCKET: mailBucket.bucketName,
        DOMAIN: props.domain,
        TABLE: aliasTable.tableName,
      },
      timeout: Duration.seconds(30),
      memorySize: 512,
    })
    aliasTable.grantReadData(forwarder)
    mailBucket.grantRead(forwarder)
    forwarder.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ses:SendRawEmail'],
        resources: ['*'],
        conditions: {
          StringLike: {
            'ses:FromAddress': `*@${props.domain}`,
          },
        },
      })
    )

    const ruleset = props.ruleset
      ? ses.ReceiptRuleSet.fromReceiptRuleSetName(
          this,
          'ReceiptRuleSet',
          props.ruleset
        )
      : new ses.ReceiptRuleSet(this, 'ReceiptRuleSet')

    ruleset.addRule(`Forward${pascalize(props.domain)}`, {
      scanEnabled: true,
      recipients: [props.domain],
      actions: [
        new sesActions.S3({ bucket: mailBucket }),
        new sesActions.Lambda({ function: forwarder }),
      ],
    })

    new CfnOutput(this, 'LogGroup', {
      value: forwarder.logGroup.logGroupName,
    })
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
