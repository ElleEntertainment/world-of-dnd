import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string): Promise<any> {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email già registrata');
    }
    const hashedPassword = await this.hashPassword(password);
    const verificationToken = randomBytes(32).toString('hex');
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
    } as any);
    await this.userRepository.save(user);
    // Simulazione invio email
    this.sendVerificationEmail(email, verificationToken);
    return { message: 'Registrazione completata. Controlla la mail per confermare.' };
  }

  async login(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenziali non valide');
    if (!user.isVerified) throw new UnauthorizedException('Email non verificata');
    const valid = await this.comparePasswords(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenziali non valide');
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    return { access_token: token, user: { id: user.id, email: user.email } };
  }

  async confirmEmail(token: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { verificationToken: token } });
    if (!user) throw new UnauthorizedException('Token non valido');
    user.isVerified = true;
    user.verificationToken = null;
    await this.userRepository.save(user);
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

  async changePassword(email: string, oldPassword: string, newPassword: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Utente non trovato');
    const valid = await this.comparePasswords(oldPassword, user.password);
    if (!valid) throw new UnauthorizedException('Vecchia password errata');
    user.password = await this.hashPassword(newPassword);
    await this.userRepository.save(user);
    return { message: 'Password aggiornata con successo' };
  }
}
