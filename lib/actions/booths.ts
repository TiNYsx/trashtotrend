"use server"

import { query, getMany, getOne } from "@/lib/db"
import { requireStaff } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getBooths() {
  await requireStaff()
  return getMany<{
    id: number
    name_en: string
    name_th: string
    description_en: string | null
    description_th: string | null
    image_url: string | null
    display_order: number
    is_active: boolean
  }>("SELECT * FROM booths ORDER BY display_order ASC")
}

export async function getBooth(id: number) {
  await requireStaff()
  return getOne<{
    id: number
    name_en: string
    name_th: string
    description_en: string | null
    description_th: string | null
    image_url: string | null
    display_order: number
    is_active: boolean
  }>("SELECT * FROM booths WHERE id = $1", [id])
}

export async function createBooth(formData: FormData) {
  await requireStaff()
  const name_en = formData.get("name_en") as string
  const name_th = formData.get("name_th") as string
  const description_en = formData.get("description_en") as string
  const description_th = formData.get("description_th") as string
  const image_url = formData.get("image_url") as string
  const display_order = parseInt(formData.get("display_order") as string) || 0

  if (!name_en || !name_th) {
    return { error: "Both English and Thai names are required" }
  }

  try {
    await query(
      "INSERT INTO booths (name_en, name_th, description_en, description_th, image_url, display_order) VALUES ($1, $2, $3, $4, $5, $6)",
      [name_en, name_th, description_en || null, description_th || null, image_url || null, display_order]
    )
    revalidatePath("/staff/booths")
    return { success: true }
  } catch {
    return { error: "Failed to create booth" }
  }
}

export async function updateBooth(formData: FormData) {
  await requireStaff()
  const id = parseInt(formData.get("id") as string)
  const name_en = formData.get("name_en") as string
  const name_th = formData.get("name_th") as string
  const description_en = formData.get("description_en") as string
  const description_th = formData.get("description_th") as string
  const image_url = formData.get("image_url") as string
  const display_order = parseInt(formData.get("display_order") as string) || 0
  const is_active = formData.get("is_active") === "true"

  if (!name_en || !name_th) {
    return { error: "Both English and Thai names are required" }
  }

  try {
    await query(
      "UPDATE booths SET name_en=$1, name_th=$2, description_en=$3, description_th=$4, image_url=$5, display_order=$6, is_active=$7 WHERE id=$8",
      [name_en, name_th, description_en || null, description_th || null, image_url || null, display_order, is_active, id]
    )
    revalidatePath("/staff/booths")
    return { success: true }
  } catch {
    return { error: "Failed to update booth" }
  }
}

export async function deleteBooth(id: number) {
  await requireStaff()
  try {
    await query("DELETE FROM booths WHERE id = $1", [id])
    revalidatePath("/staff/booths")
    return { success: true }
  } catch {
    return { error: "Failed to delete booth" }
  }
}
