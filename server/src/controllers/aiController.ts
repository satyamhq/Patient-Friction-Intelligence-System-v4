import { Request, Response } from 'express';
import { geminiRagService } from '../services/geminiService.js';

export const handleChatQuery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, history, role, currentPath, language } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(400).json({
        success: false,
        message: 'The query parameter is required and cannot be empty.',
      });
      return;
    }

    const response = await geminiRagService.chat({
      query: query.trim(),
      history: Array.isArray(history) ? history : [],
      role: typeof role === 'string' ? role : undefined,
      currentPath: typeof currentPath === 'string' ? currentPath : undefined,
      language: typeof language === 'string' ? language : undefined,
    });

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error('[AI Controller Error] Failed to process chat query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI chat query.',
      error: error.message,
    });
  }
};

export const getSuggestedQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = (req.query.role as string) || undefined;
    const suggestions = geminiRagService.getSuggestedQuestions(role);

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error: any) {
    console.error('[AI Controller Error] Failed to fetch suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve suggested questions.',
      error: error.message,
    });
  }
};

export const getAiStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = geminiRagService.getStatus();
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error('[AI Controller Error] Failed to get AI status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve AI system status.',
      error: error.message,
    });
  }
};

export const triggerReindexing = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('[AI Controller] Manual re-indexing requested.');
    const result = geminiRagService.reloadIndex();

    res.status(200).json({
      success: result.success,
      message: result.success
        ? `Successfully re-indexed codebase! ${result.totalItems} items available.`
        : 'Failed to complete re-indexing.',
      data: result,
    });
  } catch (error: any) {
    console.error('[AI Controller Error] Failed to reindex:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute re-indexing.',
      error: error.message,
    });
  }
};

export const getPrebuiltQuestionsList = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = (req.query.category as string) || undefined;
    const role = (req.query.role as string) || undefined;
    const search = (req.query.search as string) || undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const data = geminiRagService.getPrebuiltQuestions({ category, role, search, limit, offset });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[AI Controller Error] Failed to fetch prebuilt questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve prebuilt questions.',
      error: error.message,
    });
  }
};

