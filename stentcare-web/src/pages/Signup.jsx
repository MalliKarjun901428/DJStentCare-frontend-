import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Award,
  Calendar,
  Users
} from 'lucide-react';
import { ValidatedInput, Select, Button } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';
import { validatePhone, validateAge, formatPhoneNumber } from '../utils/validation';
import { apiFetch } from '../utils/api';

export const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  
  // Get role from location state or default to 'doctor'
  const initialRole = location.state?.role || 'doctor';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    specialization: '',
    password: '',
    confirmPassword: '',
    role: initialRole
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    let finalValue = value;
    let error = '';

    if (field === 'phone') {
      const res = validatePhone(value);
      finalValue = res.value;
      error = res.error;
    } else if (field === 'age') {
      const res = validateAge(value);
      finalValue = res.value;
      error = res.error;
    }

    setFormData(prev => ({ ...prev, [field]: finalValue }));
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      // 1. Call real backend API
      const registerData = await apiFetch('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          age: parseInt(formData.age),
          gender: formData.gender,
          password: formData.password,
          role: formData.role,
          specialization: formData.role === 'doctor' ? formData.specialization : undefined
        })
      });

      // 2. Automatically login after successful signup
      const user = login(formData.email, formData.password, formData.role);
      
      // 3. Save real token if provided by signup response
      if (registerData.token) {
        localStorage.setItem('stentcare_token', registerData.token);
      }

      // 4. Navigate to correct dashboard
      if (user) navigate(`/${user.role}`);

    } catch (err) {
      console.error('Signup failed:', err);
      // Fallback for testing if backend is not ready
      if (err.message === 'Failed to fetch') {
         const user = login(formData.email, formData.password, formData.role);
         if (user) navigate(`/${user.role}`);
      } else {
         setErrors({ general: err.message || 'Signup failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 max-w-md mx-auto relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
      
      {/* Navigation Header */}
      <div className="relative z-10 mb-8 pt-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-slate-800 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 mb-10">
        <h1 className="text-4xl font-black text-[#1a2b4b] tracking-tight leading-none mb-3">Create Account</h1>
        <p className="text-lg font-bold text-slate-400">Fill in your details to get started</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSignup} className="relative z-10 flex-1 space-y-5">
        
        <ValidatedInput 
          label="Full Name"
          placeholder="e.g. John Doe"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />

        <ValidatedInput 
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
        />

        <ValidatedInput 
          label="Phone Number"
          type="tel"
          placeholder="98765 43210"
          value={formatPhoneNumber(formData.phone)}
          onChange={(e) => handleChange('phone', e.target.value)}
          numericOnly={true}
          maxLength={11}
          error={errors.phone}
          required
        />

        <div className="grid grid-cols-2 gap-5">
          <ValidatedInput 
            label="Age"
            placeholder="25"
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            numericOnly={true}
            maxLength={2}
            error={errors.age}
            required
          />
          <Select 
            label="Gender"
            value={formData.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            options={[
              { label: 'Select Gender', value: '', disabled: true },
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' }
            ]}
            required
          />
        </div>

        {formData.role === 'doctor' && (
          <ValidatedInput 
            label="Medical Specialization"
            placeholder="e.g. Urology"
            value={formData.specialization}
            onChange={(e) => handleChange('specialization', e.target.value)}
            required
          />
        )}

        <ValidatedInput 
          label="Password"
          type="password"
          placeholder="••••••••••••"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          required
        />

        <ValidatedInput 
          label="Confirm Password"
          type="password"
          placeholder="••••••••••••"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          required
        />

        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold animate-in shake duration-300">
             {errors.general}
          </div>
        )}

        <div className="pt-6">
          <Button 
            type="submit" 
            className="w-full !py-4.5 shadow-xl shadow-primary/20"
            disabled={
              loading || 
              !formData.name || 
              !formData.phone || 
              formData.phone.length < 10 ||
              !formData.age ||
              !!errors.phone ||
              !!errors.age
            }
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>

        <div className="text-center pt-8 pb-10">
          <p className="text-sm font-bold text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">Sign In</Link>
          </p>
        </div>

      </form>
    </div>
  );
};
