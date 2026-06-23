'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

function SignupForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    await signIn('google', { callbackUrl });
  };

  const handleCredentialsSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || 'Registration failed.');
        setIsLoading(false);
        return;
      }

      // Automatically sign in after successful registration
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (signInRes?.error) {
        setError('Registered successfully, but failed to sign in automatically.');
        setIsLoading(false);
      } else if (signInRes?.url) {
        router.push(signInRes.url);
      }
    } catch (err) {
      setError('An error occurred during registration.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-bg-secondary border border-border-default rounded-2xl shadow-xl overflow-hidden p-8 text-center relative z-10 my-8">
      
      <div className="flex justify-center mb-6">
        <div className="relative p-3 bg-bg-tertiary rounded-xl border border-border-default shadow-sm">
          <BarChart3 className="h-8 w-8 text-text-primary" />
          <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-primary animate-pulse" />
        </div>
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-2">
        Create an Account
      </h1>
      <p className="text-text-secondary text-sm mb-6">
        Join Apex Intel for institutional-grade due diligence
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleCredentialsSignup} className="space-y-4 mb-6">
        <div className="text-left">
          <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
          <input 
            type="text" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-bg-tertiary border border-border-default rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            placeholder="John Doe"
          />
        </div>
        <div className="text-left">
          <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-bg-tertiary border border-border-default rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            placeholder="you@company.com"
          />
        </div>
        <div className="text-left">
          <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className="w-full bg-bg-tertiary border border-border-default rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || status === 'loading' || status === 'authenticated'}
          className="w-full bg-accent-primary hover:bg-accent-hover text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-sm"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-default"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-bg-secondary text-text-muted">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading || isLoading || status === 'loading' || status === 'authenticated'}
        className="w-full relative flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 py-3 px-4 rounded-xl font-medium transition-all focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-secondary disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
      >
        {isGoogleLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {isGoogleLoading ? 'Signing in...' : 'Google'}
      </button>

      <p className="mt-6 text-sm text-text-secondary">
        Already have an account?{' '}
        <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-accent-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary font-sans text-text-primary">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
          </div>
        }>
          <SignupForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
