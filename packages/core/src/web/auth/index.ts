import { apiClient } from "../apiClient";

export async function updateToken(refreshToken: string) {
  try {
    const { data } = await apiClient.post("/refresh-token", {
      refreshToken,
    });
    return {
      accessToken: data?.access_token,
      refreshToken: data?.refresh_token,
    };
  } catch (err: unknown) {
    console.log(err);
    throw Error(err as string);
  }
}

export async function loginUser() {
  try {
    console.log(apiClient);
    const { data } = await apiClient.get("/login");
    return data;
  } catch (err: unknown) {
    console.log(err);
    throw Error(err as string);
  }
}
