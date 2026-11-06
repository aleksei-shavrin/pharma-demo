import { NotFoundException } from '@nestjs/common';
import { MockDemoDataSource } from '../data/mock-demo-data-source';
import { NOT_FOUND_IN_SNAPSHOT } from '../data/fixtures/analyst-portfolio';
import { PortfolioService } from './portfolio.service';

describe('PortfolioService', () => {
  const service = new PortfolioService(new MockDemoDataSource());

  it('на C PRG-CON красная, PRG-DSN жёлтая и без вех', () => {
    const construction = service.getProgram('PRJ-01', 'PRG-CON', 'C');
    const design = service.getProgram('PRJ-01', 'PRG-DSN', 'C');
    expect(construction.status).toBe('Red');
    expect(construction.milestones.map((ms) => ms.id)).toEqual([
      'MS-BLD-EXC',
      'MS-BLD-ENCL',
      'MS-CLN-RDY',
      'MS-CLN-PANEL',
    ]);
    expect(design.status).toBe('Yellow');
    expect(design.milestones).toEqual([]);
    expect(design.projects.every((row) => row.status === 'Yellow')).toBe(true);
  });

  it('на C панель и энергоснабжение видны и в портфеле, и в программе', () => {
    const overviewIds = new Set(
      service
        .getProgram('PRJ-01', 'PRG-CON', 'C')
        .milestones.map((ms) => ms.id),
    );
    expect(overviewIds.has('MS-CLN-PANEL')).toBe(true);
    const power = service
      .getProgram('PRJ-01', 'PRG-ENG', 'C')
      .milestones.find((ms) => ms.id === 'MS-UTL-PWR');
    expect(power?.rag).toBe('Red');
  });

  it('на D карточка AN-08 отделяет поставку от монтажа', () => {
    const card = service.getProject('PRJ-01', 'AN-08', 'D');
    expect(card.ownerLabel).toContain('Лебедева');
    expect(card.installationLag).toContain('Отставание монтажа');
    expect(card.deliveryNote).toContain('не причина');
    expect(card.equipment.map((item) => item.id)).toEqual(['EQ-CLN-01']);
    expect(card.issues.map((issue) => issue.id)).toContain('ISS-CLN-01');
    expect(card.milestones.map((ms) => ms.id)).toEqual(
      expect.arrayContaining(['MS-CLN-PANEL', 'MS-CLN-RDY']),
    );
  });

  it('PRG-DIG на фильтре прячет зелёный AN-15 и возвращает его без фильтра', () => {
    const program = service.getProgram('PRJ-01', 'PRG-DIG', 'C');
    const attention = program.projects.filter((row) => row.status !== 'Green');
    expect(attention.map((row) => row.id)).toEqual(['AN-16', 'AN-17', 'AN-18']);
    expect(program.projects.map((row) => row.id)).toContain('AN-15');
  });

  it('неизвестный ID — не найден', () => {
    expect(() => service.getProgram('PRJ-01', 'PRG-NOPE', 'C')).toThrow(
      NotFoundException,
    );
    try {
      service.getProject('PRJ-01', 'AN-99', 'C');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect((error as NotFoundException).message).toBe(NOT_FOUND_IN_SNAPSHOT);
    }
  });
});
