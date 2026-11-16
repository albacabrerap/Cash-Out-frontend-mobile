import { http } from "@/api/client"
import type { ChangePasswordRequest, UpdateUserRequest, User } from "@/types/auth"
import { Platform } from "react-native"

export interface PickedPhoto {
  uri: string
  mimeType?: string | null
  fileName?: string | null
}

export const userService = {
  async updateMe(changes: UpdateUserRequest): Promise<User> {
    const { data } = await http.patch<User>("/users/me", changes)
    return data
  },

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await http.put("/users/me/password", request)
  },

  async deleteMe(): Promise<void> {
    await http.delete("/users/me")
  },

  async uploadAvatar(photo: PickedPhoto): Promise<User> {
    const type = photo.mimeType ?? "image/jpeg"
    const name = photo.fileName ?? `avatar.${type.split("/")[1] ?? "jpg"}`
    const body = new FormData()
    if (Platform.OS === "web") {
    
      body.append("file", await (await fetch(photo.uri)).blob(), name)
    } else {
      
      body.append("file", { uri: photo.uri, name, type } as unknown as Blob)
    }
    const { data } = await http.put<User>("/users/me/avatar", body, { headers: { "Content-Type": "multipart/form-data" } })
    return data
  },

  async removeAvatar(): Promise<User> {
    const { data } = await http.delete<User>("/users/me/avatar")
    return data
  },

  async getAvatar(signal?: AbortSignal): Promise<Blob> {
    const { data } = await http.get<Blob>("/users/me/avatar", { responseType: "blob", signal })
    return data
  },
}
