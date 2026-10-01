import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Lock, ArrowRight, CheckCircle2, Loader2, ShieldCheck,
  Mail, Key, Eye, EyeOff
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, updatePassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

export default function StudentLogin() {
  const [mode, setMode] = useState<"login" | "change">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [statusText, setStatusText] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setIsAuthenticating(true);
    setStatusText(mode === "login" ? "Verifying credentials..." : "Changing password...");
    try {
      if (mode === "change") {
        if (!newPassword.trim() || newPassword.length < 6) throw new Error("New password must be at least 6 characters.");
        setStatusText("Verifying credentials...");
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
        setStatusText("Updating password...");
        await updatePassword(userCredential.user, newPassword);
        setStatusText("Password Changed Successfully!");
        await signInWithEmailAndPassword(auth, email.trim(), newPassword.trim());
        setStatusText("Access Granted.");
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password.trim());
        setStatusText("Access Granted.");
      }
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Authentication Failed.";
      setStatusText(msg);
      setTimeout(() => { setIsAuthenticating(false); setStatusText(""); }, 3000);
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setStatusText("Connecting to Google...");
    try {
      await signInWithPopup(auth, googleProvider);
      setStatusText("Access Granted.");
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Google Authentication Failed.";
      setStatusText(msg);
      setTimeout(() => { setIsAuthenticating(false); setStatusText(""); }, 3000);
    }
  };

  const isSuccess = statusText.includes("Granted") || statusText.includes("Changed");
  const isError = statusText.includes("Invalid") || statusText.includes("Failed") || statusText.includes("required") || statusText.includes("characters");

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center relative overflow-hidden text-white selection:bg-purple-500/30">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,60,250,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <a href="https://buildicy.com" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <svg width="22" height="24" viewBox="0 0 68 72" fill="none">
                <path d="M8 54 L34 68 L60 54 L34 40 Z" fill="#c084fc" />
                <path d="M14 36 L34 46 L54 36 L34 26 Z" fill="#d8b4fe" />
                <path d="M20 15.5 L34 22.5 L48 15.5 L34 8.5 Z" fill="white" />
                <circle cx="34" cy="8.5" r="3.5" fill="white" />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight italic" style={{ fontFamily: 'Inter' }}>Buildicy</span>
          </a>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-[#0C0C12]/80 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Loading Overlay */}
          <AnimatePresence>
            {isAuthenticating && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-[#0C0C12]/95 backdrop-blur-xl flex flex-col items-center justify-center rounded-3xl p-6 text-center"
              >
                {isSuccess ? <CheckCircle2 size={48} className="text-green-500 mb-6" /> :
                  isError ? <ShieldCheck size={48} className="text-red-500 mb-6" /> :
                    <Loader2 size={48} className="text-purple-500 animate-spin mb-6" />}
                <p className={`text-sm font-bold tracking-wide ${isSuccess ? "text-green-400" : isError ? "text-red-400" : "text-purple-400"}`}>{statusText}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6">
              <User className="text-white/80" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Internship Portal</h1>
            <p className="text-zinc-400 text-sm">
              {mode === "login" ? "Sign in to access your dashboard" : "Change your default password"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                  </div>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="john@example.com" required
                    className="w-full bg-[#050507] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                  {mode === "change" ? "Current Password" : "Password"}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                  </div>
                  <input type={showPassword ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)} required
                    placeholder={mode === "change" ? "Enter current password" : "Enter your password"}
                    className="w-full bg-[#050507] border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password (change mode) */}
              {mode === "change" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Key className="text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                    </div>
                    <input type={showNewPassword ? "text" : "password"} value={newPassword}
                      onChange={e => setNewPassword(e.target.value)} required={mode === "change"} minLength={6}
                      placeholder="Set a secure new password"
                      className="w-full bg-[#050507] border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors">
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button type="submit"
              disabled={!email.trim() || !password.trim() || (mode === "change" && !newPassword.trim()) || isAuthenticating}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
              {mode === "login" ? "Sign In" : "Change Password"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#0C0C12] text-zinc-500 font-mono">OR</span>
            </div>
          </div>

          {/* Google */}
          <button type="button" onClick={handleGoogleLogin} disabled={isAuthenticating}
            className="mt-6 w-full py-3.5 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Toggle mode */}
          <div className="mt-8 text-center">
            {mode === "login" ? (
              <button onClick={() => setMode("change")} className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Need to change your default password? Click here.
              </button>
            ) : (
              <button onClick={() => setMode("login")} className="text-xs text-zinc-400 hover:text-white transition-colors">
                Remembered your password? Sign in.
              </button>
            )}
          </div>
        </motion.div>

        <p className="text-center text-xs text-zinc-600 mt-6">© {new Date().getFullYear()} Buildicy · Internship Portal</p>
      </div>
    </div>
  );
}
