"use client";

import { useRef, useState, useTransition } from "react";
import { createUser } from "@/app/actions/user";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

export function AddUserForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);
  const [showPw, setShowPw] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setResult(null);

    startTransition(async () => {
      const res = await createUser(formData);
      setResult(res);
      if (res.success) {
        formRef.current?.reset();
        setTimeout(() => setResult(null), 4000);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Username */}
        <div className="space-y-1.5">
          <Label htmlFor="add-name">Benutzername</Label>
          <Input
            id="add-name"
            name="name"
            placeholder="z. B. DJ_Felix"
            required
            minLength={2}
            autoComplete="off"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="add-password">Passwort</Label>
          <div className="relative">
            <Input
              id="add-password"
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="Mindestens 6 Zeichen"
              required
              minLength={6}
              className="pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Role */}
        <div className="space-y-1.5">
          <Label htmlFor="add-role">Rolle</Label>
          <select
            id="add-role"
            name="role"
            required
            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm font-jakarta text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:border-transparent"
          >
            <option value="moderator">Radio Moderator</option>
            <option value="dj">DJ</option>
          </select>
        </div>
      </div>

      {/* Feedback */}
      {result?.error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-jakarta text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {result.error}
        </div>
      )}
      {result?.success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-jakarta text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Benutzer wurde erfolgreich erstellt!
        </div>
      )}

      <Button type="submit" disabled={isPending} className="gap-2">
        {isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Erstelle…</>
        ) : (
          "Benutzer erstellen"
        )}
      </Button>
    </form>
  );
}
