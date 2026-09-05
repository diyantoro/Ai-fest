import { defaultAIProvider } from '../services/ai_provider.js';
import { createQuizItem } from '../db/repositories/quiz_repo.js';
import { logger } from '../utils/logger.js';

/**
 * Validates a single quiz question object
 * @param {object} item 
 */
export function validateQuizQuestion(item) {
  if (!item || typeof item !== 'object') {
    throw new Error('Quiz question item must be an object.');
  }

  if (!item.question || typeof item.question !== 'string' || !item.question.trim()) {
    throw new Error('Quiz question text cannot be empty.');
  }

  if (!Array.isArray(item.options) || item.options.length < 2) {
    throw new Error(`Quiz options must be an array with at least 2 options for question: "${item.question}"`);
  }

  const validAnswers = ['A', 'B', 'C', 'D'];
  const normalizedCorrect = (item.correct_answer || '').trim().toUpperCase();
  if (!validAnswers.includes(normalizedCorrect)) {
    throw new Error(`Invalid correct_answer "${item.correct_answer}". Must be A, B, C, or D.`);
  }

  return {
    question: item.question.trim(),
    options: item.options.map(o => String(o).trim()),
    correct_answer: normalizedCorrect,
    explanation: item.explanation ? String(item.explanation).trim() : 'Sesuai materi.'
  };
}

/**
 * Skill: generate-quiz
 * 
 * @param {string} topicId 
 * @param {string} title 
 * @param {string} extractedText 
 * @param {number} count - Default 5 questions
 * @param {object} [aiProvider] 
 * @returns {Promise<Array<object>>} Saved quiz bank records
 */
export async function generateQuizSkill(topicId, title, extractedText, count = 5, aiProvider = defaultAIProvider) {
  logger.info('generate-quiz skill started', { topicId, title, count });

  if (!extractedText || !extractedText.trim()) {
    throw new Error('Extracted text cannot be empty for quiz generation.');
  }

  const rawQuestions = await aiProvider.generateQuiz(title, extractedText, count);

  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    throw new Error('Failed to generate any valid quiz questions.');
  }

  const validatedQuestions = [];
  for (const item of rawQuestions) {
    try {
      const validItem = validateQuizQuestion(item);
      validatedQuestions.push(validItem);
    } catch (valErr) {
      logger.warn('Skipping invalid quiz question item', { error: valErr.message });
    }
  }

  if (validatedQuestions.length === 0) {
    throw new Error('Quiz generation failed validation. No valid questions passed.');
  }

  const savedQuizItems = [];
  for (const item of validatedQuestions) {
    const saved = await createQuizItem(
      topicId,
      item.question,
      item.options,
      item.correct_answer,
      item.explanation
    );
    savedQuizItems.push(saved);
  }

  logger.info('generate-quiz skill completed', { savedCount: savedQuizItems.length });
  return savedQuizItems;
}
