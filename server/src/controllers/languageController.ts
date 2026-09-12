import { Request, Response } from 'express';
import { TranslationService } from '../services/translationService.js';
import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';

export class LanguageController {
  static getLanguages(req: Request, res: Response) {
    const languages = TranslationService.getSupportedLanguages();
    res.status(200).json({ success: true, languages });
  }

  static getDialects(req: Request, res: Response) {
    const langCode = String(req.params.langCode || 'en');
    const dialects = TranslationService.getSupportedDialects(langCode);
    res.status(200).json({ success: true, langCode, dialects });
  }

  static async updateLanguagePreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { preferredLanguage, preferredDialect, simpleLanguageMode, voiceEnabled, textToSpeechEnabled } = req.body;

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          ...(preferredLanguage && { preferredLanguage }),
          ...(preferredDialect && { preferredDialect }),
          ...(simpleLanguageMode !== undefined && { simpleLanguageMode }),
          ...(voiceEnabled !== undefined && { voiceEnabled }),
          ...(textToSpeechEnabled !== undefined && { textToSpeechEnabled }),
        });

        await Patient.findOneAndUpdate(
          { userId },
          {
            ...(preferredLanguage && { preferredLanguage }),
            ...(preferredDialect && { preferredDialect }),
            ...(simpleLanguageMode !== undefined && { simpleLanguageMode }),
            ...(voiceEnabled !== undefined && { voiceEnabled }),
            ...(textToSpeechEnabled !== undefined && { textToSpeechEnabled }),
          }
        );
      }

      res.status(200).json({
        success: true,
        message: 'Language and accessibility preferences saved successfully.',
        preferences: {
          preferredLanguage,
          preferredDialect,
          simpleLanguageMode,
          voiceEnabled,
          textToSpeechEnabled,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getLanguageAnalytics(req: Request, res: Response) {
    try {
      const patients = await Patient.find({}).select('preferredLanguage');
      const total = patients.length || 1;
      const counts: Record<string, number> = {};

      patients.forEach((p: any) => {
        const lang = p.preferredLanguage || 'en';
        counts[lang] = (counts[lang] || 0) + 1;
      });

      const analytics = Object.entries(counts).map(([lang, count]) => ({
        language: lang,
        count,
        percentage: Math.round((count / total) * 100),
      }));

      res.status(200).json({
        success: true,
        totalPatients: patients.length,
        analytics,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
