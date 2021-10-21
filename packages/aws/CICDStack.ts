import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'
import {
  aws_codepipeline as codepipeline,
  aws_codepipeline_actions as actions,
  aws_codebuild as codebuild,
  aws_secretsmanager as secrets,
  aws_s3 as s3,
} from 'aws-cdk-lib'

export interface CICDStackProps extends StackProps {
  codeBuildImage: string
  github: {
    owner: string
    repo: string
    branch: string
    secret: secrets.ISecret
  }
  websiteBucket: s3.IBucket
}

export class CICDStack extends Stack {
  constructor(scope: Construct, id: string, props: CICDStackProps) {
    super(scope, id, props)

    const build = new codebuild.PipelineProject(this, 'CodeBuildProject', {
      projectName: this.stackName,
      environmentVariables: {},
      cache: codebuild.Cache.local(codebuild.LocalCacheMode.CUSTOM),
      environment: {
        buildImage: codebuild.LinuxBuildImage.fromDockerRegistry(
          props.codeBuildImage
        ),
        computeType: codebuild.ComputeType.SMALL,
      },
    })

    const sourceOutput = new codepipeline.Artifact()
    const immutableAssetsOutput = new codepipeline.Artifact('ImmutableAssets')
    const notCachedAssetsOutput = new codepipeline.Artifact('NotCachedAssets')
    new codepipeline.Pipeline(this, 'CodePipeline', {
      artifactBucket: new s3.Bucket(this, 'CodePipelineArtifactsBucket', {
        encryption: s3.BucketEncryption.KMS_MANAGED, // to prevent creating KMS keys (they cost money)
      }),
      stages: [
        {
          stageName: 'Source',
          actions: [
            new actions.GitHubSourceAction({
              actionName: 'GitHub_Source',
              owner: props.github.owner,
              repo: props.github.repo,
              branch: props.github.branch,
              oauthToken: props.github.secret.secretValue,
              output: sourceOutput,
            }),
          ],
        },
        {
          stageName: 'Build',
          actions: [
            new actions.CodeBuildAction({
              actionName: 'CodeBuild',
              project: build,
              input: sourceOutput,
              outputs: [immutableAssetsOutput, notCachedAssetsOutput],
            }),
          ],
        },
        {
          stageName: 'Deploy',
          actions: [
            new actions.S3DeployAction({
              actionName: 'DeployNotCached',
              bucket: props.websiteBucket,
              input: notCachedAssetsOutput,
              extract: true,
              cacheControl: [
                actions.CacheControl.fromString(
                  'public, max-age=0, must-revalidate'
                ),
              ],
            }),
            new actions.S3DeployAction({
              actionName: 'DeployImmutable',
              bucket: props.websiteBucket,
              input: immutableAssetsOutput,
              extract: true,
              cacheControl: [
                actions.CacheControl.fromString(
                  'public, max-age=31536000, immutable'
                ),
              ],
            }),
          ],
        },
      ],
    })
  }
}
