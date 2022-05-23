import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import {Avatar, Button, CardActions, Grid} from "@mui/material";
import Typography from "@mui/material/Typography";
import React from "react";
import {useNavigate} from "react-router-dom";



export const AuctionsListObject = (props: {currentAuction: auction}) => {
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const [currentAuction] = React.useState<auction>(props.currentAuction)
    const [auctionImage] = React.useState<string>(`http://localhost:4941/api/v1/auctions/${props.currentAuction.auctionId}/image`)
    const [sellerImage] = React.useState<string>(`http://localhost:4941/api/v1/users/${props.currentAuction.sellerId}/image`)
    const navigate = useNavigate();

    const getDate = () => {
        let closesIn: string;
        const endDate = new Date(currentAuction.endDate);
        const now = new Date();
        const totalDays = now.valueOf() - endDate.valueOf();
        if (totalDays === 0)
            closesIn = "Today"
        else if (totalDays === 1)
            closesIn = "Tomorrow"
        else
            closesIn =  `${endDate.getDate()}-${month[endDate.getMonth()]}-${endDate.getFullYear()}`

        return closesIn
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
                            Closes: {getDate()}
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
                <CardActions disableSpacing>
                    <Button size={'small'}
                            onClick={() => navigate(`/AuctionDetails/${currentAuction.auctionId}`)}>
                        View Details
                    </Button>
                </CardActions>
        </Card>
        </Grid>
    )
}