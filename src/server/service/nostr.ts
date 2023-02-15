import { getEventHash, getPublicKey, nip04, signEvent, SimplePool } from 'nostr-tools'
import 'websocket-polyfill'
import { prisma } from '~/server/prisma'
import { Event } from 'nostr-tools/event'

// eslint-disable-next-line @typescript-eslint/no-var-requires
globalThis.crypto = require('crypto').webcrypto

const getConnectedRelays = async () => {
    const pool = new SimplePool()
    const relays = (await prisma.staticData
        .findUnique({ where: { key: 'nostrRelays' } })
        .then((data) => data?.value)) as { relays: string[] }

    const ensuredRelaysAfterSomeTime = await Promise.allSettled(
        relays.relays.map(async (rel, index) => {
            return new Promise(async (resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(undefined)
                }, 1000)
                const connected = pool
                    .ensureRelay(rel)
                    .then((relay) => {
                        if (relay.status === 1) {
                            clearTimeout(timeoutId)
                            resolve(relay.url)
                        } else {
                            reject(undefined)
                        }
                    })
                    .catch((e) => {
                        reject(e)
                        console.log(`Error connecting to relay ${index}: ${e}`)
                    })
            }).catch((e) => {
                console.log(`Error connecting to relay ${index}: ${e}`)
            })
        }),
    ).then((res) =>
        res
            .filter((res) => res.status === 'fulfilled')

            .map((res) => {
                const value = res as PromiseFulfilledResult<string>
                return value.value
            })
            .filter((res) => res),
    )

    return { pool, ensuredRelaysAfterSomeTime }
}

const getKeys = () => {
    const websitePrivateKey = `${process.env.WEBSITE_PRIVATE_NOSTR_KEY}`
    const websitePublicKey = getPublicKey(websitePrivateKey)

    const websiteOwnerRecipientPublicKey = `${process.env.WEBSITE_NOTIFICATION_RECIPIENT_NOSTR_PUBLIC_KEY}`

    return { websitePrivateKey, websitePublicKey, websiteOwnerRecipientPublicKey }
}

export const sendMessageToServerOwner = async (message: string) => {
    const { pool, ensuredRelaysAfterSomeTime } = await getConnectedRelays()
    const { websitePrivateKey, websitePublicKey, websiteOwnerRecipientPublicKey } = getKeys()

    const ciphertext = await nip04.encrypt(websitePrivateKey, websiteOwnerRecipientPublicKey, message)

    const event: Event = {
        kind: 4,
        created_at: Math.floor(Date.now() / 1000),
        pubkey: websitePublicKey,
        tags: [['p', websiteOwnerRecipientPublicKey]],
        content: ciphertext,
    }

    event.id = getEventHash(event)
    event.sig = signEvent(event, websitePrivateKey)

    console.log('ensuredRelaysAfterSomeTime', ensuredRelaysAfterSomeTime)

    pool.publish(ensuredRelaysAfterSomeTime, event)
}

export const sendMessageToPubKey = async (pubKey: string, message: string) => {
    const { pool, ensuredRelaysAfterSomeTime } = await getConnectedRelays()
    const { websitePrivateKey, websitePublicKey } = getKeys()

    const ciphertext = await nip04.encrypt(websitePrivateKey, pubKey, message)

    const event: Event = {
        kind: 4,
        created_at: Math.floor(Date.now() / 1000),
        pubkey: websitePublicKey,
        tags: [['p', pubKey]],
        content: ciphertext,
    }

    event.id = getEventHash(event)
    event.sig = signEvent(event, websitePrivateKey)

    pool.publish(ensuredRelaysAfterSomeTime, event)
}

export const sendPublicWebsiteEventMessage = async (message: string) => {
    const { pool, ensuredRelaysAfterSomeTime } = await getConnectedRelays()
    const { websitePrivateKey, websitePublicKey } = getKeys()

    const event: Event = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        pubkey: websitePublicKey,
        tags: [],
        content: message,
    }

    event.id = getEventHash(event)
    event.sig = signEvent(event, websitePrivateKey)

    pool.publish(ensuredRelaysAfterSomeTime, event)
}
