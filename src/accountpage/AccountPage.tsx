import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import DefaultLayout from "../DefaultLayout";
import { UserContext } from "../UserProvider";

export default function AccountPage() {
  const user = useContext(UserContext).user!;

  const [stripeUsage, setStripeUsage] = useState<{
    text_generation: number;
  } | null>(null);

  const [subscription, setSubscription] = useState<any | null>(null);
  const [subscriptionCheckComplete, setSubscriptionCheckComplete] =
    useState(false);

  useEffect(() => {
    api("stripe", { request_type: "get_usage" }).then((results) => {
      setStripeUsage(results.usage);
    });

    api("stripe", { request_type: "get_subscription" }).then((results) => {
      setSubscription(results.subscription);
      setSubscriptionCheckComplete(true);
    });
  }, []);

  const unsubscribe = useCallback(() => {
    api("stripe", { request_type: "unsubscribe" }).then((result) => {
      setSubscription(result.subscription);
    });
  }, []);

  const subscribe = useCallback(() => {
    api("stripe", { request_type: "subscribe" }).then((result) => {
      setSubscription(result.subscription);
    });
  }, []);

  const totalPrice = useMemo(() => {
    if (stripeUsage) {
      return Math.max(stripeUsage.text_generation / 10000, 1).toLocaleString(
        "en-US",
        { style: "currency", currency: "USD" }
      );
    }
    return null;
  }, [stripeUsage]);

  return (
    <DefaultLayout>
      <h1>Profile</h1>
      <p style={{ lineHeight: "2rem" }}>
        <b>Name</b> {user.name}
        <br />
        <b>Email</b> {user.email}
        <br />
        <button
          style={{ marginTop: "1rem" }}
          onClick={() => {
            window.localStorage.removeItem("accessToken");
            window.location.href = "/";
          }}
        >
          Sign out
        </button>
      </p>

      <h1>Subscription</h1>
      <p>We partner with Stripe to streamline the billing process.</p>
      {subscriptionCheckComplete ? (
        subscription ? (
          <>
            {!subscription.cancel_at_period_end ? (
              <>
                <p>
                  You are subscribed.{" "}
                  <a
                    href="https://billing.stripe.com/p/login/6oEdUJ5jr2Qqd8Y8ww"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Manage your subscription
                  </a>
                  <div style={{ marginTop: "1rem" }}>
                    <button onClick={unsubscribe}>
                      Cancel at end of cycle
                    </button>
                  </div>
                </p>
              </>
            ) : (
              <>
                <p>
                  Your subscription will end at the end of the current billing
                  cycle.{" "}
                  <a
                    href="https://billing.stripe.com/p/login/6oEdUJ5jr2Qqd8Y8ww"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Manage your subscription
                  </a>
                </p>
              </>
            )}
          </>
        ) : (
          <>
            <br />
            You are not subscribed.
            <button onClick={subscribe}>Subscribe</button>
          </>
        )
      ) : (
        <p>Checking your subscription status...</p>
      )}

      {stripeUsage ? (
        <>
          <h3>Monthly Usage</h3>
          <span style={{ fontSize: "2rem" }}>{totalPrice}</span>
          <p>
            (based on ~{Math.ceil(stripeUsage.text_generation * 0.75)} words
            read or written by AI. There is a $1.00/month flat rate and a
            $0.0001/token charge thereafter.)
          </p>
          <p>An invoice will automatically be sent to your email by Stripe.</p>
        </>
      ) : (
        <p>Loading monthly usage</p>
      )}
    </DefaultLayout>
  );
}
