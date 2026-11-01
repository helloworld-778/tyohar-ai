/**
 * @file ApiKeyModal.tsx
 * @description Slide-over modal allowing users to enter a custom Google Gemini API Key
 * for real-time generative capabilities, while ensuring 100% session isolation and offline fallback.
 */

import React from 'react';
import { Key, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { SlideOverDrawer } from '../ui/Primitives';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeyInput: string;
  setApiKeyInput: (val: string) => void;
  onSave: () => void;
  onClear: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKeyInput,
  setApiKeyInput,
  onSave,
  onClear,
}) => {
  return (
    <SlideOverDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="BYOK: Gemini API Key"
      description="Session-isolated client key storage with deterministic fallback"
      icon={<Key className="w-5 h-5" aria-hidden="true" />}
      size="md"
    >
      <div className="space-y-4 text-xs">
        <div className="rounded-md border border-[#E4DEC8] bg-[#F3EFE6] p-4 space-y-2 text-[#161412]">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1E5631] shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong>Zero Permanent Storage:</strong> Your key is stored strictly in your browser&apos;s{' '}
              <code className="text-[#B4690E] bg-white px-1 py-0.5 rounded border border-[#E4DEC8]">
                sessionStorage
              </code>{' '}
              and is discarded when this tab closes.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2B4C7E] shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong>100% Offline Safety:</strong> If no key is entered or quota runs out, Tyohar AI automatically
              relies on its deterministic math and graph algorithms.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="gemini-key-input" className="block font-bold text-[#161412] mb-1.5">
            Google AI Studio API Key
          </label>
          <input
            id="gemini-key-input"
            type="password"
            placeholder="AIzaSy..."
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-md focus:border-[#B4690E] text-[#161412] font-mono focus:outline-hidden"
          />
          <p className="mt-1 flex items-center justify-between text-[11px] text-[#686259]">
            <span>Free keys from Google AI Studio</span>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B4690E] hover:underline flex items-center gap-1 font-semibold"
            >
              Get Free Key <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#E4DEC8]">
          <button
            type="button"
            onClick={onClear}
            className="font-bold text-[#C23B22] hover:text-[#9E2A15] transition-colors"
          >
            Remove Custom Key
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-[#E4DEC8] text-[#686259] hover:text-[#161412]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="px-4 py-2 rounded-md bg-[#161412] hover:bg-[#24201C] text-[#FAF7F2] font-bold text-xs shadow-xs transition-colors"
            >
              Save &amp; Activate
            </button>
          </div>
        </div>
      </div>
    </SlideOverDrawer>
  );
};

