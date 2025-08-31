
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { addGame, type GameSchema, updateAllGameImages, deleteGame, deletePlan, updateGame, updatePlan, addPlan } from '@/app/actions/admin';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, FilePlus2, RefreshCw, Edit, Gamepad, DollarSign, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import type { PricingData, Game as GameData, Plan as PlanData } from '@/lib/pricing';
import { useEffect, useState, useTransition } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


const planSchema = z.object({
  name: z.string().min(1, "Plan name is required."),
  price: z.string().min(1, "Price is required."),
  priceId: z.string().optional(),
  features: z.string().min(1, "Features are required."),
  icon: z.string().optional(),
  popular: z.boolean().default(false),
  cpu: z.coerce.number({invalid_type_error: "Must be a number"}).min(1, "CPU is required."),
  ram: z.coerce.number({invalid_type_error: "Must be a number"}).min(1, "RAM is required."),
  disk: z.coerce.number({invalid_type_error: "Must be a number"}).min(1, "Disk is required."),
});

const gameSchema = z.object({
  name: z.string().min(1, "Game name is required."),
  description: z.string().min(1, "Description is required."),
  hint: z.string().min(1, "AI hint is required."),
  plans: z.array(planSchema).min(1, "At least one plan is required."),
});

// For updates
const updatePlanSchema = planSchema.extend({ id: z.number() });
const updateGameSchema = gameSchema.omit({ plans: true }).extend({ id: z.number() });
const addPlanSchema = planSchema.extend({ game_id: z.number() });


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
      plans: [{ name: '', price: '', features: '', popular: false, priceId: '', icon: '', cpu: 100, ram: 2048, disk: 5120 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'plans',
  });

  const onSubmit = async (data: z.infer<typeof gameSchema>) => {
    const dataForAction: GameSchema = {
      ...data,
      plans: data.plans.map(p => ({...p, features: p.features.split(',').map(s => s.trim())}))
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
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                           <FormField
                            control={form.control}
                            name={`plans.${index}.cpu`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CPU (%)</FormLabel>
                                <FormControl><Input type="number" placeholder="100" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name={`plans.${index}.ram`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>RAM (MB)</FormLabel>
                                <FormControl><Input type="number" placeholder="2048" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name={`plans.${index}.disk`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Disk (MB)</FormLabel>
                                <FormControl><Input type="number" placeholder="5120" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="md:col-span-full">
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
                  onClick={() => append({ name: '', price: '', priceId: '', features: '', icon: '', popular: false, cpu: 100, ram: 2048, disk: 5120 })}
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

function EditGameForm({ game, onFinished }: { game: GameData, onFinished: () => void }) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof updateGameSchema>>({
        resolver: zodResolver(updateGameSchema),
        defaultValues: {
            id: game.id,
            name: game.name,
            description: game.description,
            hint: game.hint,
        },
    });

    const onSubmit = async (data: z.infer<typeof updateGameSchema>) => {
        const result = await updateGame(data);
        if (result.success) {
            toast({ title: 'Success!', description: result.message });
            onFinished();
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: typeof result.error === 'string' ? result.error : JSON.stringify(result.error),
            });
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Game</DialogTitle>
                <DialogDescription>Update the details for {game.name}.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Game Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem className="md:col-span-2"> <FormLabel>Description</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="hint" render={({ field }) => ( <FormItem className="md:col-span-2"> <FormLabel>AI Hint</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </div>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </Form>
        </DialogContent>
    );
}

function EditPlanForm({ plan, onFinished }: { plan: PlanData, onFinished: () => void }) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof updatePlanSchema>>({
        resolver: zodResolver(updatePlanSchema),
        defaultValues: {
            id: plan.id,
            name: plan.name,
            price: plan.price,
            priceId: plan.priceId || '',
            icon: plan.icon || '',
            popular: plan.popular || false,
            features: Array.isArray(plan.features) ? plan.features.join(', ') : '',
            cpu: plan.cpu,
            ram: plan.ram,
            disk: plan.disk,
        },
    });
    
    const onSubmit = async (data: z.infer<typeof updatePlanSchema>) => {
        const result = await updatePlan({
            ...data,
            id: plan.id!,
            features: data.features.split(',').map(s => s.trim()),
        });

        if (result.success) {
            toast({ title: 'Success!', description: result.message });
            onFinished();
        } else {
            toast({
                variant: 'destructive',
                title: 'Error updating plan',
                description: typeof result.error === 'string' ? result.error : JSON.stringify(result.error),
            });
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Plan</DialogTitle>
                <DialogDescription>Update the details for the {plan.name} plan.</DialogDescription>
            </DialogHeader>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Plan Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                       <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Price</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                       <FormField control={form.control} name="priceId" render={({ field }) => ( <FormItem> <FormLabel>Stripe Price ID</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                       <FormField control={form.control} name="icon" render={({ field }) => ( <FormItem> <FormLabel>Icon Path</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="cpu" render={({ field }) => ( <FormItem> <FormLabel>CPU (%)</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="ram" render={({ field }) => ( <FormItem> <FormLabel>RAM (MB)</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="disk" render={({ field }) => ( <FormItem> <FormLabel>Disk (MB)</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                       <FormField control={form.control} name="features" render={({ field }) => ( <FormItem className="md:col-span-2"> <FormLabel>Features (comma-separated)</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                       <FormField
                            control={form.control}
                            name="popular"
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
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </Form>
        </DialogContent>
    )
}

function AddPlanForm({ game, onFinished }: { game: GameData, onFinished: () => void }) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof addPlanSchema>>({
        resolver: zodResolver(addPlanSchema),
        defaultValues: {
            game_id: game.id,
            name: '',
            price: '',
            priceId: '',
            features: '',
            icon: '',
            popular: false,
            cpu: 100,
            ram: 2048,
            disk: 5120,
        },
    });

    const onSubmit = async (data: z.infer<typeof addPlanSchema>) => {
        const result = await addPlan({
            ...data,
            features: data.features.split(',').map(s => s.trim()),
        });
        if (result.success) {
            toast({ title: 'Success!', description: result.message });
            onFinished();
        } else {
            toast({
                variant: 'destructive',
                title: 'Error adding plan',
                description: typeof result.error === 'string' ? result.error : JSON.stringify(result.error),
            });
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Plan to {game.name}</DialogTitle>
                <DialogDescription>Create a new pricing plan for this game.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Plan Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                       <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Price</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                       <FormField control={form.control} name="priceId" render={({ field }) => ( <FormItem> <FormLabel>Stripe Price ID</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                       <FormField control={form.control} name="icon" render={({ field }) => ( <FormItem> <FormLabel>Icon Path</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="cpu" render={({ field }) => ( <FormItem> <FormLabel>CPU (%)</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="ram" render={({ field }) => ( <FormItem> <FormLabel>RAM (MB)</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="disk" render={({ field }) => ( <FormItem> <FormLabel>Disk (MB)</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                       <FormField control={form.control} name="features" render={({ field }) => ( <FormItem className="md:col-span-2"> <FormLabel>Features (comma-separated)</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField
                            control={form.control}
                            name="popular"
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
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Adding..." : "Add Plan"}
                    </Button>
                </form>
            </Form>
        </DialogContent>
    )
}

function ManageGamesTab() {
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);
    const [games, setGames] = useState<PricingData['supportedGames']>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    
    // State for modals
    const [editingGame, setEditingGame] = useState<GameData | null>(null);
    const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);
    const [addingPlanToGame, setAddingPlanToGame] = useState<GameData | null>(null);

    const refreshGames = () => {
        setIsLoading(true);
        fetch('/api/pricing')
            .then(res => res.json())
            .then((data: PricingData) => {
                setGames(data.supportedGames);
            })
            .catch(error => {
                console.error("Failed to fetch games:", error);
                toast({
                    title: "Error",
                    description: "Could not load games data.",
                    variant: "destructive",
                });
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        refreshGames();
    }, [toast]);

    const onModalOpenChange = (open: boolean) => {
        if (!open) {
            setEditingGame(null);
            setEditingPlan(null);
            setAddingPlanToGame(null);
            refreshGames();
        }
    }


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
             refreshGames();
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: typeof result.error === 'string' ? result.error : 'An unknown error occurred.',
            });
        }
        setIsUpdating(false);
    };

    const handleDeleteGame = (gameId: number) => {
        startTransition(async () => {
            const result = await deleteGame(gameId);
            if (result.success) {
                toast({ title: 'Success', description: result.message });
                setGames(prev => prev.filter(g => g.id !== gameId));
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
        });
    };

    const handleDeletePlan = (planId: number) => {
        startTransition(async () => {
            const result = await deletePlan(planId);
            if (result.success) {
                toast({ title: 'Success', description: result.message });
                refreshGames();
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
        });
    };


    return (
        <Dialog onOpenChange={onModalOpenChange}>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Global Actions</CardTitle>
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Existing Games</CardTitle>
                        <CardDescription>Edit or delete existing games and their pricing plans.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isLoading ? (
                            <p>Loading games...</p>
                        ) : games.length > 0 ? (
                            games.map((game) => (
                                <Card key={game.id} className="overflow-hidden">
                                    <div className="flex items-center justify-between bg-secondary p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-16 w-12 flex-shrink-0">
                                                <Image src={game.image} alt={game.name} fill className="object-cover rounded-md" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl">{game.name}</CardTitle>
                                                <p className="text-sm text-muted-foreground">Game ID: {game.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" onClick={() => setAddingPlanToGame(game)}><Plus className="mr-2 h-4 w-4" />Add Plan</Button>
                                            </DialogTrigger>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" onClick={() => setEditingGame(game)}><Edit className="mr-2 h-4 w-4" />Edit Game</Button>
                                            </DialogTrigger>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" />Delete Game</Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the game "{game.name}" and all of its associated plans. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteGame(game.id!)} disabled={isPending}>
                                                        {isPending ? "Deleting..." : "Delete"}
                                                    </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-4">
                                        <h4 className="font-semibold text-muted-foreground">Plans for {game.name}</h4>
                                        {game.plans && game.plans.length > 0 ? (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                {game.plans.map(plan => (
                                                    <div key={plan.id} className="flex items-center justify-between rounded-md border p-4">
                                                        <div className="font-medium">
                                                            <p className="text-foreground">{plan.name}</p>
                                                            <p className="text-sm text-muted-foreground">{plan.price}/mo</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="sm" onClick={() => setEditingPlan(plan)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
                                                            </DialogTrigger>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will permanently delete the plan "{plan.name}". This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeletePlan(plan.id!)} disabled={isPending}>
                                                                        {isPending ? "Deleting..." : "Delete"}
                                                                    </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ): (
                                            <p className="text-sm text-muted-foreground">No plans found for this game.</p>
                                        )}
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <p>No games found in the database.</p>
                        )}
                    </CardContent>
                </Card>
                
                {editingGame && <EditGameForm game={editingGame} onFinished={() => { setEditingGame(null); onModalOpenChange(false) }} />}
                {editingPlan && <EditPlanForm plan={editingPlan} onFinished={() => { setEditingPlan(null); onModalOpenChange(false) }} />}
                {addingPlanToGame && <AddPlanForm game={addingPlanToGame} onFinished={() => { setAddingPlanToGame(null); onModalOpenChange(false) }} />}

            </div>
        </Dialog>
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

      <Tabs defaultValue="manage" className="mt-8">
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
