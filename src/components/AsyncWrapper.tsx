import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useErrorHandler } from '@/hooks/useErrorHandler';

/**
 * Props for AsyncWrapper component
 */
interface AsyncWrapperProps<T> {
    data: T | null | undefined;
    loading: boolean;
    error: unknown;
    loadingComponent?: React.ReactNode;
    errorComponent?: React.ReactNode;
    emptyComponent?: React.ReactNode;
    retry?: () => void;
    children: (data: T) => React.ReactNode;
    isEmpty?: (data: T) => boolean;
}

/**
 * Default loading component
 */
const DefaultLoading: React.FC = () => (
    <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
    </div>
);

/**
 * Default error component
 */
const DefaultError: React.FC<{ error: unknown; onRetry?: () => void }> = ({ error, onRetry }) => {
    const { handleError } = useErrorHandler();

    React.useEffect(() => {
        if (error) {
            handleError(error, 'AsyncWrapper');
        }
    }, [error, handleError]);

    return (
        <Alert className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
                <span>Failed to load data. Please try again.</span>
                {onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                        Retry
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    );
};

/**
 * Default empty state component
 */
const DefaultEmpty: React.FC = () => (
    <div className="flex items-center justify-center p-8 text-muted-foreground">
        <span className="text-sm">No data available</span>
    </div>
);

/**
 * Wrapper component for handling loading, error, and empty states
 * Provides consistent UX for async operations
 */
export function AsyncWrapper<T>({
    data,
    loading,
    error,
    loadingComponent,
    errorComponent,
    emptyComponent,
    retry,
    children,
    isEmpty
}: AsyncWrapperProps<T>) {
    // Show loading state
    if (loading) {
        return loadingComponent || <DefaultLoading />;
    }

    // Show error state
    if (error) {
        const ErrorComp = errorComponent || DefaultError;
        return <ErrorComp error={error} onRetry={retry} />;
    }

    // Check for empty state
    if (!data || (isEmpty && isEmpty(data))) {
        return emptyComponent || <DefaultEmpty />;
    }

    // Render children with data
    return <>{children(data)}</>;
}
