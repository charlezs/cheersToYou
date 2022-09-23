import type { RegisterForm, LoginForm  } from './types.server'
import { prisma } from './prisma.server'
import { redirect, json, createCookieSessionStorage } from '@remix-run/node'
import { createUser } from './user.server'
import bcrypt from 'bcryptjs'

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set')
}

const storage = createCookieSessionStorage({
  cookie: {
    name: 'kudos-session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
})

export async function createUserSession(userId: string, redirectTo: string) {
    const session = await storage.getSession()
    session.set('userId', userId)
    return redirect(redirectTo, {
      headers: {
        'Set-Cookie': await storage.commitSession(session),
      },
    })
  }

export async function register(user: RegisterForm) {
  const exists = await prisma.user.count({ where: { email: user.email } })
  if (exists) {
    return json({ error: `User already exists with that email` }, { status: 400 })
  }
  const newUser = await createUser(user)
  if (!newUser) {
    return json(
      {
        error: `Something went wrong trying to create a new user.`,
        fields: { email: user.email, password: user.password },
      },
      { status: 400 },
    )
  }
  return createUserSession(newUser.id, '/');
}

export async function login({ email, password }: LoginForm) {
    const user = await prisma.user.findUnique({
      where: { email },
    })
  
    if (!user || !(await bcrypt.compare(password, user.password)))
      return json({ error: `Incorrect login` }, { status: 400 })
  
      return createUserSession(user.id, "/");
  }