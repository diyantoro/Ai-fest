/**
 * Base Channel Adapter Interface
 */
export class ChannelAdapter {
  constructor(channelName) {
    this.channelName = channelName;
  }

  async sendMessage(userId, text) {
    throw new Error('sendMessage() must be implemented by subclass');
  }

  async sendQuiz(userId, quizItem, currentIndex, totalQuestions) {
    throw new Error('sendQuiz() must be implemented by subclass');
  }

  async sendReminder(userId, topicTitle, totalQuestions) {
    throw new Error('sendReminder() must be implemented by subclass');
  }
}
