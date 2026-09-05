import { ChannelAdapter } from './ChannelAdapter.js';
import { logger } from '../utils/logger.js';

export class WhatsAppAdapter extends ChannelAdapter {
  constructor(sessionId = 'studybuddy_wa') {
    super('whatsapp');
    this.sessionId = sessionId;
    logger.info('WhatsAppAdapter initialized (Bridge Mode).');
  }

  async sendMessage(userId, text) {
    logger.info(`[WHATSAPP BRIDGE] Send message to ${userId}:\n${text}`);
    return { success: true, channel: 'whatsapp' };
  }

  async sendQuiz(userId, quizItem, currentIndex, totalQuestions) {
    const text = `❓ *Pertanyaan ${currentIndex}/${totalQuestions}*\n\n${quizItem.question}\n\n${quizItem.options.join('\n')}\n\n*Balas dengan A, B, C, atau D untuk menjawab.*`;
    return await this.sendMessage(userId, text);
  }

  async sendReminder(userId, topicTitle, totalQuestions) {
    const text = `🔔 *Waktunya review!* 👋\n\nMateri *${topicTitle}* sudah waktunya kamu review.\nStudyBuddy telah menyiapkan ${totalQuestions} soal quiz untuk menguji pemahamanmu.\n\nYuk mulai review! 📚`;
    return await this.sendMessage(userId, text);
  }
}
