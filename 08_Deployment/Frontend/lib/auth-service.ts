import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

/* ═══════════════════════════════════════════════════════════════════
   AUTH SERVICE — User creation & lookup
   ═══════════════════════════════════════════════════════════════════ */

export async function createUser({
  name,
  email,
  password,
  institution,
}: {
  name: string
  email: string
  password: string
  institution?: string
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS")
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      institution: institution || null,
    },
  })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      institution: true,
      createdAt: true,
    },
  })
}
