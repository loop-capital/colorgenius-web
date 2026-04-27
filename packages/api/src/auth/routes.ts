import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { pool, query } from '../db/index.js';
import { config } from '../config.js';
import type { RegisterRequest, LoginRequest, ApiResponse, AuthResponse, User } from '../types/index.js';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /auth/register
  fastify.post<{
    Body: RegisterRequest;
    Reply: ApiResponse<AuthResponse>;
  }>('/register', async (request, reply) => {
    const { email, password } = request.body || {};

    if (!email || !password) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        },
      });
    }

    if (password.length < 8) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 8 characters',
        },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email format',
        },
      });
    }

    try {
      const existingUser = await query<{ id: string }>(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        return reply.status(409).send({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'An account with this email already exists',
          },
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const result = await query<{
        id: string;
        email: string;
        created_at: Date;
      }>(
        `INSERT INTO users (email, password_hash)
         VALUES ($1, $2)
         RETURNING id, email, created_at`,
        [email.toLowerCase(), passwordHash]
      );

      const user = result.rows[0];

      const token = fastify.jwt.sign(
        { userId: user.id, email: user.email },
        { expiresIn: config.jwt.expiresIn }
      );

      return reply.status(201).send({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
          },
        },
      });
    } catch (error) {
      fastify.log.error('Registration error: %s', error instanceof Error ? error.message : String(error));
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create account',
        },
      });
    }
  });

  // POST /auth/login
  fastify.post<{
    Body: LoginRequest;
    Reply: ApiResponse<AuthResponse>;
  }>('/login', async (request, reply) => {
    const { email, password } = request.body || {};

    if (!email || !password) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        },
      });
    }

    try {
      const result = await query<{
        id: string;
        email: string;
        password_hash: string;
        created_at: Date;
      }>(
        'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
      }

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
      }

      const token = fastify.jwt.sign(
        { userId: user.id, email: user.email },
        { expiresIn: config.jwt.expiresIn }
      );

      return reply.status(200).send({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
          },
        },
      });
    } catch (error) {
      fastify.log.error('Login error: %s', error instanceof Error ? error.message : String(error));
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to authenticate',
        },
      });
    }
  });
}