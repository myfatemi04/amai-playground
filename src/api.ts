export async function getToken(): Promise<string> {
  if (window.location.pathname === "/researchwriting") {
    return "$research-writing";
  } else {
    return "$playground";
  }
}

export async function api(path: string, body: any) {
  const result = await fetch(
    `https://7azz4l2unk.execute-api.us-east-1.amazonaws.com/${path}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        token: await getToken(),
      }),
    }
  );
  return await result.json();
}
