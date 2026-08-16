import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, GraduationCap, Loader2, ShieldCheck, UserCheck, User, Zap, Eye, EyeOff } from 'lucide-react';

const demoAccounts = [
    { icon: ShieldCheck, label: 'Admin',   sub: 'admin / admin123',       user: 'admin',   pass: 'admin123',   color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe'  },
    { icon: UserCheck,   label: 'Faculty', sub: 'teacher / teacher123',   user: 'teacher', pass: 'teacher123', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    { icon: User,        label: 'Student', sub: 'student / student123',   user: 'student', pass: 'student123', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
];

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const doLogin = async (u, p) => {
        setIsLoading(true);
        try {
            const ok = await login(u, p);
            if (ok) navigate('/dashboard');
        } finally { setIsLoading(false); }
    };

    const handleSubmit = (e) => { e.preventDefault(); doLogin(username, password); };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
            {/* BG decorations */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                    {/* Top accent bar */}
                    <div className="h-1 gradient-bg w-full" />

                    <div className="p-8">
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/30">
                                <GraduationCap className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-white tracking-tight">
                                Smart<span className="text-indigo-400">Edu</span> Portal
                            </h1>
                            <p className="text-slate-500 text-sm mt-1.5">Student Management System</p>
                        </div>

                        {/* Demo Login Buttons */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Quick Demo Login</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {demoAccounts.map(({ icon: Icon, label, sub, user: u, pass: p, color, bg, border }) => (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => doLogin(u, p)}
                                        disabled={isLoading}
                                        className="flex flex-col items-center p-3 rounded-2xl border transition-all duration-200 disabled:opacity-50 hover:-translate-y-0.5 text-left"
                                        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = bg + '22'; e.currentTarget.style.borderColor = border + '66'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                                    >
                                        <Icon className="w-5 h-5 mb-1.5" style={{ color }} />
                                        <span className="text-xs font-bold text-slate-200">{label}</span>
                                        <span className="text-[10px] text-slate-500 mt-0.5 text-center leading-tight">{u}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 h-px bg-slate-800" />
                            <span className="text-xs text-slate-600 font-medium">or sign in manually</span>
                            <div className="flex-1 h-px bg-slate-800" />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                                <input
                                    type="text" required
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500
                                               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-50"
                                    placeholder="Enter your username"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'} required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        className="w-full px-4 pr-11 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500
                                                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-50"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition p-1"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center py-3.5 rounded-xl text-sm font-bold text-white
                                           bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
                                           shadow-lg shadow-indigo-600/30 transition-all duration-200
                                           disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing In…</>
                                ) : (
                                    <><LogIn className="w-4 h-4 mr-2" /> Sign In</>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-xs text-slate-500 mt-6">
                            New here?{' '}
                            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Credentials hint below card */}
                <p className="text-center text-[11px] text-slate-600 mt-5">
                    Placement-Ready Student Management Portal · SmartEdu
                </p>
            </div>
        </div>
    );
};

export default Login;
