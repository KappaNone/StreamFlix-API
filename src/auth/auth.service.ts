import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entity/auth.entity';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;
const ACCOUNT_LOCK_DURATION_MINUTES = 30;
const MAX_LOGIN_ATTEMPTS = 3;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  /**
   * Register a new user with email and password
   * Generates verification token and sends verification email
   */
  async register(
    email: string,
    password: string,
    name?: string,
  ): Promise<{ message: string }> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresAt = new Date(
      Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    // Create user with verification token
    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        verificationToken,
        verificationTokenExpiresAt,
        emailVerified: false,
      },
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(email, verificationToken);

    return {
      message:
        'User registered successfully. Please check your email to verify your account.',
    };
  }

  /**
   * Verify user email using token
   */
  async verifyEmail(verificationToken: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { verificationToken },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    // Check if token has expired
    if (
      user.verificationTokenExpiresAt &&
      user.verificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Verification token has expired');
    }

    // Mark email as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });

    return { message: 'Email verified successfully. You can now log in.' };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresAt = new Date(
      Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiresAt,
      },
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(email, verificationToken);

    return { message: 'Verification email has been resent' };
  }

  /**
   * Login with email and password
   * Tracks failed login attempts and locks account after 3 failures
   */
  async login(email: string, password: string): Promise<AuthEntity> {
    // Fetch user
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    // Check if account is active
    if (user.isActive === false) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check if account is locked
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const remainingTime = Math.ceil(
        (user.accountLockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account is locked. Try again in ${remainingTime} minutes.`,
      );
    }

    // Reset failed attempts if lock period has passed
    if (user.accountLockedUntil && user.accountLockedUntil <= new Date()) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          accountLockedUntil: null,
        },
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment failed login attempts
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const shouldLock = newFailedAttempts >= MAX_LOGIN_ATTEMPTS;

      const updateData: any = {
        failedLoginAttempts: newFailedAttempts,
      };

      if (shouldLock) {
        updateData.accountLockedUntil = new Date(
          Date.now() + ACCOUNT_LOCK_DURATION_MINUTES * 60 * 1000,
        );

        // Send account locked email
        await this.emailService.sendAccountLockedEmail(
          email,
          updateData.accountLockedUntil,
        );
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      const attemptStr = `${newFailedAttempts}/${MAX_LOGIN_ATTEMPTS}`;
      if (shouldLock) {
        throw new UnauthorizedException(
          `Invalid password (${attemptStr}). Account locked for ${ACCOUNT_LOCK_DURATION_MINUTES} minutes.`,
        );
      } else {
        throw new UnauthorizedException(
          `Invalid password (${attemptStr}). Account will be locked after ${MAX_LOGIN_ATTEMPTS} failed attempts.`,
        );
      }
    }

    // Step 6: Reset failed attempts on successful login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      },
    });

    // Step 7: Generate JWT token
    return {
      accessToken: this.jwtService.sign({ userId: user.id }),
    };
  }

  /**
   * Request password reset
   * Generates reset token and sends email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // For security, don't reveal if user exists
      return {
        message:
          'If an account with this email exists, a password reset link has been sent.',
      };
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetTokenExpiresAt = new Date(
      Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetTokenExpiresAt,
      },
    });

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(email, resetToken);

    return {
      message:
        'If an account with this email exists, a password reset link has been sent.',
    };
  }

  /**
   * Reset password using reset token
   */
  async resetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { passwordResetToken: resetToken },
    });

    if (!user) {
      throw new BadRequestException('Invalid password reset token');
    }

    // Check if token has expired
    if (
      user.passwordResetTokenExpiresAt &&
      user.passwordResetTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Password reset token has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      },
    });

    return {
      message:
        'Password has been reset successfully. You can now log in with your new password.',
    };
  }
}
