import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { requestProvider } from 'webln'
import { Button, CircularProgress } from '@mui/material'

interface PollingQRCodeProps {
    bolt11: string
}

export const PollingQRCode = ({ bolt11 }: PollingQRCodeProps) => {
    const [showCopied, setShowCopied] = useState(false)
    const [webLNAvailable, setWebLNAvailable] = useState(false)
    const [parent] = useAutoAnimate<HTMLDivElement>()

    const handleUrlStringClick = async () => {
        // await navigator.clipboard.writeText(bolt11)
        setShowCopied(true)
        setTimeout(() => {
            setShowCopied(false)
        }, 2000)
    }

    useEffect(() => {
        const doWebLNCheck = async () => {
            try {
                const webln = await requestProvider()
                await webln
                    .getInfo()
                    .then((info) => {
                        setWebLNAvailable(true)
                        return info
                    })
                    .catch((e) => {
                        console.log('WebLn error: ', e)
                    })
            } catch (e) {
                console.log('WebLn error: ', e)
            }
        }
        void doWebLNCheck()
    }, [])

    return (
        <div ref={parent} className={'flex flex-col items-center justify-center gap-8'}>
            <QRCodeSVG value={bolt11} level={'Q'} size={250} />
            <CircularProgress />
            <div id={'bolt11-text'} className={'max-w-3xl break-all text-center'} onClick={handleUrlStringClick}>
                {bolt11}
            </div>

            {showCopied && <div>ln-url copied to clipboard!</div>}
            {webLNAvailable && (
                <a href={`lightning:${bolt11}`}>
                    <Button variant={'contained'} component="div" color={'info'}>
                        WebLN
                    </Button>
                </a>
            )}
        </div>
    )
}
