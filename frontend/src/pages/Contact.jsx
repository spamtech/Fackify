import React, { useState } from 'react';
import {
  Send,
  Mail,
  User,
  Phone,
  MessageSquare,
  MessageCircle,
  Instagram,
  AlertCircle,
  CheckCircle2,
  Headphones,
  Music2,
  Sparkles,
  Heart,
  Radio,
  Disc3,
  ArrowRight,
  ShieldCheck,
  Clock3,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function Contact() {
  const auth = useAuth() || {};
  const user = auth.user || null;

  const [formData, setFormData] = useState({
    name: user?.username || '',
    email: user?.email || '',
    phone: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({
    type: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (status.message) {
      setStatus({
        type: '',
        message: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.message.trim()
    ) {
      setStatus({
        type: 'error',
        message:
          'All fields (name, email, phone, message) are required.',
      });
      return;
    }

    try {
      setLoading(true);

      setStatus({
        type: '',
        message: '',
      });

      await api.post('/contact', formData);

      setStatus({
        type: 'success',
        message:
          'Your message has been received successfully. We will get back to you soon.',
      });

      setFormData({
        name: user?.username || '',
        email: user?.email || '',
        phone: '',
        message: '',
      });
    } catch (err) {
      setStatus({
        type: 'error',
        message:
          err?.response?.data?.message ||
          'Transmission failed. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full bg-[#020617] text-white overflow-hidden">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* Main glow */}
        <div className="absolute -top-40 left-[10%] w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[120px]" />

        <div className="absolute top-[35%] right-[-150px] w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[120px]" />

        <div className="absolute bottom-[-150px] left-[30%] w-[500px] h-[400px] bg-purple-500/10 rounded-full blur-[130px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
            backgroundSize: '45px 45px',
          }}
        />

        {/* Floating icons */}

        <Music2
          className="absolute top-20 left-[7%] text-emerald-400/10 animate-pulse"
          size={40}
        />

        <Headphones
          className="absolute top-32 right-[8%] text-cyan-400/10 animate-bounce"
          size={45}
        />

        <Disc3
          className="absolute bottom-20 left-[10%] text-purple-400/10 animate-spin"
          size={50}
          style={{
            animationDuration: '12s',
          }}
        />

      </div>

      {/* =====================================================
          MAIN CONTENT
          NO EXTRA HEADER SPACE
      ===================================================== */}

      <main className="relative z-10 w-full">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="px-5 sm:px-8 lg:px-12 pt-8 sm:pt-10 pb-8">

          <div className="max-w-6xl mx-auto">

            <div className="flex flex-col items-center text-center">

              {/* Badge */}

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] backdrop-blur-md mb-5">

                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>

                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">
                  Fackify Support
                </span>

              </div>

              {/* Heading */}

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">

                We're Here To
                <span className="block mt-1 bg-gradient-to-r from-emerald-400 via-green-400 to-purple-400 bg-clip-text text-transparent">
                  Help You :)
                </span>

              </h1>

              <p className="max-w-xl mt-5 text-sm sm:text-base text-slate-400 leading-7">
                Have a question, found a problem, or just want to
                share something with us?
                <span className="text-slate-300">
                  {' '}
                  Send your message — we're listening.
                </span>
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            CONTACT AREA
        ================================================= */}

        <section className="px-5 sm:px-8 lg:px-12 pb-12">

          <div className="max-w-6xl mx-auto">

            <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6">

              {/* =================================================
                  LEFT CARD
              ================================================= */}

              <div className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl p-7 sm:p-8">

                {/* Card glow */}

                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-400/10 blur-[90px]" />

                <div className="relative z-10">

                  {/* Icon */}

                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/10 border border-emerald-400/20 flex items-center justify-center mb-6">

                    <Headphones
                      className="w-8 h-8 text-emerald-400"
                    />

                  </div>

                  <div className="text-xs uppercase tracking-[0.25em] font-bold text-emerald-400 mb-3">
                    Let's connect
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                    Your voice
                    <br />
                    <span className="text-slate-400">
                      matters.
                    </span>
                  </h2>

                  <p className="mt-5 text-sm text-slate-400 leading-7">
                    Fackify is built for people who love music.
                    Your feedback, ideas and suggestions help us
                    create a better listening experience.
                  </p>

                  {/* Information */}

                  <div className="mt-8 space-y-3">

                    <div className="group flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] bg-black/20 hover:bg-white/[0.035] transition">

                      <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-400/10 flex items-center justify-center">

                        <Clock3 className="w-5 h-5 text-emerald-400" />

                      </div>

                      <div>
                        <p className="text-sm font-bold text-white">
                          Quick response
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          We'll get back to you as soon as possible.
                        </p>
                      </div>

                    </div>

                    <div className="group flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] bg-black/20 hover:bg-white/[0.035] transition">

                      <div className="w-10 h-10 shrink-0 rounded-xl bg-cyan-400/10 flex items-center justify-center">

                        <ShieldCheck className="w-5 h-5 text-cyan-400" />

                      </div>

                      <div>
                        <p className="text-sm font-bold text-white">
                          Privacy first
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Your information stays protected.
                        </p>
                      </div>

                    </div>

                    <div className="group flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] bg-black/20 hover:bg-white/[0.035] transition">

                      <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-400/10 flex items-center justify-center">

                        <Heart className="w-5 h-5 text-purple-400" />

                      </div>

                      <div>
                        <p className="text-sm font-bold text-white">
                          Built with passion
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Made for people who live through music.
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* Connect with Admin */}

                  <div className="mt-7">

                    <div className="text-xs uppercase tracking-[0.25em] font-bold text-slate-500 mb-3">
                      Connect with admin
                    </div>

                    <div className="grid grid-cols-2 gap-3">

                      <a
                        href="https://wa.me/917810828802"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 p-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] hover:bg-emerald-400/10 hover:border-emerald-400/30 transition"
                      >

                        <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-400/10 flex items-center justify-center group-hover:scale-105 transition">

                          <MessageCircle className="w-5 h-5 text-emerald-400" />

                        </div>

                        <div>
                          <p className="text-sm font-bold text-white">
                            WhatsApp
                          </p>

                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Chat directly
                          </p>
                        </div>

                      </a>

                      <a
                        href="https://instagram.com/YOUR_INSTAGRAM_USERNAME"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 p-4 rounded-2xl border border-pink-400/15 bg-pink-400/[0.04] hover:bg-pink-400/10 hover:border-pink-400/30 transition"
                      >

                        <div className="w-10 h-10 shrink-0 rounded-xl bg-pink-400/10 flex items-center justify-center group-hover:scale-105 transition">

                          <Instagram className="w-5 h-5 text-pink-400" />

                        </div>

                        <div>
                          <p className="text-sm font-bold text-white">
                            Instagram
                          </p>

                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Follow along
                          </p>
                        </div>

                      </a>

                    </div>

                  </div>

                  {/* Quote */}

                  <div className="relative mt-7 p-5 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.035] to-transparent">

                    <div className="flex items-center gap-2 mb-3">

                      <Sparkles
                        className="w-4 h-4 text-emerald-400"
                      />

                      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-500">
                        Fackify
                      </span>

                    </div>

                    <p className="text-sm text-slate-300 italic leading-6">
                      "Sometimes the best conversations start
                      with a simple message."
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  FORM CARD
              ================================================= */}

              <div className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl p-6 sm:p-8">

                {/* Top gradient */}

                <div className="absolute top-0 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

                {/* Header */}

                <div className="flex items-center justify-between mb-7">

                  <div>

                    <div className="flex items-center gap-2 mb-2">

                      <Radio
                        className="w-4 h-4 text-emerald-400"
                      />

                      <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold">
                        Send a message
                      </span>

                    </div>

                    <h3 className="text-2xl font-black">
                      Tell us what's on your mind.
                    </h3>

                  </div>

                  <div className="hidden sm:flex w-11 h-11 rounded-xl bg-emerald-400/10 items-center justify-center">

                    <Music2
                      className="w-5 h-5 text-emerald-400"
                    />

                  </div>

                </div>

                {/* Status */}

                {status.message && (

                  <div
                    className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 ${
                      status.type === 'error'
                        ? 'border-rose-400/20 bg-rose-400/[0.05] text-rose-300'
                        : 'border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-300'
                    }`}
                  >

                    {status.type === 'error' ? (
                      <AlertCircle className="w-5 h-5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    )}

                    <div>

                      <p className="text-xs font-bold uppercase tracking-wider">
                        {status.type === 'error'
                          ? 'Something went wrong'
                          : 'Message received'}
                      </p>

                      <p className="text-xs mt-1 text-slate-400 leading-5">
                        {status.message}
                      </p>

                    </div>

                  </div>

                )}

                {/* Form */}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* Name */}

                  <div>

                    <label className="block text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">
                      Full Name
                    </label>

                    <div className="relative group">

                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-400 transition" />

                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full bg-black/20 border border-white/[0.07] p-3.5 pl-11 rounded-2xl text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-400/[0.04] transition"
                      />

                    </div>

                  </div>

                  {/* Email + Phone */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    <div>

                      <label className="block text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">
                        Email Address
                      </label>

                      <div className="relative group">

                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-400 transition" />

                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className="w-full bg-black/20 border border-white/[0.07] p-3.5 pl-11 rounded-2xl text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-400/[0.04] transition"
                        />

                      </div>

                    </div>

                    <div>

                      <label className="block text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">
                        Phone Number
                      </label>

                      <div className="relative group">

                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-400 transition" />

                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 9876543210"
                          className="w-full bg-black/20 border border-white/[0.07] p-3.5 pl-11 rounded-2xl text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-400/[0.04] transition"
                        />

                      </div>

                    </div>

                  </div>

                  {/* Message */}

                  <div>

                    <label className="block text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">
                      Your Message
                    </label>

                    <div className="relative group">

                      <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-600 group-focus-within:text-emerald-400 transition" />

                      <textarea
                        rows={6}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us what's on your mind..."
                        className="w-full bg-black/20 border border-white/[0.07] p-3.5 pl-11 rounded-2xl text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-400/[0.04] resize-none transition"
                      />

                    </div>

                  </div>

                  {/* Submit */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative overflow-hidden w-full py-4 rounded-2xl bg-emerald-400 text-slate-950 font-black uppercase tracking-[0.12em] text-xs hover:bg-emerald-300 hover:shadow-[0_0_40px_rgba(52,211,153,0.2)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >

                    <span className="relative z-10 flex items-center justify-center gap-2">

                      {loading ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message

                          <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />

                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      )}

                    </span>

                  </button>

                  {/* Secure text */}

                  <div className="flex justify-center items-center gap-2 pt-1 text-[9px] uppercase tracking-[0.15em] text-slate-600">

                    <ShieldCheck className="w-3.5 h-3.5" />

                    Securely transmitted

                  </div>

                </form>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            BOTTOM
        ================================================= */}

        <div className="pb-8 text-center">

          <div className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-slate-700">

            <Music2 className="w-3.5 h-3.5" />

            Keep listening · Keep feeling · Keep discovering

            <Music2 className="w-3.5 h-3.5" />

          </div>

        </div>

      </main>
    </div>
  );
}