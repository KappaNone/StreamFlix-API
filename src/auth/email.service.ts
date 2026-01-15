import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  /**
   * Send verification email with token
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    console.log(`
      ========================================
      EMAIL VERIFICATION
      ========================================
      To: ${email}
      Subject: Verify Your StreamFlix Email
      
      Please verify your email by clicking the link below:
      ${verificationUrl}
      
      This link expires in 24 hours.
      ========================================
    `);
  }

  /**
   * Send password reset email with token
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    console.log(`
      ========================================
      PASSWORD RESET
      ========================================
      To: ${email}
      Subject: Reset Your StreamFlix Password
      
      Click the link below to reset your password:
      ${resetUrl}
      
      This link expires in 1 hour.
      ========================================
    `);
  }

  /**
   * Send account locked notification
   */
  async sendAccountLockedEmail(email: string, unlockTime: Date): Promise<void> {
    console.log(`
      ========================================
      ACCOUNT LOCKED
      ========================================
      To: ${email}
      Subject: Your StreamFlix Account Has Been Locked
      
      Your account has been temporarily locked due to multiple failed login attempts.
      
      Account will be unlocked at: ${unlockTime.toISOString()}
      ========================================
    `);
  }

  /**
   * Send welcome email after successful registration
   */
  async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    console.log(`
      ========================================
      WELCOME TO STREAMFLIX
      ========================================
      To: ${email}
      Subject: Welcome to StreamFlix
      
      Hello ${name || 'User'},
      
      Welcome to StreamFlix! Your account has been successfully created.
      ========================================
    `);
  }
}
