# Inventory Management System Setup

This comprehensive inventory request and approval workflow system includes:

## Features

- **User Inventory Request Form**: Users can submit inventory requests with email and quantity selection
- **Admin Dashboard**: Complete admin interface for managing requests and approvals
- **Email Notifications**: Automated email workflow for all stakeholders
- **Invoice Generation**: Admin can generate invoices and send to customers
- **Real-time Status Updates**: Track request status from pending to completed

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the root directory with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Email Service Configuration (for production)
# VITE_EMAIL_SERVICE_API_KEY=your-email-service-api-key
# VITE_EMAIL_SERVICE_URL=https://api.sendgrid.com/v3/mail/send
```

### 2. Supabase Database Setup

Create the following table in your Supabase database:

```sql
-- Create inventory_requests table
CREATE TABLE inventory_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invoice_number TEXT,
  admin_notes TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE inventory_requests ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication needs)
CREATE POLICY "Enable read access for all users" ON inventory_requests FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON inventory_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON inventory_requests FOR UPDATE USING (true);
```

### 3. Email Service Integration

The system includes a mock email service. For production, integrate with:

- **SendGrid**: Popular email delivery service
- **AWS SES**: Amazon's email service
- **Mailgun**: Transactional email service
- **Resend**: Modern email API

Update the `email-service.ts` file to use your preferred email service.

### 4. Routes

- `/inventory-request` - User inventory request form
- `/admin` - Admin dashboard for managing requests

## Usage Workflow

### For Users:
1. Navigate to `/inventory-request`
2. Fill in name and email
3. Select products and quantities
4. Submit request
5. Receive email confirmation
6. Wait for approval/rejection email
7. Receive invoice email (if approved)

### For Admins:
1. Navigate to `/admin`
2. View all pending requests
3. Approve or reject requests
4. Generate invoices for approved requests
5. Track request status and history

## Email Notifications

The system sends the following emails:

1. **Admin Notification**: When a new request is submitted
2. **User Confirmation**: When a request is received
3. **Status Update**: When a request is approved/rejected
4. **Invoice**: When an invoice is generated

## Customization

### Products
Update the `availableProducts` array in `InventoryRequestForm.tsx` to match your inventory.

### Email Templates
Modify the email templates in `email-service.ts` to match your brand.

### Styling
The system uses Tailwind CSS and shadcn/ui components. Customize the styling in the component files.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Production Deployment

1. Set up your Supabase project
2. Configure environment variables
3. Integrate with a real email service
4. Deploy to your preferred hosting platform (Vercel, Netlify, etc.)

## Security Considerations

- Implement proper authentication for admin access
- Use environment variables for sensitive data
- Set up proper CORS policies
- Implement rate limiting for form submissions
- Add CAPTCHA for spam prevention 