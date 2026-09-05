import React, { useState } from 'react';
import { UploadCloud, FileText, Sparkles, CheckCircle2, Loader2, Circle } from 'lucide-react';

export function UploadMaterial({ onProcessComplete }) {
  const [title, setTitle] = useState('');
  const [textInput, setTextInput] = useState('');
  const [fileName, setFileName] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setPdfBase64(null);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      const reader = new FileReader();
      reader.onload = () => setPdfBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!title) {
      alert('Silakan masukkan judul materi terlebih dahulu.');
      return;
    }
    if (!fileName && !textInput.trim()) {
      alert('Silakan upload file PDF atau tempel teks materi.');
      return;
    }

    setIsProcessing(true);
    setStep(1);

    // Step 1: Read material
    await new Promise(r => setTimeout(r, 800));
    setStep(2);

    // Step 2: Create summary
    await new Promise(r => setTimeout(r, 900));
    setStep(3);

    // Step 3: Create quiz
    await new Promise(r => setTimeout(r, 900));
    setStep(4);

    // Step 4: Schedule review
    await new Promise(r => setTimeout(r, 600));

    const contentToUse = pdfBase64 || textInput.trim();
    const contentType = pdfBase64 ? 'pdf' : 'text';
    if (!contentToUse) {
      return;
    }
    await onProcessComplete(title, contentToUse, contentType);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#0F172A', marginBottom: '0.5rem' }}>Tambah Materi Belajar</h1>
        <p style={{ color: '#64748B' }}>
          Upload PDF text-heavy atau tempel teks materi untuk memicu StudyBuddy AI Agent.
        </p>
      </div>

      {!isProcessing ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
          {/* Title Input */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#334155' }}>
              Judul Topik Materi *
            </label>
            <input 
              type="text" 
              placeholder="Contoh: Database Management Systems" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* PDF Drag & Drop Area */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#334155' }}>
              Upload Dokumen PDF
            </label>
            <div style={{
              border: '2px dashed #CBD5E1',
              borderRadius: '16px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              background: '#F8FAFC',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                id="pdf-upload" 
              />
              <label htmlFor="pdf-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UploadCloud size={28} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>
                    {fileName ? `File terpilih: ${fileName}` : 'Drag & drop PDF di sini'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                    atau klik untuk memilih file PDF
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94A3B8', fontSize: '0.85rem' }}>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
            <span>Atau tempel teks materi</span>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
          </div>

          {/* Textarea Area */}
          <div>
            <textarea 
              rows={5} 
              placeholder="Tempelkan ringkasan atau teks materi belajar kamu di sini..." 
              value={textInput} 
              onChange={e => setTextInput(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Action Button */}
          <button 
            onClick={handleProcess} 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem', borderRadius: '12px' }}
          >
            <Sparkles size={20} />
            <span>Proses dengan AI</span>
          </button>
        </div>
      ) : (
        /* Loading Progress State Card */
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={36} className="animate-pulse" />
          </div>

          <div>
            <h3 style={{ fontSize: '1.4rem', color: '#0F172A', marginBottom: '0.5rem' }}>
              StudyBuddy sedang memahami materi kamu...
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Topik: {title}</p>
          </div>

          {/* Progress Checklist */}
          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: 600 }}>
              {step >= 1 ? <CheckCircle2 color="#10B981" size={22} /> : <Circle color="#CBD5E1" size={22} />}
              <span style={{ color: step >= 1 ? '#0F172A' : '#94A3B8' }}>Membaca materi</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: 600 }}>
              {step >= 2 ? <CheckCircle2 color="#10B981" size={22} /> : step === 1 ? <Loader2 className="animate-spin" color="#4F46E5" size={22} /> : <Circle color="#CBD5E1" size={22} />}
              <span style={{ color: step >= 2 ? '#0F172A' : step === 1 ? '#4F46E5' : '#94A3B8' }}>Membuat ringkasan</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: 600 }}>
              {step >= 3 ? <CheckCircle2 color="#10B981" size={22} /> : step === 2 ? <Loader2 className="animate-spin" color="#4F46E5" size={22} /> : <Circle color="#CBD5E1" size={22} />}
              <span style={{ color: step >= 3 ? '#0F172A' : step === 2 ? '#4F46E5' : '#94A3B8' }}>Membuat quiz</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: 600 }}>
              {step >= 4 ? <CheckCircle2 color="#10B981" size={22} /> : step === 3 ? <Loader2 className="animate-spin" color="#4F46E5" size={22} /> : <Circle color="#CBD5E1" size={22} />}
              <span style={{ color: step >= 4 ? '#0F172A' : step === 3 ? '#4F46E5' : '#94A3B8' }}>Menyiapkan jadwal review</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
