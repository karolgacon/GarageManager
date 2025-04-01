import {createUseStyles} from "react-jss";

const useStyles = createUseStyles({
    container: {
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "50vw",
        fontFamily: "'Roboto', sans-serif",
        padding: "20px",
        boxSizing: "border-box",
        backgroundColor: "#ffffff", // White color from image
        color: "#000000",
        position: "relative",
    },
    button: {
        margin: "8px 0",
        padding: "12px 24px",
        fontFamily: "fontFamily",
        fontSize: "20px",
        fontWeight: 500,
        color: "#ffffff",
        backgroundColor: "#DC143C", // Dark red color from image
        border: "1px solid #DC143C",
        borderRadius: "32px",
        cursor: "pointer",
        transition: "background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        width: "100%",
        maxWidth: "280px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
        "&:hover": {
            backgroundColor: "#C01030",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
        },
        "&:active": {
            backgroundColor: "#B0102E",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.15)",
        },
    },

    title: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#000000",
        marginBottom: "10px",
    },

    krsContainer: {
        marginTop: "20px",
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "400px",
        textAlign: "center",
    },
    krsOption: {
        display: "flex",
        alignItems: "center",
        marginBottom: "10px",
        fontSize: "16px",
        "& input": {
            marginRight: "10px",
        },
    },
    heading: {
        fontSize: "20px",
        marginBottom: "10px",
        color: "#333",
        fontWeight: "bold",
    },
    input: {
        margin: "10px 0",
        padding: "10px",
        fontSize: "16px",
        borderRadius: "12px",
        border: "1px solid #ccc",
        width: "100%",
        maxWidth: "300px",
        boxSizing: "border-box",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    },

    link: {
        marginTop: "10px",
        fontSize: "12px",
        color: "#666",
        textDecoration: "none",
        "&:hover": {
            textDecoration: "underline",
        },
    },

    errorMessage: {
        color: "red",
        fontSize: "14px",
        marginTop: "10px",
    },
    '@media (max-width: 768px)': {
        container: {
            width: "100%",
            padding: "10px",
        },
        button: {
            maxWidth: "100%",
        },
    },

    span: {
        display: "block",
        fontSize: "12px",
        color: "grey",
    }
});

export default useStyles;