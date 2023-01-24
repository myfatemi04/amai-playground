import { useContext, useEffect, useState } from "react";
import { api } from "../api";
import DefaultLayout from "../DefaultLayout";
import { UserContext } from "../UserProvider";

export default function AccountPage() {
  const user = useContext(UserContext).user!;

  const [results, setResults] = useState<any | null>(null);

  const [stripeUsage, setStripeUsage] = useState<{
    text_generation: number;
  } | null>(null);

  useEffect(() => {
    api("list_usage", { collection: "retrieval_enhancement_usage" }).then(
      setResults
    );

    api("stripe", {request_type: "get_usage"}).then((results) => {
      setStripeUsage(results);
    });
  }, []);

  return (
    <DefaultLayout>
      <h1>Profile</h1>
      <p style={{ lineHeight: "2rem" }}>
        <b>Name</b> {user.name}
        <br />
        <b>Email</b> {user.email}
      </p>
      <button
      className="link"
        onClick={() => {
          window.localStorage.removeItem("accessToken");
          window.location.href = "/";
        }}
      >
        Sign out
      </button>
      <h1>Usage History</h1>
      <pre>{JSON.stringify(stripeUsage)}</pre>
      <pre>{JSON.stringify(results)}</pre>
    </DefaultLayout>
  );
}
