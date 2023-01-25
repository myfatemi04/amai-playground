import { Elements, PaymentElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";

import { api } from "./api";
import DefaultLayout from "./DefaultLayout";

const publishableKeys = {
  test: "pk_test_51MHJf2HVS6vXNMgeosxenbu0vfbFxtczzhePPpsEzJAAvspe7mL3gAnQzFO4J2dCSvTjdtsYe97HeJzzRoaPbjzb00qbJbRM4B",
};

const stripePromise = loadStripe(publishableKeys.test);

// https://stripe.com/docs/stripe-js/react

function CheckoutForm() {
  return (
    <div>
      <PaymentElement />
    </div>
  );
}

export default function PaymentsPage() {
  const [stripeUsage, setStripeUsage] = useState<{
    text_generation: number;
  } | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    api("stripe", { request_type: "get_usage" }).then((results) => {
      setStripeUsage(results);
    });
  }, []);

  return (
    <DefaultLayout>
      <h1>Payments</h1>
      <pre>{JSON.stringify(stripeUsage)}</pre>
      {clientSecret ? (
        /* @ts-ignore */
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      ) : (
        <>
          <p className="label-header">Waiting for client secret</p>
        </>
      )}
    </DefaultLayout>
  );
}
