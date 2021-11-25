import 'source-map-support/register'
import S3 from 'aws-sdk/clients/s3'
import SES from 'aws-sdk/clients/ses'
import DynamoDB from 'aws-sdk/clients/dynamodb'
import nodemailer from 'nodemailer'
import type { ParsedMail, AddressObject } from 'mailparser'
import { simpleParser } from 'mailparser'

import { transform } from './emailTransformer'

if (!process.env.BUCKET)
  throw new Error('The `BUCKET` environment variable must be specified')
const { BUCKET } = process.env
if (!process.env.TABLE)
  throw new Error('The `TABLE` environment variable must be specified')
const { TABLE } = process.env

const s3 = new S3()
const transporter = nodemailer.createTransport({
  SES: new SES({ apiVersion: '2010-12-01' }),
})
const dbClient = new DynamoDB.DocumentClient()

export async function handler(event: AWSLambda.SESEvent): Promise<void> {
  // console.log('event', JSON.stringify(event, null, 2))
  const record = event.Records[0].ses
  const messageId = record.mail.messageId
  const fromRaw = record.mail.commonHeaders.from?.[0]
  const toRaw = record.mail.commonHeaders.to?.join(', ')
  console.log(`Received message ID ${messageId} from ${fromRaw} to ${toRaw}`)
  const receipt = record.receipt
  if (
    receipt.spamVerdict.status === 'FAIL' ||
    receipt.virusVerdict.status === 'FAIL'
  ) {
    console.warn(
      `The message ${messageId} from ${fromRaw} is spam or virus. Not forwarding`
    )
    return
  }

  const message = await getFromS3(messageId)
  const parsed = await simpleParser(message)

  if (!parsed.from) {
    console.error('Received mail without From header. Not forwarding')
    return
  }

  const recipients = getRecipients(parsed)
  const destinations = await getForwardingDestinations(recipients)
  if (destinations.length === 0) {
    console.warn('No recipients found for this destination. Not forwarding')
    return
  }

  try {
    await transporter.sendMail(transform(parsed, destinations))
  } catch (e) {
    console.error('Failed to send message. Transporter error:', e)
  }
}

async function getFromS3(messageId: string): Promise<Buffer> {
  try {
    const { Body: data } = await s3
      .getObject({
        Bucket: BUCKET,
        Key: messageId,
      })
      .promise()
    if (!(data instanceof Buffer))
      throw new Error(
        `Unexpected type of the S3 bucket object body: '${typeof data}'. Expected Buffer`
      )
    return data
  } catch (e) {
    throw new Error(
      `Could not fetch message ID ${messageId} from S3 bucket: ${e}`
    )
  }
}

export interface Recipient {
  name: string
  address: string
}

function getRecipients(email: ParsedMail): Recipient[] {
  function getRecipientList(
    addrObjects: AddressObject | AddressObject[] | undefined
  ): Recipient[] {
    const recipients: Recipient[] = []
    if (addrObjects === undefined) return []
    if (!Array.isArray(addrObjects)) addrObjects = [addrObjects]
    for (const addrObject of addrObjects) {
      for (const value of addrObject.value) {
        if (value.address)
          recipients.push({
            name: value.name,
            address: value.address,
          })
      }
    }
    return recipients
  }
  return getRecipientList(email.to)
    .concat(getRecipientList(email.cc))
    .concat(getRecipientList(email.bcc))
}

async function getForwardingDestinations(
  recipients: Recipient[]
): Promise<string[]> {
  const { Responses } = await dbClient
    .batchGet({
      RequestItems: {
        [TABLE]: {
          Keys: recipients.map((recipient) => ({
            in: recipient.address.toLowerCase(),
          })),
        },
      },
    })
    .promise()
  if (!Responses) {
    console.warn('No forwarding destinations found')
    return []
  }
  const result: string[] = []
  for (const record of Responses[TABLE].values()) {
    if (
      record.out &&
      record.out.wrapperName === 'Set' &&
      record.out.type === 'String'
    )
      result.push(...(record.out.values as string[]))
  }
  console.log('Found recipients', result)
  return result
}
