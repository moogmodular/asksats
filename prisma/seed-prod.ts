import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    await prisma.staticData.deleteMany()
    await prisma.staticData.create({
        data: {
            key: 'wallets',
            value: [
                {
                    name: 'Alby',
                    url: 'https://getalby.com/',
                },
                {
                    name: 'Balance of Satoshis',
                    url: 'https://github.com/alexbosworth/balanceofsatoshis',
                },
                {
                    name: 'Blixt',
                    url: 'https://blixtwallet.github.io/',
                },
                {
                    name: 'Breez',
                    url: 'https://breez.technology/',
                },
                {
                    name: 'BlueWallet',
                    url: 'https://bluewallet.io/',
                },
                {
                    name: 'Clams',
                    url: 'http://clamclient.com/',
                },
                {
                    name: 'coinos',
                    url: 'https://coinos.io/',
                },
                {
                    name: 'LifPay',
                    url: 'https://lifpay.me/',
                },
                {
                    name: 'LNbits',
                    url: 'https://lnbits.com/',
                },
                {
                    name: 'LightningTipBot',
                    url: 'https://github.com/LightningTipBot',
                },
                {
                    name: 'Phoenix',
                    url: 'https://phoenix.acinq.co/',
                },
                {
                    name: 'SeedAuth',
                    url: 'https://play.google.com/store/apps/details?id=net.dfocus.seedauth&hl=en&gl=US',
                },
                {
                    name: 'SeedAuthExtension',
                    url: 'https://github.com/pseudozach/seedauthextension',
                },
                {
                    name: 'SimpleBitcoinWallet',
                    url: 'https://sbw.app/',
                },
                {
                    name: 'Sparrow Wallet',
                    url: 'https://sparrowwallet.com/',
                },
                {
                    name: 'ThunderHub',
                    url: 'https://thunderhub.io/',
                },
                {
                    name: 'Zap Desktop',
                    url: 'https://zaphq.io/',
                },
                {
                    name: 'Zeus',
                    url: 'https://zeusln.app/',
                },
            ],
        },
    })

    await prisma.staticData.create({
        data: {
            key: 'welcomeMessage',
            value: {
                message:
                    "Welcome to ArtiSats! We're excited to have you join our community of image traders. With **ArtiSats**, you can place asks for specific images, and other users can place offers to fulfill those asks. You can also browse and place offers on asks posted by other users. Remember, you can choose from three different ask types: **private**, **public**, or **bump public**. Private asks are only **visible to you**, public asks can be **bumped by other users and are visible to the entire community** upon successful settlement, and bump public asks are similar to public asks but only users who have bumped the ask with at **least 10% of the current sum** can see the final image upon successful settlement. Thank you for joining **ArtiSats**, and happy trading!",
            },
        },
    })

    await prisma.staticData.create({
        data: {
            key: 'aboutMessage',
            value: {
                message:
                    'ArtiSats is a custodial, level 3, lightning network powered web platform where you can buy and sell art, photos, sketches, AI generated images and soon more with Bitcoin. The platform is based on a system of auctions.\n' +
                    'There are three types of asks: **private**, **public** and **bump public**. **Private asks** are only visible to you, **public asks** can be bumped by other users and are visible to the entire community upon successful settlement, and **bump public** asks are similar to public asks but only users who have bumped the ask with at least 10% of the current sum can see the final image upon successful settlement.',
            },
        },
    })

    await prisma.staticData.create({
        data: {
            key: 'nostrRelays',
            value: {
                relays: [
                    'wss://nostr-relay.wlvs.space',
                    'wss://relay.damus.io',
                    'wss://nostr-pub.wellorder.net',
                    'wss://relay.nostr.info',
                    'wss://nostr.bitcoiner.social',
                    'wss://nostr.onsats.org',
                    'wss://nostr.oxtr.dev',
                    'wss://nostr.fmt.wiz.biz',
                ],
            },
        },
    })
}

main()
    .catch((e) => {
        // console.error(e)
        // process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
