import React from "react";
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Paper, Snackbar,
    TextField
} from "@mui/material";
import AuctionLogo from "../website_images/auction-logo.svg";
import AucitonImage from "../website_images/istockphoto-1209088835-612x612.jpeg";
import CSS from 'csstype'
import {Visibility, VisibilityOff} from "@mui/icons-material";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {useUserStore} from "../store";
import MenuBar from "./MenuBar";

const Login = () => {
    const [showPassword, updateShowPassword] = React.useState<boolean>(false)
    const [email, setEmail] = React.useState<string>("")
    const [password, setPassword] = React.useState<string>("")
    const[errorFlag, setErrorFlag] = React.useState(false);
    const[errorMessage, setErrorMessage] = React.useState("");
    const navigate = useNavigate();
    const setCurrentUser = useUserStore(state => state.setUser)
    const currentUser = useUserStore(state => state.currentUser)
    const loggedOut = useUserStore(state => state.loggedOut)
    const setLoggedOut = useUserStore(state => state.setLoggedOut)
    const [loggedIn, setLoggedIn] = React.useState(false)


    React.useEffect(() => {
        if (currentUser.userId !== -1) {
            setLoggedIn(true)
            navigate('/Auctions')
        } else {
            setLoggedIn(false)
        }

    },[])


    const loginHeader = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    const updateEmailEditState = (event: { target: { value: React.SetStateAction<string> } }) => {
        setEmail(event.target.value)
    }

    const updatePasswordEditState = (event: { target: { value: React.SetStateAction<string> } }) => {
        setPassword(event.target.value)
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway')
            return;
        setErrorFlag(false)
    }

    const loginUser = () => {
        axios.post('http://localhost:4941/api/v1/users/login', {"email": email, "password": password}, loginHeader)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setCurrentUser(response.data)
                setLoggedOut(false)
                setLoggedIn(true)
                setTimeout( () => navigate('/auctions'), 2000)
            }, (error) => {
                setErrorFlag(true)
                if(error.response.status === 400)
                    setErrorMessage("Invalid email or password")

                else if(error.response.status === 500)
                    setErrorMessage("Server unavailable")

            })
    }

    const card: CSS.Properties = {
        padding: "10px",
        display: "flex",
        flexDirection: "column"

    }
    return(
    <div>
        <MenuBar key={"/login"} items={["/Register", "/Auctions"]} searchBar={false}/>
        <Grid container style={{minHeight: '100vh'}}>
            <Grid item xs={12} sm={6} md={6}>
                <img src={AucitonImage} style ={{width: '100%', height:'100%', objectFit:'cover'}} alt={'Welcome'}/>
            </Grid>
            <Grid container item xs={12} sm={6} md={6}
                  alignItems="center"
                  direction="column"
                  justifyContent="space-between"
                  style={{ padding : 10 }}>
                <div />
                <Paper elevation={3} style={card}>
                    <Grid container>
                        <img src={AuctionLogo} width={50} height={50} alt="logo"/>
                    </Grid>
                    <TextField label="Email" margin="normal" size={"small"} onChange={updateEmailEditState}/>
                    <TextField type={showPassword ? 'text': 'password'} onChange={updatePasswordEditState}
                               label="password"
                               required={true}
                               margin="normal" size={"small"}
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

                    <Grid sx={{ '& button': { m: 1 } }}>
                        <Button color="primary" size="small" variant="contained" onClick={loginUser}>Login</Button>
                        <Button color="secondary" size="small" variant="contained" onClick={() => navigate('/register')}>Register</Button>
                    </Grid>
                </Paper>
                <div />
            </Grid>
        </Grid>
        <Snackbar open={errorFlag}
                  anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                  autoHideDuration={2000}
                  onClose={handleClose}>
            <Alert severity="success" onClose={handleClose}>{errorMessage}</Alert>
        </Snackbar>
        <Snackbar open={loggedIn}
                  anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                  autoHideDuration={2000} onClose={handleClose}>
            <Alert severity="success" onClose={handleClose}>Logged in successfully</Alert>
        </Snackbar>
    </div>
)

}

export default Login;