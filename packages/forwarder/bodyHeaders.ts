import type { AddressObject } from 'mailparser'

type AddressHeaderValue = AddressObject | AddressObject[] | undefined

export function getHtmlHeader(
  from: string,
  date: Date | undefined,
  to: AddressHeaderValue,
  cc: AddressHeaderValue,
  bcc: AddressHeaderValue
): string {
  const ccText = recipientsToString(cc)
  const bccText = recipientsToString(bcc)
  return `
    <b>From:</b> ${from}<br />
    <b>Sent:</b> ${dateToString(date ?? new Date())}<br />
    <b>To:</b> ${recipientsToString(to)}<br />\n`
    + (ccText ? `<b>Cc:</b> ${ccText} <br />\n` : '')
    + (bccText ? `<b>Bcc:</b> ${bccText} <br />\n` : '')
    + `<hr /><br />\n\n`
}

export function getTextHeader(
  from: string,
  date: Date | undefined,
  to: AddressHeaderValue,
  cc: AddressHeaderValue,
  bcc: AddressHeaderValue
): string {
  const ccText = recipientsToString(cc)
  const bccText = recipientsToString(bcc)
  return `From: ${from}
Отправлено: ${dateToString(date ?? new Date())}
To: ${recipientsToString(to)}\n`
+ (ccText ? `Cc: ${ccText}\n` : '')
+ (bccText ? `Bcc: ${bccText}\n` : '')
+ '--------------------------------\n\n'
}

export function recipientsToString(recipients: AddressHeaderValue): string {
  if (!recipients) return ''
  if (!Array.isArray(recipients)) recipients = [recipients]
  return recipients
    .map((r) => {
      return r.value.map(val => {
        const name = val.name
        return name ? `${name} (${val.address})` : val.address
      }).join(', ')
    })
    .join(', ')
}

export function dateToString(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(date)
}
