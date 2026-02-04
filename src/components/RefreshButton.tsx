import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface RefreshButtonProps {
    onRefresh: () => Promise<void>;
    isRefreshing?: boolean;
}

export function RefreshButton({
    onRefresh,
    isRefreshing = false,
}: RefreshButtonProps) {
    const { toast } = useToast();

    const handleRefresh = async () => {
        try {
            await onRefresh();
            toast({
                title: "Actualizare completă",
                description: "Fluxurile RSS au fost actualizate cu succes.",
            });
        } catch (error) {
            toast({
                title: "Eroare la actualizare",
                description:
                    "Nu s-au putut actualiza fluxurile RSS. Încearcă din nou.",
                variant: "destructive",
            });
        }
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="h-10 w-10 rounded-full bg-secondary/50 hover:bg-primary hover:text-white transition-all duration-300 group"
                    aria-label="Actualizează Fluxurile"
                >
                    <RotateCcw
                        className={`h-4 w-4 transition-all duration-500 ${isRefreshing
                                ? "animate-spin"
                                : "group-hover:rotate-180"
                            }`}
                    />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-foreground text-background font-bold text-[10px] uppercase tracking-widest px-3 py-2 rounded-xl border-none mt-2">
                Actualizează Fluxurile
            </TooltipContent>
        </Tooltip>
    );
}
