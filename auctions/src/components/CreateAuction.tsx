import React from "react";
import {useUserStore} from "../store";
import {useNavigate} from "react-router-dom";
import MenuBar from "./MenuBar";
import {
    Alert,
    Autocomplete,
    Avatar,
    Button, Checkbox,
    Grid,
    InputAdornment,
    Paper,
    Snackbar,
    TextField
} from "@mui/material";
import AuctionLogo from "../website_images/auction-logo.svg";
import axios from "axios";
import ImageIcon from '@mui/icons-material/Image';


const CreateAuction = () => {
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const navigate = useNavigate();
    const[imageFile, setImageFile] = React.useState(new File(["../website_images/default-user-image.png"], 'default-user-image.png'));
    const [img, setImg] = React.useState("")
    const [title, setTitle] = React.useState("")
    const [category, setCategory] = React.useState<category>({
        categoryId: -1,
        name: "",
    })
    const [endDate, setEndDate] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [invalidEndDate, setInvalidEndDate] = React.useState(true)
    const [reserve, setReserve] = React.useState(1)
    const [invalidTitle, setInvalidTitle] = React.useState(true)
    const [noImageFile, setNoImageFile] = React.useState(true)
    const [hasReserve, setHasReserve] = React.useState(false)
    const [invalidDescription, setInvalidDescription] = React.useState(true)
    const [invalidReserve, setInvalidReserve] = React.useState(false)
    const [noCategory, setNoCategory] = React.useState(true)
    const categories = useUserStore(state => state.categories)
    const setCategories = useUserStore(state => state.setCategories)
    const currentUser = useUserStore(state => state.currentUser)
    const [auctionCreated, setAuctionCreated] = React.useState(false)
    const setAuctions = useUserStore(state => state.setAuctions)


    const sleep = (milliseconds: number) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    React.useEffect( () => {
        const getCategories = () => {
            axios.get('http://localhost:4941/api/v1/auctions/categories')
                .then((response) => {
                    setCategories(response.data)
                    setErrorFlag(false)
                    setErrorMessage("")
                },(error:any) => {
                    setErrorFlag(true)
                    setErrorMessage(error.response.statusText)
                })
        }
        if(currentUser.userId === -1)
            navigate("/Auctions")

        else {
            getCategories()

        }
    }, [setCategories])

    const addAuction = async () => {
        let auctionData;
        if (hasReserve) {
            auctionData = {
                "title": title,
                "description": description,
                "reserve": reserve,
                "categoryId": category.categoryId,
                "endDate": endDate
            }
        }
        else {
           auctionData = {
                "title": title,
                "description": description,
                "categoryId": category.categoryId,
                "endDate": endDate
            }
        }
        const {data} = await axios.post(`http://localhost:4941/api/v1/auctions` , auctionData,
            {headers: {
                'X-Authorization': `${currentUser.token}`
            }})

        await axios.put(`http://localhost:4941/api/v1/auctions/${data.auctionId}/image`, imageFile, {headers: {
                'Content-Type': `${imageFile.type}`,
                'X-Authorization': `${currentUser.token}`
            }})

        setAuctions([])
    }


    const createAuction = async () => {
        try {
            await addAuction()
            setAuctionCreated(true)
            await sleep(1000)
            window.location.reload()
        } catch (error: any) {
            setErrorFlag(true)
            setErrorMessage(error.response.statusText)
            setAuctionCreated(false)
        }
    }

    const reserveLogic =(event:any,value:any)=> {
            setInvalidReserve(value)
            setHasReserve(value)
    }


    const checkTitle = (event: { target: { value: any }; }) => {
        if (event.target.value.length > 0) {
            setTitle(event.target.value)
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
        const chosenReserve = event.target.value
        if (chosenReserve >= 1 && !chosenReserve.includes('.')) {
            setReserve(parseInt(chosenReserve, 10))
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
            setInvalidEndDate(false)
            setEndDate(chosenDate.toLocaleDateString().split('/').reverse().join('-') + ' ' + chosenDate.toLocaleTimeString())
        }

    }

    const checkDescription = (event: { target: { value: any; }; }) => {
        if (event.target.value.length > 0) {
            setDescription(event.target.value)
            setInvalidDescription(false)
        }
        else
            setInvalidDescription(true)


    }

    const fileSelectedHandler = (event: any) => {
        if(event.target.files.length > 0 &&
            ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(event.target.files[0].type)) {

            const file = event.target.files[0]
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
        setAuctionCreated(false)
    }

    return(
        <div>
            <MenuBar key={"/CreateAuction"} items={["/Auctions","/Account","/Logout"]} searchBar={false}/>
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
                            onClick={createAuction}
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
            <Snackbar open={auctionCreated && !errorFlag}
                      anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                      autoHideDuration={2000} onClose={handleClose}>
                <Alert severity="success" onClose={handleClose}>The auctions has been successfully created</Alert>
            </Snackbar>
        </div>
    )

}

export default CreateAuction;