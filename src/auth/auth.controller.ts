import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entity/auth.entity';
import {
  LoginDto,
  RegisterDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * Generates and sends email verification link
   */
  @Post('register')
  @ApiOkResponse()
  register(@Body() { email, password, name }: RegisterDto) {
    return this.authService.register(email, password, name);
  }

  /**
   * Verify email using verification token (GET endpoint for email links)
   */
  @Get('verify-email')
  @ApiOkResponse()
  verifyEmailLink(@Query('token') verificationToken: string) {
    return this.authService.verifyEmail(verificationToken);
  }

  /**
   * Resend verification email
   */
  @Post('resend-verification')
  @ApiOkResponse()
  resendVerification(@Body() { email }: { email: string }) {
    return this.authService.resendVerificationEmail(email);
  }

  /**
   * User login
   * Tracks failed attempts and locks account after 3 failures
   */
  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  login(@Body() { email, password }: LoginDto) {
    return this.authService.login(email, password);
  }

  /**
   * Request password reset
   * Sends password reset link via email
   */
  @Post('forgot-password')
  @ApiOkResponse()
  forgotPassword(@Body() { email }: ForgotPasswordDto) {
    return this.authService.forgotPassword(email);
  }

  /**
   * Reset password using reset token (POST endpoint)
   */
  @Post('reset-password')
  @ApiOkResponse()
  resetPassword(@Body() { resetToken, newPassword }: ResetPasswordDto) {
    return this.authService.resetPassword(resetToken, newPassword);
  }

  /**
   * Reset password using reset token (GET endpoint for email links - redirects to frontend)
   */
  @Get('reset-password')
  @ApiOkResponse()
  resetPasswordLink(@Query('token') resetToken: string) {
    // In a real app, you'd redirect to a frontend page
    // For now, just return the token so the frontend can use it
    return { resetToken, message: 'Use this token to reset your password' };
  }
}
