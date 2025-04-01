import { createUseStyles } from 'react-jss';
import LoginWrapper from '../components/Auth/LoginWrapper';
import LeftAppInfo from '../components/Auth/LeftAppInfo';

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
    },
    leftSide: {
        width: '50%',
        position: 'relative',
        backgroundColor: '#FF2D55', // Red color from image
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightSide: {
        width: '50%',
        position: 'relative',
        backgroundColor: '#FFFFFF', // White background
    },
    '@media (max-width: 768px)': {
        container: {
            flexDirection: 'column',
        },
        leftSide: {
            width: '100%',
            height: '30%',
        },
        rightSide: {
            width: '100%',
            height: '70%',
        },
    },
});

function Login() {
    const classes = useStyles();

    return (
        <div className={classes.container}>
            <div className={classes.leftSide}>
                <LeftAppInfo />
            </div>
            <div className={classes.rightSide}>
                <LoginWrapper />
            </div>
        </div>
    );
}

export default Login;