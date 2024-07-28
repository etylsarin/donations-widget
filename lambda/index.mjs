import { SSMClient, ListAssociationsCommand } from "@aws-sdk/client-ssm";
import { GpWebpayRequest, GpWebpayOperation, GpWebpay, GpWebpayRequestCurrency } from "@topmonks/gpwebpay"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
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
  privateKeyPass: '',
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
  const payload = JSON.parse(event.body).parameters
    const request = new GpWebpayRequest(
    GpWebpayOperation.CREATE_ORDER,
    payload.orderNumber,
    payload.amount,
    payload.currency,
    payload.redirect_url
  )
  return formatResponse(client.getRequestUrl(request))
};

var formatResponse = function(body){
  var response = {
    "statusCode": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "isBase64Encoded": false,
    "body": body
  }
  return response
}