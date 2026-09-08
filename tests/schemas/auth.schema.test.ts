import { describe, expect, it } from 'vitest'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/schemas/auth.schema'

describe('loginSchema', () => {
  it('accepts a valid email and non-empty password', () => {
    const result = loginSchema.safeParse({
      email: 'jane@example.com',
      password: 'anything',
      rememberMe: false,
    })

    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'anything',
      rememberMe: false,
    })

    expect(result.success).toBe(false)
  })

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({
      email: 'jane@example.com',
      password: '',
      rememberMe: false,
    })

    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const valid = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Password1!',
    confirmPassword: 'Password1!',
  }

  it('accepts fully valid input', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a blank full name', () => {
    const result = registerSchema.safeParse({ ...valid, fullName: ' ' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: 'Ab1!',
      confirmPassword: 'Ab1!',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a password with no number', () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: 'Password!',
      confirmPassword: 'Password!',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a password with no symbol', () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: 'Password1',
      confirmPassword: 'Password1',
    })
    expect(result.success).toBe(false)
  })

  it('rejects mismatched password confirmation, flagging confirmPassword', () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: 'Different1!',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPassword'])
    }
  })
})

describe('resetPasswordSchema', () => {
  const valid = {
    tempPassword: 'Temp1234!',
    newPassword: 'NewPassword1!',
    confirmNewPassword: 'NewPassword1!',
  }

  it('accepts fully valid input', () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a blank temporary password', () => {
    const result = resetPasswordSchema.safeParse({ ...valid, tempPassword: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a new password shorter than 8 characters', () => {
    const result = resetPasswordSchema.safeParse({
      ...valid,
      newPassword: 'Ab1!',
      confirmNewPassword: 'Ab1!',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a new password with no number', () => {
    const result = resetPasswordSchema.safeParse({
      ...valid,
      newPassword: 'NewPassword!',
      confirmNewPassword: 'NewPassword!',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a new password with no symbol', () => {
    const result = resetPasswordSchema.safeParse({
      ...valid,
      newPassword: 'NewPassword1',
      confirmNewPassword: 'NewPassword1',
    })
    expect(result.success).toBe(false)
  })

  it('rejects mismatched confirmation, flagging confirmNewPassword', () => {
    const result = resetPasswordSchema.safeParse({
      ...valid,
      confirmNewPassword: 'Different1!',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmNewPassword'])
    }
  })

  it('rejects a new password identical to the temporary password, flagging newPassword', () => {
    const result = resetPasswordSchema.safeParse({
      tempPassword: 'SamePass1!',
      newPassword: 'SamePass1!',
      confirmNewPassword: 'SamePass1!',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['newPassword'])
    }
  })
})

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'jane@example.com' }).success).toBe(true)
  })

  it('rejects an empty email', () => {
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false)
  })

  it('rejects an invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'not-an-email' }).success).toBe(false)
  })
})
