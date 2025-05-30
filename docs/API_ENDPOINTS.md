# CircohBack API Endpoints

This document outlines all API endpoints used in the CircohBack application across different environments.

## Environment-Specific API URLs

| Environment | API Base URL                    | Supabase URL                             |
|-------------|--------------------------------|------------------------------------------|
| Development | http://localhost:8080          | https://zrfjkrinmhxuxhwapqch.supabase.co |
| Staging     | https://api-staging.circohback.com | https://staging-instance.supabase.co     |
| Production  | https://api.circohback.com     | https://production-instance.supabase.co  |

## Core API Endpoints

| Endpoint                 | Method | Description                             | Authentication Required |
|--------------------------|--------|-----------------------------------------|------------------------|
| `/auth/login`            | POST   | User login                              | No                     |
| `/auth/register`         | POST   | User registration                       | No                     |
| `/auth/refresh-token`    | POST   | Refresh authentication token            | Yes                    |
| `/auth/password-reset`   | POST   | Request password reset                  | No                     |
| `/performance`           | POST   | Send performance monitoring data        | No                     |

## User Services

| Endpoint                 | Method | Description                             | Authentication Required |
|--------------------------|--------|-----------------------------------------|------------------------|
| `/users/profile`         | GET    | Get current user profile                | Yes                    |
| `/users/profile`         | PUT    | Update user profile                     | Yes                    |
| `/users/subscription`    | GET    | Get user subscription information       | Yes                    |
| `/users/subscription`    | POST   | Create/update subscription              | Yes                    |

## Contact Services

| Endpoint                    | Method | Description                             | Authentication Required |
|-----------------------------|--------|-----------------------------------------|------------------------|
| `/contacts`                 | GET    | List all contacts                       | Yes                    |
| `/contacts`                 | POST   | Create a new contact                    | Yes                    |
| `/contacts/:id`             | GET    | Get a specific contact                  | Yes                    |
| `/contacts/:id`             | PUT    | Update a contact                        | Yes                    |
| `/contacts/:id`             | DELETE | Delete a contact                        | Yes                    |
| `/contacts/:id/reminders`   | GET    | Get reminders for a contact             | Yes                    |
| `/contacts/import`          | POST   | Import contacts                         | Yes                    |
| `/contacts/export`          | GET    | Export contacts                         | Yes                    |

## Reminder Services

| Endpoint                    | Method | Description                             | Authentication Required |
|-----------------------------|--------|-----------------------------------------|------------------------|
| `/reminders`                | GET    | List all reminders                      | Yes                    |
| `/reminders`                | POST   | Create a new reminder                   | Yes                    |
| `/reminders/upcoming`       | GET    | Get upcoming reminders                  | Yes                    |
| `/reminders/:id`            | GET    | Get a specific reminder                 | Yes                    |
| `/reminders/:id`            | PUT    | Update a reminder                       | Yes                    |
| `/reminders/:id`            | DELETE | Delete a reminder                       | Yes                    |
| `/reminders/:id/complete`   | POST   | Mark a reminder as completed            | Yes                    |

## Travel Services

| Endpoint                    | Method | Description                             | Authentication Required |
|-----------------------------|--------|-----------------------------------------|------------------------|
| `/travel/plans`             | GET    | List all travel plans                   | Yes                    |
| `/travel/plans`             | POST   | Create a new travel plan                | Yes                    |
| `/travel/plans/:id`         | GET    | Get a specific travel plan              | Yes                    |
| `/travel/plans/:id`         | PUT    | Update a travel plan                    | Yes                    |
| `/travel/plans/:id`         | DELETE | Delete a travel plan                    | Yes                    |
| `/travel/contact-links`     | GET    | Get contact travel links                | Yes                    |
| `/travel/nearby-contacts`   | GET    | Get contacts near a location            | Yes                    |

## Score/Rating Services

| Endpoint                    | Method | Description                             | Authentication Required |
|-----------------------------|--------|-----------------------------------------|------------------------|
| `/scores/ratings`           | GET    | Get received quality ratings            | Yes                    |
| `/scores/ratings/:id`       | GET    | Get a specific rating                   | Yes                    |
| `/scores/submit-rating`     | POST   | Submit a rating for a connection        | Yes                    |

## Supabase Tables

While not traditional REST endpoints, these are the Supabase tables accessed directly:

| Table Name      | Operations     | Description                           |
|-----------------|----------------|---------------------------------------|
| `profiles`      | GET, POST, PUT | User profile information              |
| `contacts`      | CRUD          | Contact information                    |
| `reminders`     | CRUD          | Reminder records                       |
| `travel_plans`  | CRUD          | Travel planning information            |
| `ratings`       | CRUD          | Quality ratings between connections    |

## Error Handling

All endpoints should handle these error conditions:

- 401 - Unauthorized (missing or invalid authentication)
- 403 - Forbidden (insufficient permissions)
- 404 - Not Found (resource doesn't exist)
- 422 - Validation Error (invalid request data)
- 429 - Rate Limit Exceeded
- 500 - Server Error

## Authentication

API requests requiring authentication should include:

```
Authorization: Bearer <jwt_token>
```

## Migration Considerations

When moving from local development to staging/production:

1. Update all API URLs in environment configurations
2. Ensure proper SSL/TLS is enforced for all endpoints
3. Implement proper CORS headers for allowed origins
4. Set appropriate rate limiting based on environment
5. Enable all monitoring and logging for non-development environments 