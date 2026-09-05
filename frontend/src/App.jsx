import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { UploadMaterial } from './pages/UploadMaterial';
import { MaterialDetail } from './pages/MaterialDetail';
import { QuizPage } from './pages/QuizPage';
import { QuizResultPage } from './pages/QuizResultPage';
import { ReviewPage } from './pages/ReviewPage';
import { AIChatPage } from './pages/AIChatPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  const [activePage, setActivePage] = useState('landing');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('studybuddy_theme') || 'dark';
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('studybuddy_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { id: 'guest_demo', name: 'Budi (Tamu)', isGuest: true, email: '' };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState({ totalTopics: 3, quizzesCompleted: 12, reviewsCompleted: 8, averageScore: 82 });
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    loadData();
  }, [theme]);

  const loadData = async () => {
    const tList = await api.getTopics();
    const st = await api.getStats();
    setTopics(tList);
    setStats(st);
  };

  const handleLoginSuccess = (loggedUser) => {
    setUser(loggedUser);
    localStorage.setItem('studybuddy_user', JSON.stringify(loggedUser));
  };

  const handleProcessMaterial = async (title, content) => {
    const newTopic = await api.ingestMaterial(title, content);
    await loadData();
    setSelectedTopic(newTopic);
    setActivePage('detail');
  };

  const handleStartQuiz = (topic) => {
    setSelectedTopic(topic);
    setActivePage('quiz');
  };

  const handleFinishQuiz = async (answers) => {
    if (!selectedTopic) return;
    const res = await api.submitQuiz(selectedTopic.id, answers);
    setQuizResult(res);
    await loadData();
    setActivePage('result');
  };

  return (
    <div className="app-container">
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        theme={theme}
        setTheme={setTheme}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="main-content">
        {activePage === 'landing' && (
          <LandingPage onStart={() => setActivePage('dashboard')} />
        )}

        {activePage === 'dashboard' && (
          <Dashboard 
            topics={topics} 
            stats={stats} 
            onNavigate={setActivePage} 
            onSelectTopic={(t) => { setSelectedTopic(t); setActivePage('detail'); }} 
          />
        )}

        {activePage === 'upload' && (
          <UploadMaterial onProcessComplete={handleProcessMaterial} />
        )}

        {activePage === 'detail' && (
          <MaterialDetail 
            topic={selectedTopic || topics[0]} 
            onBack={() => setActivePage('dashboard')} 
            onStartQuiz={handleStartQuiz} 
          />
        )}

        {activePage === 'quiz' && (
          <QuizPage 
            topic={selectedTopic || topics[0]} 
            onFinishQuiz={handleFinishQuiz} 
          />
        )}

        {activePage === 'result' && (
          <QuizResultPage 
            result={quizResult} 
            topic={selectedTopic || topics[0]} 
            onBackToDetail={() => setActivePage('detail')} 
            onBackToDashboard={() => setActivePage('dashboard')} 
          />
        )}

        {activePage === 'review' && (
          <ReviewPage 
            topics={topics} 
            onStartReview={(t) => { setSelectedTopic(t); setActivePage('quiz'); }} 
          />
        )}

        {activePage === 'chat' && (
          <AIChatPage onStartQuiz={handleStartQuiz} />
        )}

        {activePage === 'profile' && (
          <ProfilePage 
            stats={stats} 
            user={user} 
            onOpenAuth={() => setIsAuthModalOpen(true)} 
          />
        )}
      </main>

      <Footer />

      {/* Auth Modal for ChatGPT-like Email Login & Instant Guest Access */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
