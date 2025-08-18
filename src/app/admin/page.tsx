
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { addGame, type GameSchema, updateAllGameImages } from '@/app/actions/admin';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, FilePlus2, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { PricingData } from '@/lib/pricing';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  hint: z.string().min(1, "AI hint is required."),
  pterodactylNestId: z.coerce.number({invalid_type_error: "Must be a number"}).min(1, "Pterodactyl Nest ID is required."),
  pterodactylEggId: z.coerce.number({invalid_type_error: "Must be a number"}).min(1, "Pterodactyl Egg ID is required."),
  plans: z.array(planSchema).min(1, "At least one plan is required."),
});

function AddGameForm() {
  const { toast } = useToast();
  const [pricingData, setPricingData] = useState<PricingData | null>(null);

  useEffect(() => {
    fetch('/api/pricing')
      .then(res => res.json())
      .then(data => setPricingData(data));
  }, []);

  const form = useForm<z.infer<typeof gameSchema>>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      name: '',
      description: '',
      hint: '',
      pterodactylNestId: 1,
      pterodactylEggId: 1,
      plans: [{ name: '', price: '', features: '', popular: false, priceId: '', icon: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'plans',
  });

  const onSubmit = async (data: z.infer<typeof gameSchema>) => {
    const dataForAction: GameSchema = {
      ...data,
      pterodactylNestId: Number(data.pterodactylNestId),
      pterodactylEggId: Number(data.pterodactylEggId),
    };
    const result = await addGame(dataForAction);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      window.location.reload();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: typeof result.error === 'string' ? result.error : 'There was an error submitting the form.',
      });
    }
  };

  const applyTemplate = () => {
    if (pricingData) {
      const minecraftTemplate = pricingData.supportedGames.find(game => game.name === 'Minecraft');
      if (minecraftTemplate) {
        const { image, ...templateDataWithoutImage } = minecraftTemplate;
        const templateData = {
          ...templateDataWithoutImage,
          name: '',
          description: minecraftTemplate.description,
          hint: minecraftTemplate.hint,
          pterodactylNestId: minecraftTemplate.pterodactylNestId,
          pterodactylEggId: minecraftTemplate.pterodactylEggId,
          plans: minecraftTemplate.plans.map(plan => ({
            ...plan,
            features: Array.isArray(plan.features) ? plan.features.join(', ') : '',
          })),
        };
        form.reset(templateData);
      } else {
        toast({
          variant: 'destructive',
          title: 'Template not found',
          description: 'Could not find the Minecraft game data to use as a template.',
        });
      }
    }
  };
  
  return (
      <Card>
        <CardHeader className="flex-row items-center justify-between">
            <div>
                <CardTitle>Add New Game</CardTitle>
                <CardDescription>Fill out the form below to add a new game to the database.</CardDescription>
            </div>
            <Button variant="outline" onClick={applyTemplate} disabled={!pricingData}>
                <FilePlus2 className="mr-2" />
                Use Minecraft Template
            </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  name="pterodactylNestId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pterodactyl Nest ID</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g. 1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pterodactylEggId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pterodactyl Egg ID</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g. 1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
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
                </div>
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="hint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Hint for Image Generation</FormLabel>
                        <FormControl><Input placeholder="e.g. viking survival" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

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
  )
}

function ManageGamesTab() {
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdateImages = async () => {
        setIsUpdating(true);
        toast({
            title: 'Updating Images...',
            description: 'This may take a few moments. Please wait.',
        });
        const result = await updateAllGameImages();
        if (result.success) {
            toast({
                title: 'Success!',
                description: result.message,
            });
             window.location.reload();
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: typeof result.error === 'string' ? result.error : 'An unknown error occurred.',
            });
        }
        setIsUpdating(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Existing Games</CardTitle>
                <CardDescription>Perform actions on all existing games in your catalog.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Button onClick={handleUpdateImages} disabled={isUpdating}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
                        {isUpdating ? 'Updating Images...' : 'Update All Game Images'}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        Fetches the latest 600x900 images from SteamGridDB for all games.
                    </p>
                </div>
                 <p className="text-sm text-muted-foreground mt-8">More management functionality is coming soon!</p>
            </CardContent>
        </Card>
    );
}


export default function AdminPage() {
  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your games and pricing via the database.</p>
        </div>
      </div>

      <Tabs defaultValue="add" className="mt-8">
        <TabsList>
          <TabsTrigger value="add">Add Game</TabsTrigger>
          <TabsTrigger value="manage">Manage Games</TabsTrigger>
        </TabsList>
        <TabsContent value="add" className="mt-6">
          <AddGameForm />
        </TabsContent>
        <TabsContent value="manage" className="mt-6">
           <ManageGamesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
