// qrGenerator.test.js - Unit tests for offline vector QR Code generator
import { generateQRCodeMatrix, generateQRCodeSVG } from '../qrGenerator';

describe('QR Code Vector Generator', () => {
  test('generates valid matrix for short text', () => {
    const matrix = generateQRCodeMatrix('https://astraea.app');
    expect(matrix).toBeDefined();
    expect(Array.isArray(matrix)).toBe(true);
    expect(matrix.length).toBeGreaterThan(0);
    expect(matrix.length).toBe(matrix[0].length); // square matrix
  });

  test('generates valid matrix for long URL', () => {
    const longUrl = 'https://wonder-lobby-chelsea-enters.trycloudflare.com/deep/link?user=astraea&token=abcdef123456';
    const matrix = generateQRCodeMatrix(longUrl);
    expect(matrix).toBeDefined();
    expect(matrix.length).toBeGreaterThanOrEqual(25);
  });

  test('finder patterns are correctly positioned in top-left, top-right, and bottom-left', () => {
    const matrix = generateQRCodeMatrix('test');
    const size = matrix.length;

    // Top-left finder center (3, 3) is true
    expect(matrix[3][3]).toBe(true);
    // Top-right finder center (3, size - 4) is true
    expect(matrix[3][size - 4]).toBe(true);
    // Bottom-left finder center (size - 4, 3) is true
    expect(matrix[size - 4][3]).toBe(true);
  });

  test('generateQRCodeSVG returns data:image/svg+xml string', () => {
    const svgDataUri = generateQRCodeSVG('http://192.168.86.21:3210', {
      color: '#F59E0B',
      bgColor: '#060814',
      size: 240,
    });

    expect(typeof svgDataUri).toBe('string');
    expect(svgDataUri.startsWith('data:image/svg+xml')).toBe(true);
    expect(svgDataUri).toContain('%23F59E0B'); // encoded #F59E0B
    expect(svgDataUri).toContain('%23060814'); // encoded #060814
  });

  test('handles empty and special characters gracefully', () => {
    const matrixSpecial = generateQRCodeMatrix('✨🔮 Astraea Cosmic Studio 🌟');
    expect(matrixSpecial).toBeDefined();
    expect(matrixSpecial.length).toBeGreaterThan(0);
  });
});
