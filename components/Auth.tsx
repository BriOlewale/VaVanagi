import React, { useState } from 'react';
import { Button, Card, Input } from './UI';
import { User } from '../types';

export const Auth: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Super simple demo login — works instantly
    if (view === 'login') {
      if (email === 'brime.olewale@gmail.com' && password === 'admin') {
        const adminUser: User = {
          id: 'admin-1',
          name: 'Brime Olewale',
          email: 'brime.olewale@gmail.com',
          role: 'admin',
          effectivePermissions: ['*'],
        };
        onLogin(adminUser);
        return;
      }

      if (email && password) {
        const user: User = {
          id: Date.now().toString(),
          name: email.split('@')[0],
          email,
          role: 'translator',
          effectivePermissions: ['translation.create'],
        };
        onLogin(user);
        return;
      }

      setError('Please enter email and password');
      return;
    }

    // Register
    if (view === 'register') {
      if (!name || !email || !password) {
        setError('All fields are required');
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role: 'translator',
        effectivePermissions: ['translation.create'],
      };

      alert('Registered successfully! (Demo mode)');
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-teal-300 via-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
            VV
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {view === 'login' ? 'Sign in to continue' : 'Join the translation community'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {view === 'register' && (
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full text-lg py-3">
            {view === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setView(view === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {view === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>

        {view === 'login' && (
          <div className="mt-4 text-xs text-center text-gray-500">
            Demo: Use <strong>brime.olewale@gmail.com</strong> + <strong>admin</strong> for admin access
          </div>
        )}
      </Card>
    </div>
  );
};