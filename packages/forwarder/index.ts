import 'source-map-support/register'
import { S3, GetObjectCommand } from '@aws-sdk/client-s3'
import { SESv2, SendEmailCommand } from '@aws-sdk/client-sesv2'
import { DynamoDBClient, BatchGetItemCommand } from '@aws-sdk/client-dynamodb'
import type { ParsedMail, AddressObject } from 'mailparser'
import { simpleParser } from 'mailparser'

import { transform } from './emailTransformer'

if (!process.env.BUCKET)
  throw new Error('The `BUCKET` environment variable must be specified')
const { BUCKET } = process.env
if (!process.env.TABLE)
  throw new Error('The `TABLE` environment variable must be specified')
const { TABLE } = process.env

const s3 = new S3({})
const dynamo = new DynamoDBClient({})
const ses = new SESv2({
  apiVersion: '2019-09-27',
})

export async function handler(event: AWSLambda.SESEvent): Promise<void> {
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
    const entries = transform(parsed, destinations)
    await Promise.all(
      entries.map((e) =>
        e.then((Data) =>
          ses.send(new SendEmailCommand({ Content: { Raw: { Data } } }))
        )
      )
    )
  } catch (e) {
    console.error('Failed to send message. Transporter error:', e)
  }
}

async function getFromS3(messageId: string): Promise<Buffer> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: messageId,
    })
    const { Body } = await s3.send(command)
    if (Body === undefined) throw new Error(`Body is undefined`)
    const data = await Body.transformToByteArray()
    return Buffer.from(data, data.byteOffset, data.byteLength)
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

export function getRecipients(email: ParsedMail): Recipient[] {
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
  const command = new BatchGetItemCommand({
    RequestItems: {
      [TABLE]: {
        Keys: recipients.map((recipient) => ({
          in: { S: recipient.address.toLowerCase() },
        })),
      },
    },
  })
  const { Responses } = await dynamo.send(command)
  if (!Responses) {
    console.warn('No forwarding destinations found')
    return []
  }
  const result: string[] = []
  for (const record of Responses[TABLE].values()) {
    if (record.out && record.out.SS) result.push(...record.out.SS)
  }
  console.log('Found recipients', result)
  return result
}
