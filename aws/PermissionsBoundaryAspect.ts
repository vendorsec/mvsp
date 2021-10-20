import type { IConstruct } from 'constructs'
import type { IAspect } from 'aws-cdk-lib'
import { aws_iam as iam } from 'aws-cdk-lib'

export class PermissionsBoundaryAspect implements IAspect {
  private readonly permissionsBoundaryArn: string

  constructor(permissionBoundaryArn: string) {
    this.permissionsBoundaryArn = permissionBoundaryArn
  }

  public visit(node: IConstruct): void {
    if (node instanceof iam.Role) {
      const roleResource = node.node.findChild('Resource') as iam.CfnRole
      roleResource.addPropertyOverride(
        'PermissionsBoundary',
        this.permissionsBoundaryArn
      )
    }
  }
}
