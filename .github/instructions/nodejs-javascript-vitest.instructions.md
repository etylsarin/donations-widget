---
description: "Guidelines for writing Node.js and JavaScript code with Vitest testing"
applyTo: '**/*.js, **/*.mjs, **/*.cjs'
---

# Code Generation Guidelines

## Coding standards
- Use JavaScript with ES2022 features and Node.js (20+) ESM modules
- Use Node.js built-in modules and avoid external dependencies where possible
- Ask the user if you require any additional dependencies before adding them
- Always use async/await for asynchronous code, and use 'node:util' promisify function to avoid callbacks
- Keep the code simple and maintainable
- Use descriptive variable and function names
- Do not add comments unless absolutely necessary, the code should be self-explanatory
- Never use `null`, always use `undefined` for optional values
- Prefer functions over classes

## Testing
- Use Vitest for testing
- Write tests for all new features and bug fixes
- Ensure tests cover edge cases and error handling
- NEVER change the original code to make it easier to test, instead, write tests that cover the original code as it is

## Documentation
- When adding new features or making significant changes, update the README.md file where necessary

## AWS Knowledge Consultation
- **MANDATORY**: Before making any design decisions involving AWS services, Lambda functions, or cloud architecture, consult the AWS Knowledge base MCP server
- Query the AWS Knowledge base for best practices, service limits, cost implications, and security considerations
- Use specific queries like "AWS Lambda Node.js best practices", "serverless security patterns", "AWS S3 bucket policies", etc.
- Include AWS Knowledge base insights in your reasoning when proposing solutions
- Document AWS best practices findings in code comments when implementing AWS-related functionality

## Lambda Function Best Practices
- **Configuration Constants**: Define all configuration values as constants at the top of the file
  - Use `process.env.VARIABLE_NAME || 'default-value'` pattern for environment variables
  - Document magic numbers with descriptive constant names
- **Error Handling**: Implement comprehensive try-catch blocks with proper logging and user-friendly error messages
- **Input Validation**: Validate all user inputs before processing (type checking, format validation, path traversal prevention)
- **Security**: Never hardcode secrets, always use environment variables or AWS Secrets Manager
- **Logging**: Use console.log/error/warn with context (order IDs, request IDs) for debugging
- **Timeout Management**: Set appropriate timeouts based on operation (3-5s for API calls, 10s+ for email sending)
- **S3 Operations**: Use proper charset encoding (UTF-8), implement retry logic, handle errors gracefully
- **Template Management**: Store HTML templates in S3 for easy updates without redeployment
- **Character Encoding**: Always specify UTF-8 encoding when reading/writing files and sending emails

## User interactions
- Ask questions if you are unsure about the implementation details, design choices, or need clarification on the requirements
- Always answer in the same language as the question, but use english for the generated content like code, comments or docs
