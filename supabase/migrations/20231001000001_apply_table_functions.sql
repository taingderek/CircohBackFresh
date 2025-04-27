-- Apply the functions that create our tables and extensions
SELECT public.enable_postgis();
SELECT public.create_contacts_table();
SELECT public.create_reminders_table();
SELECT public.create_travel_plans_table();
SELECT public.setup_reminder_triggers(); 