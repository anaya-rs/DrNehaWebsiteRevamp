import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SPECIALITIES = [
  {
    slug: "voice-disorder",
    name: "Voice Disorders",
    tagline: "Comprehensive diagnosis and treatment for voice disorders affecting speech, singing, and overall vocal health.",
    overview: "People develop voice problems for many reasons. Doctors who specialise in ear, nose and throat disorders and speech pathology are involved in diagnosing and treating voice disorders. Treatment depends on what's causing your voice disorder, but may include voice therapy, medication, injections or surgery.",
    sections: [
      { title: "Common Voice Disorders", items: ["Vocal cord paralysis", "Spasmodic dysphonia", "Vocal cord nodules and polyps", "Vocal cord cysts", "Laryngitis (acute and chronic)", "Muscle tension dysphonia", "Reinke's edema", "Vocal cord scarring"] },
      { title: "Causes & Risk Factors", items: ["Vocal strain and overuse", "Gastroesophageal reflux (GERD)", "Smoking and alcohol use", "Viral infections", "Neurological conditions", "Thyroid problems", "Professional voice users (singers, teachers, actors)", "Dehydration"] },
      { title: "Symptoms", items: ["Hoarseness or rough voice quality", "Voice fatigue or loss of voice", "Throat pain or discomfort", "Difficulty speaking loudly", "Vocal breaks or cracking", "Reduced vocal range", "Neck or throat tension"] },
      { title: "Treatment Options", cards: [
        { name: "Voice Therapy", desc: "Exercises and techniques to improve voice production and reduce strain." },
        { name: "Medication", desc: "Anti-reflux medications, steroids, and other pharmaceutical treatments." },
        { name: "Injection Therapy", desc: "Vocal cord injections for medialization and voice enhancement." },
        { name: "Phonosurgery", desc: "Microlaryngoscopy and laser surgery for structural vocal cord conditions." },
      ]},
      { title: "When to Seek Medical Help", items: ["Voice changes lasting more than 2 weeks", "Difficulty swallowing or breathing", "Severe throat pain", "Voice problems after surgery or injury", "Voice issues affecting work or daily life"] },
    ],
  },
  {
    slug: "sinusitis",
    name: "Sinusitis",
    tagline: "Comprehensive diagnosis and treatment for acute and chronic sinusitis using advanced medical and surgical approaches.",
    overview: "Sinusitis is an inflammation or swelling of tissue lining of sinuses. Healthy sinuses are filled with air, but when they become blocked and filled with fluid, germs can grow and cause an infection. Chronic sinusitis lasts 12 weeks or longer despite treatment attempts and can significantly impact quality of life.",
    sections: [
      { title: "Common Symptoms", items: ["Nasal inflammation and congestion", "Thick, discoloured discharge from nose", "Postnasal drainage down the back of the throat", "Pain and swelling around the eyes, cheeks, nose or forehead", "Reduced sense of smell and taste", "Ear pain, headache, fatigue", "Bad breath"] },
      { title: "Causes", items: ["Nasal polyps blocking nasal passages", "Deviated nasal septum restricting sinus passages", "Respiratory tract infections inflaming the sinus lining", "Allergies such as hay fever", "Other conditions including cystic fibrosis and immune disorders"] },
      { title: "Risk Factors", items: ["Nasal polyps or asthma", "Aspirin sensitivity", "Immune system disorders", "Hay fever or other allergies", "Regular exposure to pollutants", "Dental infection"] },
      { title: "Treatment Options", cards: [
        { name: "Medications", desc: "Nasal corticosteroids, saline irrigation, oral or injected corticosteroids." },
        { name: "Antibiotics", desc: "Targeted antibiotic therapy for confirmed bacterial sinus infections." },
        { name: "Immunotherapy", desc: "Allergy management to reduce inflammation contributing to sinusitis." },
        { name: "Endoscopic Sinus Surgery", desc: "Minimally invasive surgery to remove polyps or open blocked passages." },
        { name: "Balloon Sinuplasty", desc: "Minimally invasive procedure to dilate and open sinus passages." },
      ]},
      { title: "When to See a Doctor Urgently", items: ["Fever with swelling or redness around the eyes", "Severe headache or forehead swelling", "Confusion or double vision", "Stiff neck", "Sinusitis that doesn't respond to treatment after 10 days"] },
    ],
  },
  {
    slug: "nasal-bleeding",
    name: "Nasal Bleeding",
    tagline: "Expert diagnosis and treatment for nasal bleeding (epistaxis) using advanced medical and surgical techniques.",
    overview: "Nasal bleeding, also known as epistaxis, is a common condition that can range from a minor nuisance to a situation requiring medical attention. The nose contains many blood vessels close to the surface, making it vulnerable to bleeding. Understanding the causes and proper management is essential for effective treatment.",
    sections: [
      { title: "Common Causes", items: ["Dry air — irritates nasal membranes in winter or dry climates", "Nose picking — trauma to delicate blood vessels", "Allergies and sinus infections", "Medications — blood thinners, nasal sprays", "Trauma — injury to the nose or face", "Deviated septum — abnormal nasal structure", "Polyps or tumours in nasal passages"] },
      { title: "First Aid: What to Do", items: ["Sit upright and lean forward to prevent blood going down the throat", "Pinch your nose just below the bridge (the soft part)", "Breathe through your mouth", "Apply a cold compress to the bridge of the nose", "Hold pressure continuously for 10–15 minutes"] },
      { title: "First Aid: What Not to Do", items: ["Do not lie flat or tilt your head back", "Do not blow your nose or stuff tissue into the nostril", "Do not engage in strenuous activity", "Do not pick your nose after bleeding stops"] },
      { title: "Treatment Options", cards: [
        { name: "Cauterisation", desc: "Chemical or electrical sealing of blood vessels to stop recurrent bleeding." },
        { name: "Nasal Packing", desc: "Gauze or balloon packing to apply sustained pressure on bleeding sites." },
        { name: "Topical Medication", desc: "Medicated sprays and ointments to control and prevent bleeding." },
        { name: "Surgical Correction", desc: "Fixing structural problems such as a deviated nasal septum." },
      ]},
      { title: "Seek Immediate Medical Attention If", items: ["Bleeding lasts longer than 20 minutes despite pressure", "Bleeding is very heavy or causes dizziness or weakness", "Bleeding followed a serious head injury", "You have difficulty breathing"] },
    ],
  },
  {
    slug: "deafness",
    name: "Deafness & Hearing Loss",
    tagline: "Comprehensive evaluation and treatment for hearing loss including medical management and surgical interventions.",
    overview: "Deafness and hearing loss can significantly impact quality of life, affecting communication, social interactions and overall wellbeing. Modern advances in audiology and surgical techniques offer effective solutions for various types of hearing impairment. Early diagnosis is crucial for optimal outcomes, especially in children where hearing is critical for speech and language development.",
    sections: [
      { title: "Types of Hearing Loss", items: ["Conductive — problems with outer or middle ear transmission", "Sensorineural — damage to inner ear or auditory nerve", "Mixed — combination of conductive and sensorineural", "Central — problems with auditory processing in the brain"] },
      { title: "Common Causes", items: ["Aging (presbycusis) — natural age-related hearing decline", "Noise exposure — prolonged exposure to loud sounds", "Genetic factors and inherited conditions", "Infections — ear infections, meningitis, mumps", "Head or ear trauma", "Ototoxic medications", "Tumours such as acoustic neuroma"] },
      { title: "Symptoms", items: ["Difficulty understanding speech, especially in noise", "Frequently asking others to repeat themselves", "Turning up the TV or radio volume", "Withdrawal from conversations", "Tinnitus (ringing in the ears)", "Balance problems"] },
      { title: "Treatment Options", cards: [
        { name: "Hearing Aids", desc: "Digital devices tailored for mild to moderate sensorineural hearing loss." },
        { name: "Cochlear Implants", desc: "Surgical solution for severe to profound hearing loss — Dr. Sood has performed 5,000+ implants." },
        { name: "Bone Anchored Hearing Aids", desc: "Effective for conductive hearing loss or single-sided deafness." },
        { name: "Medical Management", desc: "Treating underlying infections or conditions causing hearing loss." },
        { name: "Surgical Interventions", desc: "Stapedectomy, tympanoplasty and other corrective ear surgeries." },
        { name: "Auditory Rehabilitation", desc: "Speech therapy and structured listening training post-implant or post-surgery." },
      ]},
    ],
  },
  {
    slug: "ear-discharge",
    name: "Ear Discharge",
    tagline: "Expert diagnosis and treatment for ear discharge (otorrhea) including infections and chronic conditions.",
    overview: "Ear discharge, also known as otorrhea, is any fluid that comes from the ear. While some discharge is normal, persistent or abnormal discharge may indicate an underlying condition requiring medical attention. The type, colour and consistency of discharge can help identify the cause and guide appropriate treatment.",
    sections: [
      { title: "Types of Ear Discharge", items: ["Clear or white — normal earwax or water after swimming", "Yellow or green — bacterial infection", "Bloody — trauma, infection or foreign object", "Brown or black — old blood or fungal infection", "Watery and clear — possible cerebrospinal fluid (CSF) leak"] },
      { title: "Common Causes", items: ["Otitis Media — middle ear infection", "Otitis Externa — swimmer's ear (outer ear infection)", "Eardrum perforation — hole in the eardrum", "Foreign objects in the ear canal", "Cholesteatoma — skin growth in the middle ear", "Head or ear trauma", "Tumours (benign or malignant)"] },
      { title: "Associated Symptoms", items: ["Ear pain or discomfort", "Hearing loss", "Fever", "Itching in the ear canal", "Feeling of fullness in the ear", "Dizziness or balance problems", "Foul odour from the ear", "Tinnitus (ringing in the ears)"] },
      { title: "Treatment Options", cards: [
        { name: "Antibiotics", desc: "Targeted antibiotic therapy for confirmed bacterial ear infections." },
        { name: "Antifungal Medication", desc: "Specific treatment for fungal ear infections." },
        { name: "Ear Drops", desc: "Topical drops to treat infection and reduce inflammation in the canal." },
        { name: "Professional Ear Cleaning", desc: "Safe removal of debris, wax or foreign material under specialist care." },
        { name: "Tympanoplasty", desc: "Surgical repair of a perforated eardrum." },
        { name: "Mastoidectomy", desc: "Surgery for chronic ear disease, cholesteatoma or severe infection." },
      ]},
      { title: "Seek Immediate Care If", items: ["Discharge is bloody or clear and watery (possible CSF)", "Severe pain or high fever", "Head injury preceded the discharge", "Sudden hearing loss", "Facial weakness or paralysis"] },
    ],
  },
  {
    slug: "nasal-polyposis",
    name: "Nasal Polyposis",
    tagline: "Advanced treatment for nasal polyps including medical management and endoscopic surgical removal.",
    overview: "Nasal polyps are soft, painless, noncancerous growths on the lining of the nasal passages or sinuses. They hang down like teardrops and can obstruct nasal passages, causing breathing difficulties and reduced sense of smell. Early diagnosis and appropriate management are essential for optimal outcomes.",
    sections: [
      { title: "Common Causes", items: ["Chronic sinusitis — long-term inflammation of the sinuses", "Allergies — hay fever and allergic rhinitis", "Asthma — frequently associated with nasal polyps", "Aspirin sensitivity (Samter's triad)", "Cystic fibrosis", "Churg-Strauss syndrome — rare autoimmune disorder", "Genetic predisposition"] },
      { title: "Symptoms", items: ["Persistent stuffy nose (nasal congestion)", "Runny nose and postnasal drip", "Reduced or complete loss of sense of smell", "Loss of sense of taste", "Facial pain or pressure", "Headaches and snoring", "Itching around the eyes"] },
      { title: "Diagnosis", items: ["Nasal endoscopy — direct visualisation of polyps", "CT scan — detailed imaging of the sinuses", "Allergy testing — identify allergic triggers", "Blood tests — check for underlying conditions", "Sweat test — for cystic fibrosis screening"] },
      { title: "Treatment Options", cards: [
        { name: "Nasal Corticosteroids", desc: "First-line spray treatment to reduce polyp size and inflammation." },
        { name: "Oral or Systemic Steroids", desc: "Short courses to rapidly shrink larger polyps." },
        { name: "Antihistamines", desc: "Managing the allergic component that drives polyp growth." },
        { name: "Endoscopic Sinus Surgery", desc: "Minimally invasive removal of polyps with direct visualisation." },
        { name: "Polypectomy", desc: "Surgical removal of individual polyps blocking the nasal airway." },
      ]},
    ],
  },
  {
    slug: "sleep-apnea",
    name: "Sleep Apnea & Snoring",
    tagline: "Comprehensive diagnosis and treatment for sleep apnea and snoring including surgical and non-surgical options.",
    overview: "Sleep apnea is a serious sleep disorder in which breathing repeatedly stops and starts during sleep. Left untreated it can lead to significant health complications including cardiovascular disease, diabetes and cognitive decline. Snoring can also be a sign of underlying sleep apnea — proper diagnosis is essential before treatment.",
    sections: [
      { title: "Types of Sleep Apnea", items: ["Obstructive Sleep Apnea — most common; throat muscles relax blocking the airway", "Central Sleep Apnea — the brain fails to send proper signals to the breathing muscles", "Complex Sleep Apnea — a combination of both obstructive and central types"] },
      { title: "Common Symptoms", items: ["Loud snoring", "Witnessed episodes of stopped breathing during sleep", "Gasping for air during sleep", "Morning headaches", "Excessive daytime sleepiness", "Difficulty concentrating", "Irritability and mood changes", "Dry mouth upon awakening"] },
      { title: "Risk Factors", items: ["Excess weight — obesity significantly increases risk", "Age — risk increases after 40", "Male gender — more common in men", "Family history", "Alcohol use and smoking", "Chronic nasal congestion"] },
      { title: "Potential Complications", items: ["High blood pressure", "Heart disease and arrhythmias", "Type 2 diabetes", "Stroke", "Depression and cognitive impairment"] },
      { title: "Treatment Options", cards: [
        { name: "CPAP Therapy", desc: "Continuous positive airway pressure — gold standard non-surgical treatment." },
        { name: "Oral Appliances", desc: "Custom mouthpieces that keep the airway open during sleep." },
        { name: "Surgical Correction", desc: "UPPP (uvulopalatopharyngoplasty) and other palatal or nasal surgeries." },
        { name: "Weight Loss", desc: "Significant weight reduction can substantially improve or resolve OSA." },
        { name: "Positional Therapy", desc: "Sleep position adjustments to reduce airway collapse." },
        { name: "Lifestyle Changes", desc: "Avoiding alcohol before sleep, quitting smoking, improving sleep hygiene." },
      ]},
    ],
  },
  {
    slug: "tinnitus",
    name: "Tinnitus",
    tagline: "Comprehensive management of tinnitus (ringing in the ears) including sound therapy and medical treatments.",
    overview: "Tinnitus is the perception of noise or ringing in the ears when no external sound is actually present. It affects approximately 15–20% of people and can significantly impact sleep, concentration and quality of life. Understanding the underlying cause is key to effective management.",
    sections: [
      { title: "Common Causes", items: ["Age-related hearing loss — most common cause", "Noise-induced hearing loss — loud noise exposure", "Ear and sinus issues — infections, earwax blockage", "Head and neck injuries", "Medications — aspirin, certain antibiotics, diuretics", "Meniere's disease and TMJ disorders", "Blood vessel problems — high blood pressure, atherosclerosis"] },
      { title: "Types of Tinnitus", items: ["Subjective — only the patient can hear the sound", "Objective — audible to the examining doctor too", "Pulsatile — rhythmic, often synchronised with the heartbeat", "Low-frequency — deep humming sounds"] },
      { title: "Symptoms", items: ["Ringing, buzzing, humming, hissing or clicking sounds", "Sounds that vary in pitch and volume", "Worse in quiet environments", "Interferes with sleep and concentration", "Often associated with some degree of hearing loss"] },
      { title: "Treatment Options", cards: [
        { name: "Sound Therapy", desc: "Masking devices and white noise machines to reduce tinnitus perception." },
        { name: "Hearing Aids", desc: "Amplification devices that also mask tinnitus for patients with hearing loss." },
        { name: "Tinnitus Retraining Therapy", desc: "Systematic habituation to retrain the brain's response to tinnitus sounds." },
        { name: "Cognitive Behavioural Therapy", desc: "Psychological techniques to reduce distress and improve quality of life." },
        { name: "Medication", desc: "Antidepressants or anti-anxiety medications for severe distress." },
        { name: "Treating Underlying Conditions", desc: "Addressing root causes such as ear wax, infections or vascular disease." },
      ]},
    ],
  },
  {
    slug: "tonsils",
    name: "Tonsil Disorders",
    tagline: "Comprehensive treatment for tonsil infections, chronic tonsillitis and tonsillectomy procedures.",
    overview: "The tonsils are two lymph nodes located on each side of the back of the throat, functioning as a first-line defence against infection. However, they can themselves become infected and cause significant health issues. Tonsil problems are particularly common in children but affect adults as well.",
    sections: [
      { title: "Common Tonsil Conditions", items: ["Tonsillitis — inflammation of the tonsils", "Strep throat — bacterial infection affecting the tonsils", "Tonsil stones — calcified deposits in tonsil crypts", "Enlarged tonsils — chronic swelling or hypertrophy", "Peritonsillar abscess — collection of pus behind a tonsil", "Chronic tonsillitis — recurrent or persistent infections"] },
      { title: "Symptoms", items: ["Sore throat and difficulty swallowing", "Red, swollen tonsils with white or yellow patches", "Fever", "Bad breath", "Ear pain and swollen lymph nodes in the neck", "Hoarse voice", "Difficulty breathing in severe cases"] },
      { title: "When to Consider Tonsillectomy", items: ["Seven or more tonsil infections in one year", "Five or more infections per year for two consecutive years", "Three or more infections per year for three years", "Obstructive sleep apnea due to enlarged tonsils", "Difficulty eating or breathing", "Peritonsillar abscess not responding to treatment", "Suspicion of tonsil cancer"] },
      { title: "Treatment Options", cards: [
        { name: "Antibiotics", desc: "For confirmed bacterial infections such as streptococcal tonsillitis." },
        { name: "Pain Management", desc: "Over-the-counter or prescription pain relief and anti-inflammatories." },
        { name: "Tonsillectomy", desc: "Surgical removal — performed by conventional dissection or coblation technique." },
        { name: "Adenoidectomy", desc: "Often performed alongside tonsillectomy in children with obstructive symptoms." },
        { name: "Tonsil Stone Removal", desc: "Manual removal or laser treatment for recurrent calcified deposits." },
      ]},
    ],
  },
  {
    slug: "vertigo",
    name: "Vertigo & Balance Disorders",
    tagline: "Expert diagnosis and treatment for vertigo and balance disorders including vestibular rehabilitation.",
    overview: "Vertigo is a sensation of feeling off balance or spinning, typically caused by problems in the inner ear or brain. It can be temporary or long-term and significantly impact daily activities. Proper diagnosis is essential as the underlying cause determines the appropriate treatment approach.",
    sections: [
      { title: "Common Causes", items: ["BPPV (Benign Paroxysmal Positional Vertigo) — most common cause", "Meniere's disease — inner ear disorder causing vertigo and hearing changes", "Vestibular neuritis — inflammation of the vestibular nerve", "Labyrinthitis — inner ear infection", "Head injury — trauma to the inner ear or brain", "Vestibular migraines", "Multiple sclerosis"] },
      { title: "Symptoms", items: ["Spinning sensation (may be brief or prolonged)", "Loss of balance and unsteadiness", "Nausea and vomiting", "Abnormal eye movements (nystagmus)", "Headache or sweating", "Tinnitus and hearing changes", "Difficulty focusing the eyes"] },
      { title: "Diagnostic Tests", items: ["Dix-Hallpike Maneuver — tests for BPPV", "Videonystagmography (VNG) — records eye movements", "Caloric testing — tests inner ear response to temperature", "Posturography — assesses balance control", "MRI or CT scan — rules out brain abnormalities", "Audiometry — hearing tests"] },
      { title: "Treatment Options", cards: [
        { name: "Canalith Repositioning (Epley Maneuver)", desc: "Highly effective office procedure for BPPV — repositions displaced inner ear crystals." },
        { name: "Vestibular Rehabilitation", desc: "Structured exercise programme to retrain balance and gaze stabilisation." },
        { name: "Medications", desc: "Anti-nausea and anti-vertigo drugs for acute episodes." },
        { name: "Lifestyle Modifications", desc: "Dietary changes (low-salt diet for Meniere's), stress management." },
        { name: "Physical Therapy", desc: "Balance and gaze stabilisation exercises under specialist supervision." },
        { name: "Surgery", desc: "For severe or refractory cases not responding to conservative management." },
      ]},
    ],
  },
  {
    slug: "swollen-lymph-nodes",
    name: "Swollen Lymph Nodes",
    tagline: "Comprehensive evaluation and treatment for swollen lymph nodes in the head and neck region.",
    overview: "Swollen lymph nodes (swollen glands) are a sign that the body is fighting an infection or illness. While most cases resolve after the underlying infection clears, persistent or unusually enlarged nodes may indicate a more serious condition requiring thorough medical evaluation.",
    sections: [
      { title: "Common Locations in ENT Practice", items: ["Neck — most common location evaluated by ENT specialists", "Behind the ears — often associated with ear infections", "Under the jaw — related to throat and dental issues", "Above the collarbone — may indicate serious conditions requiring urgent evaluation"] },
      { title: "Common Causes", items: ["Viral infections — common cold, flu, glandular fever", "Bacterial infections — strep throat, ear infections", "Dental problems — tooth abscesses, gum disease", "Sinusitis and tonsillitis", "Skin infections in the head and neck region", "Immune disorders — lupus, rheumatoid arthritis", "Cancer — lymphoma, leukaemia, metastatic disease"] },
      { title: "When to See a Doctor Urgently", items: ["Nodes are hard, fixed and do not move when pressed", "Nodes larger than 2 centimetres", "Accompanied by fever, night sweats or unexplained weight loss", "Nodes appear suddenly without obvious cause", "Nodes are above the collarbone", "Multiple nodes swollen across different body areas"] },
      { title: "Treatment Approaches", cards: [
        { name: "Treat Underlying Infection", desc: "Antibiotics or antivirals for confirmed infectious causes." },
        { name: "Supportive Care", desc: "Rest, hydration and warm compresses for mild cases." },
        { name: "Anti-inflammatory Medications", desc: "To reduce swelling and pain during the acute phase." },
        { name: "Imaging Studies", desc: "Ultrasound, CT or MRI for detailed evaluation of node characteristics." },
        { name: "Biopsy", desc: "Tissue sampling when cancer or lymphoma is clinically suspected." },
        { name: "Specialist Referral", desc: "Oncology referral if lymphoma or metastatic cancer is confirmed." },
      ]},
    ],
  },
]

function buildTipTapContent(speciality: typeof SPECIALITIES[number]) {
  const blocks: any[] = []

  // Overview paragraph first
  if (speciality.overview) {
    blocks.push({
      type: 'paragraph',
      content: [{ type: 'text', text: speciality.overview }],
    })
  }

  for (const section of speciality.sections) {
    blocks.push({
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: section.title }],
    })

    if (section.items && section.items.length) {
      blocks.push({
        type: 'bulletList',
        content: section.items.map((item) => ({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: item }],
            },
          ],
        })),
      })
    }

    if (section.cards && section.cards.length) {
      for (const card of section.cards) {
        blocks.push({
          type: 'paragraph',
          content: [
            { type: 'text', text: card.name, marks: [{ type: 'bold' }] },
            { type: 'text', text: ' — ' + card.desc },
          ],
        })
      }
    }
  }

  return { type: 'doc', content: blocks }
}

async function seedSpecialities() {
  console.log('Seeding specialities...')

  try {
    for (const speciality of SPECIALITIES) {
      const content = buildTipTapContent(speciality)

      await prisma.speciality.upsert({
        where: { slug: speciality.slug },
        update: {
          title: speciality.name,
          slug: speciality.slug,
          description: speciality.tagline,
          content: content,
          image: null, // Will need to add images manually
        },
        create: {
          title: speciality.name,
          slug: speciality.slug,
          description: speciality.tagline,
          content: content,
          image: null,
        },
      })
      
      console.log(`✅ Seeded speciality: ${speciality.name}`)
    }
    
    console.log('✅ Specialities seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding specialities:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  seedSpecialities()
}

export { seedSpecialities }
