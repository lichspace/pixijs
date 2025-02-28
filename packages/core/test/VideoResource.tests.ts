import path from 'path';
import { VideoResource } from '@pixi/core';

describe('VideoResource', () =>
{
    let videoUrl: string;

    beforeAll(() =>
    {
        videoUrl = path.resolve(__dirname, 'resources', 'small.mp4');
    });

    it('should create new resource', () =>
    {
        const resource = new VideoResource(videoUrl, { autoLoad: false });

        expect(resource.width).toEqual(0);
        expect(resource.height).toEqual(0);
        expect(resource.valid).toBe(false);
        expect(resource.source).toBeInstanceOf(HTMLVideoElement);

        resource.destroy();
    });

    it('should load new resource', () =>
    {
        const resource = new VideoResource(videoUrl, {
            autoLoad: false,
            autoPlay: false,
        });

        return resource.load().then((res) =>
        {
            expect(res).toEqual(resource);
            expect(res.width).toEqual(560);
            expect(res.height).toEqual(320);
            expect(res.valid).toBe(true);
            resource.destroy();
        });
    });

    it('should find correct video extension from Url', () =>
    {
        const resource = new VideoResource('https://example.org/video.webm', {
            autoLoad: false,
            autoPlay: false,
        });

        // @ts-expect-error ---
        expect(resource.source.firstChild.type).toEqual('video/webm');

        resource.destroy();
    });

    it('should get video extension without being thrown by query string', () =>
    {
        const resource = new VideoResource('/test.mp4?123...', {
            autoLoad: false,
            autoPlay: false,
        });

        // @ts-expect-error ---
        expect(resource.source.firstChild.type).toEqual('video/mp4');

        resource.destroy();
    });

    it('should respect the updateFPS settings property and getter / setter', () =>
    {
        const resource = new VideoResource(videoUrl, {
            autoLoad: false,
            autoPlay: false,
            updateFPS: 30,
        });

        return resource.load().then((res) =>
        {
            expect(res).toEqual(resource);
            expect(res.updateFPS).toEqual(30);
            res.updateFPS = 20;
            expect(res.updateFPS).toEqual(20);
            resource.destroy();
        });
    });

    it('should not hang on load if an error occurs', async () =>
    {
        const video = document.createElement('video');

        video.autoplay = false;
        video.crossOrigin = 'anonymous';
        video.preload = 'auto';
        video.src = 'data:video/webm;base64,';

        const resource = new VideoResource(video, { autoLoad: false });

        expect(resource.width).toEqual(0);
        expect(resource.height).toEqual(0);
        expect(resource.valid).toBe(false);
        expect(resource.source).toBeInstanceOf(HTMLVideoElement);

        const errorOnLoad = new Promise<boolean>((resolve) =>
        {
            resource.source.addEventListener('loadeddata', () => resolve(false));
            resource.source.addEventListener('error', () => resolve(true));
        });

        const loadPromise = resource.load();

        await expect(errorOnLoad).toResolve();
        expect(await errorOnLoad).toBe(true);
        await expect(loadPromise).toReject();

        resource.destroy();
    });
});

