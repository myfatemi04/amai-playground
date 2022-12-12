import { useContext } from "react";
import { UserContext } from "./UserProvider";

export default function ProfilePane() {
  const { user } = useContext(UserContext);
  if (!user) {
    console.warn("<ProfilePane> called without a user");
    return null;
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        border: "1px solid gray",
        borderRadius: "0.5rem",
        padding: "0.5rem",
        background: "white",
        width: "fit-content"
      }}
    >
      <span style={{ marginRight: "0.5rem" }}>Logged in as</span>
      <img
        src={user.profile_photo}
        alt="Google logo"
        style={{ width: "1.5rem", height: "1.5rem" }}
      />
      <span style={{ marginLeft: "0.5rem" }}>{user.name}</span>
    </div>
  );
}
