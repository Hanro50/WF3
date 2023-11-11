import { useParams } from "@remix-run/react";

export default function Id() {
  const { id } = useParams();

  return <>{id}</>;
}
