import type { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/index.js';
import { authenticate } from '../auth/jwt.js';
import { formulateDeveloper, calculateLevelChange } from '../services/python-bridge.js';
import type { ApiResponse, FormulateResponse, FormulateRequest } from '../types/index.js';

export async function formulateRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /formulate
  fastify.post<{
    Body: FormulateRequest;
    Reply: ApiResponse<FormulateResponse>;
  }>(
    '/formulate',
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const {
        current_level,
        target_level,
        tone,
        porosity,
        hair_condition,
        gray_percentage,
        previous_color,
        preferred_brand,
      } = request.body || {};

      if (current_level === undefined || target_level === undefined || !tone) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'current_level, target_level, and tone are required',
          },
        });
      }

      if (
        current_level < 1 || current_level > 12 ||
        target_level < 1 || target_level > 12
      ) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Hair levels must be between 1 and 12',
          },
        });
      }

      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      try {
        // Get level calculation (how many levels to lift)
        const levelCalc = await calculateLevelChange(current_level, target_level);

        // Get developer recommendation from Python engine
        const developer = await formulateDeveloper(
          levelCalc.levelsToLift,
          porosity,
          hair_condition !== undefined ? parseFloat(hair_condition) : undefined,
          gray_percentage,
          previous_color
        );

        // Build shade recommendation
        const brand = preferred_brand || 'Wella Koleston Perfect ME';
        const shades = buildShadeRecommendation(current_level, target_level, tone, gray_percentage);

        const mixingInstructions =
          `Mix shades in a non-metallic bowl. ` +
          `Use ${developer.volume} volume developer. ` +
          `Apply to dry hair. Process for ${developer.time} minutes at room temperature.`;

        // Save formulation to database
        const formulationId = uuidv4();
        await query(
          `INSERT INTO formulations
           (id, user_id, current_level, target_level, target_tone, porosity, hair_condition,
            gray_percentage, brand, developer_volume, developer_time, action_type, formula_data)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            formulationId,
            userId,
            current_level,
            target_level,
            tone,
            porosity || 'normal',
            hair_condition || 0.3,
            gray_percentage || 0,
            brand,
            developer.volume,
            developer.time,
            levelCalc.actionType,
            { shades, developer, warnings: developer.warnings },
          ]
        );

        return reply.status(201).send({
          success: true,
          data: {
            formula_id: formulationId,
            shades,
            developer_volume: developer.volume,
            developer_time: developer.time,
            mixing_instructions: mixingInstructions,
            rationale: developer.rationale,
            warnings: developer.warnings,
            action_type: levelCalc.actionType,
          },
        });
      } catch (error) {
        fastify.log.error('Formulation error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: {
            code: 'FORMULATION_ERROR',
            message: error instanceof Error ? error.message : 'Failed to generate formulation',
          },
        });
      }
    }
  );
}

interface ShadeRecommendation {
  shade_code: string;
  shade_name: string;
  level: number;
  tone: string;
  grams: number;
  purpose: string;
}

function buildShadeRecommendation(
  currentLevel: number,
  targetLevel: number,
  targetTone: string,
  grayPercentage?: number
): ShadeRecommendation[] {
  const shades: ShadeRecommendation[] = [];
  const needGrayCoverage = (grayPercentage || 0) > 25;

  // Primary shade at target level + tone
  shades.push({
    shade_code: `${targetLevel}${targetTone}`,
    shade_name: `${getLevelName(targetLevel)} ${getToneName(targetTone)}`,
    level: targetLevel,
    tone: targetTone,
    grams: 60,
    purpose: 'primary',
  });

  // Natural shade for gray coverage
  if (needGrayCoverage) {
    shades.push({
      shade_code: `${targetLevel}N`,
      shade_name: `${getLevelName(targetLevel)} Natural`,
      level: targetLevel,
      tone: 'N',
      grams: 30,
      purpose: 'gray_coverage',
    });
  }

  return shades;
}

function getLevelName(level: number): string {
  const names: Record<number, string> = {
    1: 'Black', 2: 'Darkest Brown', 3: 'Dark Brown', 4: 'Medium Brown',
    5: 'Light Brown', 6: 'Dark Blonde', 7: 'Medium Blonde',
    8: 'Light Blonde', 9: 'Very Light Blonde', 10: 'Lightest Blonde',
  };
  return names[level] || `Level ${level}`;
}

function getToneName(tone: string): string {
  const names: Record<string, string> = {
    N: 'Natural', A: 'Ash', G: 'Gold', R: 'Red',
    V: 'Violet', K: 'Copper', W: 'Warm', B: 'Beige',
  };
  return names[tone] || tone;
}