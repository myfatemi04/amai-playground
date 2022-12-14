import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "./api";
import useLocalStorage from "./useLocalStorage";

const googleOauthUrlDev =
  "https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=817387003389-56di08pe33jf169cpcpa4u9c2gg5ac6q.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fgoogle-callback&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&state=edyYKCX24zRiil9me0VvUkz7Y3jMva&access_type=offline&include_granted_scopes=true";
const googleOauthUrlProduction =
  "https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=817387003389-56di08pe33jf169cpcpa4u9c2gg5ac6q.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Faugmateai.michaelfatemi.com%2Fgoogle-callback&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&state=U1XShs6GvYkf6wehyd4lfynA4tDrcH&access_type=offline&include_granted_scopes=true";

export const googleOauthUrl =
  window.location.hostname === "localhost"
    ? googleOauthUrlDev
    : googleOauthUrlProduction;

export interface User {
  _id: string;
  email: string;
  name: string;
  profile_photo: string;
}

export const UserContext = createContext<{
  user: User | null;
  pending: boolean;
}>({
  user: null,
  pending: false,
});

export default function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pending, setPending] = useState(false);
  const accessToken = useLocalStorage("accessToken");

  useEffect(() => {
    if (!accessToken) {
      setUser(null);
      setPending(false);
      return;
    }
    setUser(null);
    setPending(true);
    api("my_info")
      .then((user) => {
        if (localStorage.getItem("redirect_url")) {
          const url = localStorage.getItem("redirect_url")!;
          localStorage.removeItem("redirect_url");
          window.location.href = url;
        }
        setUser(user);
      })
      .catch((e) => {
        setUser(null);
        setPending(false);
        console.error(e);
      })
      .finally(() => setPending(false));
  }, [accessToken]);

  return (
    <UserContext.Provider value={{ user, pending }}>
      {children}
    </UserContext.Provider>
  );
}
