'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  getPixels,
  createPixel,
  deletePixel,
  type TrackingPixelRecord,
} from '@/app/actions/pixel';
import { FontAwesomeIcon } from '@/app/components/ui/font-awesome-icon';

interface PixelsClientProps {
  shopUrl: string;
}

export default function PixelsClient({ shopUrl }: PixelsClientProps) {
  const t = useTranslations('pixels');
  const [pixels, setPixels] = useState<TrackingPixelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Add Facebook form state
  const [name, setName] = useState('');
  const [pixelId, setPixelId] = useState('');
  const [conversionApiToken, setConversionApiToken] = useState('');
  const [testToken, setTestToken] = useState('');

  const loadPixels = async () => {
    setLoading(true);
    const result = await getPixels(shopUrl);
    if (result.success && result.data) setPixels(result.data);
    setLoading(false);
  };

  useEffect(() => {
    loadPixels();
  }, [shopUrl]);

  const handleAddFacebook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!pixelId.trim()) {
      setError(t('errors.pixelIdRequired'));
      return;
    }
    setSubmitting(true);
    const result = await createPixel(shopUrl, {
      provider: 'facebook',
      name: name.trim() || undefined,
      pixelId: pixelId.trim(),
      conversionApiToken: conversionApiToken.trim() || undefined,
      testToken: testToken.trim() || undefined,
    });
    setSubmitting(false);
    if (result.success && result.data) {
      setPixels((prev) => [...prev, result.data!]);
      setName('');
      setPixelId('');
      setConversionApiToken('');
      setTestToken('');
      setSuccess(t('pixelAdded'));
    } else {
      setError(result.error ?? t('errors.saveFailed'));
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    const result = await deletePixel(shopUrl, id);
    if (result.success) {
      setPixels((prev) => prev.filter((p) => p.id !== id));
      setSuccess(t('pixelRemoved'));
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error ?? t('errors.deleteFailed'));
    }
  };

  const facebookPixels = pixels.filter((p) => p.provider === 'facebook');

  return (
    <div className="space-y-8 p-6">
      {/* Description */}
      <p className="text-muted-foreground text-sm max-w-2xl">
        {t('description')}
      </p>

      {error && (
        <div
          className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <FontAwesomeIcon icon="CircleExclamation" size={16} />
          {error}
        </div>
      )}
      {success && (
        <div
          className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400"
          role="status"
        >
          <FontAwesomeIcon icon="CircleCheck" size={16} />
          {success}
        </div>
      )}

      {/* Facebook Pixel */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1877F2]/10 text-[#1877F2]">
              <i className="fab fa-facebook-f text-lg" />
            </span>
            <div>
              <CardTitle>{t('facebook.title')}</CardTitle>
              <CardDescription>{t('facebook.description')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Facebook pixels */}
          {facebookPixels.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">{t('connectedPixels')}</h4>
              <ul className="space-y-2">
                {facebookPixels.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {p.name && (
                        <span className="font-medium">{p.name}</span>
                      )}
                      <span className="text-muted-foreground">
                        Pixel ID: {p.pixelId}
                      </span>
                      {p.hasConversionApiToken && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {t('conversionApiSet')}
                        </span>
                      )}
                      {p.hasTestToken && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {t('testTokenSet')}
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(p.id)}
                    >
                      <FontAwesomeIcon icon="TrashCan" size={14} />
                      {t('remove')}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add new Facebook pixel form */}
          <form onSubmit={handleAddFacebook} className="space-y-4">
            <h4 className="text-sm font-medium">
              {facebookPixels.length > 0 ? t('addAnother') : t('addFacebook')}
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pixel-name">{t('nameOptional')}</Label>
                <Input
                  id="pixel-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pixel-id">{t('pixelId')} *</Label>
                <Input
                  id="pixel-id"
                  value={pixelId}
                  onChange={(e) => setPixelId(e.target.value)}
                  placeholder="1234567890123456"
                  className="bg-background"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="conversion-api-token">{t('conversionApiToken')}</Label>
                <Input
                  id="conversion-api-token"
                  type="password"
                  value={conversionApiToken}
                  onChange={(e) => setConversionApiToken(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-background"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  {t('conversionApiTokenHint')}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-token">{t('testToken')}</Label>
                <Input
                  id="test-token"
                  type="password"
                  value={testToken}
                  onChange={(e) => setTestToken(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-background"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  {t('testTokenHint')}
                </p>
              </div>
            </div>
            <CardFooter className="flex justify-end px-0 pb-0 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <FontAwesomeIcon icon="ArrowPath" size={14} className="animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon="Plus" size={14} />
                    {t('addPixel')}
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {/* Coming soon: other platforms */}
      <Card className="border-dashed opacity-80">
        <CardHeader>
          <CardTitle className="text-base">{t('moreComingSoon')}</CardTitle>
          <CardDescription>{t('moreComingSoonDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              <i className="fab fa-tiktok" />
              TikTok Pixel
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              <i className="fab fa-snapchat" />
              Snapchat
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              <i className="fab fa-google" />
              Google
            </span>
          </div>
        </CardContent>
      </Card>

      {loading && pixels.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <FontAwesomeIcon icon="ArrowPath" size={24} className="animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
