import { ReactNode } from 'react'
import useActionStore from '~/store/actionStore'

interface InteractionModalProps {
    title: string
    children: ReactNode
}

export const InteractionModal = ({ children, title }: InteractionModalProps) => {
    const { closeModal } = useActionStore()

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
                <div className="relative my-6 mx-auto w-auto ">
                    <div className="modal-container relative flex w-full flex-col rounded-global border-0 focus:outline-none">
                        <div className="flex items-start justify-between rounded-t-global border-b border-solid border-slate-200 p-5">
                            <h3 className="text-3xl font-semibold">{title}</h3>
                            <button
                                className="float-right ml-auto border-0 bg-transparent p-1 text-3xl font-semibold leading-none text-black opacity-5 outline-none focus:outline-none"
                                onClick={close}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-6 w-6"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className={'flex w-full flex-row justify-center p-8'}>{children}</div>
                        <div className="flex items-center justify-end rounded-b-global border-t border-solid border-slate-200 p-6">
                            <button
                                id={'modal-close'}
                                className="background-transparent mr-1 mb-1 px-6 py-2 text-sm font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear focus:outline-none"
                                type="button"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
            {/*<input type="checkbox" id="my-modal-5" className="modal-toggle" />*/}
            {/*<div className="modal">*/}
            {/*    <div className="modal-box w-11/12 max-w-5xl">*/}
            {/*        <h3 className="text-lg font-bold">Congratulations random Internet user!</h3>*/}
            {/*        <p className="py-4">*/}
            {/*            You've been selected for a chance to get one year of subscription to use Wikipedia for free!*/}
            {/*        </p>*/}
            {/*        <div className="modal-action">*/}
            {/*            <label htmlFor="my-modal-5" className="btn">*/}
            {/*                Yay!*/}
            {/*            </label>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </>
    )
}
