/* eslint-disable react/jsx-pascal-case */
import {
  Button,
  Container,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import useSWR from "swr";
import { useFormik } from "formik";
import * as yup from "yup";
import DeleteIcon from "@mui/icons-material/Delete.js";
import VisibilityIcon from "@mui/icons-material/Visibility.js";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff.js";
const MessageSchema = yup.object({
  address: yup.string().required(),
  host: yup.string().required(),
  port: yup.number().required(),
});

export default function Proxy() {
  const { data, mutate } = useSWR("/api/proxy");
  console.log(data);
  const formik = useFormik({
    initialValues: {
      address: "",
      host: "",
      port: "",
    },
    validationSchema: MessageSchema,

    onSubmit: async (values) => {
      await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(values),
      });
      mutate();
    },
  });

  async function handleHiddenToggle(proxy: any) {
    proxy.show = !proxy.show;
    const req = await fetch("/api/proxy", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(proxy),
    });
    mutate(await req.json());
  }
  async function handleRemove(proxy: any) {
    proxy.show = !proxy.show;
    const req = await fetch("/api/proxy", {
      method: "delete",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(proxy),
    });
    mutate(await req.json());
  }
  return (
    <Container
      sx={{
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography sx={{ color: "black", my: 2 }} variant="h4">
        Proxy settings
      </Typography>
      <Grid container sx={{ color: "black" }}>
        <Grid container spacing={0.5}>
          <Grid sx={{ color: "black" }} item xs={6}>
            <TextField
              sx={{ width: "100%" }}
              label="Address"
              name="address"
              variant="outlined"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid sx={{ color: "black" }} item xs={3}>
            <TextField
              sx={{ width: "100%" }}
              label="Host"
              name="host"
              variant="outlined"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid sx={{ color: "black" }} item xs={3} md={1.75}>
            <TextField
              sx={{ width: "100%" }}
              label="Port"
              name="port"
              type="number"
              variant="outlined"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid sx={{ color: "black" }} item xs={12} md={1.25}>
            <Button
              sx={{ width: "100%", height: "100%" }}
              onClick={formik.submitForm}
              disabled={!formik.isValid}
              variant="contained"
            >
              Add
            </Button>
          </Grid>
        </Grid>
        <Grid container sx={{ height: 20 }} />

        <Grid container spacing={0.5}>
          <Grid sx={{ color: "black", textAlign: "center" }} item xs={6}>
            Address
          </Grid>
          <Grid sx={{ color: "black", textAlign: "center" }} item xs={3}>
            Host
          </Grid>
          <Grid
            sx={{ color: "black", textAlign: "center" }}
            item
            xs={3}
            md={1.75}
          >
            Port
          </Grid>
          <Grid
            sx={{
              color: "black",
              textAlign: "center",
              display: { xs: "none", md: "flex" },
            }}
            item
            md={1.25}
          >
            Actions
          </Grid>
        </Grid>
        {data &&
          Object.values(data).map((proxy: any) => (
            <Grid container key={proxy.address} sx={{ mb: { xs: 2, md: 1 } }}>
              <Grid
                item
                xs={6}
                sx={{
                  border: "0.5px solid black",
                  p: 0.25,
                  overflow: "auto",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {proxy.address}
              </Grid>
              <Grid
                item
                xs={3}
                sx={{
                  border: "0.5px solid black",
                  overflow: "auto",
                  p: 0.25,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {proxy.host}
              </Grid>
              <Grid
                item
                xs={3}
                md={1.75}
                sx={{
                  border: "0.5px solid black",
                  overflow: "auto",
                  p: 0.25,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {proxy.port}
              </Grid>

              <Grid
                sx={{
                  border: "0.5px solid black",
                  overflow: "auto",
                  p: 0.25,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                }}
                item
                xs={12}
                md={1.25}
              >
                <IconButton
                  sx={{ my: { md: -1 } }}
                  onClick={() => handleRemove(proxy)}
                >
                  {/**@ts-ignore */}
                  <DeleteIcon.default />
                </IconButton>
                <IconButton
                  sx={{ my: { md: -1 } }}
                  onClick={() => handleHiddenToggle(proxy)}
                >
                  {proxy.show ? (
                    <>
                      {" "}
                      {/**@ts-ignore */}
                      <VisibilityIcon.default />
                    </>
                  ) : (
                    <>
                      {" "}
                      {/**@ts-ignore */}
                      <VisibilityOffIcon.default />
                    </>
                  )}
                </IconButton>
              </Grid>
            </Grid>
          ))}
      </Grid>
    </Container>
  );
}
