import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    UserPlus, GraduationCap, Loader2, User, Mail, Lock,
    Eye, EyeOff, ShieldCheck, UserCheck, CheckCircle
} from 'lucide-react';

/* ── Role picker cards ── */
const roles = [
    {
        value: 'STUDENT',
        label: 'Student',
        desc: 'View your grades & attendance',
        icon: User,
        color: '#10b981',
        activeBg: 'rgba(16,185,129,0.12)',
        activeBorder: 'rgba(16,185,129,0.4)',
    },
    {
        value: 'TEACHER',
        label: 'Faculty',
        desc: 'Manage students & marks',
        icon: UserCheck,
        color: '#8b5cf6',
        activeBg: 'rgba(139,92,246,0.12)',
        activeBorder: 'rgba(139,92,246,0.4)',
    },
    {
        value: 'ADMIN',
        label: 'Admin',
        desc: 'Full system access',
        icon: ShieldCheck,
        color: '#6366f1',
        activeBg: 'rgba(99,102,241,0.12)',
        activeBorder: 'rgba(99,102,241,0.4)',
    },
];

/* ── Password strength helper ── */
const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
        { label: 'Too short', color: '#f43f5e' },
        { label: 'Weak',      color: '#f59e0b' },
        { label: 'Fair',      color: '#f59e0b' },
        { label: 'Good',      color: '#10b981' },
        { label: 'Strong',    color: '#10b981' },
    ];
    return { score, ...map[score] };
};

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'STUDENT' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 = credentials, 2 = role selection
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleNext = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const success = await register(formData.username, formData.email, formData.password, formData.role);
            if (success) navigate('/login');
        } finally {
            setIsLoading(false);
        }
    };

    const strength = getStrength(formData.password);
    const canProceed = formData.username.length >= 3 && formData.email.includes('@') && formData.password.length >= 6;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8 relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-violet-600/12 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/12 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                    {/* Top gradient bar */}
                    <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)' }} />

                    <div className="p-8">
                        {/* Logo & Title */}
                        <div className="text-center mb-7">
                            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/30">
                                <GraduationCap className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-white tracking-tight">
                                Join <span className="text-indigo-400">SmartEdu</span>
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Create your free account in seconds</p>
                        </div>

                        {/* Step Indicator */}
                        <div className="flex items-center gap-3 mb-7">
                            <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                                    step >= 1 ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 text-slate-500'
                                }`}>
                                    {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
                                </div>
                                <span className={`text-xs font-semibold ${step >= 1 ? 'text-indigo-400' : 'text-slate-600'}`}>
                                    Your Details
                                </span>
                            </div>
                            <div className={`flex-1 h-px transition-all ${step > 1 ? 'bg-indigo-600' : 'bg-slate-800'}`} />
                            <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                                    step >= 2 ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 text-slate-500'
                                }`}>
                                    2
                                </div>
                                <span className={`text-xs font-semibold ${step >= 2 ? 'text-indigo-400' : 'text-slate-600'}`}>
                                    Choose Role
                                </span>
                            </div>
                        </div>

                        {/* ── STEP 1: Credentials ── */}
                        {step === 1 && (
                            <form onSubmit={handleNext} className="space-y-4 animate-fade-in-up">
                                {/* Username */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            type="text"
                                            name="username"
                                            required
                                            minLength={3}
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl
                                                       text-white text-sm placeholder-slate-500
                                                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                            placeholder="e.g. john_doe"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl
                                                       text-white text-sm placeholder-slate-500
                                                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            minLength={6}
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-11 py-3 bg-slate-800/80 border border-slate-700 rounded-xl
                                                       text-white text-sm placeholder-slate-500
                                                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                            placeholder="Min. 6 characters"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition p-1"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Password strength meter */}
                                    {formData.password && (
                                        <div className="mt-2">
                                            <div className="flex gap-1 mb-1">
                                                {[1, 2, 3, 4].map(i => (
                                                    <div
                                                        key={i}
                                                        className="h-1 flex-1 rounded-full transition-all duration-300"
                                                        style={{
                                                            background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-[11px] font-semibold" style={{ color: strength.color }}>
                                                {strength.label}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={!canProceed}
                                    className="w-full flex items-center justify-center py-3.5 rounded-xl text-sm font-bold text-white mt-2
                                               bg-gradient-to-r from-indigo-600 to-violet-600
                                               hover:from-indigo-500 hover:to-violet-500
                                               shadow-lg shadow-indigo-600/25 transition-all duration-200
                                               disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 disabled:hover:translate-y-0"
                                >
                                    Continue →
                                </button>
                            </form>
                        )}

                        {/* ── STEP 2: Role Selection ── */}
                        {step === 2 && (
                            <form onSubmit={handleSubmit} className="animate-fade-in-up">
                                <p className="text-xs text-slate-400 mb-4">
                                    Select your role in the SmartEdu system:
                                </p>
                                <div className="space-y-3 mb-6">
                                    {roles.map(({ value, label, desc, icon: Icon, color, activeBg, activeBorder }) => {
                                        const isSelected = formData.role === value;
                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: value })}
                                                className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isSelected ? activeBg : 'rgba(255,255,255,0.03)',
                                                    borderColor: isSelected ? activeBorder : 'rgba(255,255,255,0.08)',
                                                    boxShadow: isSelected ? `0 0 0 1px ${activeBorder}` : 'none',
                                                }}
                                            >
                                                <div
                                                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all"
                                                    style={{ background: isSelected ? activeBg : 'rgba(255,255,255,0.06)', border: `1px solid ${isSelected ? activeBorder : 'transparent'}` }}
                                                >
                                                    <Icon className="w-5 h-5" style={{ color: isSelected ? color : '#94a3b8' }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold" style={{ color: isSelected ? color : '#e2e8f0' }}>
                                                        {label}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                                                </div>
                                                <div
                                                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                                                    style={{
                                                        borderColor: isSelected ? color : '#475569',
                                                        background: isSelected ? color : 'transparent'
                                                    }}
                                                >
                                                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-400 border border-slate-700
                                                   hover:bg-slate-800 hover:text-slate-200 transition"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold text-white
                                                   bg-gradient-to-r from-indigo-600 to-violet-600
                                                   hover:from-indigo-500 hover:to-violet-500
                                                   shadow-lg shadow-indigo-600/25 transition-all duration-200
                                                   disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 disabled:hover:translate-y-0"
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating…</>
                                        ) : (
                                            <><UserPlus className="w-4 h-4 mr-2" /> Create Account</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Footer link */}
                        <p className="text-center text-xs text-slate-500 mt-7">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Bottom label */}
                <p className="text-center text-[11px] text-slate-700 mt-5">
                    SmartEdu Student Management Portal · Secure Registration
                </p>
            </div>
        </div>
    );
};

export default Register;
