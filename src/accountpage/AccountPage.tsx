import { useContext } from "react";
import DefaultLayout from "../DefaultLayout";
import { UserContext } from "../UserProvider";

export default function AccountPage() {
  const user = useContext(UserContext).user!;

  return (
    <DefaultLayout>
      <h1>My Account</h1>
      <p>
        <b>Name</b> {user.name}
      </p>
      <p>
        <b>Email</b> {user.email}
      </p>
    </DefaultLayout>
  );
}
