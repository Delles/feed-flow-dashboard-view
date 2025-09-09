import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RSSFeed, Article } from "@/types/rss";
import { Rss, Plus, Loader2, CheckCircle, AlertCircle, Globe } from "lucide-react";
import { parseRSSFeed } from "@/lib/rssParser";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useErrorHandler } from "@/hooks/useErrorHandler";

// Form validation schema
const addFeedSchema = z.object({
    url: z
        .string()
        .min(1, "URL-ul este obligatoriu")
        .url("URL-ul trebuie să fie valid")
        .refine(
            (url) => url.includes("rss") || url.includes("feed") || url.includes("xml") || url.endsWith(".xml"),
            "URL-ul pare să nu fie un flux RSS valid"
        ),
    title: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
});

type AddFeedForm = z.infer<typeof addFeedSchema>;

interface AddFeedDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddFeed: (feed: RSSFeed, articles: Article[]) => void;
    existingCategories?: string[];
}

export function AddFeedDialog({
    open,
    onOpenChange,
    onAddFeed,
    existingCategories = [],
}: AddFeedDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const { handleError } = useErrorHandler();
    const [previewData, setPreviewData] = useState<{
        title?: string;
        description?: string;
        itemCount?: number;
    } | null>(null);

    const form = useForm<AddFeedForm>({
        resolver: zodResolver(addFeedSchema),
        defaultValues: {
            url: "",
            title: "",
            description: "",
            category: "",
        },
    });

    const handleSubmit = async (data: AddFeedForm) => {
        setIsLoading(true);
        setValidationStatus('idle');

        try {
            toast.loading("Se validează fluxul RSS...", {
                id: "feed-validation",
            });

            console.log("Parsing RSS feed:", data.url);
            const { feed, articles } = await parseRSSFeed(data.url);

            // Use parsed data if available, otherwise fall back to form data
            const finalFeed: RSSFeed = {
                ...feed,
                title: data.title || feed.title,
                description: data.description || feed.description,
                category: data.category || feed.category || "Altele",
                favicon: feed.favicon || "📰",
            };

            console.log(
                "Successfully parsed feed:",
                finalFeed.title,
                "with",
                articles.length,
                "articles"
            );

            toast.dismiss("feed-validation");
            toast.success("Flux RSS adăugat cu succes!", {
                description: `${finalFeed.title} - ${articles.length} articole găsite`,
            });

            onAddFeed(finalFeed, articles);
            form.reset();
            setPreviewData(null);
            setValidationStatus('idle');
            onOpenChange(false);
        } catch (error) {
            toast.dismiss("feed-validation");
            handleError(error, "Add RSS Feed");
            setValidationStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    const popularFeeds = [
        {
            title: "STIRIPESURSE.RO",
            url: "https://www.stiripesurse.ro/rss",
            favicon: "📰",
        },
        {
            title: "BBC News",
            url: "https://feeds.bbci.co.uk/news/rss.xml",
            favicon: "📺",
        },
        {
            title: "The Verge",
            url: "https://www.theverge.com/rss/index.xml",
            favicon: "📱",
        },
        {
            title: "Hacker News",
            url: "https://hnrss.org/frontpage",
            favicon: "💻",
        },
    ];

    const handleQuickAdd = (feed: (typeof popularFeeds)[0]) => {
        form.setValue("title", feed.title);
        form.setValue("url", feed.url);
        form.setValue("description", `Cele mai noi articole din ${feed.title}`);
        setValidationStatus('idle');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Rss className="h-5 w-5" />
                        Adaugă flux RSS
                    </DialogTitle>
                    <DialogDescription>
                        Introduce URL-ul fluxului RSS pentru a-l adăuga la colecția ta.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* URL Field */}
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL RSS</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="https://example.com/feed.xml sau https://example.com/rss"
                                                {...field}
                                                className="pr-10"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {isValidating ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                                ) : validationStatus === 'success' ? (
                                                    <CheckCircle className="w-4 h-4 text-success" />
                                                ) : validationStatus === 'error' ? (
                                                    <AlertCircle className="w-4 h-4 text-destructive" />
                                                ) : (
                                                    <Globe className="w-4 h-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        URL-ul trebuie să fie un flux RSS valid (.xml, .rss, sau /feed)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Preview Section */}
                        {previewData && (
                            <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-success" />
                                    Flux detectat
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Titlu:</span>
                                        <span className="font-medium">{previewData.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Articole:</span>
                                        <Badge variant="secondary">{previewData.itemCount}</Badge>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Title Field */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Titlu flux (opțional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Va fi detectat automat din flux"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Dacă nu specifici un titlu, va fi folosit cel din flux
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category Field */}
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categorie (opțional)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selectează o categorie" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {existingCategories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                            <SelectItem value="Altele">Altele</SelectItem>
                                            <SelectItem value="Știri">Știri</SelectItem>
                                            <SelectItem value="Tehnologie">Tehnologie</SelectItem>
                                            <SelectItem value="Sport">Sport</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Categorii existente: {existingCategories.join(", ")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description Field */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descriere (opțional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Va fi detectată automat din flux"
                                            rows={2}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        O scurtă descriere a fluxului RSS
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    <div className="space-y-3">
                        <Label className="text-sm font-medium">
                            Adăugare rapidă de fluxuri populare
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                            {popularFeeds.map((feed) => (
                                <Button
                                    key={feed.title}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickAdd(feed)}
                                    className="justify-start text-left h-auto p-2"
                                >
                                    <span className="mr-2">{feed.favicon}</span>
                                    <span className="text-xs">
                                        {feed.title}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Anulează
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || !form.formState.isValid}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Se validează...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Adaugă flux
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
