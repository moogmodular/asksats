import { getEventHash, getPublicKey, Relay, relayInit, signEvent } from 'nostr-tools'
import 'websocket-polyfill'
import { utf8Encoder } from 'nostr-tools/utils'
import { randomBytes } from 'crypto'
import * as secp256k1 from '@noble/secp256k1'
import { encode as b64encode } from 'base64-arraybuffer'
import { webcrypto as crypto } from 'crypto'
import { prisma } from '~/server/prisma'

function getNormalizedX(key: Uint8Array): Uint8Array {
    return key.slice(1, 33)
}
export async function encrypt(privkey: string, pubkey: string, text: string): Promise<string> {
    const key = secp256k1.getSharedSecret(privkey, '02' + pubkey)
    const normalizedKey = getNormalizedX(key)

    const iv = Uint8Array.from(randomBytes(16))
    const plaintext = utf8Encoder.encode(text)
    const cryptoKey = await crypto.subtle.importKey('raw', normalizedKey, { name: 'AES-CBC' }, false, ['encrypt'])
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, cryptoKey, plaintext)
    const ctb64 = b64encode(new Uint8Array(ciphertext))
    const ivb64 = b64encode(new Uint8Array(iv.buffer))

    return `${ctb64}?iv=${ivb64}`
}

const getRelayStatus = (relay: Relay) => {
    try {
        return relay.status
    } catch (e) {
        return 3
    }
}
const getConnectedRelays = async () => {
    const dbRelays = await prisma.staticData.findUnique({ where: { key: 'nostrRelays' } }).then((data) => data?.value)

    const relayArray = dbRelays as { relays: string[] }

    const relays = await Promise.all(
        relayArray.relays.map(async (relay) => {
            const relayInstance = relayInit(relay)
            await relayInstance.connect()
            return relayInstance
        }),
    )

    return relays.filter((relay) => getRelayStatus(relay) === 1)
}
export const sendDMToWebsiteAccount = async (msg: string) => {
    const publicKey = getPublicKey(`${process.env.WEBSITE_PRIVATE_NOSTR_KEY}`)

    const connectedRelays = await getConnectedRelays()

    const ciphertext = await encrypt(
        `${process.env.WEBSITE_PRIVATE_NOSTR_KEY}`,
        `${process.env.WEBSITE_NOTIFICATION_RECIPIENT_NOSTR_PUBLIC_KEY}`,
        msg,
    )

    const event = {
        id: '',
        sig: '',
        kind: 4,
        created_at: Math.floor(Date.now() / 1000),
        pubkey: publicKey,
        tags: [['p', `${process.env.WEBSITE_NOTIFICATION_RECIPIENT_NOSTR_PUBLIC_KEY}`]],
        content: ciphertext,
    }

    event.id = getEventHash(event)
    event.sig = signEvent(event, `${process.env.WEBSITE_PRIVATE_NOSTR_KEY}`)

    await Promise.all(
        connectedRelays.map(async (relay) => {
            const pub = await relay.publish(event)
            pub.on('ok', () => {
                console.log('ok', msg)
            })
            pub.on('seen', () => {
                console.log('seen')
            })
            pub.on('failed', (err: any) => {
                console.log('failed', err)
            })
            await relay.close()
        }),
    )

    return
}
