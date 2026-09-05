import { logger } from '../utils/logger.js';

export class AIProvider {
  constructor(apiKey = process.env.GEMINI_API_KEY) {
    this.apiKey = apiKey;
    this.isConfigured = Boolean(apiKey && apiKey !== 'mock_key' && apiKey !== 'your_gemini_api_key_here');
    if (!this.isConfigured) {
      logger.warn('AIProvider: GEMINI_API_KEY is not set or set to mock. Running in Mock/Fallback Mode.');
    }
  }

  /**
   * Generates a structured summary from raw material text
   */
  async generateSummary(title, text) {
    logger.info('AIProvider.generateSummary requested', { title, textLength: text.length });

    if (this.isConfigured) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Buatkan ringkasan materi belajar yang terstruktur, padat, dan jelas untuk mahasiswa/pelajar dari teks berikut.\nJudul: ${title}\nMateri:\n${text.slice(0, 4000)}`
              }]
            }]
          })
        });
        const data = await response.json();
        const resText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (resText) {
          logger.info('AIProvider.generateSummary completed via Gemini');
          return resText.trim();
        }
      } catch (err) {
        logger.error('Gemini generateSummary failed, using mock fallback', err);
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
      try {
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

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        const data = await response.json();
        const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = rawResponse.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          const questions = JSON.parse(jsonMatch[0]);
          if (Array.isArray(questions) && questions.length > 0) {
            logger.info('AIProvider.generateQuiz completed via Gemini', { generatedCount: questions.length });
            return questions;
          }
        }
      } catch (err) {
        logger.error('Gemini generateQuiz failed, using mock fallback', err);
      }
    }

    // Mock/Fallback Quiz Generator
    logger.info('AIProvider.generateQuiz using mock fallback generator');
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 15);
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      const sent = sentences[i % sentences.length] || `Konsep penting ${i + 1} dari materi ${title}`;
      questions.push({
        question: `Mengenai ${title}, apakah konsep berikut ini BENAR: "${sent.substring(0, 50)}..."?`,
        options: [
          `A. Ya, pernyataan tersebut benar sesuai materi.`,
          `B. Tidak, konsep tersebut salah.`,
          `C. Konsep ini tidak relevan dengan ${title}.`,
          `D. Konsep ini hanya berlaku untuk materi lain.`
        ],
        correct_answer: 'A',
        explanation: `Pernyataan ini dikutip langsung dari materi: "${sent}"`
      });
    }

    return questions;
  }

  /**
   * Evaluates text response or content (optional AI feature)
   */
  async evaluateContent(content) {
    return { evaluated: true, feedback: 'Konten valid.' };
  }
}

export const defaultAIProvider = new AIProvider();
