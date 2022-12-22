import useListStore, { FilterForInput, OrderByDirectionInput, OrderByInput } from '~/store/listStore'
import { useEffect, useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useRouter } from 'next/router'
import { Button, ButtonGroup, IconButton, InputAdornment, Menu, MenuItem, TextField, Tooltip } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SearchIcon from '@mui/icons-material/Search'
import Link from 'next/link'
import QueueOutlinedIcon from '@mui/icons-material/QueueOutlined'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined'
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined'
import useAuthStore from '~/store/useAuthStore'
import SouthIcon from '@mui/icons-material/South'
import NorthIcon from '@mui/icons-material/North'
import useMediaQuery from '@mui/material/useMediaQuery'

interface SubHeaderToolbarHeaderProps {}

export const SubHeaderToolbarHeader = ({}: SubHeaderToolbarHeaderProps) => {
    const {
        setFilterFor,
        setOrderBy,
        setOrderByDirection,
        setSearchTerm,
        orderBy,
        filterFor,
        orderByDirection,
        setTemplate,
    } = useListStore()
    const { user } = useAuthStore()

    const [anchorElFilterFor, setAnchorElFilterFor] = useState<null | HTMLElement>(null)
    const [anchorElOrderBy, setAnchorElOrderBy] = useState<null | HTMLElement>(null)
    const [anchorElDirection, setAnchorElDirection] = useState<null | HTMLElement>(null)

    const openFilterFor = Boolean(anchorElFilterFor)
    const openOrderBy = Boolean(anchorElOrderBy)
    const openDirection = Boolean(anchorElDirection)
    const handleClickFilterFor = (event: any) => {
        setAnchorElFilterFor(event.currentTarget)
    }
    const handleClickOrderBy = (event: any) => {
        setAnchorElOrderBy(event.currentTarget)
    }
    const handleClickDirection = (event: any) => {
        setAnchorElDirection(event.currentTarget)
    }
    const handleCloseFilterFor = () => {
        setAnchorElFilterFor(null)
    }
    const handleCloseOrderBy = () => {
        setAnchorElOrderBy(null)
    }
    const handleCloseDirection = () => {
        setAnchorElDirection(null)
    }
    const handleFilterFor = (filterFor: FilterForInput) => {
        setFilterFor(filterFor)
        handleCloseFilterFor()
    }
    const handleOrderBy = (orderBy: OrderByInput) => {
        setOrderBy(orderBy)
        handleCloseOrderBy()
    }
    const handleDirection = (direction: OrderByDirectionInput) => {
        setOrderByDirection(direction)
        handleCloseDirection()
    }

    const router = useRouter()
    const [hideForSingle, setHideForSingle] = useState(false)
    const [parent] = useAutoAnimate<HTMLDivElement>()

    const userNameFromPath = (path: any): string => {
        return path.split('/')[2]
    }

    useEffect(() => {
        const path = userNameFromPath(router.asPath)
        if (path === 'single') {
            setHideForSingle(true)
        } else {
            setHideForSingle(false)
        }
    }, [router])

    return (
        <>
            {!hideForSingle ? (
                <div ref={parent} className={'flex cursor-pointer flex-col flex-wrap gap-2'}>
                    <div className="flex flex-col items-center gap-2 lg:flex-row">
                        <TextField
                            fullWidth
                            id="input-with-icon-adornment"
                            variant="outlined"
                            placeholder="Search for asks"
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <div className={'flex flex-row items-center'}>
                            <Tooltip title="My asks">
                                <IconButton>
                                    <Link className={'flex items-center'} href={`/ask/user/${user?.userName}`}>
                                        <QueueOutlinedIcon fontSize={'medium'} />
                                    </Link>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="My bumps">
                                <IconButton>
                                    <Link className={'flex items-center'} href={`/ask/bumps`}>
                                        <RocketLaunchOutlinedIcon fontSize={'medium'} />
                                    </Link>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="My offers">
                                <IconButton>
                                    <Link className={'flex items-center'} href={`/ask/offers`}>
                                        <HandshakeOutlinedIcon fontSize={'medium'} />
                                    </Link>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="My files">
                                <IconButton id={'files-button'}>
                                    <Link href={`/ask/files`}>
                                        <PermMediaOutlinedIcon fontSize={'medium'} />
                                    </Link>
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>
                    <div className={'flex flex-col gap-2 lg:flex-row'}>
                        <ButtonGroup size="small" aria-label="small button group">
                            <Button key="one" onClick={() => setTemplate('newest')}>
                                new
                            </Button>
                            <Button key="two" onClick={() => setTemplate('public_settled')}>
                                public settled
                            </Button>
                            <Button key="three" onClick={() => setTemplate('ending_soon')}>
                                ending
                            </Button>
                        </ButtonGroup>

                        <Button
                            id="demo-customized-button"
                            size="small"
                            variant="outlined"
                            disableElevation
                            onClick={(e) => handleClickFilterFor(e)}
                            endIcon={<KeyboardArrowDownIcon />}
                        >
                            {filterFor}
                        </Button>
                        <Menu
                            id="basic-menu"
                            anchorEl={anchorElFilterFor}
                            open={openFilterFor}
                            onClose={handleCloseFilterFor}
                            MenuListProps={{
                                'aria-labelledby': 'basic-button',
                            }}
                        >
                            <MenuItem onClick={() => handleFilterFor('all')}>All</MenuItem>
                            <MenuItem onClick={() => handleFilterFor('active')}>Active</MenuItem>
                            <MenuItem onClick={() => handleFilterFor('pending_acceptance')}>
                                Acceptance pending
                            </MenuItem>
                            <MenuItem onClick={() => handleFilterFor('settled')}>Settled</MenuItem>
                            <MenuItem onClick={() => handleFilterFor('expired')}>Expired</MenuItem>
                        </Menu>
                        <Button
                            id="demo-customized-button"
                            size="small"
                            variant="outlined"
                            disableElevation
                            onClick={handleClickOrderBy}
                            endIcon={<KeyboardArrowDownIcon />}
                        >
                            {orderBy}
                        </Button>
                        <Menu
                            id="basic-menu"
                            anchorEl={anchorElOrderBy}
                            open={openOrderBy}
                            onClose={handleCloseOrderBy}
                            MenuListProps={{
                                'aria-labelledby': 'basic-button',
                            }}
                        >
                            <MenuItem onClick={() => handleOrderBy('deadline')}>Deadline</MenuItem>
                            <MenuItem onClick={() => handleOrderBy('acceptance')}>Acceptance</MenuItem>
                            <MenuItem onClick={() => handleOrderBy('creation')}>Creation</MenuItem>
                        </Menu>

                        <Button
                            id="demo-customized-button"
                            size="small"
                            variant="outlined"
                            disableElevation
                            onClick={handleClickDirection}
                            endIcon={<KeyboardArrowDownIcon />}
                        >
                            {orderByDirection}
                        </Button>
                        <Menu
                            id="basic-menu"
                            anchorEl={anchorElDirection}
                            open={openDirection}
                            onClose={handleCloseDirection}
                            MenuListProps={{
                                'aria-labelledby': 'basic-button',
                            }}
                        >
                            <MenuItem onClick={() => handleDirection('asc')}>
                                <SouthIcon />
                            </MenuItem>
                            <MenuItem onClick={() => handleDirection('desc')}>
                                <NorthIcon />
                            </MenuItem>
                        </Menu>
                    </div>
                </div>
            ) : null}
        </>
    )
}
