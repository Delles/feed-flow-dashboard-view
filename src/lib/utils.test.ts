import { describe, it, expect } from 'vitest';
import { getOptimisedImage } from './utils';

describe('getOptimisedImage', () => {
    it('returns the original string if it does not start with http', () => {
        expect(getOptimisedImage('data:image/png;base64,iVBORw0KGg')).toBe('data:image/png;base64,iVBORw0KGg');
        expect(getOptimisedImage('blob:http://localhost:8080/123')).toBe('blob:http://localhost:8080/123');
        expect(getOptimisedImage('/images/local.jpg')).toBe('/images/local.jpg');
    });

    it('returns the formatted weserv URL with default parameters for an HTTP URL', () => {
        const src = 'http://example.com/image.jpg';
        const expectedEncodedSrc = encodeURIComponent(src);
        expect(getOptimisedImage(src)).toBe(`https://images.weserv.nl/?url=${expectedEncodedSrc}&w=640&q=70&output=auto&il&fit=cover`);
    });

    it('returns the formatted weserv URL with default parameters for an HTTPS URL', () => {
        const src = 'https://example.com/image.jpg';
        const expectedEncodedSrc = encodeURIComponent(src);
        expect(getOptimisedImage(src)).toBe(`https://images.weserv.nl/?url=${expectedEncodedSrc}&w=640&q=70&output=auto&il&fit=cover`);
    });

    it('returns the formatted weserv URL with custom width and quality', () => {
        const src = 'https://example.com/image.jpg';
        const expectedEncodedSrc = encodeURIComponent(src);
        expect(getOptimisedImage(src, 800, 90)).toBe(`https://images.weserv.nl/?url=${expectedEncodedSrc}&w=800&q=90&output=auto&il&fit=cover`);
    });

    it('properly URI-encodes the source URL containing special characters and query parameters', () => {
        const src = 'https://example.com/image.jpg?param1=value1&param2=a b c';
        const expectedEncodedSrc = encodeURIComponent(src);
        expect(getOptimisedImage(src)).toBe(`https://images.weserv.nl/?url=${expectedEncodedSrc}&w=640&q=70&output=auto&il&fit=cover`);

        // Let's also check a URL with spaces directly in the path
        const srcWithSpace = 'https://example.com/my image.jpg';
        const expectedEncodedSrcWithSpace = encodeURIComponent(srcWithSpace);
        expect(getOptimisedImage(srcWithSpace)).toBe(`https://images.weserv.nl/?url=${expectedEncodedSrcWithSpace}&w=640&q=70&output=auto&il&fit=cover`);
    });
});
