import {
  aws_s3 as s3,
  aws_iam as iam,
  aws_cloudfront as cloudfront,
  aws_s3_deployment as deploy,
  Stack,
} from "aws-cdk-lib";
import { Construct } from 'constructs';

export class StaticSite extends Construct {
  constructor(parent: Stack, name: string) {
    super(parent, name);

    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(
      this,
      "StaticSite_OAI"
    );

    const siteBucket = new s3.Bucket(this, "StaticSiteBucket", {
      bucketName: 'soullnik-aws',
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    siteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["S3:GetObject"],
        resources: [siteBucket.arnForObjects("*")],
        principals: [
          new iam.CanonicalUserPrincipal(
            cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "StaticSite-distribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: siteBucket,
              originAccessIdentity: cloudfrontOAI,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
              },
            ],
          },
        ],
      }
    );

    new deploy.BucketDeployment(this, "StaticSite-Bucket-Deployment", {
      sources: [deploy.Source.asset("./dist")],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/*"],
    });
  }
}
