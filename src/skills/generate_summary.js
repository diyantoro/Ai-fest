import { defaultAIProvider } from '../services/ai_provider.js';
import { logger } from '../utils/logger.js';

/**
 * Skill: generate-summary
 * 
 * @param {string} title 
 * @param {string} extractedText 
 * @param {object} [aiProvider] 
 * @returns {Promise<string>}
 */
export async function generateSummarySkill(title, extractedText, aiProvider = defaultAIProvider) {
  logger.info('generate-summary skill invoked', { title });

  if (!extractedText || !extractedText.trim()) {
    throw new Error('Extracted text cannot be empty for summary generation.');
  }

  const summary = await aiProvider.generateSummary(title, extractedText);
  logger.info('generate-summary skill completed', { summaryLength: summary.length });
  return summary;
}
