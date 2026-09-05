import { ChannelAdapter } from './ChannelAdapter.js';
import { logger } from '../utils/logger.js';
import { Telegraf } from 'telegraf';

export class TelegramAdapter extends ChannelAdapter {
  constructor(botToken = process.env.TELEGRAM_BOT_TOKEN) {
    super('telegram');
    this.botToken = botToken;
    this.isConfigured = Boolean(botToken && botToken !== 'mock_token' && botToken !== 'your_telegram_bot_token_here');
    if (this.isConfigured) {
      try {
        this.bot = new Telegraf(botToken);
      } catch (err) {
        logger.error('Failed to initialize Telegraf bot', err);
        this.isConfigured = false;
      }
    } else {
      logger.warn('TelegramAdapter: TELEGRAM_BOT_TOKEN is not configured. Falling back to Mock mode.');
    }
  }

  async sendMessage(userId, text) {
    if (!this.isConfigured) {
      logger.info(`[TELEGRAM MOCK] Send message to ${userId}:\n${text}`);
      return { success: true, mock: true };
    }
    try {
      await this.bot.telegram.sendMessage(userId, text, { parse_mode: 'Markdown' });
      return { success: true };
    } catch (err) {
      logger.error(`Telegram sendMessage failed to ${userId}`, err);
      return { success: false, error: err.message };
    }
  }

  async sendQuiz(userId, quizItem, currentIndex, totalQuestions) {
    const text = `❓ *Pertanyaan ${currentIndex}/${totalQuestions}*\n\n${quizItem.question}\n\n${quizItem.options.join('\n')}\n\n_Balas dengan A, B, C, atau D untuk menjawab._`;
    return await this.sendMessage(userId, text);
  }

  async sendReminder(userId, topicTitle, totalQuestions) {
    const text = `🔔 *Waktunya review!* 👋\n\nMateri *${topicTitle}* sudah waktunya kamu review.\nStudyBuddy sudah menyiapkan ${totalQuestions} soal quiz untuk menguji pemahamanmu.\n\nSiap mengerjakan? 📚`;
    return await this.sendMessage(userId, text);
  }
}
