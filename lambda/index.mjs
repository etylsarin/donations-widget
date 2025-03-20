import { SSMClient, ListAssociationsCommand } from "@aws-sdk/client-ssm";
import { GpWebpayRequest, GpWebpayOperation, GpWebpay, GpWebpayRequestCurrency } from "@topmonks/gpwebpay"
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
const ssm = new SSMClient();

const input = {
  Bucket: "mc-happy-hearts",
  Key: "gpwebpay-pvk.key",
};

const s3 = new S3Client({});
const command = new GetObjectCommand(input);
const res = await s3.send(command);
const bodyString = await res.Body.transformToString();

const config = {
  gatewayUrl: 'https://test.3dsecure.gpwebpay.com/pgw/order.do',
  privateKey: bodyString,
  privateKeyPass: 'dsfdsfsdfsd',
  merchantNumber: '8888890693',
  publicKey: '1234'
}

const client = new GpWebpay(
  config.merchantNumber,
  config.gatewayUrl,
  config.privateKey,
  config.privateKeyPass,
  config.publicKey
)

export const handler = async (event, context) => {
  if (event.httpMethod == "OPTIONS") {
    return context.done(undefined, cors_data)
}
  const payload = JSON.parse(event.body).parameters

    const request = new GpWebpayRequest(
    GpWebpayOperation.CREATE_ORDER,
    payload.orderNumber,
    payload.amount,
    payload.currency,
    payload.redirect_url
  )
  await logToS3(payload, "audit_logs")
  const response = client.getRequestUrl(request)
  await logToS3(response, "gw_webpay_audit_log")
  return formatResponse(client.getRequestUrl(request))
};

const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "max-age=0, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: 0
};



const cors_headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers" : "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "max-age=0, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: 0
};

const cors_data = {
        multiValueHeaders: {},
        isBase64Encoded: false,
        statusCode: 200,
        headers: cors_headers,
        body: ""
};

var formatResponse = function(body){
  var response = {
    "statusCode": 200,
    "headers": {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin" : "*"
    },
    "isBase64Encoded": false,
    "body": body
  }
  return response
}

const logToS3 = async function (body, prefix) { // Make logToS3 async
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const key = `${prefix}/${timestamp}.json`;
  const input = {
      Bucket: "mc-happy-hearts",
      Key: key,
      Body: JSON.stringify(body),
  };
  const command = new PutObjectCommand(input);
  const response = await s3.send(command); // Use await here
  return response;
};