'use client';

import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUpdateCommissionBySource } from '@/hooks/use-commission';
import type { CommissionSettings, CommissionSource } from '@/lib/commission-api';

const schema = z.object({
  commissionPercentage: z.coerce
    .number()
    .min(0, 'Must be 0 or greater')
    .max(100, 'Must be 100 or less'),
});

type FormValues = z.infer<typeof schema>;

function formatDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type CommissionRateCardProps = {
  source: CommissionSource;
  title: string;
  description: string;
  settings: CommissionSettings | undefined;
  isLoading: boolean;
  fieldLabel?: string;
  notice?: string;
};

export function CommissionRateCard({
  source,
  title,
  description,
  settings,
  isLoading,
  fieldLabel = 'Commission Percentage (%)',
  notice,
}: CommissionRateCardProps) {
  const updateMutation = useUpdateCommissionBySource(source);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { commissionPercentage: 0 },
  });

  useEffect(() => {
    if (settings) {
      form.reset({ commissionPercentage: settings.commissionPercentage });
    }
  }, [settings, form]);

  function handleSubmit(values: FormValues) {
    updateMutation.mutate(values);
  }

  return (
    <Card className="rounded-2xl border-neutral-100 shadow-sm">
      <CardHeader className="px-6 pb-3 pt-5">
        <CardTitle className="font-mukta text-base font-semibold text-neutral-800">
          {title}
        </CardTitle>
        <p className="font-mukta text-xs text-neutral-500">{description}</p>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {isLoading ? (
          <p className="font-mukta text-sm text-neutral-400">Loading…</p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {notice && (
                <p className="rounded-md bg-amber-50 px-3 py-2 font-mukta text-xs text-amber-800">
                  {notice}
                </p>
              )}
              <FormField
                control={form.control}
                name="commissionPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mukta text-neutral-700">{fieldLabel}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        max={100}
                        step="1"
                        placeholder="e.g. 20"
                        className="font-mukta"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {settings && (
                <p className="font-mukta text-xs text-neutral-400">
                  Last updated {formatDate(settings.updatedAt)}
                  {settings.updatedBy ? ` by ${settings.updatedBy}` : ''}
                </p>
              )}

              {updateMutation.error && (
                <p className="font-mukta text-sm text-red-600">{updateMutation.error.message}</p>
              )}

              {updateMutation.isSuccess && (
                <p className="font-mukta text-sm text-green-600">Saved successfully.</p>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="font-mukta text-white"
                  style={{ backgroundColor: '#611508' }}
                >
                  {updateMutation.isPending ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
