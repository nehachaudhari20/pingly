import { useState, type FormEvent } from 'react';
import { Modal } from './Modal';
import { isValidUrl, normalizeUrl } from '../utils/format';
import { Loader2, Globe, Check } from 'lucide-react';

interface AddWebsiteModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (url: string) => Promise<void>;
}

export function AddWebsiteModal({ open, onClose, onAdd }: AddWebsiteModalProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setUrl('');
    setError(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const trimmed = url.trim();
  const showValid = trimmed.length > 0 && isValidUrl(normalizeUrl(trimmed));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!trimmed) {
      setError('Please enter a website URL.');
      return;
    }
    if (!isValidUrl(normalizeUrl(trimmed))) {
      setError('Please enter a valid URL (e.g. https://example.com).');
      return;
    }
    setSubmitting(true);
    try {
      await onAdd(normalizeUrl(trimmed));
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add website.');
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Website"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-website-form"
            disabled={submitting || trimmed.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding…
              </>
            ) : (
              'Add Website'
            )}
          </button>
        </>
      }
    >
      <form id="add-website-form" onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor="website-url" className="block text-sm font-medium text-gray-700">
          Website URL
        </label>
        <div className="relative">
          <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="website-url"
            type="text"
            value={url}
            autoFocus
            placeholder="https://example.com"
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 ${
              error
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                : showValid
                  ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100'
                  : 'border-gray-200 focus:border-gray-400 focus:ring-gray-100'
            }`}
          />
          {showValid && !error && (
            <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
          )}
        </div>
        {error && (
          <p className="flex items-center gap-1.5 text-sm text-rose-600">
            <span className="h-1 w-1 rounded-full bg-rose-500" />
            {error}
          </p>
        )}
        <p className="pt-1 text-xs text-gray-400">
          We'll start monitoring this URL and check its status periodically.
        </p>
      </form>
    </Modal>
  );
}
