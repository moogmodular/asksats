import { FilterForInput, OrderByDirectionInput, OrderByInput, useListStore } from '~/store/listStore'
import { useEffect, useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useRouter } from 'next/router'
import { Button, InputAdornment, Menu, MenuItem, TextField } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SearchIcon from '@mui/icons-material/Search'
import SouthIcon from '@mui/icons-material/South'
import NorthIcon from '@mui/icons-material/North'
import { useStore } from 'zustand'
import { authedUserStore } from '~/store/authedUserStore'

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
    const { user } = useStore(authedUserStore)

    const [anchorElFilterFor, setAnchorElFilterFor] = useState<null | HTMLElement>(null)
    const [anchorElOrderBy, setAnchorElOrderBy] = useState<null | HTMLElement>(null)
    const [anchorElDirection, setAnchorElDirection] = useState<null | HTMLElement>(null)
    const [anchorElQuickFilter, setAnchorElQuickFilter] = useState<null | HTMLElement>(null)

    const openFilterFor = Boolean(anchorElFilterFor)
    const openOrderBy = Boolean(anchorElOrderBy)
    const openDirection = Boolean(anchorElDirection)
    const openQuickFilter = Boolean(anchorElQuickFilter)

    const handleClickQuickFilter = (event: any) => {
        setAnchorElQuickFilter(event.currentTarget)
    }
    const handleClickFilterFor = (event: any) => {
        setAnchorElFilterFor(event.currentTarget)
    }
    const handleClickOrderBy = (event: any) => {
        setAnchorElOrderBy(event.currentTarget)
    }
    const handleClickDirection = (event: any) => {
        setAnchorElDirection(event.currentTarget)
    }
    const handleCloseQuickFilter = () => {
        setAnchorElQuickFilter(null)
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
            <div className={'flex flex-col gap-2 lg:flex-row'}>
                <TextField
                    id="input-with-icon-adornment"
                    variant="outlined"
                    size={'small'}
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
                <Button
                    component="div"
                    color="secondary"
                    id="demo-customized-button"
                    size="small"
                    variant="outlined"
                    disableElevation
                    onClick={(e) => handleClickQuickFilter(e)}
                    endIcon={<KeyboardArrowDownIcon />}
                >
                    quick filter
                </Button>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorElQuickFilter}
                    open={openQuickFilter}
                    onClose={handleCloseQuickFilter}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <MenuItem onClick={() => setTemplate('default_template')}>Default</MenuItem>
                    <MenuItem onClick={() => setTemplate('newest')}>New</MenuItem>
                    <MenuItem onClick={() => setTemplate('public_settled')}>Public settled</MenuItem>
                </Menu>

                <Button
                    component="div"
                    id="demo-customized-button"
                    size="small"
                    color="secondary"
                    variant="outlined"
                    disableElevation
                    onClick={(e) => handleClickFilterFor(e)}
                    endIcon={<KeyboardArrowDownIcon />}
                >
                    Ask Status
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
                    <MenuItem onClick={() => handleFilterFor(undefined)}>All</MenuItem>
                    <MenuItem onClick={() => handleFilterFor('OPEN')}>Open</MenuItem>
                    <MenuItem onClick={() => handleFilterFor('SETTLED')}>Settled</MenuItem>
                    <MenuItem onClick={() => handleFilterFor('CANCELED')}>Canceled</MenuItem>
                </Menu>
                <Button
                    component="div"
                    id="demo-customized-button"
                    size="small"
                    variant="outlined"
                    color="secondary"
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
                    <MenuItem onClick={() => handleOrderBy('creation')}>Creation</MenuItem>
                </Menu>

                <Button
                    component="div"
                    id="demo-customized-button"
                    size="small"
                    variant="outlined"
                    color="secondary"
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
        </>
    )
}
