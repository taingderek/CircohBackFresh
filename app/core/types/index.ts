// Export all types from contact.ts
export * from './contact';

// Export all types from user.ts
export * from './user';

// Re-export common database types
export { 
  Contact,
  ContactInput,
  ContactUpdate,
  Reminder,
  ReminderInput,
  ReminderUpdate,
  TravelPlan,
  TravelPlanInput,
  TravelPlanUpdate,
  TravelContactLink,
  TravelContactLinkInput
} from '../../types/database'; 