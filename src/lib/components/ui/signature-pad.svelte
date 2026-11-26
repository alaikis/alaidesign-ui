<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';

    let { width = 400, height = 200, strokeColor = '#000000', strokeWidth = 2, backgroundColor = '#ffffff', placeholder = 'Sign here', onChange } = $props();

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null = null;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let hasSignature = $state(false);

    export function getSignatureData(): string {
        if (!canvas) return '';
        return canvas.toDataURL('image/png');
    }

    export function clear(): void {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasSignature = false;
    }

    export function isEmpty(): boolean {
        return !hasSignature;
    }

    function getEventPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if (e instanceof TouchEvent) {
            const touch = e.touches[0];
            return {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    function startDrawing(e: MouseEvent | TouchEvent): void {
        e.preventDefault();
        isDrawing = true;
        const pos = getEventPos(e);
        lastX = pos.x;
        lastY = pos.y;
    }

    function draw(e: MouseEvent | TouchEvent): void {
        if (!isDrawing || !ctx) return;
        e.preventDefault();

        const pos = getEventPos(e);
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        lastX = pos.x;
        lastY = pos.y;
        hasSignature = true;
    }

    function stopDrawing(): void {
        isDrawing = false;
        if (hasSignature) onChange?.(getSignatureData());
    }

    onMount(() => {
        if (!browser || !canvas) return;
        
        ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size for high DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        // Draw placeholder text
        ctx.font = '16px Inter, sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText(placeholder, width / 2, height / 2);
    });

    onDestroy(() => {
        isDrawing = false;
    });
</script>

<div class="signature-pad-container" style="width: {width}px; height: {height}px;">
    <canvas
        bind:this={canvas}
        {width}
        {height}
        class="signature-canvas border-2 border-border rounded-lg cursor-crosshair touch-none"
        style="background-color: {backgroundColor};"
        onmousedown={startDrawing}
        onmousemove={draw}
        onmouseup={stopDrawing}
        onmouseleave={stopDrawing}
        ontouchstart={startDrawing}
        ontouchmove={draw}
        ontouchend={stopDrawing}
    ></canvas>
</div>

<style>
    .signature-pad-container {
        position: relative;
        overflow: hidden;
    }
    
    .signature-canvas {
        display: block;
        width: 100%;
        height: 100%;
    }
    
    /* Prevent scrolling while signing on mobile */
    .signature-canvas:active {
        touch-action: none;
    }
</style>
