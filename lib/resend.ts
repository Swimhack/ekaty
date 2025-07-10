import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

// Email templates
export const emailTemplates = {
  welcome: {
    subject: 'Welcome to eKaty.com!',
    template: (data: { name: string }) => `
      <h1>Welcome to eKaty.com, ${data.name}!</h1>
      <p>Thank you for joining the Katy restaurant community. You can now:</p>
      <ul>
        <li>Leave reviews for your favorite restaurants</li>
        <li>Save restaurants to your favorites</li>
        <li>Get personalized restaurant recommendations</li>
        <li>Stay updated with new restaurant openings</li>
      </ul>
      <p>Start exploring the best restaurants in Katy!</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background-color: #eb7425; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Explore Restaurants</a>
    `
  },
  
  contact: {
    subject: 'New Contact Form Submission - eKaty.com',
    template: (data: { name: string; email: string; subject: string; message: string }) => `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message}</p>
      <hr>
      <p><em>Sent from eKaty.com contact form</em></p>
    `
  },
  
  reviewNotification: {
    subject: 'New Review for Your Restaurant',
    template: (data: { restaurantName: string; reviewerName: string; rating: number; review: string }) => `
      <h2>New Review for ${data.restaurantName}</h2>
      <p><strong>Reviewer:</strong> ${data.reviewerName}</p>
      <p><strong>Rating:</strong> ${data.rating}/5 stars</p>
      <p><strong>Review:</strong></p>
      <p>${data.review}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/reviews">Manage Reviews</a></p>
    `
  },
  
  newsletter: {
    subject: 'Newsletter Subscription Confirmed',
    template: (data: { email: string }) => `
      <h1>Newsletter Subscription Confirmed!</h1>
      <p>Thank you for subscribing to the eKaty.com newsletter with ${data.email}.</p>
      <p>You'll receive updates about:</p>
      <ul>
        <li>New restaurant openings in Katy</li>
        <li>Special offers and promotions</li>
        <li>Featured restaurants and hidden gems</li>
        <li>Community events and food festivals</li>
      </ul>
      <p>You can unsubscribe at any time by clicking the unsubscribe link in any email.</p>
    `
  },
  
  restaurantApproval: {
    subject: 'Your Restaurant Has Been Approved!',
    template: (data: { restaurantName: string; slug: string }) => `
      <h1>Congratulations! ${data.restaurantName} is now live on eKaty.com</h1>
      <p>Your restaurant listing has been approved and is now visible to thousands of Katy food lovers.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/restaurant/${data.slug}">View Your Listing</a></p>
      <p>To maximize your visibility:</p>
      <ul>
        <li>Add high-quality photos of your food and restaurant</li>
        <li>Keep your menu and hours updated</li>
        <li>Respond to customer reviews</li>
        <li>Consider featuring your restaurant for increased visibility</li>
      </ul>
      <p>Welcome to the eKaty.com community!</p>
    `
  }
}

// Utility functions for sending emails
export const sendEmail = async (
  to: string | string[],
  subject: string,
  html: string,
  from: string = 'eKaty.com <noreply@ekaty.com>'
) => {
  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })
    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

export const sendWelcomeEmail = async (to: string, name: string) => {
  return sendEmail(
    to,
    emailTemplates.welcome.subject,
    emailTemplates.welcome.template({ name })
  )
}

export const sendContactEmail = async (contactData: {
  name: string
  email: string
  subject: string
  message: string
}) => {
  return sendEmail(
    'admin@ekaty.com', // Replace with actual admin email
    emailTemplates.contact.subject,
    emailTemplates.contact.template(contactData)
  )
}

export const sendReviewNotification = async (
  restaurantOwnerEmail: string,
  reviewData: {
    restaurantName: string
    reviewerName: string
    rating: number
    review: string
  }
) => {
  return sendEmail(
    restaurantOwnerEmail,
    emailTemplates.reviewNotification.subject,
    emailTemplates.reviewNotification.template(reviewData)
  )
}

export const sendNewsletterConfirmation = async (email: string) => {
  return sendEmail(
    email,
    emailTemplates.newsletter.subject,
    emailTemplates.newsletter.template({ email })
  )
}

export const sendRestaurantApprovalEmail = async (
  restaurantOwnerEmail: string,
  restaurantData: {
    restaurantName: string
    slug: string
  }
) => {
  return sendEmail(
    restaurantOwnerEmail,
    emailTemplates.restaurantApproval.subject,
    emailTemplates.restaurantApproval.template(restaurantData)
  )
}