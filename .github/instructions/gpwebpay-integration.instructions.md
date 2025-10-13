---
applyTo: '**/*.{js,mjs,ts,jsx,tsx}'
description: "GP Webpay payment gateway integration instructions based on official API documentation v1.19"
---

# GP Webpay Payment Gateway Integration Instructions

## Overview

You are implementing secure payment processing using GP Webpay (Global Payments) gateway integration. Follow these guidelines based on the official GP Webpay HTTP API v1.19 and Web Service API v1.19 documentation.

## API Selection Guide

### HTTP API vs WebService API

**Current Implementation**: Your Lambda function uses HTTP API (recommended for most donation widgets)

#### HTTP API (Current Choice) - Recommended for:
- ✅ Simple donation processing
- ✅ Quick integration with minimal complexity
- ✅ Standard payment flows
- ✅ Form-based parameter passing
- ✅ Direct browser redirects

#### WebService API - Consider when you need:
- 🔄 Real-time payment status checking (`getPaymentStatus()`)
- 🔄 Partial refund capabilities
- 🔄 Batch processing and reconciliation
- 🔄 Enhanced customer data collection
- 🔄 Recurring donation setup
- 🔄 Advanced fraud detection features

**Note**: WebService API requires SOAP client implementation and significantly more complex integration.

## Core Implementation Principles

### Security Requirements
- **MANDATORY**: All payment requests must be digitally signed using RSA private key
- **MANDATORY**: Validate all responses using GP Webpay public key
- **MANDATORY**: Use HTTPS for all communications with GP Webpay gateway
- **MANDATORY**: Store private keys securely (AWS Parameter Store/S3 with encryption)
- **MANDATORY**: Log all payment transactions for audit purposes
- **MANDATORY**: Implement proper error handling for all payment scenarios

### Environment Configuration
```javascript
// Environment-based configuration
const environments = {
  test: {
    gatewayUrl: 'https://test.3dsecure.gpwebpay.com/pgw/order.do',
    merchantNumber: '8888890693', // Test merchant
    publicKey: 'test-public-key'
  },
  production: {
    gatewayUrl: 'https://3dsecure.gpwebpay.com/pgw/order.do',
    merchantNumber: 'REAL_MERCHANT_NUMBER',
    publicKey: 'production-public-key'
  }
};
```

## Required Parameters

### CREATE_ORDER Operation (Mandatory)
- **MERCHANTNUMBER**: Merchant identification (assigned by GP Webpay)
- **OPERATION**: Always 'CREATE_ORDER' for new payments
- **ORDERNUMBER**: Unique order identifier (max 15 characters, alphanumeric)
- **AMOUNT**: Payment amount in cents (e.g., 10000 = 100.00 CZK)
- **CURRENCY**: ISO 4217 currency code (CZK=203, EUR=978, USD=840)
- **URL**: Return URL after payment completion
- **DIGEST**: Digital signature of the request

### Optional Parameters
- **LANG**: Language code for payment gateway UI (cs, en, sk, de, etc.)
- **DEPOSITFLAG**: Auto-deposit flag (0=manual, 1=automatic)
- **MERORDERNUM**: Additional merchant order reference
- **ADDINFO**: Additional cardholder information (XML format)

## Digital Signature Implementation

### Creating DIGEST Parameter
```javascript
// Parameters must be concatenated in specific order for signing
const signatureString = [
  merchantNumber,
  operation,
  orderNumber,
  amount,
  currency,
  depositFlag,
  url
].filter(param => param !== undefined).join('|');

// Sign with RSA-SHA1
const digest = signWithPrivateKey(signatureString, privateKey, privateKeyPass);
```

### Response Validation
```javascript
// Validate response signature to prevent tampering
const responseSignature = [
  operation,
  orderNumber,
  merordernum,
  md,
  prcode,
  srcode,
  resulttext
].filter(param => param !== undefined).join('|');

const isValid = verifyWithPublicKey(responseSignature, digest1, publicKey);
```

## Response Codes & Error Handling

### Primary Response Code (PRCODE)
- **0**: Success - payment approved
- **1-5**: Various error conditions
- **14**: Duplicate order number
- **15**: Payment timeout
- **16**: Payment cancelled by user
- **17**: Payment declined by bank

### Secondary Response Code (SRCODE)
- Provides additional detail for PRCODE values
- Use for detailed error reporting and user feedback

### Error Handling Pattern
```javascript
const handlePaymentResponse = (response) => {
  const { PRCODE, SRCODE, RESULTTEXT } = response;
  
  switch (PRCODE) {
    case '0':
      return { success: true, message: 'Payment completed successfully' };
    case '14':
      return { success: false, error: 'DUPLICATE_ORDER', message: 'Order number already exists' };
    case '15':
      return { success: false, error: 'TIMEOUT', message: 'Payment session expired' };
    case '16':
      return { success: false, error: 'CANCELLED', message: 'Payment cancelled by user' };
    case '17':
      return { success: false, error: 'DECLINED', message: 'Payment declined by bank' };
    default:
      return { success: false, error: 'UNKNOWN', message: RESULTTEXT || 'Payment failed' };
  }
};
```

## Currency Support

### Supported Currencies (ISO 4217)
```javascript
const supportedCurrencies = {
  'CZK': 203,
  'EUR': 978,
  'USD': 840,
  'GBP': 826,
  'CHF': 756,
  'HUF': 348,
  'PLN': 985
};
```

### Amount Formatting
- **CZK, EUR, USD, GBP, CHF**: Amount in cents (100 = 1.00)
- **HUF**: Amount in fillér (100 = 1.00 HUF)
- **JPY**: Amount in yen (no decimal places)

## Language Support

### Supported Language Codes
```javascript
const supportedLanguages = {
  'cs': 'Czech',
  'en': 'English', 
  'sk': 'Slovak',
  'de': 'German',
  'ru': 'Russian',
  'fr': 'French'
};

// Language fallback logic
const getLanguageCode = (requestLang) => {
  const lang = requestLang?.toLowerCase()?.slice(0, 2);
  return supportedLanguages[lang] ? lang : 'en'; // Default to English
};
```

## Order Number Requirements

### Format Rules
- **Length**: Maximum 15 characters
- **Characters**: Alphanumeric only (A-Z, 0-9)
- **Uniqueness**: Must be unique per merchant
- **Recommendation**: Include timestamp or UUID for uniqueness

```javascript
const generateOrderNumber = (prefix = 'ORD') => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp.slice(-8)}${random}`.substring(0, 15);
};
```

## Additional Cardholder Information (ADDINFO)

### XML Structure for Enhanced Security
```xml
<additionalInfoRequest version="5.0" xmlns="http://gpe.cz/gpwebpay/additionalInfo/request">
  <cardholderInfo>
    <cardholderDetails>
      <email>customer@example.com</email>
      <name>John Doe</name>
      <address>
        <street>Main Street 123</street>
        <city>Prague</city>
        <zip>12000</zip>
        <country>CZ</country>
      </address>
    </cardholderDetails>
  </cardholderInfo>
</additionalInfoRequest>
```

## Testing & Validation

### Test Card Numbers (Test Environment Only)
- **Visa**: 4056070000000008
- **Mastercard**: 5413330300001001
- **Diners**: 36006666333344
- Use only in test environment with test merchant number

### Validation Checklist
- [ ] All mandatory parameters present
- [ ] Order number uniqueness verified
- [ ] Amount and currency validation
- [ ] Digital signature correctly generated
- [ ] Response signature verification
- [ ] Error handling for all scenarios
- [ ] Proper logging and audit trail

## Security Best Practices

### Private Key Management
- Store private keys in AWS Parameter Store (SecureString)
- Never commit private keys to source control
- Use different keys for test and production
- Rotate keys according to security policy

### Request Validation
- Validate all input parameters before sending to GP Webpay
- Sanitize order numbers and amounts
- Implement rate limiting for payment requests
- Log all payment attempts for fraud detection

### Response Handling
- Always verify response signatures
- Handle all possible response codes
- Implement proper error messages for users
- Never expose internal error details to frontend

## Monitoring & Logging

### Required Audit Logging
```javascript
const auditLog = {
  timestamp: new Date().toISOString(),
  orderId: orderNumber,
  merchantNumber: merchantNumber,
  amount: amount,
  currency: currency,
  operation: 'CREATE_ORDER',
  response: {
    prcode: response.PRCODE,
    srcode: response.SRCODE,
    resulttext: response.RESULTTEXT
  },
  clientIP: event.requestContext?.http?.sourceIp,
  userAgent: event.headers?.['user-agent']
};
```

### Performance Monitoring
- Monitor payment gateway response times
- Track success/failure rates
- Alert on unusual error patterns
- Monitor for duplicate order attempts

## Integration with Current Implementation

Your current Lambda function correctly implements:
- ✅ Environment-based configuration
- ✅ Secure parameter retrieval from AWS Parameter Store
- ✅ Digital signature handling via @topmonks/gpwebpay library
- ✅ S3 audit logging
- ✅ CORS handling for frontend integration
- ✅ Language support with fallback

## Code Examples

### Complete Payment Request
```javascript
import { GpWebpayRequest, GpWebpayOperation, GpWebpay } from "@topmonks/gpwebpay";

const createPaymentRequest = async (paymentData) => {
  const { orderNumber, amount, currency, returnUrl, language } = paymentData;
  
  // Validate input
  if (!orderNumber || !amount || !currency || !returnUrl) {
    throw new Error('Missing required payment parameters');
  }
  
  // Create GP Webpay request
  const request = new GpWebpayRequest(
    GpWebpayOperation.CREATE_ORDER,
    orderNumber,
    amount,
    currency,
    returnUrl
  );
  
  // Set optional parameters
  request.lang = getLanguageCode(language);
  
  // Generate payment URL
  const client = new GpWebpay(
    merchantNumber,
    gatewayUrl,
    privateKey,
    privateKeyPassword,
    publicKey
  );
  
  return client.getRequestUrl(request);
};
```

## API Migration Considerations

### When to Consider WebService API Migration

Evaluate migrating from HTTP API to WebService API if you need:

1. **Real-Time Status Checking**
   ```javascript
   // WebService API advantage
   const status = await gpWebpayClient.getPaymentStatus(orderNumber);
   // HTTP API requires polling or webhook setup
   ```

2. **Partial Refunds**
   ```javascript
   // WebService API supports partial amounts
   await gpWebpayClient.refundPayment(orderNumber, partialAmount);
   // HTTP API only supports full refunds
   ```

3. **Enhanced Customer Data**
   ```xml
   <!-- WebService API structured data -->
   <customerInfo>
     <firstName>John</firstName>
     <lastName>Doe</lastName>
     <email>john@example.com</email>
     <address>...</address>
   </customerInfo>
   ```

### Migration Checklist
- [ ] Assess required WebService-only features
- [ ] Implement SOAP client (e.g., `soap` npm package)
- [ ] Update parameter mapping from form data to XML
- [ ] Enhance error handling for XML responses
- [ ] Test all operations in GP Webpay test environment
- [ ] Plan gradual rollout with fallback capability

## Current Implementation Validation

Your HTTP API implementation correctly covers:
- ✅ Standard donation processing workflow
- ✅ Secure parameter handling and digital signatures
- ✅ Proper error response handling
- ✅ Currency and language support
- ✅ Audit logging and compliance

**Recommendation**: Continue with HTTP API unless specific WebService features are required for your donation platform.

Remember: Always consult the official GP Webpay documentation for the most current requirements and test thoroughly in the test environment before production deployment.
