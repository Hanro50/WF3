import {
  Box,
  Button,
  Container,
  Dialog,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Outlet, useNavigate } from "@remix-run/react";
import { useState } from "react";
import useSWR from "swr";
import { theme } from "~/theme";

export default function Tasks() {
  const { data, mutate } = useSWR("/api/activities");
  const navigate = useNavigate();
  console.log(data);
  const [open, setOpen] = useState(false);
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container
      sx={{
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "calc(100% - 16px)",
      }}
    >
      <Typography sx={{ color: "black", my: 2 }} variant="h4">
        Task Manager
      </Typography>

      <Dialog
        sx={{
          outline: "1px solid #ccc",
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
        }}
        open={open}
        fullScreen={fullScreen}
        onClose={() => setOpen(false)}
      >
        <Typography variant="h6">Tasks</Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            minWidth: 200,
            "& button": {
              m: 0.5,
            },
            margin: 2,
          }}
        >
          <Button variant="contained" onClick={mutate}>
            Refresh
          </Button>
          {data?.map &&
            data?.map((script: any) => {
              return (
                <Button
                  key={script.id}
                  variant="contained"
                  onClick={() => navigate(`/task/${script.id}`)}
                >
                  {script.name}
                </Button>
              );
            })}
          <Button variant="contained" onClick={() => setOpen(false)}>
            Close
          </Button>
        </Box>
      </Dialog>

      <Outlet
        context={() => {
          return setOpen(true);
        }}
      />
    </Container>
  );
}
