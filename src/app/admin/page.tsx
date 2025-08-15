
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { addGame, type GameSchema } from '@/app/actions/admin';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

const planSchema = z.object({
  name: z.string().min(1, "Plan name is required."),
  price: z.string().min(1, "Price is required."),
  priceId: z.string().optional(),
  features: z.string().min(1, "Features are required."),
  icon: z.string().optional(),
  popular: z.boolean().default(false),
});

const gameSchema = z.object({
  name: z.string().min(1, "Game name is required."),
  description: z.string().min(1, "Description is required."),
  image: z.string().min(1, "Image path is required."),
  hint: z.string().min(1, "AI hint is required."),
  plans: z.array(planSchema).min(1, "At least one plan is required."),
});

export default function AdminPage() {
  const { toast } = useToast();

  const form = useForm<GameSchema>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      name: '',
      description: '',
      image: '',
      hint: '',
      plans: [{ name: '', price: '', features: '', popular: false, priceId: '', icon: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'plans',
  });

  const onSubmit = async (data: GameSchema) => {
    const result = await addGame(data);
    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: typeof result.error === 'string' ? result.error : 'There was an error submitting the form.',
      });
    }
  };

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Add new games to the pricing page.</p>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Add New Game</CardTitle>
          <CardDescription>Fill out the form below to add a new game to the landing page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Valheim" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Description</FormLabel>
                    <FormControl><Textarea placeholder="A short description of the game..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Image Path</FormLabel>
                    <FormControl><Input placeholder="/Game-Card-icons/NewGame.png" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Hint</FormLabel>
                    <FormControl><Input placeholder="e.g. viking survival" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Pricing Plans</h3>
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4 relative">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`plans.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Plan Name</FormLabel>
                                <FormControl><Input placeholder="e.g. Bronze Plan" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`plans.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl><Input placeholder="$5" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`plans.${index}.priceId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Stripe Price ID (Optional)</FormLabel>
                                <FormControl><Input placeholder="price_..." {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name={`plans.${index}.icon`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Icon Path (Optional)</FormLabel>
                                <FormControl><Input placeholder="/Plans-Icons/Game/icon.png" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="md:col-span-2">
                             <FormField
                              control={form.control}
                              name={`plans.${index}.features`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Features (comma-separated)</FormLabel>
                                  <FormControl><Textarea placeholder="Feature 1, Feature 2, Feature 3" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                           <FormField
                              control={form.control}
                              name={`plans.${index}.popular`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Mark as Popular
                                    </FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                       </div>
                       <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </Card>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => append({ name: '', price: '', priceId: '', features: '', icon: '', popular: false })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Plan
                </Button>
              </div>

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Adding Game..." : "Add Game"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
