import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string): Promise<any> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email già registrata');
    }
    const hashedPassword = await this.hashPassword(password);
    const verificationToken = randomBytes(32).toString('hex');
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isVerified: false,
        verificationToken,
      },
    });
    // Simulazione invio email
    this.sendVerificationEmail(email, verificationToken);
    return { message: 'Registrazione completata. Controlla la mail per confermare.' };
  }

  async login(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenziali non valide');
    if (!user.isVerified) throw new UnauthorizedException('Email non verificata');
    const valid = await this.comparePasswords(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenziali non valide');
    
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    
    // Salva refresh token nel database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await this.hashPassword(refreshToken) },
    });
    
    return { 
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { id: user.id, email: user.email, name: user.name }
    };
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Refresh token non valido');
      }
      
      const isValidRefreshToken = await this.comparePasswords(refreshToken, user.refreshToken);
      if (!isValidRefreshToken) {
        throw new UnauthorizedException('Refresh token non valido');
      }
      
      const newPayload = { sub: user.id, email: user.email };
      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });
      
      // Aggiorna refresh token nel database
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: await this.hashPassword(newRefreshToken) },
      });
      
      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token non valido o scaduto');
    }
  }

  async logout(userId: number): Promise<any> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logout effettuato con successo' };
  }

  async requestPasswordReset(email: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Per sicurezza, non rivelare se l'email esiste o meno
      return { message: 'Se l\'email esiste, riceverai le istruzioni per il reset della password' };
    }
    
    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 ora
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });
    
    // Simulazione invio email
    this.sendPasswordResetEmail(email, resetToken);
    
    return { message: 'Se l\'email esiste, riceverai le istruzioni per il reset della password' };
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gte: new Date() },
      },
    });
    
    if (!user) {
      throw new BadRequestException('Token non valido o scaduto');
    }
    
    const hashedPassword = await this.hashPassword(newPassword);
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
    
    return { message: 'Password resettata con successo' };
  }

  async confirmEmail(token: string): Promise<any> {
    const user = await this.prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) throw new UnauthorizedException('Token non valido');
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });
    return { message: 'Email confermata' };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private sendVerificationEmail(email: string, token: string) {
    // Qui puoi integrare un vero servizio email, per ora mock
    console.log(`Invia email a ${email} con link: http://localhost:3000/auth/confirm-email?token=${token}`);
  }

  private sendPasswordResetEmail(email: string, token: string) {
    // Qui puoi integrare un vero servizio email, per ora mock
    console.log(`Invia email a ${email} con link per reset password: http://localhost:4200/reset-password?token=${token}`);
  }

  async changePassword(email: string, oldPassword: string, newPassword: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Utente non trovato');
    const valid = await this.comparePasswords(oldPassword, user.password);
    if (!valid) throw new UnauthorizedException('Vecchia password errata');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: await this.hashPassword(newPassword) },
    });
    return { message: 'Password aggiornata con successo' };
  }
}
