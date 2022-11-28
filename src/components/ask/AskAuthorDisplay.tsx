import { IconPropertyDisplay } from '~/components/common/IconPropertyDisplay'
import { RouterOutput } from '~/utils/trpc'

type AskAuthorOutput = RouterOutput['ask']['byContextSlug']['ask']['user']

interface AskAuthorDisplayProps {
    user: AskAuthorOutput
}

export const AskAuthorDisplay = ({ user }: AskAuthorDisplayProps) => (
    <div>
        {user && (
            <div className={'flex flex-row gap-2'}>
                <div className="avatar">
                    <div className="w-12 rounded-global">
                        <img src={user.profileImage ?? ''} />
                    </div>
                </div>
                <div className={'grow'}>
                    <div>
                        <IconPropertyDisplay identifier={'publicKey'} value={user.publicKey?.slice(0, 24) + '...'}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-3 w-3"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-4.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                                />
                            </svg>
                        </IconPropertyDisplay>
                        <IconPropertyDisplay identifier={'userName'} value={'@' + user.userName}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-4 w-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-4 0 3 3 0 016 0z"
                                />
                            </svg>
                        </IconPropertyDisplay>
                    </div>
                </div>
            </div>
        )}
    </div>
)
