import { logger } from '../utils/logger.js';

export const GEMINI_MODEL = 'gemini-3.6-flash';
export const GEMINI_TIMEOUT_MS = 20000;

export class AIProvider {
  constructor(apiKey = process.env.GEMINI_API_KEY) {
    this.apiKey = apiKey;
    this.isConfigured = Boolean(apiKey && apiKey !== 'mock_key' && apiKey !== 'your_gemini_api_key_here');
    if (!this.isConfigured) {
      logger.warn('AIProvider: GEMINI_API_KEY is not set or set to mock. Running in Mock/Fallback Mode.');
    }
  }

  /**
   * Single Gemini generateContent call with hard timeout so the API never hangs.
   * Returns the generated text, or null on any failure.
   */
  async callGemini(prompt) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );
      if (!response.ok) {
        logger.warn('Gemini returned non-2xx', { status: response.status });
        return null;
      }
      const data = await response.json();
      const resText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return (resText || '').trim() || null;
    } catch (err) {
      logger.error('Gemini call failed, using mock fallback', { error: err.name === 'TimeoutError' ? 'timeout' : err.message });
      return null;
    }
  }

  /**
   * Generates a structured summary from raw material text
   */
  async generateSummary(title, text) {
    logger.info('AIProvider.generateSummary requested', { title, textLength: text.length });

    if (this.isConfigured) {
      const prompt = `Buatkan ringkasan materi belajar yang terstruktur, padat, dan jelas untuk mahasiswa/pelajar dari teks berikut.\nJudul: ${title}\nMateri:\n${text.slice(0, 4000)}`;
      const resText = await this.callGemini(prompt);
      if (resText) {
        logger.info('AIProvider.generateSummary completed via Gemini');
        return resText;
      }
    }

    // Mock/Fallback summary
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
    const bullets = sentences.slice(0, 4).map(s => `• ${s.trim()}`).join('\n');
    return `📌 **Ringkasan Materi: ${title}**\n\n${bullets}\n\n💡 *Poin Utama*: Pahami konsep dasar dan definisi kunci dalam materi ini.`;
  }

  /**
   * Generates multiple choice quiz questions
   */
  async generateQuiz(title, text, count = 5) {
    logger.info('AIProvider.generateQuiz requested', { title, count });

    if (this.isConfigured) {
      const prompt = `Anda adalah AI Quiz Generator StudyBuddy.
Buatkan tepat ${count} soal pilihan ganda (MCQ) dari materi di bawah ini.
Setiap soal harus relevan, memiliki 4 opsi (A, B, C, D), correct_answer ("A", "B", "C", atau "D"), dan explanation singkat.

Judul: ${title}
Materi:
${text.slice(0, 4000)}

HANYA kembalikan JSON array murni tanpa format markdown:
[
  {
    "question": "Pertanyaan?",
    "options": ["A. Opsi A", "B. Opsi B", "C. Opsi C", "D. Opsi D"],
    "correct_answer": "A",
    "explanation": "Penjelasan singkat."
  }
]`;

      const rawResponse = await this.callGemini(prompt);
      const jsonMatch = rawResponse ? rawResponse.match(/\[\s*\{.*\}\s*\]/s) : null;
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        if (Array.isArray(questions) && questions.length > 0) {
          logger.info('AIProvider.generateQuiz completed via Gemini', { generatedCount: questions.length });
          return questions;
        }
      }
    }

    // Mock/Fallback Quiz Generator
    logger.info('AIProvider.generateQuiz using mock fallback generator');
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 15);
    const uniqueSentences = [...new Set(sentences.map(s => s.trim().replace(/\s+/g, ' ')))];
    const genericWrong = [
      `Pernyataan ini kebalikan dari konsep dalam materi "${title}".`,
      `Konsep ini hanya berlaku di materi lain, bukan "${title}".`,
      `Pernyataan ini tidak ada sama sekali dalam materi "${title}".`
    ];
    const letters = ['A', 'B', 'C', 'D'];
    const questions = [];

    for (let i = 0; i < count; i++) {
      if (uniqueSentences.length === 0) {
        questions.push({
          question: `Manakah pernyataan yang benar mengenai konsep penting dalam materi "${title}"?`,
          options: [
            `A. Pahami definisi dan contoh utama yang dijelaskan dalam materi "${title}".`,
            `B. Konsep dalam materi "${title}" tidak perlu dipahami.`,
            `C. Materi "${title}" tidak berkaitan dengan pembelajaran.`,
            `D. Semua pernyataan di atas salah.`
          ],
          correct_answer: 'A',
          explanation: `Pernyataan yang benar: pelajari definisi dan contoh utama materi "${title}".`
        });
        continue;
      }

      const correct = uniqueSentences[i % uniqueSentences.length];
      const distractors = uniqueSentences
        .filter(s => s !== correct)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      while (distractors.length < 3) {
        distractors.push(genericWrong[distractors.length]);
      }

      const correctOption = `Pernyataan ini sesuai dengan materi "${title}": "${correct}"`;
      const shuffled = [correctOption, ...distractors].sort(() => Math.random() - 0.5);
      const correctIndex = shuffled.indexOf(correctOption);

      questions.push({
        question: `Manakah pernyataan berikut yang paling sesuai dengan materi "${title}"?`,
        options: shuffled.map((opt, idx) => `${letters[idx]}. ${opt}`),
        correct_answer: letters[correctIndex],
        explanation: `Pernyataan yang benar sesuai materi: "${correct}"`
      });
    }

    return questions;
  }

  /**
   * Answer a conversational question grounded on the provided study material context
   */
  async askQuestion(question, context) {
    logger.info('AIProvider.askQuestion requested', { question, contextLength: context.length });

    if (this.isConfigured) {
      const prompt = `Kamu adalah StudyBuddy AI Assistant, tutor pribadi yang membantu pelajar memahami materi.
Gunakan HANYA konteks materi belajar di bawah ini untuk menjawab pertanyaan pengguna dalam bahasa yang ramah dan jelas.
Jika pertanyaan tidak relevan dengan konteks, arahkan pengguna kembali ke materi yang tersedia.

Konteks Materi:
${context}

Pertanyaan: ${question}`;

      const resText = await this.callGemini(prompt);
      if (resText) {
        logger.info('AIProvider.askQuestion completed via Gemini');
        return resText;
      }
    }

    // Mock/Fallback answer grounded on the real material context
    const lines = context.split('\n').filter(l => l.trim().length > 0);
    const titleLine = lines.find(l => l.startsWith('Judul:'));
    const summaryLines = lines.filter(l => l.startsWith('•') || l.startsWith('Ringkasan:'));
    const title = titleLine ? titleLine.replace('Judul:', '').trim() : 'materi kamu';

    const q = question.toLowerCase();
    if (q.includes('ringkasan') || q.includes('summary') || q.includes('rangkum')) {
      const bullets = summaryLines.slice(0, 4).map(l => l.replace(/^Ringkasan:\s*/, '').trim()).join('\n');
      return `📖 **Ringkasan ${title}**:\n\n${bullets || '• Pahami konsep dasar dan definisi kunci dalam materi ini.'}\n\nKamu bisa mulai quiz kapan saja.`;
    }
    if (q.includes('quiz') || q.includes('mulai')) {
      return `Siap! 📚 Buka halaman **Quiz** untuk mengerjakan soal dari topik **${title}**. Jawab dengan A, B, C, atau D.`;
    }
    return `Berikut yang bisa kubantu untuk **${title}**: ringkasan materi, quiz pilihan ganda, dan jadwal review (1, 3, 7 hari). Ketik "ringkasan" atau "mulai quiz".`;
  }
}

export const defaultAIProvider = new AIProvider();
