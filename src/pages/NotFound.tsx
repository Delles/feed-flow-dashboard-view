import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        // Log 404 errors for analytics (handled by Vercel Analytics)
        if (import.meta.env.PROD) {
            console.warn("404 Error: User attempted to access non-existent route:", location.pathname);
        }
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <span className="text-2xl font-bold text-destructive">404</span>
                    </div>
                    <CardTitle className="text-2xl">Page Not Found</CardTitle>
                    <CardDescription>
                        The page you're looking for doesn't exist or has been moved.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        Path: <code className="bg-muted px-1 py-0.5 rounded text-xs">{location.pathname}</code>
                    </p>
                    <div className="flex gap-2">
                        <Button asChild className="flex-1">
                            <Link to="/">
                                <Home className="h-4 w-4 mr-2" />
                                Go Home
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotFound;
