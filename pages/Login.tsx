
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { db } from '../services/database';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Comprehensive Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  
  const [secretHits, setSecretHits] = useState(0);
  const [adminPin, setAdminPin] = useState('');

  const handleSecretEntrance = () => {
    const count = secretHits + 1;
    setSecretHits(count);
    if (count === 10) { // Deep hidden entrance
      setIsAdminMode(true);
      setSecretHits(0);
    }
  };

  // Fixed: Made handleAction async to support awaited DB calls
  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAdminMode) {
      // High-security Admin Access Key
      if (adminPin === 'EDUTRUST_GLOBAL_ROOT_99') {
        const admin: User = {
          id: 'root_admin_node',
          name: 'SYSTEM MASTER',
          email: 'root@edutest.global',
          phone: 'N/A',
          role: UserRole.ADMIN,
          createdAt: Date.now()
        };
        // Fixed: Added await for consistency even in mock authentication
        await db.authenticate('root@edutest.global', ''); // Mock session creation
        onLogin(admin);
      } else {
        alert("CRITICAL ERROR: ACCESS DENIED");
        setIsAdminMode(false);
      }
      return;
    }

    if (isRegistering) {
      if (!name || !email || !phone || !password) return alert("Lütfen tüm alanları doldurun.");
      // Fixed: Added await to correctly resolve the registration result promise
      const res = await db.register({ name, email, phone, password, role });
      if (res.success) {
        alert(res.message);
        setIsRegistering(false);
      } else {
        alert(res.message);
      }
    } else {
      // Fixed: Added await to correctly resolve the authentication result promise
      const user = await db.authenticate(email, password);
      if (user) {
        onLogin(user);
      } else {
        alert("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-[440px] px-6 relative z-10">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl">
          <div className="text-center mb-10">
            <button 
              type="button"
              onClick={handleSecretEntrance}
              className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span className="text-white font-black text-4xl">E</span>
            </button>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {isAdminMode ? 'ROOT CONSOLE' : (isRegistering ? 'Hesap Oluştur' : 'Giriş Yap')}
            </h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">
              {isAdminMode ? 'GLOBAL SYSTEM LOGS ACCESS' : 'Eğitimde mükemmelliğe adım atın.'}
            </p>
          </div>

          <form onSubmit={handleAction} className="space-y-4">
            {isAdminMode ? (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <input
                  type="password"
                  required
                  autoFocus
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                  placeholder="ROOT_AUTH_TOKEN"
                />
              </div>
            ) : (
              <>
                {isRegistering && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Ad Soyad"
                    />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Telefon Numarası"
                    />
                    <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 gap-1">
                      <button
                        type="button"
                        onClick={() => setRole(UserRole.STUDENT)}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${
                          role === UserRole.STUDENT ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Öğrenci
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole(UserRole.TEACHER)}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${
                          role === UserRole.TEACHER ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Eğitmen
                      </button>
                    </div>
                  </div>
                )}
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="E-posta"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Şifre"
                />
              </>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] mt-6"
            >
              {isAdminMode ? 'CONSOLA BAĞLAN' : (isRegistering ? 'Hesap Oluştur' : 'Giriş Yap')}
            </button>
            
            {!isAdminMode && (
              <p className="text-center text-slate-500 text-sm font-bold mt-6">
                {isRegistering ? 'Zaten üye misin?' : 'Hesabın yok mu?'}
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-indigo-400 ml-2 hover:underline decoration-2"
                >
                  {isRegistering ? 'Giriş Yap' : 'Hemen Kaydol'}
                </button>
              </p>
            )}
            
            {isAdminMode && (
              <button 
                type="button" 
                onClick={() => setIsAdminMode(false)}
                className="w-full text-center text-slate-600 font-bold text-[10px] uppercase tracking-widest mt-6 hover:text-white transition-colors"
              >
                GÜVENLİ ÇIKIŞ
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
