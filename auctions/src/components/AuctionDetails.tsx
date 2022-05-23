import React from "react";
import axios from "axios";
import {useParams} from "react-router-dom";
import {useUserStore} from "../store";
import {
    Avatar,
    Button,
    CardActions,
    CardHeader,
    Grid,
    IconButton,
    Paper,
    Table, TableBody, TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import MenuBar from "./MenuBar";
import AucitonImage from "../website_images/istockphoto-1209088835-612x612.jpeg";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import FavoriteIcon from '@mui/icons-material/Favorite';
import {ExpandMore} from "@mui/icons-material";
import ShareIcon from '@mui/icons-material/Share';
import {red} from "@mui/material/colors";

const AuctionDetails = () => {
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const params = useParams();
    const [biddersName, setBiddersName] = React.useState("N/A")
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const auctions = useUserStore(state => state.auctions)
    const currentUser = useUserStore(state => state.currentUser)
    const [bidHistory, setBidHistory] = React.useState([])
    const [auctionImage] = React.useState(`http://localhost:4941/api/v1/auctions/${params.id}/image`)
    const categories = useUserStore(state => state.categories)
    const setCategories = useUserStore(state => state.setCategories)
    const [sellerImage, setSellerImage] = React.useState("")
    const [currentAuction, setCurrentAuction] = React.useState<auction>({
        auctionId: -1,
        title: "",
        endDate: "",
        categoryId: -1,
        reserve: 0,
        sellerId: -1,
        sellerFirstName: "",
        sellerLastName: "",
        numBids: 0,
        highestBid: 0,
        categoryName: "",
        description:"",
    })

    const getCategories = async () => {
        const {data} = await axios.get('http://localhost:4941/api/v1/auctions/categories')
        setCategories(data)
    }

    const getAuction = async () => {
            const {data} = await axios.get(`http://localhost:4941/api/v1/auctions/${params.id}`)
            const name = categories.filter(c => c.categoryId == data.categoryId)[0].name
            // await setCurrentAuction({
            //     ...currentAuction,
            //     auctionId:data.auctionId,
            //     title: data.title,
            //     endDate: data.endDate,
            //     categoryId: data.categoryId,
            //     reserve: data.reserve,
            //     sellerId: data.sellerId,
            //     numBids: data.numBids,
            //     highestBid: data.highestBid === null ? 0 : data.highestBid,
            //     sellerLastName: data.sellerLastName,
            //     sellerFirstName: data.sellerFirstName,
            //     description: data.description,
            //     categoryName: name,
            // })
        setCurrentAuction(data)
        // @ts-ignore
        this.setState()
            console.log(currentAuction)
    }

    const getBidderDetails = async () => {
        const {data} = await axios.get(`http://localhost:4941/api/auctions/${params.id}/bids`)
        const highestBidDetails = data[0]
        setBiddersName(`${highestBidDetails.firstName} ${highestBidDetails.lastName}`)
        setBidHistory(data)
    }


    React.useEffect(() => {
       const getActionDetails = async () => {
           try {
               await getCategories()
               await getAuction()
               if (currentAuction.numBids > 0)
                    await getBidderDetails()

           } catch (error:any) {
               setErrorFlag(true)
               setErrorMessage(error.response.statusText)
           }
       }
       getActionDetails().then(() => {
           if (currentAuction.numBids > 0) {
               axios.get(`http://localhost:4941/api/v1/users/${currentAuction.sellerId}/image`)
                   .then(() => {
                       setSellerImage(`http://localhost:4941/api/v1/users/${currentAuction.sellerId}/image`)
                   }, () => {
                       setSellerImage("")
                   })
           }
       })

    }, [])

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
            closesIn =  `Closing : ${endDate.getDate()}-${month[endDate.getMonth()]}-${endDate.getFullYear()}`

        return closesIn
    }

    return(
        <div>
            <Grid container  style={{minHeight: '100vh', minWidth: '100vh'}} direction={"column"}>
                <Grid item xs={12} md={12} lg={12}>

                    <MenuBar key={"/AuctionsDetails"}
                             items={currentUser.userId !== -1 ? ["/Account","/Auctions", "/Logout"] : ["/login","/Register","/Auctions"]}
                             searchBar={true}/>
                </Grid>
                <Grid item xs={12} md={12} lg={12} sx={{mx: 5, my: 5}}>
                    <Grid container direction={"row"}  style={{minHeight: '100vh', minWidth: '100vh'}} justifyContent="space-around">
                        <Grid item xs={5} md={5} lg={5}>
                            <Paper elevation={10}>
                                <img src={auctionImage} style ={{width: '100%', height:'100%', objectFit:'cover'}} alt={'Auction Image'}/>
                            </Paper>
                        </Grid>
                        <Grid item xs={5} md={5} lg={5}>
                            <Card elevation={10}>
                                <CardHeader
                                    title={currentAuction.title}
                                    subheader={getDate()}
                                />
                                <CardContent>
                                    <Grid container justifyContent="space-between"
                                          alignItems="flex-start" direction={"column"}>
                                        <Grid item>
                                            <Typography variant="body1" color="text.primary">
                                                Category: {currentAuction.categoryName}
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
                                    </Grid>
                                </CardContent>
                                <CardActions disableSpacing>
                                    <Button> View bid history</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={12} lg={12} sx={{mx:2, my:2}}>
                    {/*<TableContainer component={Paper}>*/}
                    {/*    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">*/}
                    {/*        <TableHead>*/}
                    {/*            <TableRow>*/}
                    {/*                <TableCell>Dessert (100g serving)</TableCell>*/}
                    {/*                <TableCell align="right">Calories</TableCell>*/}
                    {/*                <TableCell align="right">Fat&nbsp;(g)</TableCell>*/}
                    {/*                <TableCell align="right">Carbs&nbsp;(g)</TableCell>*/}
                    {/*                <TableCell align="right">Protein&nbsp;(g)</TableCell>*/}
                    {/*            </TableRow>*/}
                    {/*        </TableHead>*/}
                    {/*        <TableBody>*/}
                    {/*            {rows.map((row) => (*/}
                    {/*                <TableRow*/}
                    {/*                    key={row.name}*/}
                    {/*                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}*/}
                    {/*                >*/}
                    {/*                    <TableCell component="th" scope="row">*/}
                    {/*                        {row.name}*/}
                    {/*                    </TableCell>*/}
                    {/*                    <TableCell align="right">{row.calories}</TableCell>*/}
                    {/*                    <TableCell align="right">{row.fat}</TableCell>*/}
                    {/*                    <TableCell align="right">{row.carbs}</TableCell>*/}
                    {/*                    <TableCell align="right">{row.protein}</TableCell>*/}
                    {/*                </TableRow>*/}
                    {/*            ))}*/}
                    {/*        </TableBody>*/}
                    {/*    </Table>*/}
                    {/*</TableContainer>*/}
                </Grid>
            </Grid>
        </div>
    )

}

export default AuctionDetails;