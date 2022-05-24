import React from "react";
import MenuBar from "./MenuBar";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Grid,
    InputAdornment,
    Pagination,
    Paper,
    Snackbar,
    TextField
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import {useUserStore} from "../store";
import {AuctionsListObject} from "./AuctionsListObject";


const Auctions = () => {
    const auctionsPerPage = 10
    const [pagination, setPagination] = React.useState({
        totalAuctions: 0,
        startIndex: 0,
        count: auctionsPerPage,
        params:`&startIndex=0&count=${auctionsPerPage}`,
    })

    const [selectedCategories, setSelectedCategories] = React.useState<category[]>([])
    const [searchingParams, setSearchingSearchingParams] = React.useState("")
    const [openClose, setOpenClose] = React.useState("")
    const [sortBy, setSortBy] = React.useState("")
    const [textFilter, setTextFilter] = React.useState("")
    const setAuctions = useUserStore(state => state.setAuctions)
    const auctions = useUserStore(state => state.auctions)
    const categories = useUserStore(state => state.categories)
    const setCategories = useUserStore(state => state.setCategories)
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const setCategoryNames = useUserStore(state => state.setCategoryNames)
    const currentUser = useUserStore(state => state.currentUser)


    const sortingOptions = ["Ascending Alphabetically", "Descending Alphabetically",
        "Ascending By Current Bid", "Descending By Current Bid",
        "Ascending By Reserve Price", "Descending By Reserve Price", "Chronologically By Closing date",
        "Reverse Chronologically By Closing date"]

    const serverSortingOptions = ["ALPHABETICAL_ASC", "ALPHABETICAL_DESC", "BIDS_DESC",
        "BIDS_ASC", "RESERVE_DESC", "RESERVE_ASC", "CLOSING_SOON", "CLOSING_LAST"]


    const getFilteredAuctions = async () => {
        const response = await axios.get(`http://localhost:4941/api/v1/auctions/?${searchingParams}${pagination.params}`)

        setAuctions(response.data.auctions)
        setPagination({...pagination, totalAuctions: response.data.count})

        if (categories.length === 0 ) {
            const {data} = await axios.get('http://localhost:4941/api/v1/auctions/categories')
            setCategories(data)
        }
        setCategoryNames()
    }

    React.useEffect(() => {
        const getAuctions = async () => {
            try {
                await getFilteredAuctions()
            } catch (error: any) {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            }
        }
        getAuctions().then()
    }, [searchingParams, pagination.params])

    const updateParams = async () => {
        setPagination({...pagination, startIndex: 0, count: auctionsPerPage, params:`&startIndex=0&count=${auctionsPerPage}`})
        let currentParams = ""
        if (selectedCategories.length > 0) {
            selectedCategories.map(c => currentParams = currentParams + `categoryIds=${c.id}&`)
            currentParams = currentParams.slice(0, currentParams.length - 1)

        }

        if (textFilter.length > 0 ) {
            currentParams = currentParams + `&q=${textFilter}`
        }

        if (openClose.length > 0) {
            currentParams = currentParams + `&status=${openClose}`
        }

        if(sortBy.length > 0) {
            const index = sortingOptions.indexOf(sortBy)
            currentParams = currentParams + `&sortBy=${serverSortingOptions[index]}`
        }

        setSearchingSearchingParams(currentParams)
    }

    const setFromToAuctions = async (event:any, page:number) => {
        const from = (page - 1) * auctionsPerPage
        const to = (page - 1) * auctionsPerPage + auctionsPerPage
        setPagination({...pagination, startIndex:from, count: to, params:`&startIndex=${from}&count=${to}`})
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway')
            return;
        setErrorFlag(false)
    }

    const auctions_rows = () => auctions.map((a:auction, index) => <AuctionsListObject key={a.auctionId} currentAuction={a}/>)
    return (
        <div>
            <Grid container style={{minHeight: '100vh', minWidth: '100vh'}} direction={"column"}>
                <Grid container direction={"column"} spacing={2}>
                    <Grid item xs={12} md={12} lg={12}>
                        <MenuBar key={"/View-Auctions"}
                            items={currentUser.userId !== -1 ? ["/Account", "/Logout"] : ["/login","/Register"]}
                            searchBar={true}/>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <Paper elevation={3} sx={{mx: 1, my: 1, px: 1, py: 1}}>
                            <Grid container direction={"row"} justifyContent="space-evenly" alignItems="center">
                                <Grid item xs={1} md={1} lg={1}>
                                    <Autocomplete
                                        disablePortal
                                        options={["CLOSED", "OPEN"]}
                                        size={"small"}
                                        onChange={(event,value) => setOpenClose(value !== null ? value: "")}
                                        renderInput={(params) => <TextField {...params} label="Open/Closed" />}
                                    />
                                </Grid>
                                <Grid item xs={3} md={3} lg={3}>
                                    <Autocomplete
                                        disablePortal
                                        options={sortingOptions}
                                        size={"small"}
                                        onChange={(event,value) => setSortBy(value !== null ? value: "")}
                                        renderInput={(params) =>
                                            <TextField {...params} label="Sort By"/>}
                                    />
                                </Grid>
                                <Grid item xs={4} md={4} lg={4}>
                                    <Autocomplete
                                        multiple
                                        options={categories}
                                        getOptionLabel={(option) => option.name}
                                        onChange={(event,value) => setSelectedCategories(value)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Categories"
                                                size={"small"} fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item  xs={2} md={2} lg={2}>
                                    <TextField size={"small"} fullWidth onChange={(event) => setTextFilter(event.target.value)}
                                        InputProps={{
                                            startAdornment:
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                        }}/>
                                </Grid>
                                <Grid item  xs={"auto"} md={"auto"} lg={"auto"}>
                                    <Button color="primary" variant="contained" component="span" onClick={updateParams}>
                                        Filter
                                    </Button>
                                </Grid>
                                <Grid item xs={"auto"} md={"auto"} lg={"auto"}>
                                    <Button color="secondary" variant="contained" component="span" onClick={() => window.location.reload()}>
                                        Clear
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
                 <Grid container direction={"row"} justifyContent="space-around" alignItems="center">
                        {auctions_rows()}
                </Grid>
                <Box justifyContent={"center"} alignContent={"center"} display={"flex"} sx={{my:2, mx:2}}>
                    <Pagination showLastButton showFirstButton
                                count={Math.ceil(pagination.totalAuctions/auctionsPerPage)} onChange={setFromToAuctions}/>
                </Box>
            </Grid>
            <Snackbar open={errorFlag}
                      anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                      autoHideDuration={6000} onClose={handleClose}
            >
                <Alert severity="error" onClose={handleClose}>{errorMessage}</Alert>
            </Snackbar>

        </div>
    )
}


export default Auctions