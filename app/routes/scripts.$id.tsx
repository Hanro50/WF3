import { Box, Button, Checkbox, TextField, Typography } from "@mui/material";
import { useParams } from "@remix-run/react";
import { useFormik } from "formik";
import { useEffect } from "react";
import useSWR from "swr";


export default function Script() {
  const { id } = useParams();

  const { data } = useSWR<{
    text: string,
    data:
    {
      autoStart: boolean
      cwd: string,
      id: string,
      name: string,
      newScript: boolean,
      runner: string,
    }

  }>(`/api/scripts/${id}`);
  console.log(data)

  useEffect(() => {
    if (!data) return
    formik.setValues({ ...data?.data, text: data?.text })

  }, [data])

  const formik = useFormik({
    "initialValues": {
      "name": "",
      "runner": "",
      "cwd": "",
      "autoStart": false,
      "text": "",
    },
    "onSubmit": async (values) => {
      await fetch(`/api/scripts/${id}`, {
        "method": "POST",
        "headers": {
          "content-type": "application/json",
        },
        "body": JSON.stringify(values),
      });
    },
  })

  if (!data) return <>Loading</>;

  return (

    <Box sx={{
      width: {xs:"99%",sm:"80%"},
      display: "flex",
      transitionDuration: "0.5s",
      flexDirection: "column",
      "& .MuiTextField-root,& .MuiBox-root,& .MuiButton-root": {
        m: 1
      },
    }}>
      <TextField value={formik.values.name} label={"name"} />
      <TextField value={formik.values.runner} label={"runner"} />
      <TextField value={formik.values.cwd} label={"cwd"} />

      <TextField value={formik.values.text} label="script" multiline rows={10} />
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Checkbox value={formik.values.autoStart} title={"auto start"} />
        <Typography>auto start</Typography>
      </Box>
      <Button variant="contained">Save</Button>
    </Box>

  );
}
