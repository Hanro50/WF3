import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { Outlet, useNavigate } from "@remix-run/react";
import useSWR from "swr";



export default function Tasks() {
  const { data, mutate } = useSWR("/api/activities")
  const navigate = useNavigate();
  console.log(data);
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
      <Grid container spacing={0.5} sx={{ flexGrow: 1 }}>
        <Grid item xs={4} sm={3} md={2} sx={{ display: "flex", flexDirection: "column" }} >
          <Typography variant="h6">
            Tasks</Typography>
          <Box sx={{ outline: "1px solid black", flexGrow: 1, padding: 2, borderRadius: 5,  "& button": {
                  margin: 0.5,
                },}}>
            <Button sx={{ width: "100%", textTransform: "none" }} variant="contained" onClick={mutate}>Refresh</Button>
            {data?.map && data?.map((script: any) => {
              return <Button key={script.id} sx={{ width: "100%", textTransform: "none" }} variant="contained" onClick={()=>navigate(`/task/${script.id}`)}>{script.name}</Button>
            })}
          </Box>
        </Grid>
        <Grid item xs={8} sm={9} md={10}>
          <Outlet />
        </Grid>
      </Grid>
    </Container>
  );
}
