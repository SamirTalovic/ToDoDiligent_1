import { CircularProgress, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";

function InitialLoader({ adding }: { adding: string}) {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <CircularProgress color='primary'/>
            <Typography sx={{
                fontSize: "20px",
                fontWeight: 400,
                color: "black",
                marginTop: "10px",
                fontFamily: "Poppins, sans-serif"
            }}>Loading {adding}...</Typography>
        </div>
    );
}

export default observer(InitialLoader);