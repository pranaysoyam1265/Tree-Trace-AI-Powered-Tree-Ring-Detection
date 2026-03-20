import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  institution: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = signUpSchema.parse(body)

    // Dynamic import — fails gracefully if DB not connected
    const { createUser } = await import("@/lib/auth-service")
    const user = await createUser(validated)

    return NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR", details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
      return NextResponse.json(
        { success: false, error: "USER_ALREADY_EXISTS", message: "An account with this email already exists" },
        { status: 409 }
      )
    }

    console.error("[SIGNUP ERROR]", error)
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Could not create account. Is the database connected?" },
      { status: 500 }
    )
  }
}
