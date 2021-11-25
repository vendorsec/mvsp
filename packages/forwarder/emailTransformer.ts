import type { ParsedMail, AttachmentCommon, AddressObject } from 'mailparser'
import type { Options, Attachment } from 'nodemailer/lib/mailer'
import { getHtmlHeader, getTextHeader } from './bodyHeaders'

if (!process.env.DOMAIN)
  throw new Error('The `DOMAIN` environment variable must be specified')
const { DOMAIN } = process.env

export function transform(parsed: ParsedMail, destinations: string[]): Options {
  if (!parsed.from)
    throw new Error('Received mail without From header. Not forwarding')

  const textHeader = getTextHeader(
    fromToString(parsed.from),
    parsed.date,
    parsed.to,
    parsed.cc,
    parsed.bcc
  )

  const htmlHeader = getHtmlHeader(
    fromToString(parsed.from),
    parsed.date,
    parsed.to,
    parsed.cc,
    parsed.bcc
  )

  return {
    from: `forward@${DOMAIN}`,
    bcc: [...destinations],
    subject: parsed.subject,
    text: textHeader + (parsed.text || ''),
    html: parsed.html ? htmlHeader + parsed.html : undefined,
    attachments: convertAttachments(parsed.attachments),
    replyTo: {
      address: parsed.from?.value?.[0].address || '',
      name: parsed.from?.value[0].name,
    },
  }
}

function fromToString(from: AddressObject | undefined): string {
  if (!from) return ''
  return from.value.map(v => v.name ? `${v.name} (${v.address})` : v.address).join(', ')
}

function convertAttachments(attachments: AttachmentCommon[]): Attachment[] {
  return attachments.map((att) => {
    let contentDisposition: string | undefined = att.contentDisposition
    if (contentDisposition !== 'attachment' && contentDisposition !== 'inline')
      contentDisposition = undefined
    return {
      ...att,
      headers: undefined,
      contentDisposition,
    }
  })
}
