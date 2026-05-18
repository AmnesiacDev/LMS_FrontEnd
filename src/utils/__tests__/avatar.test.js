import { describe, it, expect } from 'vitest';
import { detectGender, getAvatarUrl } from '../avatar';

describe('detectGender', () => {
  it('returns female for common Arabic female names', () => {
    expect(detectGender('Noha Nasser')).toBe('female');
    expect(detectGender('Sara Ali')).toBe('female');
    expect(detectGender('Mariam Hassan')).toBe('female');
    expect(detectGender('Fatima Mohamed')).toBe('female');
    expect(detectGender('Yasmin Ibrahim')).toBe('female');
  });

  it('returns female for common English female names', () => {
    expect(detectGender('Emma Smith')).toBe('female');
    expect(detectGender('Olivia Brown')).toBe('female');
    expect(detectGender('Sophia Davis')).toBe('female');
  });

  it('returns male for unrecognised / male names', () => {
    expect(detectGender('Ahmed Youssef')).toBe('male');
    expect(detectGender('Mohamed Hassan')).toBe('male');
    expect(detectGender('John Doe')).toBe('male');
    expect(detectGender('David Smith')).toBe('male');
  });

  it('handles empty / nullish input', () => {
    expect(detectGender()).toBe('male');
    expect(detectGender('')).toBe('male');
    expect(detectGender(null)).toBe('male');
  });

  it('is case-insensitive', () => {
    expect(detectGender('NOHA NASSER')).toBe('female');
    expect(detectGender('sara')).toBe('female');
    expect(detectGender('AHMED')).toBe('male');
  });
});

describe('getAvatarUrl', () => {
  it('returns a notionists DiceBear URL', () => {
    const url = getAvatarUrl('user-123', 'Noha Nasser');
    expect(url).toMatch(/dicebear\.com\/9\.x\/notionists\/svg/);
    expect(url).toContain('seed=user-123');
  });

  it('uses a soft palette for female names', () => {
    const url = getAvatarUrl('id1', 'Sara Ali');
    expect(url).toMatch(/backgroundColor=ffd5dc/);
  });

  it('uses a cool palette for male names', () => {
    const url = getAvatarUrl('id2', 'Ahmed');
    expect(url).toMatch(/backgroundColor=dbeafe/);
  });
});
