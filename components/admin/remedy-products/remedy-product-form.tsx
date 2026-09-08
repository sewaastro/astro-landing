'use client';

import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronDown } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRemediesCategories } from '@/hooks/use-remedies-category';
import { useAstrologerTags } from '@/hooks/use-astrologer-tags';
import { useDeleteRemedyMedia, useUploadRemedyMedia } from '@/hooks/use-remedy-products';
import { MediaUploader, type UploaderMediaItem } from './media-uploader';
import type { DeliveryType } from '@/lib/remedy-order-api';
import type { RemedyProduct, RemedyProductInput } from '@/lib/remedy-product-api';

// The mobile app's Create Remedy screen sources subcategory options from the
// `type=expertise` astrologer tags, so the admin dropdown mirrors that here.
const SUBCATEGORY_TAG_TYPE = 'expertise';

const DELIVERY_TYPE_OPTIONS: { label: string; value: DeliveryType }[] = [
  { label: 'Physical', value: 'physical' },
  { label: 'Online', value: 'online' },
  { label: 'Onsite', value: 'onsite' },
  { label: 'Online (digital)', value: 'online_digital' },
];

const schema = z.object({
  name: z.string().min(3, 'Must be at least 3 characters').max(100),
  subtitle: z.string().max(200).optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.array(z.string()).min(1, 'At least one subcategory is required'),
  description: z.string().min(1, 'Description is required'),
  prices: z.object({
    npr: z.coerce.number().min(0),
    inr: z.coerce.number().min(0),
    usd: z.coerce.number().min(0),
  }),
  discount: z.coerce.number().min(0).max(100).optional(),
  stock: z.coerce.number().min(0),
  isActive: z.boolean(),
  deliveryType: z.enum(['physical', 'online', 'onsite', 'online_digital']),
});

type FormValues = z.infer<typeof schema>;

// The mobile app renders `description` as Tiptap-style rich-text JSON. The
// admin panel only needs plain text for now, so wrap/unwrap a single
// paragraph node rather than pulling in a rich-text editor for this form.
function descriptionToJson(text: string): Record<string, unknown> {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  };
}

function descriptionFromJson(json: Record<string, unknown> | undefined): string {
  if (!json) return '';
  const content = json.content as Array<{ content?: Array<{ text?: string }> }> | undefined;
  return content?.[0]?.content?.map(node => node.text ?? '').join('') ?? '';
}

interface RemedyProductFormProps {
  defaultValues?: RemedyProduct;
  onSubmit: (values: RemedyProductInput) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function RemedyProductForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  onCancel,
}: RemedyProductFormProps) {
  const { data: categories } = useRemediesCategories();
  const { data: subcategoryTags } = useAstrologerTags(SUBCATEGORY_TAG_TYPE);
  const uploadMedia = useUploadRemedyMedia();
  const deleteMedia = useDeleteRemedyMedia();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name: defaultValues?.name ?? '',
      subtitle: defaultValues?.subtitle ?? '',
      category: defaultValues?.category.categoryId ?? '',
      subcategory: defaultValues?.subcategory ?? [],
      description: descriptionFromJson(defaultValues?.description),
      prices: {
        npr: defaultValues?.prices.npr ?? 0,
        inr: defaultValues?.prices.inr ?? 0,
        usd: defaultValues?.prices.usd ?? 0,
      },
      discount: defaultValues?.discount ?? 0,
      stock: defaultValues?.stock ?? 0,
      isActive: defaultValues?.isActive ?? true,
      deliveryType: defaultValues?.deliveryType ?? 'physical',
    },
  });

  const [media, setMedia] = useState<UploaderMediaItem[]>(() =>
    (defaultValues?.media ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(m => ({ mediaId: m.mediaId, url: m.url, isDefault: m.isDefault })),
  );

  // Media is uploaded eagerly (each Add image click hits the backend right
  // away), so it's tracked outside react-hook-form's own state and merged in
  // at submit time — matching the category/gift forms' upload flow.
  function handleFormSubmit(values: FormValues) {
    const mediaPayload = media.map(m => ({
      mediaId: m.mediaId,
      isDefault: m.isDefault,
    }));
    onSubmit({
      name: values.name.trim(),
      subtitle: values.subtitle?.trim() || undefined,
      category: values.category,
      subcategory: values.subcategory,
      description: descriptionToJson(values.description),
      prices: values.prices,
      discount: values.discount ?? 0,
      stock: values.stock,
      isActive: values.isActive,
      deliveryType: values.deliveryType,
      media: mediaPayload.length > 0 ? mediaPayload : undefined,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mukta text-neutral-700">Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. 5 Mukhi Rudraksha Mala"
                  className="font-mukta"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mukta text-neutral-700">Subtitle (optional)</FormLabel>
              <FormControl>
                <Input {...field} className="font-mukta" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mukta text-neutral-700">Category</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="font-mukta">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(categories ?? []).map(cat => (
                    <SelectItem key={cat._id} value={cat._id} className="font-mukta">
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subcategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mukta text-neutral-700">Subcategory</FormLabel>
              <DropdownMenu>
                <FormControl>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="font-mukta w-full justify-between font-normal"
                    >
                      <span className="truncate text-left">
                        {field.value.length > 0 ? (
                          field.value.join(', ')
                        ) : (
                          <span className="text-neutral-400">Select subcategories</span>
                        )}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                </FormControl>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  {(subcategoryTags ?? []).length === 0 ? (
                    <div className="font-mukta px-2 py-1.5 text-sm text-neutral-400">
                      No subcategories available
                    </div>
                  ) : (
                    subcategoryTags?.map(tag => (
                      <DropdownMenuCheckboxItem
                        key={tag._id}
                        className="font-mukta"
                        checked={field.value.includes(tag.name)}
                        onSelect={event => event.preventDefault()}
                        onCheckedChange={checked => {
                          field.onChange(
                            checked
                              ? [...field.value, tag.name]
                              : field.value.filter(v => v !== tag.name),
                          );
                        }}
                      >
                        {tag.name}
                      </DropdownMenuCheckboxItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mukta text-neutral-700">Description</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={4}
                  placeholder="Describe this remedy…"
                  className="font-mukta w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 disabled:opacity-50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="prices.npr"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mukta text-neutral-700">Price (NPR)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={0} step="0.01" className="font-mukta" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prices.inr"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mukta text-neutral-700">Price (INR)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={0} step="0.01" className="font-mukta" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prices.usd"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mukta text-neutral-700">Price (USD)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={0} step="0.01" className="font-mukta" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mukta text-neutral-700">Discount (%)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={0} max={100} className="font-mukta" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mukta text-neutral-700">Stock</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={0} className="font-mukta" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="deliveryType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mukta text-neutral-700">Delivery Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="font-mukta">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DELIVERY_TYPE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="font-mukta">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md border border-neutral-200 px-3 py-2.5">
              <FormLabel className="font-mukta text-neutral-700">Visible to users</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div>
          <p className="mb-2 font-mukta text-sm font-medium text-neutral-700">Images</p>
          <MediaUploader
            media={media}
            onChange={setMedia}
            onUpload={file => uploadMedia.mutateAsync(file)}
            onDelete={mediaId => deleteMedia.mutateAsync(mediaId)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="font-mukta"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="font-mukta text-white"
            style={{ backgroundColor: '#611508' }}
          >
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
