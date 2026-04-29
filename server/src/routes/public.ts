import { Router } from 'express'
import {
  getPageSection,
  getPosts,
  getPost,
  getMedia,
  getMediaCategories,
  getGallerySettings,
  getContact,
  getClinics,
  getSocial,
  getEmergency,
  getAvailability,
  getFaqs,
} from '../controllers/public'

const router = Router()

// Page sections
router.get('/pages/:section', getPageSection)

// Blog posts
router.get('/posts', getPosts)
router.get('/posts/:slug', getPost)

// Media / gallery
router.get('/media', getMedia)
router.get('/media/categories', getMediaCategories)
router.get('/gallery/settings', getGallerySettings)

// Site settings
router.get('/settings/contact', getContact)
router.get('/settings/clinics', getClinics)
router.get('/settings/social', getSocial)
router.get('/settings/emergency', getEmergency)
router.get('/settings/faqs', getFaqs)

// Availability
router.get('/availability', getAvailability)

export default router
