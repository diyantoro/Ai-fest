import { parsePdf } from './pdf_parser.js';
import { createTopic, getUserTopics } from '../db/repositories/topic_repo.js';
import { logger } from '../utils/logger.js';

/**
 * Generates a clean unique topic_id slug with counter (e.g., database-management-1)
 * @param {string} userId 
 * @param {string} title 
 */
export async function generateTopicSlugId(userId, title) {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'materi';

  const userTopics = await getUserTopics(userId);
  const matchingTopics = userTopics.filter(t => t.id.startsWith(baseSlug));

  const nextCounter = matchingTopics.length + 1;
  return `${baseSlug}-${nextCounter}`;
}

/**
 * Ingests PDF or raw text material
 * 
 * @param {string} userId - User ID
 * @param {string} title - Topic/Material Title
 * @param {Buffer|string} inputContent - PDF Buffer or Raw Text String
 * @param {string} [inputType='text'] - 'pdf' | 'text'
 * @returns {Promise<{topicId: string, extractedText: string, title: string, sourceType: string}>}
 */
export async function ingestMaterial(userId, title, inputContent, inputType = 'text') {
  logger.info('ingest-material started', { userId, title, inputType });

  if (!title || !title.trim()) {
    throw new Error('Title cannot be empty.');
  }

  if (!inputContent) {
    throw new Error('Material content cannot be empty.');
  }

  let extractedText = '';
  let sourceType = inputType;

  if (inputType === 'pdf' || Buffer.isBuffer(inputContent)) {
    try {
      extractedText = await parsePdf(inputContent);
      logger.info('PDF extraction success', { textLength: extractedText.length });
    } catch (err) {
      logger.warn('PDF extraction failed. Fallback: Request raw text from user.', { error: err.message });
      throw new Error(`PDF extraction failed: ${err.message}. Silakan kirimkan materi dalam format teks langsung.`);
    }
  } else if (typeof inputContent === 'string') {
    extractedText = inputContent.trim();
    if (!extractedText) {
      throw new Error('Teks materi tidak boleh kosong.');
    }
  } else {
    throw new Error('Unsupported input type. Provide PDF Buffer or string content.');
  }

  const topicId = await generateTopicSlugId(userId, title);

  logger.info('ingest-material completed', { topicId });
  return {
    topicId,
    title: title.trim(),
    extractedText,
    sourceType
  };
}
