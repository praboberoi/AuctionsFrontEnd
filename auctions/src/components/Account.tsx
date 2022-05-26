import React from "react";
import {useUserStore} from "../store";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import MenuBar from "./MenuBar";
import {
    Alert,
    Avatar,
    Button,
    Checkbox, FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Snackbar,
    TextField
} from "@mui/material";
import AuctionLogo from "../website_images/auction-logo.svg";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {AuctionsListObject} from "./AuctionsListObject";


const Account = () => {
    const [showPassword, updateShowPassword] = React.useState<boolean>(false);
    const navigate = useNavigate();
    const [invalidFirstName, setInvalidFirstName] = React.useState(false)
    const [invalidLastName, setInvalidLastName] = React.useState(false)
    const currentUser = useUserStore(state => state.currentUser)
    const [password, setPassword] = React.useState<string>("")
    const [invalidPassword, setPassValidator]= React.useState(false)
    const [userDetailsChanged, setUserDetailsChanged] = React.useState(false)
    const [invalidEmail, setEmailValidator] = React.useState(false)
    const[errorFlag, setErrorFlag] = React.useState(false);
    const[errorMessage, setErrorMessage] = React.useState("");
    const[imageFile, setImageFile] = React.useState(new File(["../website_images/default-user-image.png"], 'default-user-image.png'));
    const [img, setImg] = React.useState("")
    const [imageChanged, setImageChanged] = React.useState(false)
    const [currentPassword, setCurrentPassword] = React.useState("")
    const [changePassword, setChangePassword] =  React.useState(false)
    const [profileUpdated, setProfileUpdated] = React.useState(false)
    const [invalidCurrentPassword, setInvalidCurrentPassword] = React.useState(false)
    const [showCurrentPassword, updateShowCurrentPassword ] = React.useState(false)
    const [imageRemoved, setImageRemoved] = React.useState(false)
    const [profileUpdateMessage, setProfileUpdateMessage] = React.useState("")
    const [userHasProfileImage, setUserHasProfileImage] = React.useState(false)
    const [editProfile, setEditProfile] = React.useState(false)
    const [userDetails, setUserDetails] =  React.useState({
        firstName: "",
        lastName: "",
        email: "",
    })
    const [usersAuctions, setUsersAuctions] = React.useState<Array<auction>>([])


    const sleep = (milliseconds: number) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    const getAuctions = async () => {
        const {data} = await axios.get('http://localhost:4941/api/v1/auctions/categories')

        const response = await axios.get(`http://localhost:4941/api/v1/auctions/?sellerId=${currentUser.userId}`)

        const responseSecond = await axios.get(`http://localhost:4941/api/v1/auctions/?bidderId=${currentUser.userId}`)

        for (let currAuc of response.data.auctions) {
            for (let cat of data) {
                if (currAuc.categoryId === cat.categoryId)
                    currAuc.categoryName = cat.name
            }
        }

        for (let currAuc of responseSecond.data.auctions) {
            for (let cat of data) {
                if (currAuc.categoryId === cat.categoryId)
                    currAuc.categoryName = cat.name
            }
        }

        const firstSearch = response.data.auctions
        const secondSearch  = responseSecond.data.auctions
            .filter((a: { auctionId: number; }) => !(firstSearch.map((b: { auctionId: number; }) => b.auctionId).includes(a.auctionId)))

        firstSearch.push.apply(firstSearch, secondSearch)

        setUsersAuctions(firstSearch)
    }

    const updateDeleteButtonState = async () => {
        try {
            await axios.get(`http://localhost:4941/api/v1/users/${currentUser.userId}/image`)
            setImg(`http://localhost:4941/api/v1/users/${currentUser.userId}/image`)
            setUserHasProfileImage(true)
        } catch (error) {
            setImg("")
            setUserHasProfileImage(false)
        }
    }

    React.useEffect(() => {
        const getUserInfo = async () => {
            try {
                await updateDeleteButtonState()
                await getUserDetails()
                await getAuctions()
                setErrorFlag(false)
                setErrorMessage("")
            } catch (error: any) {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            }
        }
        if (currentUser.userId !== -1) {
            getUserInfo().then()
        } else {
            setErrorFlag(true)
            setErrorMessage("Please login first")
            setTimeout(() => navigate('/Login'), 2000)
        }
    },[])


    const updateEmailEditState = (event: { target: { value: string; }; }) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        setUserDetailsChanged(true)
        setUserDetails({...userDetails, email: event.target.value})
        if(re.test(event.target.value)) {
            setEmailValidator(false)
        } else {
            setEmailValidator(true)
        }

    }

    const updatePasswordEditState = (event: { target: { value: string; }; }) => {
        setUserDetailsChanged(true)
        if(event.target.value.length >= 6) {
            setPassword(event.target.value)
            setPassValidator(false)
        } else {
            setPassValidator(true)
        }
    }

    const updateCurrentPasswordState = (event: { target: { value: string; }; }) => {
        setUserDetailsChanged(true)
        if (event.target.value.length >= 6) {
            setCurrentPassword(event.target.value)
            setInvalidCurrentPassword(false)
        } else {
            setInvalidCurrentPassword(true)
        }
    }

    const fileSelectedHandler = (event: any) => {
        setUserDetailsChanged(true)
        if(event.target.files.length > 0 &&
            ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(event.target.files[0].type) ||
            img.length > 0) {

            const file = event.target.files[0]
            setImageFile(file)
            setImg(URL.createObjectURL(file))
            setImageChanged(true)

        } else {
            setErrorFlag(true)
            setErrorMessage("Give file type for profile image is unsupported")
        }
    }

    const uploadFile = async () => {
        await axios.put(`http://localhost:4941/api/v1/users/${currentUser.userId}/image`, imageFile, {headers: {
                'Content-Type': `${imageFile.type}`,
                'X-Authorization': `${currentUser.token}`
            }})

    }

    const getUserDetails = async () => {
        const {data} = await axios.get(`http://localhost:4941/api/v1/users/${currentUser.userId}`, {headers: {
                'X-Authorization': `${currentUser.token}`
            }})

        setUserDetails(data)
    }

    const patchUser = async () => {
        if (changePassword) {
            await axios.patch(`http://localhost:4941/api/v1/users/${currentUser.userId}`, {
                "firstName": userDetails.firstName,
                "lastName":userDetails.lastName,
                "email": userDetails.email,
                "password": password,
                "currentPassword": currentPassword
            },
                {headers: {
                    'X-Authorization': currentUser.token,
                    'Content-Type': 'application/json',
                    }

                })
        } else {
            await axios.patch(`http://localhost:4941/api/v1/users/${currentUser.userId}`, {
                    "firstName": userDetails.firstName,
                    "lastName":userDetails.lastName,
                    "email": userDetails.email,
                },
                {headers: {
                        'X-Authorization': currentUser.token,
                        'Content-Type': 'application/json',
                    }

                })

        }
    }
    const deleteUserImage = async () => {
        await updateDeleteButtonState()
        if (userHasProfileImage) {
            axios.delete(`http://localhost:4941/api/v1/users/${currentUser.userId}/image`, {headers: {'X-Authorization': currentUser.token}})
                .then(() => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setImageRemoved(true)
                    setProfileUpdateMessage("Profile image deleted successfully")
                }, (error: any) => {
                    setErrorFlag(true)
                    setErrorMessage(error.response.statusText)
                    setProfileUpdateMessage("")
                })
        }
    }


    const updateUser = async() => {
        try {
            await patchUser();
            if (imageChanged)
                await uploadFile();
            setProfileUpdateMessage("Profile updated successfully")
            setProfileUpdated(true)
            setErrorFlag(false)
            setErrorMessage("")
            await sleep(1000)
            window.location.reload()
        } catch (error:any) {
            setErrorFlag(true)
            setErrorMessage(error.response.statusText)
            setProfileUpdateMessage("")
            console.log(error)
        }

    }
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway')
            return;
        setErrorFlag(false)
        setProfileUpdated(false)
        setImageRemoved(false)

    }

    const passwordLogic = () => {
        setChangePassword(!changePassword)
        setInvalidCurrentPassword(!invalidCurrentPassword)
        setPassValidator(!invalidPassword)
    }

    const submitButtonStatus = () => {
        return !userDetailsChanged || ((changePassword && (invalidCurrentPassword || invalidPassword)) || invalidEmail || invalidFirstName || invalidLastName);
    }

    const checkFirstName = (event:any) => {
        setUserDetailsChanged(true)
        setUserDetails({...userDetails, firstName: event.target.value})
        if (event.target.value.length > 0) {
            setInvalidFirstName(false)
        }
        else
            setInvalidFirstName(true)
    }

    const checkLastName = (event:any) => {
        setUserDetailsChanged(true)
        setUserDetails({...userDetails, lastName: event.target.value})
        if (event.target.value.length > 0) {
            setInvalidLastName(false)

        }
        else
            setInvalidLastName(true)
    }


    const auctions_rows = () => usersAuctions.map((a:auction, index) => <AuctionsListObject key={a.auctionId} currentAuction={a}/>)

    return(
        <div>
            <MenuBar key={"/Account"} items={["/Auctions","/CreateAuction", "/Logout"]} searchBar={false}/>
            <Paper elevation={24} sx={{mx: 50, my: 5, px: 5, py:5}}>
                <Grid
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justifyContent="center">

                    <Avatar src={img} sx={{ width: 200, height: 200}} />
                </Grid>
                <Grid container>
                    <img src={AuctionLogo} width={50} height={50} alt="logo"/>
                </Grid>
                <Grid container direction="column">
                    <Grid item>
                        <TextField
                            label="First Name"
                            value={userDetails.firstName || ""}
                            required={true}
                            disabled={!editProfile}
                            fullWidth
                            error={invalidFirstName}
                            helperText={invalidFirstName ? "Lastname can not be empty" : ""}
                            margin="normal"
                            size={"small"}
                            onChange={checkFirstName}/>
                    </Grid>
                    <Grid item>
                        <TextField
                            label="Last Name"
                            value={userDetails.lastName || ""}
                            required={true}
                            disabled={!editProfile}
                            fullWidth
                            error={invalidLastName}
                            helperText={invalidLastName ? "Lastname can not be empty" : ""}
                            margin="normal"
                            size={"small"}
                            onChange={checkLastName}/>
                    </Grid>
                    <Grid item>
                        <TextField
                            label="Email"
                            margin="normal"
                            fullWidth
                            disabled={!editProfile}
                            value={userDetails.email || ""}
                            required={true}
                            error={invalidEmail}
                            helperText={invalidEmail ? "Please enter a valid email address" : ""}
                            size={"small"}
                            onChange={updateEmailEditState}/>
                    </Grid>
                    <Grid item>
                        <Grid container direction={"row"} justifyContent={'flex-start'} alignItems={'flex-start'} >
                    {changePassword &&
                        <Grid container direction={'column'}>
                            <Grid item>
                                <TextField type={showPassword ? 'text': 'password'}
                                           onChange={updatePasswordEditState}
                                           label="New Password"
                                           required={true}
                                           margin="normal"
                                           fullWidth
                                           size={"small"}
                                           error={invalidPassword}
                                           helperText={invalidPassword ? "Password must be at least 6 characters long" : ""}
                                           InputProps={{
                                               endAdornment: (
                                                   <InputAdornment position={"end"}>
                                                       <IconButton aria-label="toggle password visibility"
                                                                   onClick={() => {updateShowPassword(!showPassword)}}>
                                                           {showPassword ? <VisibilityOff /> : <Visibility />}
                                                       </IconButton>
                                                   </InputAdornment>
                                               )
                                           }}/>
                            </Grid>
                            <Grid item>
                            <TextField type={showPassword ? 'text': 'password'}
                                       onChange={updateCurrentPasswordState}
                                       label="current password"
                                       required={true}
                                       fullWidth
                                       margin="normal"
                                       size={"small"}
                                       error={invalidCurrentPassword}
                                       helperText={invalidCurrentPassword ? "Password must be at least 6 characters long": ""}
                                       InputProps={{
                                           endAdornment: (
                                               <InputAdornment position={"end"}>
                                                   <IconButton aria-label="toggle password visibility"
                                                               onClick={() => {updateShowCurrentPassword(!showCurrentPassword)}}>
                                                       {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                                   </IconButton>
                                               </InputAdornment>
                                           )
                                       }}/>
                        </Grid>
                        </Grid>}
                            {editProfile &&
                                <Grid item>
                                    <FormControlLabel
                                        value="end"
                                        control={<Checkbox onChange={passwordLogic} />}
                                        label="Update Password"
                                        labelPlacement="end"
                                    />
                                </Grid>
                            }
                        </Grid>
                    </Grid>
                </Grid>
                {editProfile ?
                    <Grid  item sx={{ '& button': { m: 1 } }}>
                    <Button color="primary" size="small" variant="contained"
                            onClick={updateUser} disabled={submitButtonStatus()}>Update</Button>
                    <label htmlFor="contained-button-file">
                        <input
                            style={{display:'none'}}
                            accept=".jpeg, .jpg, .png, .gif"
                            id="contained-button-file"
                            type="file"
                            onChange={fileSelectedHandler}/>
                        <Button color="primary" size="small" variant="contained" component="span">
                            Upload profile Image
                        </Button>
                    </label>
                    <Button sx={{ml:1}} color="primary" disabled={img.length === 0} size="small" variant="contained" component="span" onClick={deleteUserImage}>
                        Remove Image
                    </Button>
                </Grid>
                    : <Grid item>
                        <Button color="primary" size="small" variant="contained" component="span" onClick={() => setEditProfile(!editProfile)}>Edit Profile</Button>
                    </Grid>}
            </Paper>
            <Grid container direction={"row"} justifyContent="space-around" alignItems="center">
                {(usersAuctions.length > 0 && auctions_rows())}
            </Grid>
            <Snackbar open={errorFlag}
                      anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                      autoHideDuration={2000} onClose={handleClose}>
                <Alert severity="error" onClose={handleClose}>{errorMessage}</Alert>
            </Snackbar>
            <Snackbar open={ (imageRemoved || profileUpdated) && !errorFlag}
                      anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                      autoHideDuration={2000} onClose={handleClose}>
                <Alert severity="success" onClose={handleClose}>{profileUpdateMessage}</Alert>
            </Snackbar>
        </div>
    )


}

export default Account;