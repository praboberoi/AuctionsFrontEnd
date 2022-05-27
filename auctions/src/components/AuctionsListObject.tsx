import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import {
    Alert,
    Avatar,
    Button,
    CardActions,
    Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    IconButton, InputAdornment, Snackbar, TextField
} from "@mui/material";
import Typography from "@mui/material/Typography";
import React from "react";
import {useNavigate} from "react-router-dom";
import {differenceInDays, formatDistance} from "date-fns"
import {useUserStore} from "../store";
import {Delete} from "@mui/icons-material";
import axios from "axios";



export const AuctionsListObject = (props: {currentAuction: auction}) => {
    const [currentAuction] = React.useState<auction>(props.currentAuction)
    const [auctionImage] = React.useState<string>(`http://localhost:4941/api/v1/auctions/${props.currentAuction.auctionId}/image`)
    const [sellerImage] = React.useState<string>(`http://localhost:4941/api/v1/users/${props.currentAuction.sellerId}/image`)
    const currentUser = useUserStore(state => state.currentUser)
    const navigate = useNavigate();
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false)
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const removeAuction = useUserStore(state => state.removeAuction)
    const [auctionDeleted, setAuctionDeleted] = React.useState(false)
    const [openLoginDialog, setOpenLoginDialog] = React.useState(false)
    const [openBiddingDialog, setOpenBiddingDialog] = React.useState(false)
    const [invalidBid, setInvalidBid] = React.useState(true)
    const [currentBid, setCurrentBid]= React.useState(1)
    const [bidPaced, setBidPlaced] = React.useState(false)
    const [successMessage, setSuccessMessage] = React.useState("")


    const getDate = () => {
        const endDate = new Date(currentAuction.endDate);
        const now = new Date();
        const totalDays = formatDistance(endDate, now, { addSuffix: true })
        if(totalDays.endsWith('ago'))
            return `Closed ${totalDays}`
        else
            return `Closes ${totalDays}`
    }

    const checkCanEdit = () => {
        return currentUser.userId === currentAuction.sellerId;
    }

    const checkBid = (event:any) => {
        setCurrentBid(parseInt(event.target.value, 10))
        // @ts-ignore
        if(event.target.value <= currentAuction.highestBid || event.target.value.includes('.')) {
            setInvalidBid(true)
        } else {
            setInvalidBid(false)
        }

    }

    const bid = () => {
        setOpenBiddingDialog(false)
        axios.post(`http://localhost:4941/api/v1/auctions/${currentAuction.auctionId}/bids`,
            {"amount": currentBid},
            {headers:{
                'X-Authorization': currentUser.token
                }})
            .then(() => {
               setErrorFlag(false)
                setBidPlaced(true)
                setSuccessMessage("Bid successfully placed")
               setErrorMessage("")
                setTimeout(() => window.location.reload(), 2000)
            }, (error) => {
                setBidPlaced(false)
                setSuccessMessage("")
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })
    }


    const canBid = () => {
        return currentUser.userId !== currentAuction.sellerId && new Date(currentAuction.endDate) > new Date();
    }

    const deleteAuction = async () => {
        axios.delete(`http://localhost:4941/api/v1/auctions/${currentAuction.auctionId}`,
            {headers:
                    {
            'Content-Type': 'application/json',
            'X-Authorization': `${currentUser.token}`,
            }})
            .then(() => {
                removeAuction(currentAuction)
                setErrorFlag(false)
                setErrorMessage("")
                setOpenDeleteDialog(false)
                setAuctionDeleted(true)
                setSuccessMessage("Auction deleted successfully")
                setTimeout(()=> window.location.reload(), 2000)
            },(error) => {
                setAuctionDeleted(false)
                setSuccessMessage("")
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })

    }
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway')
            return;
        setErrorFlag(false)
        setAuctionDeleted(false)
    }

    const placeBid = () => {
        if(currentUser.userId === -1)
            setOpenLoginDialog(true)
        else
            setOpenBiddingDialog(true)

    }

    return (
        <Grid item sx={{my:2}}>
            <Card sx={{ maxWidth: 400}} raised={true}>
            <CardMedia
                component="img"
                height="250"
                image={auctionImage}
                alt="Auction Image"
                sx={{objectFit:"contain"}}
            />
            <CardContent>
                <Grid container justifyContent="space-between" alignItems="flex-start" direction={"row"}>
                    <Grid item>
                        <Typography fontSize={12} color="text.secondary">
                            Category: {currentAuction.categoryName}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography fontSize={12} color={"text.secondary"}>
                            {getDate()}
                        </Typography>
                    </Grid>
                </Grid>
                <Typography gutterBottom fontWeight={500} color={"text.primary"}>
                    Title:{currentAuction.title}
                </Typography>
                <Grid container justifyContent="center" alignItems="center" direction={"row"} spacing={0.5}>
                    <Grid item>
                        <Typography variant={"body2"}  color={"text.primary"}>
                            Seller:{currentAuction.sellerFirstName} {currentAuction.sellerLastName}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Avatar src={sellerImage} style={{maxWidth: '100%', maxHeight: '100%'}}/>
                    </Grid>
                    <Grid container justifyContent="space-between" alignItems="flex-start" direction={"row"} sx={{pt:1}}>
                        <Grid item>
                            <Typography fontSize={12} color="text.secondary">
                                Auction Reserve: ${currentAuction.reserve}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography fontSize={12} color={"text.secondary"}>
                                Highest Bid: ${currentAuction.highestBid === null ? 0 : currentAuction.highestBid}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
                <CardActions>
                    <Grid container justifyContent="space-evenly" alignItems="center">
                        <Grid item>
                            <Button size={'small'}
                                    onClick={ () => navigate(`/auctionDetails/${currentAuction.auctionId}`)}>
                                View Details
                            </Button>
                        </Grid>
                        {canBid() &&
                            <Grid item>
                                <Button size={"small"} onClick={placeBid}>Place Bid</Button>
                            </Grid>
                        }
                    {checkCanEdit() &&
                        <>
                            <Grid item>
                                <Button size={'small'}
                                        onClick={() => navigate(`/EditAuction/${currentAuction.auctionId}`)}>
                                    Edit
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button size={"small"} onClick={() => {setOpenDeleteDialog(true)}}>Delete</Button>
                            </Grid>
                        </>
                    }
                    </Grid>
                </CardActions>
                <Dialog fullWidth={true} maxWidth={'xs'} open={openDeleteDialog}
                        onClose={() => {setOpenDeleteDialog(false)}}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">
                        {"Delete Auction"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to delete {currentAuction.title}?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button size={"small"} onClick={deleteAuction} autoFocus>Delete</Button>
                        <Button size={"small"} onClick={() => {setOpenDeleteDialog(false)}}>Cancel</Button>
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

                <Snackbar open={errorFlag}
                          anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                          autoHideDuration={2000} onClose={handleClose}>
                    <Alert severity="error" onClose={handleClose}>{errorMessage}</Alert>
                </Snackbar>
                <Snackbar open={ (bidPaced || auctionDeleted) && !errorFlag }
                          anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                          autoHideDuration={2000} onClose={handleClose}>
                    <Alert severity="success" onClose={handleClose}>{successMessage}</Alert>
                </Snackbar>
        </Card>
        </Grid>
    )
}