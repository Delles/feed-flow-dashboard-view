import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
        <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 w-9 rounded-lg hover:bg-accent hover:text-accent-foreground group"
            aria-label="Actualizează fluxurile RSS"
        >
            <RotateCcw
                className={`h-4 w-4 transition-all duration-300 ${
                    isRefreshing
                        ? "animate-spin text-blue-500"
                        : "group-hover:-rotate-180"
                }`}
            />
        </Button>
    );
}
