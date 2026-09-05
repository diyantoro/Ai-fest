import { ChannelAdapter } from './ChannelAdapter.js';
import { logger } from '../utils/logger.js';

export class MockChannelAdapter extends ChannelAdapter {
  constructor(name = 'mock') {
    super(name);
    this.sentMessages = [];
  }

  async sendMessage(userId, text) {
    const msg = { type: 'message', userId, text, timestamp: new Date().toISOString() };
    this.sentMessages.push(msg);
    logger.info(`[MOCK ${this.channelName.toUpperCase()}] Send Message to ${userId}:\n${text}`);
    return { success: true, messageId: `mock_msg_${Date.now()}` };
  }

  async sendQuiz(userId, quizItem, currentIndex, totalQuestions) {
    const formattedQuiz = 
`❓ **Pertanyaan ${currentIndex}/${totalQuestions}**

${quizItem.question}

${quizItem.options.join('\n')}

*Balas dengan A, B, C, atau D untuk menjawab.*`;

    const msg = { type: 'quiz', userId, quizItem, text: formattedQuiz, timestamp: new Date().toISOString() };
    this.sentMessages.push(msg);
    logger.info(`[MOCK ${this.channelName.toUpperCase()}] Send Quiz Question ${currentIndex}/${totalQuestions} to ${userId}:\n${formattedQuiz}`);
    return { success: true, messageId: `mock_quiz_${Date.now()}` };
  }

  async sendReminder(userId, topicTitle, totalQuestions) {
    const text = 
`🔔 **Waktunya review!** 👋

Materi **${topicTitle}** sudah waktunya kamu review.
StudyBuddy sudah menyiapkan ${totalQuestions} soal quiz untuk menguji pemahamanmu.

Siap mulai review? 📚`;

    const msg = { type: 'reminder', userId, topicTitle, text, timestamp: new Date().toISOString() };
    this.sentMessages.push(msg);
    logger.info(`[MOCK ${this.channelName.toUpperCase()}] Send Reminder to ${userId}:\n${text}`);
    return { success: true, messageId: `mock_rem_${Date.now()}` };
  }

  clear() {
    this.sentMessages = [];
  }
}
