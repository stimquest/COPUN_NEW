'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { reopenStage } from '@/actions/stage-actions';

interface ReopenConfirmSheetProps {
  stageId: string;
}

export function ReopenConfirmSheet({ stageId }: ReopenConfirmSheetProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReopen = async () => {
    setIsSubmitting(true);
    setError(null);
    const result = await reopenStage(stageId);
    setIsSubmitting(false);
    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error || 'Erreur lors de la réouverture');
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 px-4 rounded-lg"
      >
        <span className="material-symbols-outlined text-[16px]">lock_open</span>
        Réouvrir
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-2xl border-t border-slate-200 bg-white">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px] text-amber-600">lock_open</span>
              </div>
              <div>
                <SheetTitle className="text-lg font-bold text-slate-900">
                  Réouvrir le stage ?
                </SheetTitle>
                <SheetDescription className="text-sm text-slate-500 mt-0.5">
                  Le contenu restera tel quel. Les notes et l’analyse par objectif seront conservées.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {error && (
            <div className="px-6 mt-4">
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            </div>
          )}

          <div className="px-6 py-5 flex gap-3 pb-8">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="flex-1 h-11 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleReopen}
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Réouverture...
                </span>
              ) : (
                'Confirmer'
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
