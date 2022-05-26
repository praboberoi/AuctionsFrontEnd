import React from "react";
import {useNavigate} from "react-router-dom";
import {useUserStore} from "../store";
import axios from "axios";
import {
    Alert,
    Avatar,
    Button,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Snackbar,
    TextField
} from "@mui/material";
import AuctionLogo from "../website_images/auction-logo.svg";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import MenuBar from "./MenuBar";


const Register = () => {
    const [showPassword, updateShowPassword] = React.useState<boolean>(false);
    const setId = useUserStore(state => state.setId)
    const setAuthToken = useUserStore(state => state.setAuthToken)
    const currentUser = useUserStore(state => state.currentUser)
    const [firstName, setFirstName] = React.useState<string>("")
    const [lastName, setLastName] = React.useState<string>("")
    const [email, setEmail] = React.useState<string>("")
    const [password, setPassword] = React.useState<string>("")
    const [invalidPassword, setPassValidator]= React.useState(true)
    const [invalidEmail, setEmailValidator] = React.useState(true)
    const[errorFlag, setErrorFlag] = React.useState(false);
    const[errorMessage, setErrorMessage] = React.useState("");
    const[imageFile, setImageFile] = React.useState(new File(["../website_images/default-user-image.png"], 'default-user-image.png'));
    const [img, setImg] = React.useState("")
    const [registered, setRegistered] = React.useState(false)
    const navigate = useNavigate();

    const sleep = (milliseconds: number) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    const registerLoginHeader = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    React.useEffect(() => {
        if (currentUser.userId !== -1)
            navigate('/Auctions')
    },[])

    const updateEmailEditState = (event: { target: { value: string; }; }) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(re.test(event.target.value)) {
            setEmail(event.target.value)
            setEmailValidator(false)
        } else {
            setEmailValidator(true)
        }

    }

    const updatePasswordEditState = (event: { target: { value: string; }; }) => {
        if(event.target.value.length >= 6) {
            setPassword(event.target.value)
            setPassValidator(false)
        } else {
            setPassValidator(true)
        }
    }

    const fileSelectedHandler = (event: any) => {
        if(event.target.files.length > 0 &&
            ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(event.target.files[0].type) ||
            img.length > 0) {

            const file = event.target.files[0]
            setImageFile(file)
            setImg(URL.createObjectURL(file))

        } else {
            setErrorFlag(true)
            setErrorMessage("Given file type for profile image is unsupported")
        }
    }

    const uploadFile = async () => {
        await axios.put(`http://localhost:4941/api/v1/users/${currentUser.userId}/image`, imageFile, {headers: {
                'Content-Type': `${imageFile.type}`,
                'X-Authorization': `${currentUser.token}`
            }})

    }

    const loginUser = async () => {
       const {data} = await axios.post('http://localhost:4941/api/v1/users/login', {
            "email": email,
            "password": password
           },
            registerLoginHeader)

        setId(data.userId)
        setAuthToken(data.token)
    }


    const registerUser = async () => {
            await axios.post('http://localhost:4941/api/v1/users/register', {
                    "firstName": firstName,
                    "lastName": lastName,
                    "email": email,
                    "password": password
                },
                registerLoginHeader)
    }

    const setUpUser = async() => {
        try {
            await registerUser();
            await loginUser();
            if (img.length > 0)
                await uploadFile();
            setErrorFlag(false)
            setErrorMessage("")
            setRegistered(true)
            await sleep(2000)
            navigate('/auctions')
        } catch (error:any) {
            setErrorFlag(true)
            setErrorMessage(error.response.statusText)
        }

    }
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway')
            return;
        setErrorFlag(false)
        setRegistered(false)
    }

    return(
            <div>
                <MenuBar key={"/Register"} items={["/login","/Auctions"]} searchBar={false}/>
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
                        <TextField
                            label="First Name"
                            required={true}
                            margin="normal"
                            error={firstName.length === 0}
                            helperText={firstName.length === 0 ? "First name cannot be empty": ""}
                            size={"small"}
                            onChange={(event) => setFirstName(event.target.value)}/>
                        <TextField
                            label="Last Name"
                            required={true}
                            margin="normal"
                            error={lastName.length === 0}
                            helperText={lastName.length === 0 ? "Last name cannot be empty": ""}
                            size={"small"}
                            onChange={(event) => setLastName(event.target.value)}/>
                        <TextField
                            label="Email"
                            margin="normal"
                            required={true}
                            error={invalidEmail}
                            helperText={invalidEmail ? "Please enter a valid email address" : ""}
                            size={"small"}
                            onChange={updateEmailEditState}/>
                        <TextField type={showPassword ? 'text': 'password'}
                                   onChange={updatePasswordEditState}
                                   label="password"
                                   required={true}
                                   margin="normal"
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
                    <Grid sx={{ '& button': { m: 1 } }}>
                        <Button color="primary" size="small" variant="contained"
                                onClick={setUpUser} disabled={invalidEmail || invalidPassword}>Submit</Button>
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
                    </Grid>
                </Paper>
                <Snackbar open={errorFlag}
                          anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                          autoHideDuration={2000} onClose={handleClose}>
                    <Alert severity="error" onClose={handleClose}>{errorMessage}</Alert>
            </Snackbar>
                <Snackbar open={ registered && !errorFlag}
                          anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                          autoHideDuration={2000} onClose={handleClose}>
                    <Alert severity="success" onClose={handleClose}>Profile created successfully</Alert>
                </Snackbar>
            </div>
    )

}

export default Register;