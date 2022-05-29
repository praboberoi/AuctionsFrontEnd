import React from "react";
import {useUserStore} from "../store";
import {useNavigate, useParams} from "react-router-dom";
import MenuBar from "./MenuBar";
import {
    Alert,
    Autocomplete,
    Avatar,
    Button, Checkbox,
    Grid,
    InputAdornment, InputLabel,
    Paper,
    Snackbar,
    TextField
} from "@mui/material";
import AuctionLogo from "../website_images/auction-logo.svg";
import axios from "axios";
import ImageIcon from '@mui/icons-material/Image';


const EditAuction = () => {

    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const navigate = useNavigate();
    const[imageFile, setImageFile] = React.useState(new File(["../website_images/default-user-image.png"], 'default-user-image.png'));
    const [img, setImg] = React.useState("")
    // const [title, setTitle] = React.useState("")

    // const [endDate, setEndDate] = React.useState("")
    // const [description, setDescription] = React.useState("")
    const [invalidEndDate, setInvalidEndDate] = React.useState(false)
    // const [reserve, setReserve] = React.useState(1)
    const [invalidTitle, setInvalidTitle] = React.useState(false)
    const [noImageFile, setNoImageFile] = React.useState(false)
    const [hasReserve, setHasReserve] = React.useState(false)
    const [invalidDescription, setInvalidDescription] = React.useState(false)
    const [invalidReserve, setInvalidReserve] = React.useState(false)
    const [noCategory, setNoCategory] = React.useState(false)
    const categories = useUserStore(state => state.categories)
    const setCategories = useUserStore(state => state.setCategories)
    const currentUser = useUserStore(state => state.currentUser)
    const [auctionUpdated, setAuctionUpdated] = React.useState(false)
    const setAuctions = useUserStore(state => state.setAuctions)
    const [imageChanged, setImageChanged] = React.useState(false)
    const [dateChanged, setDateChanged] = React.useState(false)
    const params = useParams();
    const [category, setCategory] = React.useState<category>({
        categoryId: -1,
        name: "",
    })
    const [currentAuction, setCurrentAuction] = React.useState({
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

    const sleep = (milliseconds: number) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }


    const getAuction = async () => {

        setImg(`http://localhost:4941/api/v1/auctions/${params.id}/image`)

        const response = await axios.get('http://localhost:4941/api/v1/auctions/categories')
        setCategories(response.data)

        const {data} = await axios.get(`http://localhost:4941/api/v1/auctions/${params.id}`)
        setCurrentAuction(data)

        setCategory(response.data.filter((a: { categoryId: number; }) => a.categoryId === data.categoryId)[0])

    }

    React.useEffect( () => {
        const getCategories = async () => {
            try {
                await getAuction()
                setErrorFlag(false)
                setErrorMessage("")
            } catch (error:any) {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            }
        }
        if(currentUser.userId === -1)
            navigate("/Auctions")

        else {
            getCategories().then()
        }
    }, [])

    const updateAuction = async () => {
        if (currentAuction.sellerId !== currentUser.userId) {
            setErrorFlag(true)
            setErrorMessage("You are not authorized to make changes to this auction")
        } else {
            let data;
            if (dateChanged && hasReserve) {
                data = {
                    "title": currentAuction.title,
                    "description": currentAuction.description,
                    "reserve": currentAuction.reserve,
                    "categoryId": category.categoryId,
                    "endDate": currentAuction.endDate,
                }
            } else if (dateChanged && !hasReserve) {
                data = {
                    "title": currentAuction.title,
                    "description": currentAuction.description,
                    "categoryId": category.categoryId,
                    "endDate": currentAuction.endDate,
                }
            } else if(!dateChanged && hasReserve) {
                data = {
                    "title": currentAuction.title,
                    "description": currentAuction.description,
                    "reserve": currentAuction.reserve,
                    "categoryId": category.categoryId,
                }
            } else {
                data = {
                    "title": currentAuction.title,
                    "description": currentAuction.description,
                    "categoryId": category.categoryId,
                }
            }
            await axios.patch(`http://localhost:4941/api/v1/auctions/${params.id}`, data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Authorization': `${currentUser.token}`,
                    }
                })

            setErrorFlag(false)
            setErrorMessage("")
        }

        if(imageChanged) {
            await axios.put(`http://localhost:4941/api/v1/auctions/${currentAuction.auctionId}/image`, imageFile, {
                headers: {
                    'Content-Type': `${imageFile.type}`,
                    'X-Authorization': `${currentUser.token}`
                }
            })
        }
        setAuctions([])
    }

    const editAuction = async () => {
        try {
            await updateAuction()
            setAuctionUpdated(true)
            await sleep(1000)
            window.location.reload()
        } catch (error: any) {
            setErrorFlag(true)
            setErrorMessage(error.response.statusText)
            setAuctionUpdated(false)
        }
    }

    const reserveLogic =(event:any,value:any)=> {
        if (currentAuction.reserve >= 1)
            setInvalidReserve(false)

        else
            setInvalidReserve(value)

        setHasReserve(value)
    }


    const checkTitle = (event: { target: { value: any }; }) => {
        setCurrentAuction({...currentAuction, title : event.target.value})
        if (event.target.value.length > 0) {
            setInvalidTitle(false)
        }
        else
            setInvalidTitle(true)

    }


    const checkCategory = (event: any, value: any) => {
        if(value !== null) {
            setCategory(value)
            setNoCategory(false)
        }
        else
            setNoCategory(true)

    }

    const checkReserve = (event: { target: { value: any; }; }) => {
        setCurrentAuction({...currentAuction, reserve:event.target.value})
        if (event.target.value >= 1 && !event.target.value.toString().includes('.')) {
            setInvalidReserve(false)
        } else {
            setInvalidReserve(true)
        }

    }

    const checkDate = (event: { target: { value: any; }; }) => {
        const chosenDate = new Date (event.target.value)
        const now = new Date()
        if (chosenDate < now ) {
            setInvalidEndDate(true)
        }
        else {

            setDateChanged(true)
            setInvalidEndDate(false)
            setCurrentAuction({
                ...currentAuction,
                endDate:chosenDate.toLocaleDateString().split('/').reverse().join('-')
                        + ' ' + chosenDate.toLocaleTimeString()
            })

        }

    }

    const checkDescription = (event: { target: { value: any; }; }) => {
        setCurrentAuction({...currentAuction,description:event.target.value})
        if (event.target.value.length > 0) {
            setInvalidDescription(false)
        }
        else
            setInvalidDescription(true)


    }

    const fileSelectedHandler = (event: any) => {
        if(event.target.files.length > 0 &&
            ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(event.target.files[0].type)) {

            const file = event.target.files[0]
            setImageChanged(true)
            setImageFile(file)
            setImg(URL.createObjectURL(file))
            setNoImageFile(false)

        } else {
            setErrorFlag(true)
            setErrorMessage("Given file type for profile image is unsupported")
            setNoImageFile(true)
        }
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway')
            return;
        setErrorFlag(false)
        setAuctionUpdated(false)
    }

    const getDate = () => {
        const date = new Date(currentAuction.endDate)
        if(date.toString() !== 'Invalid Date') {
            const currentDate = date.toLocaleDateString().split('/').reverse().join('-')
            const currentTime = date.toLocaleTimeString()
            return `${currentDate}T${currentTime}`
        }


    }

    return(
        <div>
            <MenuBar key={"/EditAuction"} items={["/Auctions","/Account", "/Logout"]} searchBar={false}/>
            <Paper elevation={24} sx={{mx: 50, my: 5, px: 5, py:5}}>
                <Grid
                    container
                    direction="column"
                    alignItems="center"
                    justifyContent="center">

                    <Avatar src={img} sx={{ width: 200, height: 200}}>
                        <ImageIcon sx={{ width: 150, height: 150}} />
                    </Avatar>
                </Grid>
                <Grid container>
                    <img src={AuctionLogo} width={50} height={50} alt="logo"/>
                </Grid>
                <Grid container direction="column">
                    <Grid item>
                        <TextField
                            label="Title"
                            value={currentAuction.title ||""}
                            required={true}
                            fullWidth
                            error={invalidTitle}
                            helperText={invalidTitle ? "Please enter a title" : ""}
                            margin="normal"
                            size={"small"}
                            onChange={checkTitle}/>
                    </Grid>
                    <Grid item>
                        <Autocomplete
                            disablePortal
                            options={categories}
                            getOptionLabel={(option) => option.name}
                            value={category.categoryId !== -1 ? category : null}
                            size={"small"}
                            onChange={checkCategory}
                            renderInput={(params) =>
                                <TextField
                                    {...params}
                                    label="Categories"
                                    required={true}
                                    error={noCategory}
                                    helperText={noCategory ? "Please select a category" : ""}
                                />}
                        />
                    </Grid>
                    <Grid item>
                        <Grid container direction={"row"} justifyContent="space-between" alignItems="center" pt={2}>
                            <Grid item>
                                <Grid container>
                                    <Grid item ml={-1}>
                                        <Checkbox onChange={reserveLogic} />
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                            label={"Reserve"}
                                            type={"number"}
                                            value={currentAuction.reserve.toString() || ""}
                                            disabled={!hasReserve}
                                            required={hasReserve}
                                            size={"small"}
                                            fullWidth
                                            error={invalidReserve}
                                            helperText={invalidReserve  ? "Reserve value must be $1 or more" : ""}
                                            onChange={checkReserve}
                                            InputProps={{
                                                startAdornment:
                                                    <InputAdornment position="start">
                                                        $
                                                    </InputAdornment>
                                            }}/>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item pb={1}>
                                <TextField
                                    type="datetime-local"
                                    required={true}
                                    value={getDate() || ""}
                                    fullWidth
                                    error={invalidEndDate}
                                    helperText={invalidEndDate ? "End date cannot be empty or in the past": ""}
                                    margin="normal"
                                    size={"small"}
                                    onChange={checkDate}/>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item justifyContent={"flex-start"} display={"flex"} alignContent={"flex-start"} pt={2}>
                        <TextField
                            id="outlined-multiline-static"
                            label="Description"
                            multiline
                            value={currentAuction.description !== null ? currentAuction.description : ""}
                            error={invalidDescription}
                            helperText={invalidEndDate ? "Please enter a description" : ""}
                            rows={4}
                            fullWidth
                            required={true}
                            onChange={checkDescription}
                        />
                    </Grid>


                </Grid>
                <Grid sx={{ '& button': { m: 1 } }}>
                    <Button color="primary" size="small" variant="contained"
                            onClick={editAuction}
                            disabled={invalidTitle || invalidEndDate || noImageFile || invalidDescription || noCategory || (hasReserve && invalidReserve)}>
                        Submit</Button>
                    <label htmlFor="contained-button-file">
                        <input
                            style={{display:'none'}}
                            accept=".jpeg, .jpg, .png, .gif"
                            id="contained-button-file"
                            type="file"
                            required={true}
                            onChange={fileSelectedHandler}/>
                        <Button color="primary" size="small" variant="contained" component="span">
                            Upload auction image
                        </Button>
                    </label>
                </Grid>
            </Paper>
            <Snackbar open={errorFlag}
                      anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                      autoHideDuration={2000} onClose={handleClose}>
                <Alert severity="error" onClose={handleClose}>{errorMessage}</Alert>
            </Snackbar>
            <Snackbar open={auctionUpdated && !errorFlag}
                      anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                      autoHideDuration={2000} onClose={handleClose}>
                <Alert severity="success" onClose={handleClose}>The auctions has been successfully updated</Alert>
            </Snackbar>
        </div>
    )

}

export default EditAuction;