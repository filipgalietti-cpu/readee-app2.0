"use client";

import { useState } from "react";
import { Users, BookOpen, Mail, Send } from "lucide-react";

export default function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      const data = await res.json();
      setResult({ success: data.success, message: data.message });
      if (data.success) {
        setName("");
        setEmail("");
        setMessage("");
      }
    } catch {
      setResult({ success: false, message: "Something went wrong. Please try again." });
    }

    setSending(false);
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
        Get in Touch
      </h1>
      <p className="text-zinc-600 mb-8">
        Have a question or want to learn more? We&apos;d love to hear from you.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">
            Send Us a Message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-zinc-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="How can we help?"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold text-sm hover:from-indigo-700 hover:to-violet-600 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send Message"}
            </button>
            {result && (
              <p className={`text-sm text-center ${result.success ? "text-emerald-600" : "text-red-500"}`}>
                {result.message}
              </p>
            )}
          </form>
        </div>

        {/* Contact Categories */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 mb-1">Parents</h3>
                <p className="text-sm text-zinc-600">
                  Questions about your child&apos;s account, reading progress,
                  or subscription.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 mb-1">Educators</h3>
                <p className="text-sm text-zinc-600">
                  Classroom pricing, school setup, and bulk licensing inquiries.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 mb-1">General</h3>
                <p className="text-sm text-zinc-600">
                  Partnerships, press inquiries, and anything else.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 text-center">
            <p className="text-sm text-indigo-700">
              Or email us directly at{" "}
              <a
                href="mailto:hello@readee.app"
                className="font-semibold underline hover:text-indigo-800"
              >
                hello@readee.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
