"use server"

import { query, getMany } from "@/lib/db"
import { requireStaff } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getRegistrationFields() {
  return getMany<{
    id: number
    field_key: string
    label_en: string
    label_th: string
    field_type: string
    options: string[] | null
    is_required: boolean
    display_order: number
    is_active: boolean
  }>("SELECT * FROM registration_fields ORDER BY display_order ASC")
}

export async function createRegistrationField(formData: FormData) {
  await requireStaff()
  const field_key = formData.get("field_key") as string
  const label_en = formData.get("label_en") as string
  const label_th = formData.get("label_th") as string
  const field_type = formData.get("field_type") as string
  const is_required = formData.get("is_required") === "true"
  const display_order = parseInt(formData.get("display_order") as string) || 0
  const optionsRaw = formData.get("options") as string

  if (!field_key || !label_en || !label_th) {
    return { error: "Field key and labels are required" }
  }

  let options = null
  if (field_type === "select" && optionsRaw) {
    try {
      options = JSON.parse(optionsRaw)
    } catch {
      options = optionsRaw.split(",").map((s: string) => s.trim())
    }
  }

  try {
    await query(
      "INSERT INTO registration_fields (field_key, label_en, label_th, field_type, options, is_required, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [field_key, label_en, label_th, field_type, options ? JSON.stringify(options) : null, is_required, display_order]
    )
    revalidatePath("/staff/registration")
    return { success: true }
  } catch {
    return { error: "Failed to create field. Key may already exist." }
  }
}

export async function updateRegistrationField(formData: FormData) {
  await requireStaff()
  const id = parseInt(formData.get("id") as string)
  const label_en = formData.get("label_en") as string
  const label_th = formData.get("label_th") as string
  const field_type = formData.get("field_type") as string
  const is_required = formData.get("is_required") === "true"
  const is_active = formData.get("is_active") === "true"
  const display_order = parseInt(formData.get("display_order") as string) || 0
  const optionsRaw = formData.get("options") as string

  let options = null
  if (field_type === "select" && optionsRaw) {
    try {
      options = JSON.parse(optionsRaw)
    } catch {
      options = optionsRaw.split(",").map((s: string) => s.trim())
    }
  }

  try {
    await query(
      "UPDATE registration_fields SET label_en=$1, label_th=$2, field_type=$3, options=$4, is_required=$5, display_order=$6, is_active=$7 WHERE id=$8",
      [label_en, label_th, field_type, options ? JSON.stringify(options) : null, is_required, display_order, is_active, id]
    )
    revalidatePath("/staff/registration")
    return { success: true }
  } catch {
    return { error: "Failed to update field" }
  }
}

export async function deleteRegistrationField(id: number) {
  await requireStaff()
  try {
    await query("DELETE FROM registration_fields WHERE id = $1", [id])
    revalidatePath("/staff/registration")
    return { success: true }
  } catch {
    return { error: "Failed to delete field" }
  }
}
