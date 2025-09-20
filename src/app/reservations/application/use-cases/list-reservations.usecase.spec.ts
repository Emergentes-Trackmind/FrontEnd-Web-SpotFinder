import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ListReservationsUseCase } from './list-reservations.usecase';
import { ReservationsRepo } from '../../infrastructure/repositories/reservations.repo';
import { Reservation } from '../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../domain/enums/reservation-status.enum';

describe('ListReservationsUseCase', () => {
  let useCase: ListReservationsUseCase;
  let mockRepo: jasmine.SpyObj<ReservationsRepo>;

  const mockReservations: Reservation[] = [
    {
      id: '1000',
      userId: '1',
      userName: 'Usuario Test',
      userEmail: 'test@example.com',
      vehiclePlate: 'ABC123',
      parkingId: '1',
      parkingName: 'Parking Test',
      parkingSpotId: 'spot-a1',
      space: 'A-1',
      startTime: '2025-09-10T14:30:00.000Z',
      endTime: '2025-09-10T16:30:00.000Z',
      totalPrice: 15.00,
      currency: 'USD',
      status: ReservationStatus.PENDING,
      createdAt: '2025-09-01T10:00:00.000Z',
      updatedAt: '2025-09-01T10:00:00.000Z'
    }
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ReservationsRepo', ['list']);

    TestBed.configureTestingModule({
      providers: [
        ListReservationsUseCase,
        { provide: ReservationsRepo, useValue: spy }
      ]
    });

    useCase = TestBed.inject(ListReservationsUseCase);
    mockRepo = TestBed.inject(ReservationsRepo) as jasmine.SpyObj<ReservationsRepo>;
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should list reservations successfully', (done) => {
    const mockResponse = { data: mockReservations, total: 1 };
    mockRepo.list.and.returnValue(of(mockResponse));

    const filters = { _page: 1, _limit: 10 };

    useCase.execute(filters).subscribe({
      next: (result) => {
        expect(result).toEqual(mockResponse);
        expect(result.data.length).toBe(1);
        expect(result.total).toBe(1);
        expect(result.data[0].id).toBe('1000');
        expect(mockRepo.list).toHaveBeenCalledWith(filters);
        done();
      },
      error: done.fail
    });
  });

  it('should handle empty results', (done) => {
    const mockResponse = { data: [], total: 0 };
    mockRepo.list.and.returnValue(of(mockResponse));

    const filters = { status: [ReservationStatus.COMPLETED] };

    useCase.execute(filters).subscribe({
      next: (result) => {
        expect(result.data).toEqual([]);
        expect(result.total).toBe(0);
        done();
      },
      error: done.fail
    });
  });

  it('should pass correct filters to repository', (done) => {
    const mockResponse = { data: [], total: 0 };
    mockRepo.list.and.returnValue(of(mockResponse));

    const complexFilters = {
      q: 'test',
      status: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
      parkingId: '1',
      startTime_gte: '2025-09-01T00:00:00.000Z',
      startTime_lte: '2025-09-30T23:59:59.000Z',
      _page: 2,
      _limit: 20,
      _sort: 'createdAt',
      _order: 'desc' as const
    };

    useCase.execute(complexFilters).subscribe({
      next: () => {
        expect(mockRepo.list).toHaveBeenCalledWith(complexFilters);
        done();
      },
      error: done.fail
    });
  });
});
