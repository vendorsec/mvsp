import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'
import { aws_secretsmanager as secretsmanager } from 'aws-cdk-lib'

export interface TokenStackProps extends StackProps {
  githubSecretName: string
}

export class TokensStack extends Stack {
  public readonly githubSecret: secretsmanager.ISecret
  constructor(scope: Construct, id: string, props: TokenStackProps) {
    super(scope, id, props)

    this.githubSecret = new secretsmanager.Secret(this, 'GitHubTokenSecret', {
      secretName: props.githubSecretName,
    })
  }
}
