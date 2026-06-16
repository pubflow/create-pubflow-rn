import { User } from '@/lib/schemas/user';

export const mockUsers: User[] = [
  {
    id: 'demo-user-1',
    name: 'Camila',
    last_name: 'Reyes',
    email: 'camila.reyes@example.com',
    user_type: 'admin',
    picture: undefined,
    user_name: 'camila.reyes',
    created_at: '2026-01-15T14:30:00.000Z',
    updated_at: '2026-06-10T18:20:00.000Z',
  },
  {
    id: 'demo-user-2',
    name: 'Luis',
    last_name: 'Mendez',
    email: 'luis.mendez@example.com',
    user_type: 'user',
    picture: undefined,
    user_name: 'luis.mendez',
    created_at: '2026-02-04T11:10:00.000Z',
    updated_at: '2026-06-11T16:45:00.000Z',
  },
  {
    id: 'demo-user-3',
    name: 'Sofia',
    last_name: 'Castillo',
    email: 'sofia.castillo@example.com',
    user_type: 'user',
    picture: undefined,
    user_name: 'sofia.castillo',
    created_at: '2026-03-22T09:05:00.000Z',
    updated_at: '2026-06-12T13:00:00.000Z',
  },
];
