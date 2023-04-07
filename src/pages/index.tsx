import { trpc } from '../utils/trpc'
import { NextPageWithLayout } from './_app'
import React, { useEffect } from 'react'
import { Header } from '~/components/layout/Header'
import { Authenticate } from '~/components/modal/Authenticate'
import { Transact } from '~/components/modal/Transact'
import { Footer } from '~/components/layout/Footer'
import { InteractionModal } from '~/components/modal/InteractionModal'
import { EditUser } from '~/components/modal/EditUser'
import { AskList } from '~/components/ask/AskList'
import { CreateAsk } from '~/components/ask/CreateAsk'
import { CreateOffer } from '~/components/offer/CreateOffer'
import { useRouter } from 'next/router'
import { Ask } from '~/components/ask/Ask'
import { useActionStore } from '~/store/actionStore'
import { Logo } from '~/components/layout/Logo'
import { ImageView } from '~/components/common/ImageView'
import { useMessageStore } from '~/store/messageStore'
import { Sidebar } from '~/components/layout/Sidebar'
import { ToasterDisplay } from '~/components/common/Toaster'
import { useUXStore } from '~/store/uxStore'
import { BlogList } from '~/components/blog/BlogList'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import MenuIcon from '@mui/icons-material/Menu'
import { Button, ThemeProvider } from '@mui/material'
import { WelcomeScreen } from '~/components/common/WelcomeScreen'
import { SubHeaderToolbarHeader } from '~/components/layout/SubHeaderToolbar'
import useMediaQuery from '@mui/material/useMediaQuery'
import theme from '~/theme'
import { authedUserStore } from '~/store/authedUserStore'
import { useStore } from 'zustand'
import { EditAsk } from '~/components/ask/EditAsk'
import { SpaceBar } from '~/components/layout/SpaceBar'
import { CreateSpace } from '~/components/ask/CreateSpace'
import { EditSpace } from '~/components/ask/EditSpace'
import { CustomHead } from '~/components/layout/CustomHead'

const IndexPage: NextPageWithLayout = () => {
    const { setUser, storeToken, storeLogin } = useStore(authedUserStore)
    const { mobileMenuOpen, setMobileMenuOpen } = useUXStore()
    const { currentModal, setCurrentModal } = useActionStore()
    const { visible } = useMessageStore()

    const [parent] = useAutoAnimate<HTMLDivElement>(/* optional config */)
    const router = useRouter()
    const matches = useMediaQuery('(min-width:1024px)')
    const utils = trpc.useContext()

    const routerPath = (path: string): string => {
        const subPath = path.split('/')[2]
        if (!subPath) {
            return 'timeline'
        }
        return path.split('/')[2] ?? ''
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            storeLogin(token)
        }
        if (storeToken) {
            utils.user.getMe.fetch().then((data) => {
                setUser(data)
                setCurrentModal('none')
            })
        }
    }, [storeToken])

    return (
        <ThemeProvider theme={theme}>
            <CustomHead />
            <div className={'index-background flex max-h-screen flex-col lg:flex-row'}>
                <div className={'flex w-full flex-col shadow-2xl lg:w-4/12'}>
                    <header className={'flex flex-row gap-1 bg-primary p-2 shadow-xl lg:gap-4 lg:p-4'}>
                        {!matches && (
                            <Button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                variant={'contained'}
                                component="div"
                            >
                                <MenuIcon />
                            </Button>
                        )}
                        {matches && <Logo />}
                        <Header />
                    </header>
                    {(matches || mobileMenuOpen) && (
                        <div className={'grow'}>
                            {matches ? null : <SubHeaderToolbarHeader />}
                            <div className={'p-4'}>
                                <Sidebar />
                            </div>
                        </div>
                    )}
                    {matches && (
                        <footer className={'border-t-black bg-primary p-4'}>
                            <Footer />
                        </footer>
                    )}
                </div>
                <main
                    className={'flex max-h-fit grow flex-col gap-4 bg-gray-100 lg:w-8/12 lg:pb-6 lg:pl-6 lg:pr-6'}
                    ref={parent}
                >
                    {routerPath(router.asPath) === 'timeline' && <SpaceBar />}
                    {
                        {
                            single: <Ask slug={router.query.slug as string} />,
                            timeline: <AskList />,
                            user: <AskList />,
                            blog: <BlogList />,
                        }[routerPath(router.asPath)]
                    }
                </main>
                {
                    {
                        authenticate: (
                            <InteractionModal title={'Authenticate'}>
                                <Authenticate />
                            </InteractionModal>
                        ),
                        transact: (
                            <InteractionModal title={'Transact'}>
                                <Transact />
                            </InteractionModal>
                        ),
                        editUser: (
                            <InteractionModal title={'Edit User'} size={'md'}>
                                <EditUser />
                            </InteractionModal>
                        ),
                        createAsk: (
                            <InteractionModal title={'Create Ask'}>
                                <CreateAsk />
                            </InteractionModal>
                        ),
                        addOffer: (
                            <InteractionModal title={'Add Offer'} size={'xl'}>
                                <CreateOffer />
                            </InteractionModal>
                        ),
                        viewImage: (
                            <InteractionModal title={'Image'}>
                                <ImageView />
                            </InteractionModal>
                        ),
                        welcome: (
                            <InteractionModal title={'Welcome!'}>
                                <WelcomeScreen />
                            </InteractionModal>
                        ),
                        editAsk: (
                            <InteractionModal title={'Edit Ask'}>
                                <EditAsk />
                            </InteractionModal>
                        ),
                        createSpace: (
                            <InteractionModal title={'Create Space'}>
                                <CreateSpace />
                            </InteractionModal>
                        ),
                        editSpace: (
                            <InteractionModal title={'Edit Space'}>
                                <EditSpace />
                            </InteractionModal>
                        ),
                        none: null,
                    }[currentModal]
                }
                {visible && <ToasterDisplay />}
            </div>
        </ThemeProvider>
    )
}

export default IndexPage
