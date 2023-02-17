import { RouterOutput, trpc } from '~/utils/trpc'
import { useEffect, useState } from 'react'
import { PollingQRCode } from '~/components/common/PollingQRCode'
import { useActionStore } from '~/store/actionStore'
import { useStore } from 'zustand'
import { authedUserStore } from '~/store/authedUserStore'
import { Chip } from '@mui/material'

type LoginUrlResponse = RouterOutput['auth']['loginUrl']

export const Authenticate = ({}) => {
    const utils = trpc.useContext()
    const { storeToken, storeLogin } = useStore(authedUserStore)
    const { setCurrentModal } = useActionStore()

    const [loginUrl, setLoginUrl] = useState<LoginUrlResponse>({ secret: '', encoded: '' })
    const [localStorageToken, setLocalstorageToken] = useState<string | null>()

    const { data: dataWallets } = trpc.staticData.walletList.useQuery()

    trpc.auth.isLoggedIn.useQuery(
        { secret: loginUrl?.secret },
        {
            refetchInterval: (data) => {
                if (!storeToken && !localStorageToken) {
                    if (!data?.user) {
                        return 1000
                    }
                    storeLogin(data.user)
                    if (!data?.lastLogin) {
                        setTimeout(() => {
                            setCurrentModal('welcome')
                        }, 1000)
                    }
                    // utils.invalidate()
                    return false
                }
                return false
            },
        },
    )

    useEffect(() => {
        // const token = localStorage.getItem('token')
        // setLocalstorageToken(token)
        utils.auth.loginUrl.fetch().then((data) => {
            setLoginUrl(data)
        })
    }, [])

    return (
        <div className={'flex flex-col items-center gap-4'}>
            <div className={'text-center'}>
                If you dont already have a <b>ln-url compliant Bitcoin wallet</b>, here is a list of candidates in
                alphabetical order:
            </div>
            {dataWallets && (
                <div className={'flex flex-wrap justify-center gap-1'}>
                    {dataWallets.map((wallet, index) => {
                        return (
                            <a key={index} href={wallet.url} className={'underline hover:text-blue-500'}>
                                {wallet.name}
                                {index !== dataWallets.length - 1 && ', '}
                            </a>
                        )
                    })}
                </div>
            )}
            <div className={'flex flex-row'}>
                <div className={'bg-primary p-4'}>
                    <div className={'mb-3 font-bold'}>Recommended:</div>
                    <div className={'flex flex-col gap-2'}>
                        <div className={'flex flex-row gap-2'}>
                            <b>mobile:</b>
                            <Chip label="Breez" component="a" href="https://breez.technology/" clickable />
                            <Chip label="Blixt" component="a" href="https://blixtwallet.github.io/" clickable />
                            <Chip label="Blue Wallet" component="a" href="https://bluewallet.io/" clickable />
                        </div>
                        <div className={'flex flex-row gap-2'}>
                            <b>desktop:</b>
                            <Chip label="Alby" component="a" href="https://getalby.com//" clickable />
                            <Chip label="Zap" component="a" href="https://zaphq.io/download/" clickable />
                        </div>
                    </div>
                </div>

                <img className={'aspect-square w-32'} src="/scan_qr.png" />
            </div>

            <PollingQRCode bolt11={loginUrl.encoded} />
        </div>
    )
}
