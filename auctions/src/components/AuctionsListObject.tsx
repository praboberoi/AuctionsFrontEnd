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
    IconButton, Snackbar
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
        if(currentUser.userId === currentAuction.sellerId)
            return true
        else
            return false
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
            },(error) => {
                setAuctionDeleted(false)
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })

    }
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway')
            return;
        setErrorFlag(false)
    }

    return (
        <Grid item sx={{my:2}}>
            <Card sx={{ maxWidth: 345}} raised={true}>
            <CardMedia
                component="img"
                height="140"
                image={auctionImage}
                alt="green iguana"
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
                        <Avatar src={sellerImage}/>
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
                    <Button size={'small'}
                            onClick={ () => navigate(`/auctionDetails/${currentAuction.auctionId}`)}>
                        View Details
                    </Button>
                    {checkCanEdit() &&
                        <div>
                            <Button size={'small'}
                                    onClick={() => navigate(`/EditAuction/${currentAuction.auctionId}`)}>
                                Edit
                            </Button>
                            <Button size={"small"} onClick={() => {setOpenDeleteDialog(true)}}>Delete</Button>
                        </div>
                    }

                </CardActions>
                <Dialog open={openDeleteDialog}
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
                <Snackbar open={errorFlag}
                          anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                          autoHideDuration={6000} onClose={handleClose}>
                    <Alert severity="error" onClose={handleClose}>{errorMessage}</Alert>
                </Snackbar>
                <Snackbar open={auctionDeleted && !errorFlag}
                          anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                          autoHideDuration={6000} onClose={handleClose}>
                    <Alert severity="error" onClose={handleClose}>The auctions has been successfully deleted</Alert>
                </Snackbar>
        </Card>
        </Grid>
    )
}