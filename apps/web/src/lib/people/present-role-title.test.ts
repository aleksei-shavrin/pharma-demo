import { describe, expect, it } from 'vitest';
import { presentRoleTitleRu } from './present-role-title';

describe('presentRoleTitleRu', () => {
  it('strips legacy tag leak from UI copy', () => {
    expect(
      presentRoleTitleRu(
        'Ответственный по направлению (legacy tag) «Строительство»',
      ),
    ).toBe('Ответственный по направлению «Строительство»');
  });

  it('keeps normal human titles', () => {
    expect(presentRoleTitleRu('Руководитель проекта (PM)')).toBe(
      'Руководитель проекта (PM)',
    );
  });
});
