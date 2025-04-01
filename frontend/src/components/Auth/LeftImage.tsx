import { createUseStyles } from 'react-jss';
import userLoginImage from '../../../public/logo.png';

const useStyles = createUseStyles({
    logoWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    image: {
        height: '80px', // Larger logo
        width: 'auto',
    },
    fosterFlowTitle: {
        fontFamily: "Poly",
        fontSize: '24px',
        color: '#FFFFFF', // White color
        margin: 0,
    },
});

const LeftImage = () => {
    const classes = useStyles();

    return (
        <div className={classes.logoWrapper}>
            <img className={classes.image} src={userLoginImage} alt="GarageManager logo" />
            <h1 className={classes.fosterFlowTitle}>GarageManager</h1>
        </div>
    );
};

export default LeftImage;