/**
 * Security utility for input sanitization and DOM-XSS prevention.
 */

// Escapes special HTML characters to prevent XSS injection in raw string rendering
export function sanitizeString(input: string): string {
  return input.replace(/[&<>"']/g, (match) => {
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
    };
    return escapeMap[match] || match;
  });
}

// Validates Hex color codes to prevent injection via CSS/SVG color props
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}

// Sanitizes raw SVG content by stripping dangerous tags and inline event handlers
export function sanitizeSVG(svgContent: string): string {
  return svgContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}

// Simple secure SVG downloader helper
export function exportSecureSVG(filename: string, rawSvg: string): void {
  const cleanFilename = sanitizeString(filename);
  const cleanSvg = sanitizeSVG(rawSvg);

  const blob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${cleanFilename.toLowerCase().replace(/\s+/g, '-')}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Converts canvas contents or SVG DOM elements into downloadable image files
export function downloadPatternImage(
  element: HTMLCanvasElement | SVGSVGElement | null,
  filename: string = 'math-mosaic-pattern',
  format: 'png' | 'svg' = 'png'
): void {
  if (!element) return;

  const sanitizedFilename = sanitizeString(filename)
    .toLowerCase()
    .replace(/\s+/g, '-');

  const ext = format === 'svg' ? 'svg' : 'png';

  if (element instanceof HTMLCanvasElement) {
    const dataUrl = element.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${sanitizedFilename}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (element instanceof SVGSVGElement) {
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(element);
    svgString = sanitizeSVG(svgString);

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizedFilename}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}