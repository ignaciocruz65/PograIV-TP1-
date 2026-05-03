import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { partidaGuard } from './partida-guard';

describe('partidaGuard', () => {
  const executeGuard: CanDeactivateFn<unknown> = (...guardParameters) =>
    TestBed.runInInjectionContext(() => partidaGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
