import React from "react";
import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {useUserStore} from "../store";
import {
    Alert,
    Avatar, Box, Button, CardActions,
    CardHeader, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Grid, InputAdornment, Pagination,
    Paper, Snackbar,
    Table, TableBody, TableCell,
    TableContainer,
    TableHead,
    TableRow, TextField
} from "@mui/material";
import MenuBar from "./MenuBar";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";

import CardContent from "@mui/material/CardContent";
import {AuctionsListObject} from "./AuctionsListObject";


const AuctionDetails = () => {
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const params = useParams();
    const [biddersName, setBiddersName] = React.useState("N/A")
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const currentUser = useUserStore(state => state.currentUser)
    const [bidHistory, setBidHistory] = React.useState<Array<bid>>([])
    const [auctionImage, setAuctionImage] = React.useState("")
    const categories = useUserStore(state => state.categories)
    const setCategories = useUserStore(state => state.setCategories)
    const [similarAuctions, setSimilarAuctions] = React.useState<Array<auction>>([])
    const [openBiddingDialog, setOpenBiddingDialog] = React.useState(false)
    const [invalidBid, setInvalidBid] = React.useState(true)
    const [openLoginDialog, setOpenLoginDialog] = React.useState(false)
    const [currentBid, setCurrentBid]= React.useState(1)
    const [bidPaced, setBidPlaced] = React.useState(false)

    const navigate = useNavigate();



    const [currentAuction, setCurrentAuction] = React.useState<auction>({
        auctionId: -1,
        title: "",
        description:"",
        endDate: "",
        categoryId: -1,
        reserve: 0,
        sellerId: -1,
        sellerFirstName: "",
        sellerLastName: "",
        numBids: 0,
        highestBid: 0,
        categoryName: "",
    })

    const [sellerImage, setSellerImage] = React.useState("")

    const getCategories = async () => {
        const {data} = await axios.get('http://localhost:4941/api/v1/auctions/categories')
        setCategories(data)
    }



    const getAuctionRelatedData = async () => {
        setAuctionImage(`http://localhost:4941/api/v1/auctions/${params.id}/image`)
        const {data} = await axios.get(`http://localhost:4941/api/v1/auctions/${params.id}`)
        setCurrentAuction(data)

        setSellerImage(`http://localhost:4941/api/v1/users/${data.sellerId}/image`)


        const  response = await axios.get(`http://localhost:4941/api/v1/auctions/?categoryIds=${data.categoryId}`)
        const firstSearch = response.data.auctions.filter((a: { auctionId: number; }) => a.auctionId !== parseInt(params.id as string, 10))

        const responseSecond = await axios.get(`http://localhost:4941/api/v1/auctions/?sellerId=${data.sellerId}`)
        const secondSearch  = responseSecond.data.auctions
            .filter((a: { auctionId: number; }) => a.auctionId !== parseInt(params.id as string, 10) &&
                !(firstSearch.map((b: { auctionId: number; }) => b.auctionId).includes(a.auctionId)))

        firstSearch.push.apply(firstSearch, secondSearch)

        setSimilarAuctions(firstSearch)

    }


    const getBidderDetails = async () => {
        const response = await axios.get(`http://localhost:4941/api/v1/auctions/${params.id}/bids`)
        if (response.data.length > 0) {
            const highestBidDetails = response.data[0]
            setBiddersName(`${highestBidDetails.firstName} ${highestBidDetails.lastName}`)
            setBidHistory(response.data)
        }
        else {
            setBiddersName("N/A")
            setBidHistory([])
        }
    }


    React.useEffect(() => {
       const getActionDetails = async () => {
           try {
               await getCategories()
               await getAuctionRelatedData()
               await getBidderDetails()
               setErrorFlag(false)
               setErrorMessage("")
           } catch (error:any) {
               setErrorFlag(true)
               setErrorMessage(error.response.statusText)
           }
       }
       getActionDetails().then()

    }, [params.id, currentAuction.highestBid])

    const getDate = () => {

        const endDate = new Date(currentAuction.endDate);
        return `Closing : ${endDate.getDate()}-${month[endDate.getMonth()]}-${endDate.getFullYear()} ${endDate.toLocaleTimeString('en-NZ')}`
    }

    const get_category_to_display = () =>{
        let category
        if (currentAuction != null) {
            category = categories.find(obj => {return obj.categoryId === currentAuction.categoryId})
        }
        return category!=null?category.name:""
    }

    const checkBid = (event:any) => {
        setCurrentBid(parseInt(event.target.value, 10))
        // @ts-ignore
        if(event.target.value < currentAuction.highestBid || event.target.value.includes('.')) {
            setInvalidBid(true)
        } else {
            setInvalidBid(false)
        }

    }
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway')
            return;
        setErrorFlag(false)
    }

    const placeBid = () => {
        if(currentUser.userId === -1)
            setOpenLoginDialog(true)
        else
            setOpenBiddingDialog(true)

    }

    const bid = () => {
        setOpenBiddingDialog(false)
        axios.post(`http://localhost:4941/api/v1/auctions/${currentAuction.auctionId}/bids`,
            {"amount": currentBid},
            {headers:{
                    'X-Authorization': currentUser.token
                }})
            .then(() => {
                setBidPlaced(true)
                setErrorFlag(false)
                setErrorMessage("")
                setTimeout( () =>window.location.reload(), 2000)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
                setBidPlaced(false)
            })
    }


    const auctions_rows = () => similarAuctions.map((a:auction, index) => <AuctionsListObject key={a.auctionId} currentAuction={a}/>)


    const getTableData = () => {
        if (bidHistory.length > 0 ) {
            return (bidHistory.map((row, index) =>
                    <TableRow key={index}  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row"><Avatar
                            src={`http://localhost:4941/api/v1/users/${row.bidderId}/image`}/>
                        </TableCell>
                        <TableCell align="left">{row.firstName}</TableCell>
                        <TableCell align="left">{row.lastName}</TableCell>
                        <TableCell align="right">$ {row.amount}</TableCell>

                    </TableRow>)

            )
        }
        return
    }

    return(
        <div>
            <Grid container  style={{minHeight: '100vh', minWidth: '100vh'}} direction={"column"} spacing={5}>
                <Grid item xs={12} md={12} lg={12}>

                    <MenuBar key={"/AuctionsDetails"}
                             items={currentUser.userId !== -1 ? ["/Account","/Auctions", "/Logout"] : ["/login","/Register","/Auctions"]}
                             searchBar={true}/>
                </Grid>
                <Grid item xs={12} md={12} lg={12}>
                    <Grid container direction={"row"}  justifyContent="space-around">
                        <Grid item xs={5} md={5} lg={5}>
                            <Paper elevation={10}>
                                <img src={auctionImage} style={{maxWidth: '100%', maxHeight: '100%'}} alt={'Auction Image'}/>
                            </Paper>
                        </Grid>
                        <Grid item xs={5} md={5} lg={5}>
                            <Card elevation={10} style={{maxWidth: '100%', maxHeight: '100%'}}>
                                <CardHeader
                                    title={currentAuction.title}
                                    subheader={getDate()}
                                />
                                <CardContent>
                                    <Grid container justifyContent="space-between"
                                          alignItems="flex-start" direction={"column"}>
                                        <Grid item>
                                            <Typography variant="body1" color="text.primary">
                                                Category: {get_category_to_display()}
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Grid container direction={"row"} justifyContent="center" alignItems="center">
                                                <Grid item>
                                                    <Typography variant="body1" color="text.primary">
                                                        Seller: {`${currentAuction.sellerFirstName} ${currentAuction.sellerLastName}`}
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Avatar src={sellerImage}/>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item>
                                            <Typography gutterBottom variant="body1" color={"text.primary"}>
                                                Reserve:$ {currentAuction.reserve}
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography gutterBottom variant={"body1"} color={"text.primary"}>
                                                Total bids: {currentAuction.numBids}
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography gutterBottom variant={"body1"} color={"text.primary"}>
                                                Current Bid: $ {currentAuction.highestBid}
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography gutterBottom variant={"body1"} color={"text.primary"}>
                                                Current Bidder: {biddersName}
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography gutterBottom variant={"body1"} color={"text.primary"}>
                                                Description: {currentAuction.description}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                                <CardActions disableSpacing>
                                    <Button onClick={placeBid}>Place Bid</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={12} lg={12}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center" colSpan={6}> Bid History </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Image</TableCell>
                                    <TableCell align="left">First Name</TableCell>
                                    <TableCell align="left">Last Name</TableCell>
                                    <TableCell align="right">Amount</TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {getTableData()}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={12} md={12} lg={12}>
                    <Grid container direction={"row"} justifyContent="space-around" alignItems="center">
                        {(similarAuctions.length > 0 && auctions_rows())}
                    </Grid>
                </Grid>
            </Grid>
            <Dialog fullWidth={true} maxWidth={'xs'} open={openBiddingDialog} onClose={() => {setOpenBiddingDialog(false)}}>
                <DialogTitle>
                    {"Place Bid"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Please enter a bid value
                    </DialogContentText>
                    <TextField
                        sx={{mt:1}}
                        label={"Reserve"}
                        type={"number"}
                        required
                        size={"small"}
                        fullWidth
                        error={invalidBid}
                        helperText={invalidBid  ? "Chosen bid value is invalid" : ""}
                        onChange={checkBid}
                        InputProps={{
                            startAdornment:
                                <InputAdornment position="start">
                                    $
                                </InputAdornment>
                        }}/>
                </DialogContent>
                <DialogActions>
                    <Button size={"small"}  onClick={bid} disabled={invalidBid} autoFocus>Bid</Button>
                    <Button size={"small"} onClick={() => {setOpenBiddingDialog(false)}}>Cancel</Button>
                </DialogActions>
            </Dialog>
            <Dialog fullWidth={true} maxWidth={'xs'} open={openLoginDialog}
                    onClose={() => {setOpenLoginDialog(false)}}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">
                    {"Login/Register"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Please log or register in to place a bid
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button size={"small"} onClick={() => navigate('/Login')} autoFocus>Login</Button>
                    <Button size={"small"} onClick={() => navigate('/Register')}>Register</Button>
                    <Button size={"small"} onClick={() => {setOpenLoginDialog(false)}}>Cancel</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={errorFlag}
                      anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                      autoHideDuration={2000} onClose={handleClose}
            >
                <Alert severity="error" onClose={handleClose}>{errorMessage}</Alert>
            </Snackbar>
            <Snackbar open={bidPaced && !errorFlag}
                      anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                      autoHideDuration={2000} onClose={handleClose}>
                <Alert severity="success" onClose={handleClose}>Bid successfully placed</Alert>
            </Snackbar>
        </div>
    )

}

export default AuctionDetails;