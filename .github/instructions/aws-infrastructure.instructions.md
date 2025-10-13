---
description: "AWS infrastructure, deployment, and cloud architecture guidelines with mandatory knowledge base consultation"
applyTo: '**/*.{yml,yaml,json,sh,tf,md}'
---

# AWS Infrastructure and Deployment Guidelines

## Core Principle
**MANDATORY**: Before ANY AWS-related design decision, architectural choice, or infrastructure change, you MUST consult the AWS Knowledge base MCP server.

## AWS Knowledge Consultation Requirements

### Pre-Decision Research
- **Service Selection**: Query "AWS [service] best practices", "AWS [service] pricing", "AWS [service] limits"
- **Architecture Patterns**: Research "AWS Well-Architected Framework", "serverless patterns", "microservices AWS"
- **Security Standards**: Validate against "AWS security best practices", "AWS compliance requirements"
- **Cost Optimization**: Check "AWS cost optimization", "AWS pricing calculator", "AWS service costs"
- **Performance**: Research "AWS performance optimization", "AWS scaling patterns"

### Specific Query Examples
- "AWS Lambda cold start optimization"
- "AWS API Gateway rate limiting"
- "AWS S3 bucket security policies"
- "AWS CloudFront caching strategies"
- "AWS Parameter Store vs Secrets Manager"
- "AWS IAM least privilege policies"
- "AWS CloudWatch monitoring best practices"

### Documentation Requirements
- Include AWS Knowledge base findings in all architectural decision comments
- Reference specific AWS documentation in infrastructure code
- Document cost implications and service limits in deployment scripts
- Explain security considerations based on AWS best practices

## Infrastructure as Code
- Use AWS CDK, CloudFormation, or Terraform with AWS provider
- Always validate templates against AWS best practices
- Implement proper resource tagging and naming conventions
- Follow AWS Well-Architected Framework principles

## Deployment Guidelines
- Implement blue-green or canary deployment strategies
- Use AWS CodePipeline, GitHub Actions, or similar CI/CD tools
- Ensure proper environment separation (dev, staging, production)
- Implement automated testing for infrastructure changes

## Security Requirements
- Follow AWS security best practices from Knowledge base
- Implement least privilege access for all IAM roles and policies
- Use AWS Secrets Manager or Parameter Store for sensitive data
- Enable CloudTrail and CloudWatch for monitoring and auditing
- Apply security groups and NACLs appropriately

## Cost Management
- Research AWS pricing before implementing new services
- Implement cost monitoring and alerting
- Use appropriate instance types and scaling policies
- Consider AWS Reserved Instances and Savings Plans for production workloads

## Monitoring and Observability
- Implement comprehensive CloudWatch monitoring
- Set up proper alerting for critical metrics
- Use AWS X-Ray for distributed tracing where applicable
- Implement log aggregation and analysis

## Lambda Function Guidelines
- **Timeout Configuration**: Set appropriate timeouts (e.g., 10s for email sending, 30s for batch processing)
- **Memory Allocation**: Start with 128MB, increase only if needed (monitor Max Memory Used)
- **Environment Variables**: Use for configuration (API keys, bucket names, feature flags)
- **Dependencies**: Package node_modules with function code, consider Lambda Layers for large dependencies
- **Error Handling**: Implement comprehensive try-catch blocks with proper logging
- **S3 Integration**: Use `GetObject`, `PutObject` with proper error handling and retry logic
- **Email Services**: For email sending, ensure timeout is sufficient (3-5 seconds minimum)
- **Security**: Never hardcode secrets, use environment variables or AWS Secrets Manager
- **Testing**: Test locally with SAM CLI before deploying to production

## Email Service Integration
- **Resend**: Modern email service with simple API, suitable for transactional emails
- **AWS SES**: Use for high-volume email, requires domain verification
- **Template Storage**: Store HTML templates in S3 for easy updates without redeployment
- **Character Encoding**: Always use UTF-8 encoding, save files with proper charset
- **Multi-language Support**: Implement language-specific templates in S3
- **Error Handling**: Implement fallback templates for template load failures

Remember: The AWS Knowledge base consultation is not optional - it's a mandatory step in our development process to ensure we follow AWS best practices, optimize costs, and maintain security standards.
