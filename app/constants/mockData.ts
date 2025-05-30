import { Review } from '../types/review';

export const mockReviews: Review[] = [
  {
    id: '1',
    userId: 'user123',
    userName: 'Alex Johnson',
    rating: 5,
    comment: 'This app has completely transformed how I stay in touch with my network. The reminders are helpful without being intrusive. Highly recommend!',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    avatarUrl: null,
  },
  {
    id: '2',
    userId: 'user456',
    userName: 'Sarah Miller',
    rating: 4,
    comment: 'Very intuitive interface and the AI suggestions are surprisingly helpful. Would love to see more customization options in the future.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    avatarUrl: 'https://randomuser.me/api/portraits/women/42.jpg',
  },
  {
    id: '3',
    userId: 'user789',
    userName: 'David Chen',
    rating: 5,
    comment: 'The premium features are well worth the price. I\'ve reconnected with so many important contacts thanks to this app.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days ago
    avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
  },
  {
    id: '4',
    userId: 'user101',
    userName: 'Maya Patel',
    rating: 3,
    comment: 'Good concept but needs some polish. The notifications sometimes fail to trigger on my device.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(), // 21 days ago
    avatarUrl: null,
  },
  {
    id: '5',
    userId: 'user202',
    userName: 'James Wilson',
    rating: 5,
    comment: 'Been using this for 3 months now and it\'s helped me maintain professional relationships I would have otherwise neglected. Great job!',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
    avatarUrl: 'https://randomuser.me/api/portraits/men/67.jpg',
  },
]; 