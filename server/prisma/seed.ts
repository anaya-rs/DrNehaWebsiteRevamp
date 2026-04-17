import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Admin ──────────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('Admin@1234', 10)
  await prisma.admin.upsert({
    where: { email: 'admin@drnehasood.in' },
    update: {},
    create: {
      email: 'admin@drnehasood.in',
      passwordHash: hash,
      name: 'Dr. Neha Sood',
      firstLogin: true,
    },
  })
  console.log('✓ Admin seeded')

  // ─── Page Sections ───────────────────────────────────────────────────────────
  const sections = [
    {
      section: 'hero',
      content: {
        eyebrow: 'Centre of Excellence',
        line1: 'Expert',
        line2: 'ENT Care',
        line3: '& Cochlear Implantation',
        subheading: '20+ years of healing ears, noses and throats. Director of ENT & Cochlear Implant at BLK-MAX Super Speciality Hospital, Delhi.',
        ctaLabel: 'Book Appointment',
        ctaUrl: '#contact',
        heroImage: 'https://www.drnehasood.in/images/Banner_1.png',
        stats: [
          { num: '20+', label: 'Years Experience' },
          { num: '5000+', label: 'Cochlear Implants' },
          { num: '2', label: 'Clinic Locations' },
        ],
      },
    },
    {
      section: 'about',
      content: {
        name: 'Dr. Neha Sood',
        body: '<p>An accomplished ENT surgeon with over two decades of experience treating all ear, nose, and throat related ailments. Currently serving as Director — ENT &amp; Cochlear Implant at BLK-MAX Super Speciality Hospital, Delhi, Dr. Sood is deeply empathetic toward her patients and guides them through every step of their treatment.</p>',
        credentials: [
          'MBBS, MS (ENT) — Lady Hardinge Medical College, Delhi',
          'Served as ENT Surgeon at Rashtrapati Bhawan and Consultant at Sri Ganga Ram Hospital, Primus Hospital & Sita Ram Bhartia Hospital',
          'Fellowship trained at University of Freiburg, Germany and UPMC, USA for endoscopic skull base surgeries',
          'Co-authored research papers on sleep apnoea, breathing problems in children, and other ENT conditions',
        ],
        profilePhoto: 'https://www.drnehasood.in/images/nehasood.png',
        ctaLabel: 'Full Profile',
        ctaUrl: '/about',
      },
    },
    {
      section: 'services',
      content: {
        items: [
          { icon: '🎙️', name: 'Voice Treatment', desc: 'Advanced care for vocal cord disorders and voice rehabilitation.' },
          { icon: '🔬', name: 'Endoscopy Sinus & Skull Base', desc: 'Minimally invasive procedures for chronic sinusitis and skull base conditions.' },
          { icon: '😴', name: 'Snoring & Sleep Apnea', desc: 'Effective treatments to improve breathing and sleep quality.' },
          { icon: '👂', name: 'Cochlear Implants', desc: 'Restoring hearing for severe to profound hearing loss with advanced implant technology.' },
          { icon: '⚡', name: 'Laser Surgery', desc: 'Precision laser treatments for various ENT conditions with minimal discomfort.' },
          { icon: '🔆', name: 'CO₂ Laser Surgery', desc: 'Precise CO₂ laser for vocal cord, tonsil, and nasal conditions.' },
          { icon: '👃', name: 'Septoplasty', desc: 'Corrective surgery for deviated nasal septum to improve airflow.' },
          { icon: '🏥', name: 'Tonsillectomy', desc: 'Safe removal of tonsils for chronic infections or obstruction.' },
          { icon: '🔭', name: 'Ear Microsurgery', desc: 'Microscopic repair of the eardrum and middle ear structures.' },
          { icon: '👶', name: 'Paediatric ENT', desc: 'Gentle, specialized ENT care for children of all ages.' },
        ],
      },
    },
    {
      section: 'conditions',
      content: {
        items: [
          'Voice Disorders', 'Sinusitis', 'Nasal Bleeding', 'Deafness',
          'Ear Discharge', 'Nasal Polyposis', 'Sleep Apnea & Snoring', 'Tinnitus',
          'Tonsils', 'Vertigo', 'Swollen Lymph Nodes', 'Cochlear Implants',
          'Ear Infections', 'Hoarseness', 'Nasal Obstruction', 'Skull Base Tumors',
          'Thyroid Disorders', 'Head & Neck Cancers',
        ],
      },
    },
    {
      section: 'stats',
      content: {
        items: [
          { num: '20+', label: 'Years Experience' },
          { num: '5000+', label: 'Cochlear Implants' },
          { num: '98%', label: 'Patient Satisfaction' },
          { num: '2', label: 'Clinic Locations' },
        ],
      },
    },
    {
      section: 'faqs',
      content: {
        items: [
          {
            q: 'Why does my child get frequent ear infections?',
            a: "Children under three average one to two ear infections per year. Their Eustachian tubes are short and still developing, making them prone to swelling and blockages that trap fluid in the middle ear.",
          },
          {
            q: 'What is the treatment for an ear infection?',
            a: 'Most ear infections resolve in about a week. Pain can be managed with over-the-counter medications, eardrops, and warm compresses. Bacterial infections may require antibiotics. Children with chronic infections may benefit from ear tubes.',
          },
          {
            q: 'I experience frequent sinus infections — is this normal?',
            a: 'Sinusitis is very common. It occurs when sinus lining becomes inflamed and swollen, causing nasal obstruction, pain or pressure, and discharge. If medical treatment is ineffective, surgery may be an option.',
          },
          {
            q: 'What causes hoarseness, and should I be concerned?',
            a: 'Hoarseness is usually caused by upper respiratory infections, GERD, or postnasal drip. If it persists longer than four to six weeks, see a doctor to rule out nodules, tumors, or vocal cord paralysis.',
          },
          {
            q: 'My snoring is keeping my partner awake. What can I do?',
            a: 'Lifestyle changes like weight loss, sleeping on your side, and avoiding alcohol before bed often help. Snoring is frequently associated with obstructive sleep apnea, which warrants a proper evaluation.',
          },
        ],
      },
    },
    {
      section: 'testimonials',
      content: {
        items: [
          { name: 'Parent of 5-year-old', location: 'Delhi', videoUrl: '/media/videos/Testimonial1.mp4', desc: "Dr. Sood's expertise in cochlear implants transformed my child's life." },
          { name: 'Business Executive', location: 'Gurugram', videoUrl: '/media/videos/Testimonial2.mp4', desc: 'Advanced treatment gave permanent relief from sinus issues.' },
          { name: 'Classical Singer', location: 'Mumbai', videoUrl: '/media/videos/Testimonial3.mp4', desc: 'Voice treatment restored my singing ability completely.' },
        ],
      },
    },
  ]

  for (const s of sections) {
    await prisma.pageSection.upsert({
      where: { section: s.section },
      update: { content: s.content },
      create: s,
    })
  }
  console.log('✓ Page sections seeded')

  // ─── Site Settings ───────────────────────────────────────────────────────────
  const settings = [
    {
      section: 'contact',
      data: {
        primaryPhone: '9205407127',
        secondaryPhone: '',
        primaryEmail: 'prohealthspecialists114@gmail.com',
        enquiryEmail: 'prohealthspecialists114@gmail.com',
        whatsapp: '919205407127',
      },
    },
    {
      section: 'clinics',
      data: {
        items: [
          {
            id: 'clinic-1',
            name: 'Pro Health Specialists',
            address: 'First Floor, M3M Urbana, R4/114, Ramgarh, Sector 67, Gurugram, Haryana 122002',
            mapsUrl: 'https://maps.google.com/?q=M3M+Urbana+Sector+67+Gurugram',
            timings: {
              mon: { open: true, start: '10:30', end: '14:30', evening: '17:00-19:00' },
              tue: { open: true, start: '10:30', end: '14:30', evening: '17:00-19:00' },
              wed: { open: true, start: '10:30', end: '14:30', evening: '17:00-19:00' },
              thu: { open: true, start: '10:30', end: '14:30', evening: '17:00-19:00' },
              fri: { open: true, start: '10:30', end: '14:30', evening: '17:00-19:00' },
              sat: { open: true, start: '10:30', end: '14:30', evening: '17:00-19:00' },
              sun: { open: false, start: '', end: '' },
            },
          },
          {
            id: 'clinic-2',
            name: 'BLK-Max Super Speciality Hospital',
            address: 'Pusa Road, Rajendra Place, New Delhi – 110005',
            mapsUrl: 'https://maps.google.com/?q=BLK+Max+Hospital+Pusa+Road+New+Delhi',
            timings: {
              mon: { open: false, start: '', end: '' },
              tue: { open: true, start: '10:00', end: '15:00', note: 'By appointment' },
              wed: { open: true, start: '10:00', end: '15:00' },
              thu: { open: true, start: '10:00', end: '15:00' },
              fri: { open: true, start: '10:00', end: '15:00', note: 'By appointment' },
              sat: { open: true, start: '10:00', end: '15:00' },
              sun: { open: false, start: '', end: '' },
            },
          },
        ],
      },
    },
    {
      section: 'social',
      data: {
        youtube: { url: 'https://www.youtube.com/channel/UCAh6S5zjb6HRcltZJyAJGBg', show: true },
        linkedin: { url: 'https://www.linkedin.com/in/dr-neha-sood-436b9b10/', show: true },
        instagram: { url: 'https://www.instagram.com/drneha.sood/', show: true },
        facebook: { url: 'https://www.facebook.com/Hearingandvoice', show: true },
        whatsapp: { url: 'https://wa.me/919205407127', show: true },
      },
    },
    {
      section: 'emergency',
      data: {
        enabled: false,
        phone: '9205407127',
        message: 'For after-hours emergencies, please call or WhatsApp us.',
        startTime: '20:00',
        endTime: '08:00',
      },
    },
    {
      section: 'email',
      data: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER || '',
        pass: '',
        fromName: process.env.SMTP_FROM_NAME || 'Dr. Neha Sood Clinic',
        enabled: false,
      },
    },
    {
      section: 'sms',
      data: {
        accountSid: '',
        authToken: '',
        fromNumber: '',
        enabled: false,
      },
    },
  ]

  for (const s of settings) {
    await prisma.siteSettings.upsert({
      where: { section: s.section },
      update: { data: s.data },
      create: s,
    })
  }
  console.log('✓ Site settings seeded')

  // ─── Email Templates ─────────────────────────────────────────────────────────
  const templates = [
    {
      type: 'confirmation',
      subject: 'Your appointment with Dr. Neha Sood is confirmed',
      body: `Dear {{patient_name}},\n\nYour appointment at {{clinic_name}} on {{appointment_time}} has been confirmed.\n\nFor any queries, please call 9205407127.\n\nBest regards,\nDr. Neha Sood Clinic`,
      enabled: true,
    },
    {
      type: 'cancellation',
      subject: 'Your appointment has been cancelled',
      body: `Dear {{patient_name}},\n\nWe're sorry, your appointment at {{clinic_name}} has been cancelled.\n\nPlease call 9205407127 to reschedule.\n\nBest regards,\nDr. Neha Sood Clinic`,
      enabled: true,
    },
    {
      type: 'reminder',
      subject: 'Appointment reminder — Dr. Neha Sood',
      body: `Dear {{patient_name}},\n\nThis is a reminder for your appointment at {{clinic_name}} on {{appointment_time}}.\n\nPlease arrive 10 minutes early.\n\nBest regards,\nDr. Neha Sood Clinic`,
      enabled: false,
    },
  ]

  for (const t of templates) {
    await prisma.emailTemplate.upsert({
      where: { type: t.type },
      update: { subject: t.subject, body: t.body },
      create: t,
    })
  }
  console.log('✓ Email templates seeded')

  // ─── Gallery Settings ─────────────────────────────────────────────────────────
  const existingGallery = await prisma.gallerySettings.findFirst()
  if (!existingGallery) {
    await prisma.gallerySettings.create({
      data: { layout: 'grid', columns: 3, showCaptions: true, showCategories: true, featuredOrder: [] },
    })
  }
  console.log('✓ Gallery settings seeded')

  // ─── Availability Blocks ─────────────────────────────────────────────────────
  await prisma.availabilityBlock.deleteMany({})
  const days = [1, 2, 3, 4, 5, 6] // Mon–Sat
  for (const day of days) {
    await prisma.availabilityBlock.create({
      data: { dayOfWeek: day, startTime: '10:00', endTime: '14:00', isRecurring: true, label: 'Morning OPD' },
    })
    await prisma.availabilityBlock.create({
      data: { dayOfWeek: day, startTime: '17:00', endTime: '19:00', isRecurring: true, label: 'Evening OPD' },
    })
  }
  console.log('✓ Availability blocks seeded')

  // ─── Sample Appointments ──────────────────────────────────────────────────────
  const existingAppts = await prisma.appointment.count()
  if (existingAppts === 0) {
    await prisma.appointment.createMany({
      data: [
        {
          patientName: 'Rahul Sharma',
          phone: '9876543210',
          gender: 'Male',
          clinicLocation: 'Pro Health Specialists, Gurugram',
          preferredTime: '10:00 AM – 11:00 AM',
          status: 'pending',
        },
        {
          patientName: 'Priya Mehra',
          phone: '9123456780',
          gender: 'Female',
          clinicLocation: 'BLK-Max Hospital, Delhi',
          preferredTime: '11:00 AM – 12:00 PM',
          status: 'confirmed',
        },
        {
          patientName: 'Arun Verma',
          phone: '9988776655',
          gender: 'Male',
          clinicLocation: 'Pro Health Specialists, Gurugram',
          preferredTime: '5:00 PM – 6:00 PM',
          status: 'cancelled',
        },
      ],
    })
  }
  console.log('✓ Sample appointments seeded')

  console.log('\n✅ Seeding complete!')
  console.log('  Admin login: admin@drnehasood.in / Admin@1234')
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
