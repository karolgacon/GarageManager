import { createUseStyles } from 'react-jss';
import userLoginImage from '../../../public/logo.png';

const useStyles = createUseStyles({
    textContainer: {
        position: 'fixed',
        bottom: '40px',
        left: '25%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '1000px',
        textAlign: 'center',
        zIndex: 2,
    },
    textWrapper: {
        position: 'relative',
        display: 'inline-block',
    },
    image: {
        width: '300px',
        height: 'auto',
        marginBottom: '20px',
        borderRadius: '40%',
    },
    description: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '18px',
        fontWeight: 390,
        color: '#FEFCFA',
        lineHeight: 1.3,
        whiteSpace: 'pre-wrap',
        zIndex: 1,
        position: 'relative',
    },
});

const AppText = () => {
    const classes = useStyles();
    const content = `Nobody repairs a car like us!`;

    return (
        <div className={classes.textContainer}>
            <div className={classes.textWrapper}>
                <img className={classes.image} src={userLoginImage} alt="Foster Flow logo" />
                <p className={classes.description}>{content}</p>
            </div>
        </div>
    );
};

export default AppText;