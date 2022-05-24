import React from "react";
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {Alert, AppBar, IconButton, InputAdornment, Snackbar, TextField, Toolbar} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import {useNavigate} from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import {useUserStore} from "../store";
import axios from "axios";

const MenuBar = (props: { items: string[], searchBar:boolean }) => {
    const [isVisible, setVisible] = React.useState(false);
    const navigate = useNavigate();
    const [isLoggedOut, setIsLoggedOut] = React.useState(false)
    const setCurrentUser = useUserStore(state => state.setUser)
    const currentUser = useUserStore(state => state.currentUser)
    const[errorFlag, setErrorFlag] = React.useState(false);
    const[errorMessage, setErrorMessage] = React.useState("");


    const logoutUser = () => {

        axios.post('http://localhost:4941/api/v1/users/logout', null, {headers: {'X-Authorization': currentUser.token}})
            .then((() => {
                setErrorMessage("")
                setErrorFlag(false)
                setIsLoggedOut(true)
                setCurrentUser({userId: -1, token: ""})
                setTimeout(() => navigate("/Auctions"), 2000)
            }), (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway')
            return;
        setErrorFlag(false)
        setIsLoggedOut(false)
    }
    return (
        <Box sx={{ flexGrow: 1}}>
            <AppBar position="static">
                    <Toolbar variant="dense">
                        <React.Fragment key={"right"}>
                            <IconButton color={"inherit"} onClick={() => setVisible( true)}><MenuIcon /></IconButton>
                            <Drawer
                                anchor={"top"}
                                open={isVisible}
                                onClose={() => setVisible(false)}
                            >
                                <Box
                                    sx={{ color: 'primary.main'}}
                                    role="presentation"
                                    onClick={() => setVisible( false)}
                                >
                                    <List>
                                        {props.items.map((text:string) => (
                                            <ListItem key={text} disablePadding>
                                                <ListItemButton onClick={() => text !== '/Logout' ? navigate(text): logoutUser()}>
                                                    <ListItemText primary={text.split('/')[1]} />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </Drawer>
                            <Snackbar open={errorFlag}
                                      anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                                      autoHideDuration={6000}
                                      onClose={handleClose}>
                                <Alert severity="error" onClick={handleClose}>{errorMessage}</Alert>
                            </Snackbar>
                            <Snackbar open={isLoggedOut}
                                      anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                                      autoHideDuration={6000}
                                      onClose={handleClose}>
                                <Alert severity="success" onClose={handleClose}>Logged out successfully</Alert>
                            </Snackbar>
                    </React.Fragment>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

export default MenuBar;
