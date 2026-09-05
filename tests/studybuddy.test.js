import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { initDb, dbQuery } from '../src/db/client.js';
import { generateTopicSlugId, ingestMaterial } from '../src/skills/ingest_material.js';
import { generateSummarySkill } from '../src/skills/generate_summary.js';
import { generateQuizSkill, validateQuizQuestion } from '../src/skills/generate_quiz.js';
import { scheduleReviewSkill } from '../src/skills/schedule_review.js';
import { gradeAnswerSkill } from '../src/skills/grade_answer.js';
import { runHeartbeatCheck } from '../src/heartbeat/heartbeat_service.js';
import { MockChannelAdapter } from '../src/channels/MockChannelAdapter.js';
import { defaultAIProvider } from '../src/services/ai_provider.js';

describe('StudyBuddy AI Agent (OpenClaw) Test Suite', () => {
  before(async () => {
    process.env.DATABASE_PATH = './data/test_studybuddy.sqlite';
    await initDb();
  });

  beforeEach(async () => {
    await dbQuery.run('DELETE FROM quiz_attempts');
    await dbQuery.run('DELETE FROM review_schedule');
    await dbQuery.run('DELETE FROM quiz_bank');
    await dbQuery.run('DELETE FROM topics');
    await dbQuery.run('DELETE FROM users');
  });

  // Test 1: Ingestion
  it('1. Should ingest text material successfully', async () => {
    const userId = 'user_test_1';
    await dbQuery.run('INSERT INTO users (id, channel, channel_user_id) VALUES (?, ?, ?)', [userId, 'mock', 'user_1']);

    const ingested = await ingestMaterial(userId, 'Software Testing', 'Software testing verifies system correctness.', 'text');
    assert.equal(ingested.title, 'Software Testing');
    assert.equal(ingested.topicId, 'software-testing-1');
  });

  // Test 2: Summary Generation
  it('2. Should generate summary from extracted text', async () => {
    const summary = await generateSummarySkill('Data Structures', 'Stack is LIFO. Queue is FIFO.', defaultAIProvider);
    assert.ok(summary.length > 0);
    assert.ok(summary.includes('Data Structures') || summary.includes('LIFO'));
  });

  // Test 3: Quiz Generation
  it('3. Should generate quiz questions', async () => {
    const questions = await defaultAIProvider.generateQuiz('Network Protocols', 'HTTP operates over TCP port 80. HTTPS uses port 443.', 3);
    assert.equal(questions.length, 3);
    assert.ok(questions[0].question);
    assert.equal(questions[0].options.length, 4);
  });

  // Test 4: Quiz Validation
  it('4. Should validate quiz question structure', () => {
    const valid = validateQuizQuestion({
      question: 'Apa singkatan dari SQL?',
      options: ['A. Structured Query Language', 'B. Simple Query Logic', 'C. System Quality Language', 'D. Sequential Logic'],
      correct_answer: 'A',
      explanation: 'SQL singkatan dari Structured Query Language.'
    });
    assert.equal(valid.correct_answer, 'A');

    // Expect error on invalid correct_answer
    assert.throws(() => {
      validateQuizQuestion({
        question: 'Test?',
        options: ['A. X', 'B. Y'],
        correct_answer: 'INVALID'
      });
    }, /Invalid correct_answer/);
  });

  // Test 5: Score Calculation
  it('5. Should calculate score correctly', async () => {
    const userId = 'user_score_test';
    const topicId = 'topic_score_test';

    await dbQuery.run('INSERT INTO users (id, channel, channel_user_id) VALUES (?, ?, ?)', [userId, 'mock', 'u_score']);
    await dbQuery.run('INSERT INTO topics (id, user_id, title, raw_text, summary) VALUES (?, ?, ?, ?, ?)', [topicId, userId, 'T', 'R', 'S']);
    await scheduleReviewSkill(userId, topicId, 1);

    const answers = [
      { quizId: 'q1', userAnswer: 'A', correctAnswer: 'A' },
      { quizId: 'q2', userAnswer: 'B', correctAnswer: 'B' },
      { quizId: 'q3', userAnswer: 'A', correctAnswer: 'C' }
    ];

    const result = await gradeAnswerSkill(userId, topicId, answers);
    assert.equal(result.score, 67); // 2 out of 3 = 66.67% -> rounded to 67%
    assert.equal(result.correctCount, 2);
  });

  // Test 6: Adaptive Interval Cases (Case 1, 2, 3, 4)
  it('6a. Case 1: Score < 60% (40%) -> Reset to Stage 1 (+1 day)', async () => {
    const userId = 'u_c1';
    const topicId = 't_c1';
    await dbQuery.run('INSERT INTO users (id, channel, channel_user_id) VALUES (?, ?, ?)', [userId, 'mock', 'u_c1']);
    await dbQuery.run('INSERT INTO topics (id, user_id, title, raw_text, summary) VALUES (?, ?, ?, ?, ?)', [topicId, userId, 'C1', 'R', 'S']);
    await scheduleReviewSkill(userId, topicId, 2); // currently at stage 2

    const result = await gradeAnswerSkill(userId, topicId, [
      { quizId: 'q1', userAnswer: 'A', correctAnswer: 'A' },
      { quizId: 'q2', userAnswer: 'B', correctAnswer: 'C' },
      { quizId: 'q3', userAnswer: 'B', correctAnswer: 'D' },
      { quizId: 'q4', userAnswer: 'A', correctAnswer: 'D' },
      { quizId: 'q5', userAnswer: 'A', correctAnswer: 'D' }
    ]); // 1/5 = 20% (<60%)

    assert.equal(result.score, 20);
    assert.equal(result.nextReviewStage, 1); // Reset back to Stage 1!
  });

  it('6b. Case 2: Score >= 60% on Stage 1 -> Advance to Stage 2 (+3 days)', async () => {
    const userId = 'u_c2';
    const topicId = 't_c2';
    await dbQuery.run('INSERT INTO users (id, channel, channel_user_id) VALUES (?, ?, ?)', [userId, 'mock', 'u_c2']);
    await dbQuery.run('INSERT INTO topics (id, user_id, title, raw_text, summary) VALUES (?, ?, ?, ?, ?)', [topicId, userId, 'C2', 'R', 'S']);
    await scheduleReviewSkill(userId, topicId, 1);

    const result = await gradeAnswerSkill(userId, topicId, [
      { quizId: 'q1', userAnswer: 'A', correctAnswer: 'A' },
      { quizId: 'q2', userAnswer: 'B', correctAnswer: 'B' },
      { quizId: 'q3', userAnswer: 'C', correctAnswer: 'C' },
      { quizId: 'q4', userAnswer: 'D', correctAnswer: 'D' }
    ]); // 4/4 = 100%

    assert.equal(result.score, 100);
    assert.equal(result.nextReviewStage, 2); // Stage 2!
  });

  it('6c. Case 3: Score >= 60% on Stage 2 -> Advance to Stage 3 (+7 days)', async () => {
    const userId = 'u_c3';
    const topicId = 't_c3';
    await dbQuery.run('INSERT INTO users (id, channel, channel_user_id) VALUES (?, ?, ?)', [userId, 'mock', 'u_c3']);
    await dbQuery.run('INSERT INTO topics (id, user_id, title, raw_text, summary) VALUES (?, ?, ?, ?, ?)', [topicId, userId, 'C3', 'R', 'S']);
    await scheduleReviewSkill(userId, topicId, 2);

    const result = await gradeAnswerSkill(userId, topicId, [
      { quizId: 'q1', userAnswer: 'A', correctAnswer: 'A' },
      { quizId: 'q2', userAnswer: 'B', correctAnswer: 'B' },
      { quizId: 'q3', userAnswer: 'C', correctAnswer: 'C' }
    ]); // 3/3 = 100%

    assert.equal(result.score, 100);
    assert.equal(result.nextReviewStage, 3); // Stage 3!
  });

  it('6d. Case 4: Score >= 60% on Stage 3 -> Topic Mastered / Completed', async () => {
    const userId = 'u_c4';
    const topicId = 't_c4';
    await dbQuery.run('INSERT INTO users (id, channel, channel_user_id) VALUES (?, ?, ?)', [userId, 'mock', 'u_c4']);
    await dbQuery.run('INSERT INTO topics (id, user_id, title, raw_text, summary) VALUES (?, ?, ?, ?, ?)', [topicId, userId, 'C4', 'R', 'S']);
    await scheduleReviewSkill(userId, topicId, 3);

    const result = await gradeAnswerSkill(userId, topicId, [
      { quizId: 'q1', userAnswer: 'A', correctAnswer: 'A' }
    ]); // 100%

    assert.equal(result.score, 100);
    assert.equal(result.status, 'completed'); // Completed / Mastered!
  });

  // Test 7: Review Scheduling
  it('7. Should create review schedule at stage 1 (+1 day)', async () => {
    const userId = 'u_sched';
    const topicId = 't_sched';
    await dbQuery.run('INSERT INTO users (id, channel, channel_user_id) VALUES (?, ?, ?)', [userId, 'mock', 'u_sched']);
    await dbQuery.run('INSERT INTO topics (id, user_id, title, raw_text, summary) VALUES (?, ?, ?, ?, ?)', [topicId, userId, 'Sched', 'R', 'S']);

    const record = await scheduleReviewSkill(userId, topicId, 1);
    assert.equal(record.review_stage, 1);
    assert.equal(record.status, 'pending');
  });

  // Test 8: Heartbeat Finding Due Reviews
  it('8. Should find due review schedules in Heartbeat check', async () => {
    const userId = 'u_hb';
    const topicId = 't_hb';
    await dbQuery.run('INSERT INTO users (id, channel, channel_user_id) VALUES (?, ?, ?)', [userId, 'mock', 'u_hb']);
    await dbQuery.run('INSERT INTO topics (id, user_id, title, raw_text, summary) VALUES (?, ?, ?, ?, ?)', [topicId, userId, 'Heartbeat Topic', 'R', 'S']);
    await dbQuery.run('INSERT INTO quiz_bank (id, topic_id, question, options, correct_answer) VALUES (?, ?, ?, ?, ?)', ['q_hb', topicId, 'Q?', '["A. 1", "B. 2"]', 'A']);

    // Set schedule due in the past
    await dbQuery.run(
      `INSERT INTO review_schedule (id, user_id, topic_id, review_stage, scheduled_at, status) VALUES (?, ?, ?, 1, datetime('now', '-2 hours'), 'pending')`,
      ['s_hb', userId, topicId]
    );

    const mockAdapter = new MockChannelAdapter('mock');
    const adapters = new Map([['mock', mockAdapter]]);

    const result = await runHeartbeatCheck(adapters);
    assert.equal(result.checked, 1);
    assert.equal(result.dispatched, 1);
    assert.equal(mockAdapter.sentMessages.length, 2); // 1 reminder + 1 quiz question
  });

  // Test 9: Topic ID Generation (Slug + Counter)
  it('9. Should generate unique slug + counter topic ID', async () => {
    const userId = 'u_slug';
    await dbQuery.run('INSERT INTO users (id, channel, channel_user_id) VALUES (?, ?, ?)', [userId, 'mock', 'u_slug']);

    const slug1 = await generateTopicSlugId(userId, 'Database Management');
    assert.equal(slug1, 'database-management-1');

    await dbQuery.run('INSERT INTO topics (id, user_id, title, raw_text, summary) VALUES (?, ?, ?, ?, ?)', [slug1, userId, 'Database Management', 'R', 'S']);

    const slug2 = await generateTopicSlugId(userId, 'Database Management');
    assert.equal(slug2, 'database-management-2');
  });

  // Test 10: Error Handling
  it('10. Should handle invalid input and errors gracefully', async () => {
    await assert.rejects(async () => {
      await ingestMaterial('user', '', '', 'text');
    }, /Title cannot be empty/);

    await assert.rejects(async () => {
      await generateQuizSkill('t1', 'Title', '', 5);
    }, /Extracted text cannot be empty/);
  });
});
