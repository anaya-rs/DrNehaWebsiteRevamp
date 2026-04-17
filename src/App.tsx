import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from './lib/api';

// ─── Lazy-load admin pages ───────────────────────────────────────────────────
const LoginPage = lazy(() => import('./auth/LoginPage'));
const ProtectedRoute = lazy(() => import('./auth/ProtectedRoute'));

/* ═══════════════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════════════ */
const SERVICES = [
  { name: "Voice Treatment", slug: "voice", icon: "🎙️", img: "/voicedisorder.png",
    desc: "Advanced care for vocal cord disorders and voice rehabilitation.",
    detail: "Dr. Sood specialises in diagnosing and treating conditions affecting the larynx and voice box — including vocal cord paralysis, nodules, polyps and spasmodic dysphonia — using microscopic and laser-assisted techniques." },
  { name: "Endoscopy Sinus & Skull Base", slug: "sinus", icon: "🔬", img: "/sinusitis.png",
    desc: "Minimally invasive procedures for chronic sinusitis and skull base conditions.",
    detail: "Functional endoscopic sinus surgery (FESS) and extended endoscopic approaches allow treatment of complex sinus disease, tumors, CSF leaks and pituitary lesions through the nose — no external incisions." },
  { name: "Snoring & Sleep Apnea", slug: "sleep-apnea", icon: "😴", img: "/Sleep-Apnea-and-Snoring.png",
    desc: "Effective treatments to improve breathing and sleep quality.",
    detail: "Comprehensive evaluation including polysomnography, followed by tailored treatment: lifestyle modification, CPAP, oral devices, or surgical correction of anatomical obstruction in the palate, tonsils or nasal passages." },
  { name: "Cochlear Implants", slug: "cochlear", icon: "👂", img: "/Cochlear.png",
    desc: "Restoring hearing for severe to profound hearing loss with advanced implant technology.",
    detail: "With 5,000+ cochlear implant surgeries performed, Dr. Sood is one of India's most experienced implant surgeons. The program covers candidacy evaluation, surgery, device programming and lifelong auditory rehabilitation." },
  { name: "Laser Surgery", slug: "laser", icon: "⚡", img: "/Co2.png",
    desc: "Precision laser treatments for various ENT conditions with minimal discomfort.",
    detail: "Laser-assisted procedures offer bloodless surgery with rapid healing — used for tonsillectomy, adenoidectomy, vocal cord lesions, nasal polyps and turbinate reduction, often as day-care procedures." },
  { name: "CO₂ Laser Surgery", slug: "co2-laser", icon: "🔆", img: "",
    desc: "Precise CO₂ laser for vocal cord, tonsil, and nasal conditions.",
    detail: "CO₂ laser energy is selectively absorbed by soft tissue, enabling precise excision of lesions in the larynx, oral cavity and nasal airway with minimal thermal spread and faster healing." },
  { name: "Septoplasty", slug: "septoplasty", icon: "👃", img: "",
    desc: "Corrective surgery for deviated nasal septum to improve airflow.",
    detail: "A deviated septum causes chronic nasal obstruction, recurrent sinusitis and sleep disturbance. Septoplasty straightens the cartilage and bone through the nostril with no external incisions. Recovery: 5–7 days." },
  { name: "Tonsillectomy", slug: "tonsillectomy", icon: "🏥", img: "",
    desc: "Safe removal of tonsils for chronic infections or obstruction.",
    detail: "Indicated for recurrent tonsillitis (≥7 episodes/year), peritonsillar abscess, or obstructive sleep-disordered breathing. Performed with conventional dissection or coblation under general anaesthesia." },
  { name: "Ear Microsurgery", slug: "ear-microsurgery", icon: "🔭", img: "",
    desc: "Microscopic repair of the eardrum and middle ear structures.",
    detail: "Myringoplasty, tympanoplasty and mastoidectomy treat chronic ear disease, cholesteatoma and conductive hearing loss, restoring both structure and hearing function under operative microscope guidance." },
  { name: "Paediatric ENT", slug: "paediatric", icon: "👶", img: "",
    desc: "Gentle, specialised ENT care for children of all ages.",
    detail: "Children with recurrent ear infections, tonsillitis, adenoid hypertrophy, hearing loss and airway problems need age-specific expertise. Services include grommet insertion, adenotonsillectomy and paediatric cochlear implants." },
];

const CONDITIONS = [
  "Voice Disorders", "Sinusitis", "Nasal Bleeding", "Deafness", "Ear Discharge",
  "Nasal Polyposis", "Sleep Apnea & Snoring", "Tinnitus", "Tonsils", "Vertigo",
  "Swollen Lymph Nodes", "Cochlear Implants", "Ear Infections", "Hoarseness",
  "Nasal Obstruction", "Skull Base Tumors", "Thyroid Disorders", "Head & Neck Cancers",
];

const CLINIC_PHOTOS = [
  "https://www.drnehasood.in/images/doctor-image-3.jpeg",
  "https://www.drnehasood.in/images/doctor-image-4.jpeg",
  "https://www.drnehasood.in/images/doctor-image-6.jpeg",
  "https://www.drnehasood.in/img/IMG_2320.jpg",
  "https://www.drnehasood.in/img/IMG_3654.jpg",
  "https://www.drnehasood.in/img/IMG_3775.jpg",
];
const VIDEO_GALLERY = [
  "https://www.drnehasood.in/video_gallery/video1.mp4",
  "https://www.drnehasood.in/video_gallery/video2.mp4",
];
const PRINT_MEDIA = [
  "https://www.drnehasood.in/print_media/print1.jpg",
  "https://www.drnehasood.in/print_media/print2.jpg",
];
const STATIC_PDF_NEWS = [
  { name: "News Clipping 1", href: "/news-pdfs/news-clipping-01.pdf" },
  { name: "News Clipping 2", href: "/news-pdfs/news-clipping-02.pdf" },
  { name: "News Clipping 3", href: "/news-pdfs/news-clipping-03.pdf" },
  { name: "News Clipping 4", href: "/news-pdfs/news-clipping-04.pdf" },
  { name: "News Clipping 5", href: "/news-pdfs/news-clipping-05.pdf" },
];

// Static articles (rendered from .docx files via server API)
const ARTICLES = [
  { slug: "cochlear-implant-guide",       tag: "Cochlear Implant", title: "Cochlear Implant — A Comprehensive Guide",   excerpt: "A comprehensive look at cochlear implant surgery — candidacy, procedure, rehabilitation and outcomes." },
  { slug: "hearing-loss-causes-treatment", tag: "Hearing",          title: "Hearing Loss — Causes & Treatment",          excerpt: "An in-depth look at hearing loss, its causes including COVID-19, and treatment options." },
  { slug: "laryngitis-guide",              tag: "Voice",            title: "Laryngitis — What You Need to Know",          excerpt: "An in-depth guide to laryngitis: types, causes, symptoms and when to seek specialist care." },
  { slug: "nasal-allergy-guide",           tag: "Allergy",          title: "Nasal Allergy Guide",                         excerpt: "Airborne allergens can make everyday life difficult. Learn how to understand and manage your triggers." },
  { slug: "swimmers-ear",                  tag: "Ears",             title: "Swimmer's Ear",                               excerpt: "Frequent underwater exposure can lead to a painful outer ear canal infection known as swimmer's ear." },
  { slug: "world-voice-day-2021",          tag: "Voice",            title: "World Voice Day 2021",                        excerpt: "Celebrating the science of voice — awareness, disorders, treatment and the importance of vocal health." },
];

const FAQS = [
  { q: "Why does my child get frequent ear infections?", a: "Children under three average one to two ear infections per year. Their Eustachian tubes are short and still developing, making them prone to swelling and blockages that trap fluid in the middle ear." },
  { q: "What is the treatment for an ear infection?", a: "Most ear infections resolve in about a week. Pain can be managed with over-the-counter medications, eardrops, and warm compresses. Bacterial infections may require antibiotics. Children with chronic infections may benefit from ear tubes." },
  { q: "I experience frequent sinus infections — is this normal?", a: "Sinusitis is very common. It occurs when sinus lining becomes inflamed and swollen, causing nasal obstruction, pain or pressure, and discharge. If medical treatment is ineffective, surgery may be an option." },
  { q: "What causes hoarseness, and should I be concerned?", a: "Hoarseness is usually caused by upper respiratory infections, GERD, or postnasal drip. If it persists longer than four to six weeks, see a doctor to rule out nodules, tumors, or vocal cord paralysis." },
  { q: "My snoring is keeping my partner awake. What can I do?", a: "Lifestyle changes like weight loss, sleeping on your side, and avoiding alcohol before bed often help. Snoring is frequently associated with obstructive sleep apnea, which warrants a proper evaluation." },
];

/* ─── Speciality pages data ──────────────────────────────────────────────── */
interface SpecSection {
  title: string;
  items?: string[];
  cards?: { name: string; desc: string }[];
}
interface Speciality {
  slug: string;
  name: string;
  tagline: string;
  overview: string;
  sections: SpecSection[];
}

const SPECIALITIES: Speciality[] = [
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
    overview: "Sinusitis is an inflammation or swelling of the tissue lining the sinuses. Healthy sinuses are filled with air, but when they become blocked and filled with fluid, germs can grow and cause an infection. Chronic sinusitis lasts 12 weeks or longer despite treatment attempts and can significantly impact quality of life.",
    sections: [
      { title: "Common Symptoms", items: ["Nasal inflammation and congestion", "Thick, discoloured discharge from the nose", "Postnasal drainage down the back of the throat", "Pain and swelling around the eyes, cheeks, nose or forehead", "Reduced sense of smell and taste", "Ear pain, headache, fatigue", "Bad breath"] },
      { title: "Causes", items: ["Nasal polyps blocking the nasal passages", "Deviated nasal septum restricting sinus passages", "Respiratory tract infections inflaming the sinus lining", "Allergies such as hay fever", "Other conditions including cystic fibrosis and immune disorders"] },
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
      { title: "Types of Hearing Loss", items: ["Conductive — problems with outer or middle ear transmission", "Sensorineural — damage to the inner ear or auditory nerve", "Mixed — combination of conductive and sensorineural", "Central — problems with auditory processing in the brain"] },
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
      { title: "Common Causes", items: ["Age-related hearing loss — the most common cause", "Noise-induced hearing loss — loud noise exposure", "Ear and sinus issues — infections, earwax blockage", "Head and neck injuries", "Medications — aspirin, certain antibiotics, diuretics", "Meniere's disease and TMJ disorders", "Blood vessel problems — high blood pressure, atherosclerosis"] },
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
      { title: "Common Locations in ENT Practice", items: ["Neck — the most common location evaluated by ENT specialists", "Behind the ears — often associated with ear infections", "Under the jaw — related to throat and dental issues", "Above the collarbone — may indicate serious conditions requiring urgent evaluation"] },
      { title: "Common Causes", items: ["Viral infections — common cold, flu, glandular fever", "Bacterial infections — strep throat, ear infections", "Dental problems — tooth abscesses, gum disease", "Sinusitis and tonsillitis", "Skin infections in the head and neck region", "Immune disorders — lupus, rheumatoid arthritis", "Cancer — lymphoma, leukaemia, metastatic disease"] },
      { title: "When to See a Doctor Urgently", items: ["Nodes are hard, fixed and do not move when pressed", "Nodes larger than 2 centimetres", "Accompanied by fever, night sweats or unexplained weight loss", "Nodes appear suddenly without obvious cause", "Nodes are above the collarbone", "Multiple nodes swollen across different body areas"] },
      { title: "Treatment Approaches", cards: [
        { name: "Treat the Underlying Infection", desc: "Antibiotics or antivirals for confirmed infectious causes." },
        { name: "Supportive Care", desc: "Rest, hydration and warm compresses for mild cases." },
        { name: "Anti-inflammatory Medications", desc: "To reduce swelling and pain during the acute phase." },
        { name: "Imaging Studies", desc: "Ultrasound, CT or MRI for detailed evaluation of node characteristics." },
        { name: "Biopsy", desc: "Tissue sampling when cancer or lymphoma is clinically suspected." },
        { name: "Specialist Referral", desc: "Oncology referral if lymphoma or metastatic cancer is confirmed." },
      ]},
    ],
  },
];

const STATIC_SOCIAL = [
  { label: "YouTube", abbr: "YT", url: "https://www.youtube.com/channel/UCAh6S5zjb6HRcltZJyAJGBg", color: "#ff0000", desc: "Surgical walkthroughs & patient education" },
  { label: "Instagram", abbr: "IG", url: "https://www.instagram.com/drneha.sood/", color: "#e1306c", desc: "Daily health tips & clinic updates" },
  { label: "Facebook", abbr: "FB", url: "https://www.facebook.com/Hearingandvoice", color: "#1877f2", desc: "Community Q&A & patient stories" },
  { label: "LinkedIn", abbr: "LI", url: "https://www.linkedin.com/in/dr-neha-sood-436b9b10/", color: "#0a66c2", desc: "Professional updates & research" },
];

/* ═══════════════════════════════════════════════════════════
   UTILITY COMPONENTS
═══════════════════════════════════════════════════════════ */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #e8eeec", padding: "1.1rem 0" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, gap: "1rem" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "1rem", fontWeight: 500, color: "#1a2e26", lineHeight: 1.5 }}>{q}</span>
        <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: open ? "#1a6b4a" : "#e8f4ef", color: open ? "#fff" : "#1a6b4a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 300, transition: "all 0.25s" }}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <p style={{ marginTop: "0.75rem", fontFamily: "var(--font-body)", fontSize: "0.92rem", color: "#4a6359", lineHeight: 1.8, paddingRight: "3rem" }}>{a}</p>}
    </div>
  );
}

function ScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => { if (ref.current) ref.current.scrollBy({ left: dir * 320, behavior: "smooth" }); };
  return (
    <div style={{ position: "relative" }}>
      <div ref={ref} style={{ display: "flex", gap: "1.25rem", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "0.5rem", paddingTop: "0.5rem" }}>
        {children}
      </div>
      <button onClick={() => scroll(-1)} style={{ position: "absolute", left: -18, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "#fff", border: "1.5px solid #d1e6dd", color: "#1a6b4a", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", zIndex: 2 }}>‹</button>
      <button onClick={() => scroll(1)} style={{ position: "absolute", right: -18, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "#fff", border: "1.5px solid #d1e6dd", color: "#1a6b4a", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", zIndex: 2 }}>›</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════ */
function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      :root {
        --green: #1a6b4a; --green-dark: #134f37; --green-light: #e8f4ef;
        --green-mid: #2e8b62; --gold: #c9973b; --text: #1a2e26; --text-muted: #4a6359;
        --border: #d8ebe3; --bg: #f9fdfb; --white: #ffffff;
        --font-display: 'Playfair Display', Georgia, serif;
        --font-body: 'DM Sans', system-ui, sans-serif;
        --radius: 14px; --section-pad: 2.75rem 0; --max-w: 1160px;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      html { scroll-behavior: smooth; }
      body { font-family: var(--font-body); color: var(--text); font-size: 16px; }

      /* Skeleton animation */
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      /* ── NAV ── */
      .public-site nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.96); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; height: 68px; }
      .public-site .nav-brand { display: flex; align-items: center; gap: 0.75rem; }
      .public-site .nav-logo { height: 44px; width: auto; object-fit: contain; }
      .public-site .nav-brand-main { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--green); line-height: 1.2; }
      .public-site .nav-brand-sub { font-size: 0.7rem; color: var(--text-muted); letter-spacing: 0.02em; }
      .public-site .nav-links { display: flex; align-items: center; gap: 1.75rem; }
      .public-site .nav-links a { font-family: inherit; font-size: 0.88rem; color: var(--text-muted); text-decoration: none; font-weight: 400; letter-spacing: 0.01em; transition: color 0.2s; padding: 0.5rem 0; display: inline-block; line-height: 1.4; }
      .public-site .nav-links a:hover { color: var(--green); }
      .public-site .nav-cta { background: var(--green); color: #fff; text-decoration: none; padding: 0.55rem 1.25rem; border-radius: 8px; font-size: 0.85rem; font-weight: 500; transition: background 0.2s; white-space: nowrap; }
      .public-site .nav-cta:hover { background: var(--green-dark); }
      .public-site .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
      @media (max-width: 820px) { .public-site .nav-links { display: none; } .public-site .hamburger { display: flex; flex-direction: column; gap: 5px; } .public-site .hamburger span { display: block; width: 22px; height: 2px; background: var(--green); border-radius: 2px; } .public-site nav { padding: 0 1.25rem; } }
      @media (max-width: 480px) { .public-site .nav-cta { display: none; } }
      .public-site .mobile-menu { display: none; position: fixed; top: 68px; left: 0; right: 0; z-index: 99; background: #fff; border-bottom: 1px solid var(--border); flex-direction: column; padding: 1rem 1.5rem 1.5rem; gap: 0.75rem; }
      .public-site .mobile-menu.open { display: flex; }
      .public-site .mobile-menu a { font-size: 1rem; color: var(--text); text-decoration: none; padding: 0.4rem 0; }

      /* ── SECTIONS ── */
      .public-site section { padding: var(--section-pad); min-height: auto; display: flex; align-items: flex-start; }
      .section-inner { max-width: var(--max-w); margin: 0 auto; width: 100%; padding: 0 2rem; }
      .eyebrow { display: inline-block; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--green); background: var(--green-light); padding: 0.3rem 0.75rem; border-radius: 20px; margin-bottom: 0.5rem; }
      .section-title { font-family: var(--font-display); font-size: clamp(1.7rem, 3.5vw, 2.4rem); font-weight: 700; color: var(--text); line-height: 1.25; margin-bottom: 0.6rem; text-align: left; }
      .section-title em { font-style: italic; color: var(--green); }

      /* ── HERO ── */
      #hero { min-height: 78vh; padding-top: 96px; padding-bottom: 2.5rem; display: flex; align-items: center; background: linear-gradient(135deg, #f0faf5 0%, #f9fdfb 60%, #eef6f1 100%); position: relative; overflow: hidden; }
      .hero-inner { max-width: var(--max-w); margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; width: 100%; padding: 0 2rem; }
      .hero-title { font-family: var(--font-display); font-size: clamp(2.4rem, 5vw, 3.4rem); font-weight: 700; line-height: 1.15; color: var(--text); margin-bottom: 1.1rem; }
      .hero-title em { font-style: italic; color: var(--green); }
      .hero-sub { font-size: 1rem; color: var(--text-muted); line-height: 1.75; margin-bottom: 1.5rem; max-width: 440px; }
      .hero-actions { display: flex; gap: 0.875rem; flex-wrap: wrap; margin-bottom: 1.75rem; }
      .btn-primary { background: var(--green); color: #fff; text-decoration: none; padding: 0.75rem 1.6rem; border-radius: 10px; font-size: 0.9rem; font-weight: 500; border: none; cursor: pointer; display: inline-block; transition: all 0.2s; white-space: nowrap; }
      .btn-primary:hover { background: var(--green-dark); transform: translateY(-1px); }
      .btn-ghost { background: transparent; color: var(--green); text-decoration: none; padding: 0.75rem 1.6rem; border-radius: 10px; font-size: 0.9rem; font-weight: 500; border: 1.5px solid var(--green); cursor: pointer; display: inline-block; transition: all 0.2s; white-space: nowrap; }
      .btn-ghost:hover { background: var(--green-light); }
      .hero-stats { display: flex; gap: 1.5rem; flex-wrap: wrap; }
      .stat-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 0.9rem 1.3rem; min-width: 100px; }
      .stat-num { font-family: var(--font-display); font-size: 1.7rem; font-weight: 700; color: var(--green); line-height: 1; }
      .stat-lbl { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem; }
      .hero-right { position: relative; display: flex; justify-content: center; }
      .hero-img-wrap { position: relative; width: 100%; max-width: 460px; border-radius: 24px; overflow: hidden; background: linear-gradient(160deg, #cdeade 0%, #a8d8c0 100%); }
      .hero-img-wrap img { width: 100%; display: block; object-fit: cover; }
      @media (max-width: 820px) { .hero-inner { grid-template-columns: 1fr; padding: 0 1rem; } .hero-right { order: -1; } .hero-img-wrap { max-width: 300px; } }

      /* ── ABOUT ── */
      #about { background: #fff; }
      .about-inner { max-width: var(--max-w); margin: 0 auto; display: grid; grid-template-columns: 280px 1fr; gap: 3rem; align-items: center; width: 100%; padding: 0 2rem; }
      .about-photo { width: 100%; border-radius: 20px; overflow: hidden; background: var(--green-light); aspect-ratio: 3/4; }
      .about-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .about-body { font-size: 0.95rem; color: var(--text-muted); line-height: 1.85; margin-bottom: 1.5rem; }
      .cred-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.75rem; }
      .cred { display: flex; align-items: flex-start; gap: 0.65rem; font-size: 0.875rem; color: var(--text-muted); line-height: 1.65; }
      .cred-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); flex-shrink: 0; margin-top: 7px; }
      @media (max-width: 820px) { .about-inner { grid-template-columns: 1fr; } .about-photo { max-width: 260px; margin: 0 auto; } }

      /* ── CLINIC FACILITY ── */
      #facility { background: var(--bg); }
      .facility-inner { max-width: var(--max-w); margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 3.5rem; align-items: center; width: 100%; padding: 0 2rem; }
      .facility-info-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem 1.75rem; margin-top: 1.5rem; }
      .facility-info-header { display: flex; align-items: center; gap: 0.875rem; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
      .facility-logo { width: 40px; height: 40px; border-radius: 10px; background: var(--green-light); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
      .facility-logo img { width: 100%; height: 100%; object-fit: contain; }
      .facility-info-name { font-family: var(--font-display); font-size: 0.95rem; font-weight: 700; color: var(--text); line-height: 1.25; }
      .facility-info-sub { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.1rem; }
      .facility-address { font-size: 0.85rem; color: var(--text); line-height: 1.75; margin-bottom: 1rem; }
      .facility-timings-label { font-size: 0.78rem; font-weight: 600; color: var(--text); margin-bottom: 0.35rem; }
      .facility-timings { font-size: 0.82rem; color: var(--text-muted); line-height: 1.85; margin-bottom: 1.25rem; font-style: italic; }
      .facility-actions { display: flex; gap: 0.625rem; flex-wrap: wrap; }
      .facility-photo-wrap { position: relative; border-radius: 20px; overflow: hidden; background: #0a1f17; aspect-ratio: 4/3; }
      .facility-photo-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .facility-photo-caption { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(10,31,23,0.9) 0%, transparent 100%); padding: 1.5rem 1.25rem 1rem; }
      .facility-photo-caption-title { font-family: var(--font-display); font-size: 1.05rem; color: #fff; font-weight: 700; }
      .facility-photo-caption-sub { font-size: 0.78rem; color: rgba(255,255,255,0.7); margin-top: 0.2rem; }
      @media (max-width: 820px) { .facility-inner { grid-template-columns: 1fr; } .facility-photo-wrap { aspect-ratio: 16/9; } }

      /* ── SPECIALITY LIST PAGE ── */
      .spec-list-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; margin-top: 2rem; }
      .spec-card { display: block; background: #fff; border: 1px solid var(--border); border-radius: var(--radius); padding: 1.75rem 1.75rem 1.5rem; text-decoration: none; transition: all 0.22s; }
      .spec-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(26,107,74,0.1); border-color: #b8d9c8; }
      .spec-card-name { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: var(--text); margin-bottom: 0.75rem; }
      .spec-card-tag { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--green); background: var(--green-light); padding: 0.2rem 0.6rem; border-radius: 20px; display: inline-block; margin-bottom: 0.75rem; }
      .spec-card-desc { font-size: 0.82rem; color: var(--text-muted); line-height: 1.7; margin-bottom: 1rem; }
      .spec-card-cta { font-size: 0.8rem; font-weight: 500; color: var(--green); }

      /* ── SPECIALITY DETAIL PAGE ── */
      .spec-detail-wrap { max-width: 860px; margin: 0 auto; }
      .spec-overview { font-size: 1rem; color: var(--text-muted); line-height: 1.85; background: #fff; border-left: 3px solid var(--green); padding: 1.25rem 1.5rem; border-radius: 0 var(--radius) var(--radius) 0; margin-bottom: 2rem; }
      .spec-section { margin-bottom: 2.25rem; }
      .spec-section-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--text); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); }
      .spec-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
      .spec-list li { font-size: 0.875rem; color: var(--text-muted); line-height: 1.65; padding-left: 1.1rem; position: relative; }
      .spec-list li::before { content: ''; position: absolute; left: 0; top: 0.55em; width: 5px; height: 5px; border-radius: 50%; background: var(--green); }
      .spec-treatment-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
      .spec-treatment-card { background: var(--green-light); border: 1px solid #c8e6d5; border-radius: 10px; padding: 1.25rem; }
      .spec-treatment-name { font-family: var(--font-display); font-size: 0.9rem; font-weight: 700; color: var(--text); margin-bottom: 0.4rem; }
      .spec-treatment-desc { font-size: 0.8rem; color: var(--text-muted); line-height: 1.65; }

      /* ── SERVICES (home scroll) ── */
      #services { background: var(--bg); }
      .service-card { flex: 0 0 230px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; transition: all 0.25s; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
      .service-card:hover { transform: translateY(-5px); box-shadow: 0 14px 36px rgba(26,107,74,0.12); border-color: #c2ddd1; }
      .service-img { width: 100%; height: 190px; object-fit: cover; display: block; }
      .service-img-placeholder { width: 100%; height: 190px; background: linear-gradient(135deg, var(--green-light), #d0eee0); display: flex; align-items: center; justify-content: center; font-size: 3rem; }
      .service-body { padding: 1rem 1.1rem 1.25rem; }
      .service-name { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 0.45rem; line-height: 1.3; }
      .service-desc { font-size: 0.79rem; color: var(--text-muted); line-height: 1.65; margin-bottom: 0.85rem; }
      .service-link { font-size: 0.81rem; font-weight: 500; color: var(--green); text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem; }
      .service-link:hover { gap: 0.5rem; }
      .service-link::after { content: '→'; }
      @media (max-width: 700px) { #services .service-card { flex: 0 0 160px !important; max-width: 160px !important; } .service-img { height: 140px !important; } }

      /* ── SERVICES PAGE ── */
      .services-page-hero { background: linear-gradient(135deg, #f0faf5 0%, #e8f5ee 100%); padding: 3.5rem 2rem 3rem; text-align: center; }
      .services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
      .service-full-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; transition: all 0.25s; }
      .service-full-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(26,107,74,0.1); }
      .service-full-body { padding: 1.25rem 1.5rem 1.5rem; }

      /* ── ARTICLE DETAIL ── */
      .article-detail-wrap { max-width: 760px; margin: 0 auto; }
      .article-detail-meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
      .article-detail-body { font-size: 0.94rem; color: var(--text); line-height: 1.9; }
      .article-detail-body h1,.article-detail-body h2,.article-detail-body h3 { font-family: var(--font-display); font-weight: 700; color: var(--text); margin: 1.5rem 0 0.75rem; }
      .article-detail-body h1 { font-size: 1.5rem; } .article-detail-body h2 { font-size: 1.2rem; } .article-detail-body h3 { font-size: 1rem; }
      .article-detail-body p { margin: 0 0 1rem; }
      .article-detail-body ul,.article-detail-body ol { padding-left: 1.5rem; margin: 0 0 1rem; }
      .article-detail-body li { margin-bottom: 0.35rem; }
      .article-detail-body strong { font-weight: 600; color: var(--text); }

      /* ── BOOK APPOINTMENT PAGE ── */
      .book-page-wrap { display: grid; grid-template-columns: 1fr 1.4fr; gap: 3rem; align-items: start; }
      @media (max-width: 820px) { .book-page-wrap { grid-template-columns: 1fr; } }
      .book-page-info h2 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--text); margin-bottom: 0.75rem; }
      .book-page-info p { font-size: 0.92rem; color: var(--text-muted); line-height: 1.8; margin-bottom: 1.25rem; }
      .book-contact-list { display: flex; flex-direction: column; gap: 0.625rem; margin-bottom: 1.5rem; }
      .book-contact-list a { font-size: 0.88rem; color: var(--green); text-decoration: none; font-weight: 500; }
      .book-contact-list a:hover { text-decoration: underline; }

      /* ── PDF card (news clippings) ── */
      .pdf-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; background: var(--green-light); border: 1.5px solid var(--border); border-radius: 12px; padding: 1.5rem 1rem; text-align: center; color: var(--text); text-decoration: none; transition: all 0.2s; min-height: 160px; }
      .pdf-card:hover { background: #c9e8d8; border-color: var(--green); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(26,107,74,0.12); }
      .pdf-card-icon { font-size: 2.5rem; line-height: 1; }
      .pdf-card-name { font-size: 0.82rem; font-weight: 600; color: var(--text); }
      .pdf-card-action { font-size: 0.75rem; color: var(--green); font-weight: 500; }
      .service-full-name { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--text); margin-bottom: 0.4rem; }
      .service-full-brief { font-size: 0.82rem; color: var(--text-muted); line-height: 1.65; margin-bottom: 0.6rem; }
      .service-full-detail { font-size: 0.8rem; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); padding-top: 0.75rem; margin-top: 0.5rem; }
      @media (max-width: 640px) { .services-grid { grid-template-columns: 1fr; } }

      /* ── SOCIAL SECTION (replaces conditions on home) ── */
      #social { background: #0a1f17; }
      .social-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem; max-width: 900px; margin-left: auto; margin-right: auto; }
      .social-platform-card { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 1.75rem 1rem; border-radius: 16px; text-decoration: none; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); transition: all 0.25s; }
      .social-platform-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); }
      .social-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; flex-shrink: 0; }
      .social-platform-label { font-weight: 600; color: #fff; font-size: 0.95rem; }
      .social-platform-desc { font-size: 0.75rem; color: rgba(255,255,255,0.5); text-align: center; line-height: 1.5; }

      /* ── GALLERY ── */
      #gallery { background: #fff; }
      .gallery-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.75rem; }
      .gtab { padding: 0.45rem 1rem; border-radius: 30px; font-size: 0.82rem; font-weight: 500; border: 1.5px solid var(--border); background: transparent; color: var(--text-muted); cursor: pointer; text-decoration: none; transition: all 0.2s; display: inline-block; }
      .gtab:hover, .gtab.active { background: var(--green); border-color: var(--green); color: #fff; }
      .gallery-thumb { flex: 0 0 220px; height: 170px; border-radius: 12px; overflow: hidden; background: var(--green-light); position: relative; cursor: pointer; }
      .gallery-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s; }
      .gallery-thumb:hover img { transform: scale(1.05); }
      .gallery-thumb video { width: 100%; height: 100%; object-fit: cover; }
      .gallery-overlay { position: absolute; inset: 0; background: rgba(26,107,74,0.35); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
      .gallery-thumb:hover .gallery-overlay { opacity: 1; }
      .gallery-overlay-icon { width: 36px; height: 36px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 1rem; }

      /* ── TESTIMONIALS ── */
      #testimonials { background: var(--bg); }
      .video-card { flex: 0 0 300px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
      .video-card video { width: 100%; aspect-ratio: 16/9; background: #0d1f17; display: block; }
      .video-card-body { padding: 1rem 1.25rem 1.25rem; }
      .video-card-name { font-weight: 500; font-size: 0.9rem; color: var(--text); margin-bottom: 0.3rem; }
      .video-card-desc { font-size: 0.8rem; color: var(--text-muted); line-height: 1.6; }

      /* ── ARTICLES ── */
      #blog { background: #fff; }
      .article-card { flex: 0 0 280px; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; text-decoration: none; color: inherit; transition: all 0.25s; display: flex; flex-direction: column; gap: 0.75rem; }
      .article-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
      .article-tag { display: inline-block; font-size: 0.68rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--green); background: var(--green-light); padding: 0.2rem 0.6rem; border-radius: 20px; }
      .article-title { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--text); line-height: 1.35; }
      .article-excerpt { font-size: 0.82rem; color: var(--text-muted); line-height: 1.7; flex: 1; }
      .article-read { font-size: 0.78rem; color: var(--green); font-weight: 500; margin-top: auto; }

      /* ── CLINICS ── */
      #clinics { background: var(--bg); }
      .clinic-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius); padding: 1.75rem 2rem; }
      .clinic-tag { display: inline-block; font-size: 0.7rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold); background: #fdf5e8; padding: 0.2rem 0.6rem; border-radius: 20px; margin-bottom: 0.75rem; }
      .clinic-name { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--text); margin-bottom: 0.9rem; }
      .clinic-detail { font-size: 0.85rem; color: var(--text-muted); line-height: 1.85; margin-bottom: 1.25rem; }
      .clinic-map-btn { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.82rem; font-weight: 500; color: var(--green); text-decoration: none; border: 1.5px solid var(--green); padding: 0.45rem 1rem; border-radius: 8px; transition: all 0.2s; }
      .clinic-map-btn:hover { background: var(--green-light); }
      @media (max-width: 640px) { .clinics-grid { grid-template-columns: 1fr !important; } }

      /* ── CONDITIONS ── */
      .conditions-grid { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 1.5rem; }
      .condition-pill { background: #fff; border: 1px solid var(--border); border-radius: 30px; padding: 0.4rem 1rem; font-size: 0.82rem; color: var(--text-muted); transition: all 0.2s; cursor: default; }
      .condition-pill:hover { background: var(--green-light); border-color: var(--green); color: var(--green); }

      /* ── FAQs ── */
      #faqs { background: #fff; }
      .faq-inner { max-width: 760px; margin: 0 auto; width: 100%; }

      /* ── CONTACT ── */
      #contact { background: linear-gradient(135deg, #0e4530 0%, #1a6b4a 60%, #1f7d56 100%); padding: 2.75rem 0; }
      .contact-inner { max-width: var(--max-w); margin: 0 auto; display: grid; grid-template-columns: 1fr 1.3fr; gap: 2.5rem; align-items: start; width: 100%; padding: 0 2rem; }
      .contact-eyebrow { display: inline-block; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.1); padding: 0.3rem 0.75rem; border-radius: 20px; margin-bottom: 0.85rem; }
      .contact-title { font-family: var(--font-display); font-size: 2.1rem; font-weight: 700; color: #fff; line-height: 1.25; margin-bottom: 1rem; }
      .contact-sub { font-size: 0.92rem; color: rgba(255,255,255,0.7); line-height: 1.75; margin-bottom: 1.5rem; }
      .contact-info { display: flex; flex-direction: column; gap: 0.5rem; }
      .contact-info a { font-size: 0.88rem; color: rgba(255,255,255,0.75); text-decoration: none; }
      .contact-info a:hover { color: #fff; }
      .form-wrap { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); border-radius: 18px; padding: 1.5rem; backdrop-filter: blur(6px); }
      .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
      .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
      .form-group label { font-size: 0.78rem; color: rgba(255,255,255,0.7); font-weight: 500; }
      .form-group input, .form-group select { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 0.6rem 0.875rem; font-size: 0.875rem; color: #fff; outline: none; transition: border-color 0.2s; font-family: var(--font-body); appearance: none; -webkit-appearance: none; }
      .form-group input::placeholder { color: rgba(255,255,255,0.4); }
      .form-group input:focus, .form-group select:focus { border-color: rgba(255,255,255,0.5); }
      .form-group select option { background: #1a6b4a; color: #fff; }
      .btn-white { display: inline-block; background: #fff; color: var(--green); text-decoration: none; padding: 0.8rem 2rem; border-radius: 10px; font-size: 0.9rem; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; margin-top: 1.25rem; width: 100%; text-align: center; }
      .btn-white:hover { background: #e8f4ef; }
      @media (max-width: 820px) { .contact-inner { grid-template-columns: 1fr; gap: 2rem; } .form-row { grid-template-columns: 1fr; } }

      /* ── BOOK APPOINTMENT PAGE FORM STYLES ── */
      .book-page-wrap .form-wrap { background: #f8fafb; border: 1px solid var(--border); padding: 1.5rem; }
      .book-page-wrap .form-group label { font-size: 0.78rem; color: var(--text); font-weight: 500; }
      .book-page-wrap .form-group input, 
      .book-page-wrap .form-group select { 
        background: #fff; 
        border: 1px solid var(--border); 
        border-radius: 8px; 
        padding: 0.6rem 0.875rem; 
        font-size: 0.875rem; 
        color: var(--text); 
        outline: none; 
        transition: border-color 0.2s; 
        font-family: var(--font-body); 
        appearance: none; 
        -webkit-appearance: none; 
      }
      .book-page-wrap .form-group input::placeholder { color: var(--text-muted); }
      .book-page-wrap .form-group input:focus, 
      .book-page-wrap .form-group select:focus { border-color: var(--green); }
      .book-page-wrap .form-group select option { background: #fff; color: var(--text); }
      .book-page-wrap .btn-white { display: inline-block; background: var(--green); color: #fff; text-decoration: none; padding: 0.8rem 2rem; border-radius: 10px; font-size: 0.9rem; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; margin-top: 1.25rem; width: 100%; text-align: center; }
      .book-page-wrap .btn-white:hover { background: var(--green-dark); }

      /* ── BOOK APPOINTMENT CTA (shared banner) ── */
      .book-cta-section { background: linear-gradient(135deg, #0e4530 0%, #1a6b4a 100%); padding: 3rem 2rem; text-align: center; display: flex; align-items: center; justify-content: center; }
      .book-cta-title { font-family: var(--font-display); font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 700; color: #fff; line-height: 1.25; margin-bottom: 0.75rem; }
      .book-cta-title em { font-style: italic; color: #a3e8c5; }
      .book-cta-sub { font-size: 0.95rem; color: rgba(255,255,255,0.72); line-height: 1.7; margin-bottom: 2rem; max-width: 520px; margin-left: auto; margin-right: auto; }
      .book-cta-actions { display: flex; gap: 0.875rem; justify-content: center; flex-wrap: wrap; }
      .btn-cta-outline { background: transparent; color: #fff; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-size: 0.9rem; font-weight: 500; border: 1.5px solid rgba(255,255,255,0.45); cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; transition: all 0.2s; }
      .btn-cta-outline:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.75); }

      /* ── FOOTER ── */
      .site-footer { background: #0a1f17; color: rgba(255,255,255,0.65); padding: 3.5rem 2rem 2rem; }
      .footer-inner { max-width: var(--max-w); margin: 0 auto; display: grid; grid-template-columns: 1.6fr 1.4fr 1fr 1fr; gap: 2.5rem; padding-bottom: 2.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
      .footer-brand-name { font-family: var(--font-display); font-size: 1.2rem; color: #fff; margin-bottom: 0.25rem; }
      .footer-brand-sub { font-size: 0.72rem; color: rgba(255,255,255,0.45); margin-bottom: 0.9rem; letter-spacing: 0.04em; }
      .footer-about { font-size: 0.82rem; line-height: 1.75; color: rgba(255,255,255,0.5); margin-bottom: 0; }
      .footer-col h4 { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 1rem; }
      .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 0.55rem; }
      .footer-col li a { font-size: 0.83rem; color: rgba(255,255,255,0.6); text-decoration: none; transition: color 0.2s; }
      .footer-col li a:hover { color: #fff; }
      .footer-social-row { display: flex; flex-direction: column; gap: 0.5rem; }
      .footer-social-link { display: flex; align-items: center; gap: 0.6rem; padding: 0.4rem 0.625rem; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); text-decoration: none; font-size: 0.8rem; font-weight: 500; transition: all 0.2s; }
      .footer-social-link:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.2); color: #fff; }
      .footer-social-dot { width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
      .footer-bottom { max-width: var(--max-w); margin: 2rem auto 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; font-size: 0.75rem; color: rgba(255,255,255,0.3); }
      @media (max-width: 900px) { .footer-inner { grid-template-columns: 1fr 1fr; gap: 2rem; } }
      @media (max-width: 480px) { .footer-inner { grid-template-columns: 1fr; } .public-site section { padding: 3rem 0; } .book-cta-section { padding: 3rem 1.5rem; } }

      /* ── PAGE BACK NAV ── */
      .page-back { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--green); font-size: 0.85rem; font-weight: 500; text-decoration: none; padding: 0.4rem 0; transition: gap 0.2s; }
      .page-back:hover { gap: 0.65rem; }
      .page-hero-band { background: linear-gradient(135deg, #f0faf5 0%, #e8f5ee 100%); padding: 2rem 2rem 2.5rem; border-bottom: 1px solid var(--border); }
      .page-hero-inner { max-width: var(--max-w); margin: 0 auto; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
  return null;
}

/* ═══════════════════════════════════════════════════════════
   SHARED: BOOK APPOINTMENT CTA BANNER
   (appears on every inner page before the footer)
═══════════════════════════════════════════════════════════ */
function BookAppointmentCTA() {
  const { data: contactData } = useQuery({
    queryKey: ['public', 'contact'],
    queryFn: () => publicApi.getContact().then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
  });
  const phone = contactData?.phone ?? "9205407127";
  const whatsapp = contactData?.whatsapp ?? "919205407127";

  return (
    <div className="book-cta-section">
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <span style={{ display: "inline-block", fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.1)", padding: "0.3rem 0.75rem", borderRadius: 20, marginBottom: "1rem" }}>
          Ready to Consult?
        </span>
        <h2 className="book-cta-title">
          Book Your <em>Appointment</em> Today
        </h2>
        <p className="book-cta-sub">
          Consult Dr. Neha Sood at BLK-MAX Super Speciality Hospital, Delhi or Pro Health Specialists, Gurugram. Same-day appointments often available.
        </p>
        <div className="book-cta-actions">
          <a className="btn-white" href="/book-appointment">Book Appointment</a>
          <a className="btn-cta-outline" href={`tel:${phone}`}>{phone}</a>
          <a className="btn-cta-outline" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
      </div>
    </div>
  );
}

/* ─── Real SVG brand icons for social platforms ─────────────────────────── */
function SocialIcon({ platform, size = 16 }: { platform: string; size?: number }) {
  const p = platform.toLowerCase();
  if (p.includes("youtube")) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/>
    </svg>
  );
  if (p.includes("instagram")) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3c1.2-.1 1.6-.1 4.8-.1zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1.0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/>
    </svg>
  );
  if (p.includes("facebook")) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1C0 18.1 4.4 23.1 10.1 24v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.7 4.6-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.2h3.3l-.5 3.5H14v8.4C19.6 23.1 24 18.1 24 12.1z"/>
    </svg>
  );
  if (p.includes("linkedin")) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.4 20.4h-3.4v-5.3c0-1.3 0-2.9-1.8-2.9-1.8 0-2 1.4-2 2.8v5.4H9.8V9h3.3v1.5h.1c.5-.9 1.6-1.8 3.3-1.8 3.5 0 4.1 2.3 4.1 5.3v6.4zM5.3 7.4a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm1.7 13H3.6V9h3.4v11.4zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6C0 23.2.8 24 1.8 24h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"/>
    </svg>
  );
  if (p.includes("twitter") || p.includes("x")) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 1h3.7l-8 9.1L24 23h-7.4l-5.8-7.5L4.5 23H.8l8.6-9.8L0 1h7.6l5.2 6.9L18.9 1zm-1.3 19.8h2L6.5 3.1H4.3L17.6 20.8z"/>
    </svg>
  );
  // Generic fallback
  return <span style={{ fontSize: "0.65rem", fontWeight: 800 }}>{platform.slice(0,2).toUpperCase()}</span>;
}

/* ═══════════════════════════════════════════════════════════
   SHARED: SITE FOOTER
═══════════════════════════════════════════════════════════ */
function SiteFooter() {
  const { data: contactData } = useQuery({
    queryKey: ['public', 'contact'],
    queryFn: () => publicApi.getContact().then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
  });
  const { data: socialData } = useQuery({
    queryKey: ['public', 'social'],
    queryFn: () => publicApi.getSocial().then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

  const phone = contactData?.phone ?? "9205407127";
  const email = contactData?.email ?? "prohealthspecialists114@gmail.com";
  const whatsapp = contactData?.whatsapp ?? "919205407127";
  const liveSocial: typeof STATIC_SOCIAL = socialData?.platforms ?? null;
  const socialPlatforms = (liveSocial ?? STATIC_SOCIAL).filter((s: any) => s.show !== false && (s.url || s.href));

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Brand */}
        <div>
          <div className="footer-brand-name">Dr. Neha Sood</div>
          <div className="footer-brand-sub">ENT &amp; Cochlear Implant Specialist</div>
          <p className="footer-about">Director, ENT &amp; Cochlear Implant — BLK-MAX Super Speciality Hospital, Delhi. 20+ years of trusted ENT care across Delhi and Gurugram.</p>
        </div>

        {/* Social */}
        <div className="footer-col">
          <h4>Follow Dr. Neha Sood</h4>
          <div className="footer-social-row">
            {socialPlatforms.map((s: any) => {
              const href = s.url ?? s.href;
              const color = s.color ?? "#0b6b4e";
              const label = s.label ?? s.platform ?? "Social";
              return (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="footer-social-link"
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = color + "22"; (e.currentTarget as HTMLAnchorElement).style.borderColor = color + "66"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <span className="footer-social-dot" style={{ background: color, color: "#fff" }}>
                    <SocialIcon platform={label} size={13} />
                  </span>
                  {label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            {[["About", "/about"], ["Services", "/services"], ["Gallery", "/gallery"], ["Articles", "/articles"]].map(([l, h]) =>
              <li key={l}><Link to={h}>{l}</Link></li>
            )}
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><a href={`tel:${phone}`}>{phone}</a></li>
            <li><a href={`mailto:${email}`}>Email Us</a></li>
            <li><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Dr. Neha Sood. All rights reserved.</span>
        <span>Designed with care for patient accessibility</span>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════ */
function PublicNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <nav>
        <Link className="nav-brand" to="/" style={{ textDecoration: "none" }}>
          <img src="/logo updated.png" alt="Dr. Neha Sood" className="nav-logo"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div>
            <div className="nav-brand-main">Dr. Neha Sood</div>
            <div className="nav-brand-sub">ENT &amp; Cochlear Implant Specialist</div>
          </div>
        </Link>

        <div className="nav-links">
          <Link to="/about">About</Link>
          <Link to="/services">Specialities</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/articles">Articles</Link>
        </div>

        <Link className="nav-cta" to="/book-appointment">Book Appointment</Link>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)}>
        <Link to="/about">About</Link>
        <Link to="/services">Specialities</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/articles">Articles</Link>
        <Link to="/book-appointment">Book Appointment</Link>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════ */
function HomePage() {

  const { data: articlesData } = useQuery({
    queryKey: ['public', 'posts'],
    queryFn: () => publicApi.getPosts({ limit: 6, status: 'published' }).then(r => r.data.data as any[]),
    staleTime: 1000 * 60 * 2,
  });
  const { data: clinicsData } = useQuery({
    queryKey: ['public', 'clinics'],
    queryFn: () => publicApi.getClinics().then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
  });
  const { data: contactData } = useQuery({
    queryKey: ['public', 'contact'],
    queryFn: () => publicApi.getContact().then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
  });
  const { data: socialData } = useQuery({
    queryKey: ['public', 'social'],
    queryFn: () => publicApi.getSocial().then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
  });
  const { data: faqsData } = useQuery({
    queryKey: ['public', 'faqs'],
    queryFn: () => publicApi.getFaqs().then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

  // Merge DB posts with static ARTICLES; DB posts first, then static
  const liveArticles: any[] = [...(articlesData ?? []), ...ARTICLES].slice(0, 6);
  const liveClinics = clinicsData?.clinics ?? null;
  const phone = contactData?.phone ?? "9205407127";
  const email = contactData?.email ?? "prohealthspecialists114@gmail.com";
  const whatsapp = contactData?.whatsapp ?? "919205407127";
  const liveSocial: typeof STATIC_SOCIAL = socialData?.platforms ?? null;
  const socialPlatforms = (liveSocial ?? STATIC_SOCIAL).filter((s: any) => s.show !== false && (s.url || s.href));

  return (
    <>
      {/* ── HERO ──────────────────────────────────── */}
      <section id="hero">
        <div className="hero-inner">
          <div>
            <span className="eyebrow">Centre of Excellence</span>
            <h1 className="hero-title">Expert <em>ENT Care</em><br />&amp; Cochlear Implantation</h1>
            <p className="hero-sub">20+ years of healing ears, noses and throats. Director of ENT &amp; Cochlear Implant at BLK-MAX Super Speciality Hospital, Delhi.</p>
            <div className="hero-actions">
              <a className="btn-primary" href="/book-appointment">Book Appointment</a>
              <Link className="btn-ghost" to="/about">Meet the Doctor</Link>
            </div>
            <div className="hero-stats">
              {[["20+", "Years Experience"], ["5000+", "Cochlear Implants"], ["2", "Clinic Locations"]].map(([n, l]) => (
                <div className="stat-card" key={l}><div className="stat-num">{n}</div><div className="stat-lbl">{l}</div></div>
              ))}
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-img-wrap">
              <img src="https://www.drnehasood.in/images/Banner_1.png" alt="Dr Neha Sood"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://www.drnehasood.in/images/nehasood.png"; }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────── */}
      <section id="about" style={{ background: "#fff" }}>
        <div className="about-inner">
          <div className="about-photo">
            <img src="https://www.drnehasood.in/images/nehasood.png" alt="Dr Neha Sood"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div>
            <span className="eyebrow">Meet Our Doctor</span>
            <h2 className="section-title">Dr. Neha Sood</h2>
            <p className="about-body">An accomplished ENT surgeon with over two decades of experience treating all ear, nose, and throat related ailments. Currently serving as Director — ENT &amp; Cochlear Implant at BLK-MAX Super Speciality Hospital, Delhi, Dr. Sood is deeply empathetic toward her patients and guides them through every step of treatment.</p>
            <div className="cred-list">
              {[
                "Served as ENT Surgeon at Rashtrapati Bhawan and Consultant at Sri Ganga Ram Hospital, Primus Hospital & Sita Ram Bhartia Hospital",
                "Fellowship trained at University of Freiburg, Germany and UPMC, USA for endoscopic skull base surgeries",
                "Co-authored research papers on sleep apnoea, breathing problems in children, and other ENT conditions",
              ].map((c, i) => (
                <div className="cred" key={i}><div className="cred-dot" /><span>{c}</span></div>
              ))}
            </div>
            <Link className="btn-primary" to="/about">Full Profile</Link>
          </div>
        </div>
      </section>

      {/* ── CLINIC FACILITY ───────────────────────── */}
      <section id="facility">
        <div className="facility-inner">
          <div>
            <span className="eyebrow">Our Facility</span>
            <h2 className="section-title">About Pro Health <em>Specialists</em></h2>
            <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.8, marginTop: "0.75rem" }}>
              State-of-the-art ENT clinic equipped with advanced diagnostic and treatment facilities. Our modern facility provides comprehensive care for all ear, nose, and throat conditions in a comfortable and patient-friendly environment.
            </p>

            <div className="facility-info-card">
              <div className="facility-info-header">
                <div className="facility-logo">
                  <img src="/logo updated.png" alt="Pro Health Specialists"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div>
                  <div className="facility-info-name">Pro Health Specialists</div>
                  <div className="facility-info-sub">Advanced ENT Care Center</div>
                </div>
              </div>
              <div className="facility-address">
                <strong>First Floor, M3M Urbana, R4/114,</strong><br />
                Ramgarh, Sector 67, Gurugram, Haryana 122002
              </div>
              <div className="facility-timings-label">OPD Timings:</div>
              <div className="facility-timings">
                <strong style={{ fontStyle: "normal" }}>Monday:</strong> 10:30 AM – 2:30 PM<br />
                <strong style={{ fontStyle: "normal" }}>Monday – Saturday:</strong> 5:00 PM – 7:00 PM<br />
                <em>Sunday: Closed</em>
              </div>
              <div className="facility-actions">
                <a className="btn-primary"
                  href="https://www.google.com/maps?q=M3M+Urbana+Sector+67+Gurugram"
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "0.85rem", padding: "0.55rem 1.1rem" }}>
                  Get Directions
                </a>
                <a className="btn-ghost" href={`tel:${phone}`}
                  style={{ fontSize: "0.85rem", padding: "0.55rem 1.1rem" }}>
                  Call Clinic
                </a>
              </div>
            </div>
          </div>

          <div className="facility-photo-wrap">
            <img src="/doctortwo.png" alt="Pro Health Specialists Clinic"
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
            <div className="facility-photo-caption">
              <div className="facility-photo-caption-title">Modern ENT Facility</div>
              <div className="facility-photo-caption-sub">Advanced diagnostic and treatment equipment</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────── */}
      <section id="services">
        <div className="section-inner">
          <span className="eyebrow">Advanced Care</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Specialized ENT <em>Treatments</em></h2>
            <Link className="btn-ghost" to="/services" style={{ fontSize: "0.85rem", padding: "0.55rem 1.1rem" }}>View All Specialities</Link>
          </div>
          {/* Only the 5 image-backed services, one centred row */}
          <div style={{ display: "flex", gap: "1.1rem", justifyContent: "center" }}>
            {SERVICES.filter(s => s.img).map((s) => (
              <Link className="service-card" key={s.name} to={`/services`}
                style={{ textDecoration: "none", flex: "1 1 0", minWidth: 0, maxWidth: 220 }}>
                <img src={s.img} alt={s.name} className="service-img"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div className="service-body">
                  <div className="service-name">{s.name}</div>
                  <div className="service-desc">{s.desc}</div>
                  <span className="service-link">Learn more</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────── */}
      <section id="testimonials">
        <div className="section-inner" style={{ textAlign: "center" }}>
          <span className="eyebrow">Patient Stories</span>
          <h2 className="section-title" style={{ textAlign: "center" }}>What Our Patients Say</h2>
          <div style={{ marginTop: "1.25rem", display: "flex", gap: "1.25rem", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { src: "/media/videos/Testimonial1.mp4", name: "Parent of 5-year-old patient", desc: "Dr. Sood's expertise in cochlear implants transformed my child's life." },
              { src: "/media/videos/Testimonial2.mp4", name: "Business Executive, Gurugram", desc: "Advanced treatment gave permanent relief from sinus issues." },
              { src: "/media/videos/Testimonial3.mp4", name: "Classical Singer", desc: "Voice treatment restored my singing ability." },
            ].map((v, i) => (
              <div className="video-card" key={i} style={{ flex: "0 0 300px" }}>
                <video src={v.src} controls muted playsInline />
                <div className="video-card-body"><div className="video-card-name">{v.name}</div><div className="video-card-desc">{v.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARTICLES ──────────────────────────────── */}
      <section id="blog" style={{ background: "#fff" }}>
        <div className="section-inner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "1.75rem" }}>
            <div><span className="eyebrow">Education</span><h2 className="section-title" style={{ marginBottom: 0 }}>Latest Articles</h2></div>
            <Link className="btn-ghost" to="/articles">View All</Link>
          </div>
          <ScrollRow>
            {liveArticles.map((a: any, idx: number) => (
              <a className="article-card" key={a.id ?? a.href ?? idx} href={a.href ?? `/articles/${a.slug}`}
                target={a.href ? "_blank" : undefined} rel={a.href ? "noopener noreferrer" : undefined}
                download={a.download ? "" : undefined}>
                <span className="article-tag">{a.tag ?? a.category ?? "Article"}</span>
                <div className="article-title">{a.title}</div>
                <div className="article-excerpt">{a.excerpt}</div>
                <div className="article-read">{a.download ? "Download ↓" : "Read article →"}</div>
              </a>
            ))}
          </ScrollRow>
        </div>
      </section>

      {/* ── CLINICS ───────────────────────────────── */}
      <section id="clinics">
        <div className="section-inner">
          <span className="eyebrow">Find Us</span>
          <h2 className="section-title">Clinic Locations</h2>
          <div className="clinics-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.75rem" }}>
            {(liveClinics ?? [
              { tag: "Gurugram", name: "Pro Health Specialists", detail: "First Floor, M3M Urbana, R4/114\nSector 67, Gurugram, Haryana 122002\n\nMon: 10:30 AM – 2:30 PM\nMon–Sat: 5:00 PM – 7:00 PM", mapUrl: "https://maps.google.com/?q=M3M+Urbana+Sector+67+Gurugram" },
              { tag: "New Delhi", name: "BLK-Max Super Speciality Hospital", detail: "Pusa Road, Rajendra Place\nNew Delhi – 110005\n\nWed, Thu, Sat: 10 AM – 3 PM\nTue, Fri: By appointment", mapUrl: "https://maps.google.com/?q=BLK+Max+Hospital+Pusa+Road+Delhi" },
            ]).map((c: any) => (
              <div className="clinic-card" key={c.name}>
                <span className="clinic-tag">{c.tag ?? c.city}</span>
                <div className="clinic-name">{c.name}</div>
                <div className="clinic-detail">
                  {(c.detail ?? c.address ?? "").split("\n").map((line: string, i: number) =>
                    line === "" ? <br key={i} /> : <span key={i}>{line}<br /></span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                  {(c.mapUrl ?? c.mapsUrl) && (
                    <a className="clinic-map-btn" href={c.mapUrl ?? c.mapsUrl} target="_blank" rel="noopener noreferrer">Open in Maps</a>
                  )}
                  <a className="btn-primary" href="/book-appointment" style={{ fontSize: "0.82rem", padding: "0.45rem 1rem" }}>Book Appointment</a>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.875rem" }}>
            <a className="btn-primary" href={`tel:${phone}`}>{phone}</a>
            <a className="btn-ghost" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </div>
      </section>

      {/* ── FAQs ──────────────────────────────────── */}
      <section id="faqs" style={{ background: "#fff" }}>
        <div className="section-inner">
          <div className="faq-inner">
            <span className="eyebrow">Common Questions</span>
            <h2 className="section-title" style={{ textAlign: "center" }}>Frequently Asked Questions</h2>
            <div style={{ marginTop: "1.75rem" }}>{(faqsData?.home?.length ? faqsData.home : FAQS).map((f: any) => <FaqItem key={f.q} q={f.q} a={f.a} />)}</div>
          </div>
        </div>
      </section>

      {/* ── CONTACT INFO ──────────────────────────── */}
      <section id="contact" style={{ background: "var(--green-dark, #063d2c)" }}>
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "3.5rem 2rem", display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: "0.75rem" }}>Contact Us</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, color: "#fff", margin: "0 0 0.5rem" }}>Ready to Book an Appointment?</h2>
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", margin: 0 }}>Reach us by phone, email, or WhatsApp — or use our online booking form.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1.25rem" }}>
              <a href={`tel:${phone}`} style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem", textDecoration: "none" }}>{phone}</a>
              <a href={`mailto:${email}`} style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem", textDecoration: "none" }}>{email}</a>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem", textDecoration: "none" }}>WhatsApp</a>
            </div>
          </div>
          <a href="/book-appointment" style={{ display: "inline-block", background: "#fff", color: "var(--green)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem", padding: "0.75rem 1.75rem", borderRadius: "var(--radius)", textDecoration: "none", whiteSpace: "nowrap" }}>Book Appointment</a>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────── */}
      <SiteFooter />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ABOUT PAGE
═══════════════════════════════════════════════════════════ */
function AboutPage() {
  return (
    <>
      {/* Page hero with back nav */}
      <div style={{ paddingTop: 68 }}>
        <div className="page-hero-band">
          <div className="page-hero-inner">
            <Link to="/" className="page-back">← Back to Home</Link>
            <span className="eyebrow" style={{ marginTop: "0.75rem" }}>About</span>
            <h1 className="section-title">Dr. Neha Sood</h1>
          </div>
        </div>

        {/* Bio */}
        <section style={{ background: "#fff" }}>
          <div className="about-inner">
            <div className="about-photo">
              <img src="https://www.drnehasood.in/images/nehasood.png" alt="Dr Neha Sood"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <div>
              <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.85, marginBottom: "1.25rem" }}>
                Dr. Neha Sood is a highly accomplished ENT surgeon with over two decades of clinical experience. She currently serves as <strong>Director of ENT &amp; Cochlear Implant</strong> at BLK-MAX Super Speciality Hospital, New Delhi — one of India's premier tertiary care centres.
              </p>
              <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.85, marginBottom: "1.5rem" }}>
                She has performed over <strong>5,000 cochlear implant surgeries</strong>, making her one of the most experienced cochlear implant surgeons in India. Her expertise spans voice disorders, functional endoscopic sinus surgery, skull base surgery, snoring and sleep apnea, and comprehensive paediatric ENT care.
              </p>
              <div className="cred-list">
                {[
                  "MBBS, MS (ENT) — Lady Hardinge Medical College, New Delhi",
                  "Fellowship in Endoscopic Skull Base Surgery — University of Freiburg, Germany",
                  "Advanced Training — UPMC, Pittsburgh, USA",
                  "Former ENT Surgeon at Rashtrapati Bhawan",
                  "Senior Consultant: Sri Ganga Ram Hospital, Primus Hospital & Sita Ram Bhartia Hospital",
                  "Co-authored peer-reviewed papers on sleep apnoea, paediatric breathing disorders & ENT innovations",
                ].map((c, i) => (
                  <div className="cred" key={i}><div className="cred-dot" /><span>{c}</span></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Expertise highlights */}
        <section style={{ background: "var(--bg)" }}>
          <div className="section-inner">
            <span className="eyebrow">Areas of Excellence</span>
            <h2 className="section-title">Clinical Expertise</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
              {[
                { title: "Cochlear Implants", body: "5,000+ surgeries. Candidacy evaluation, programming and full rehabilitation support." },
                { title: "Voice & Larynx", body: "Microsurgery, laser ablation and injection augmentation for vocal cord pathology." },
                { title: "Endoscopic Skull Base", body: "Fellowship-trained in complex FESS and endonasal approaches to the skull base." },
                { title: "Sleep Medicine", body: "Comprehensive OSA workup and personalised medical or surgical management." },
                { title: "Paediatric ENT", body: "Gentle care for children — from ear infections to paediatric cochlear implants." },
                { title: "Laser Surgery", body: "CO₂ and KTP laser for bloodless day-care procedures of the upper aerodigestive tract." },
              ].map((item) => (
                <div key={item.title} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--text)", marginBottom: "0.5rem" }}>{item.title}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.7 }}>{item.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <BookAppointmentCTA />
      <SiteFooter />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   SPECIALITIES LISTING PAGE  (/services)
═══════════════════════════════════════════════════════════ */
function ServicesPage() {
  return (
    <>
      <div style={{ paddingTop: 68 }}>
        <div className="page-hero-band">
          <div className="page-hero-inner">
            <Link to="/" className="page-back">← Back to Home</Link>
            <span className="eyebrow" style={{ marginTop: "0.75rem" }}>Expert Care</span>
            <h1 className="section-title">Our <em>Specialities</em></h1>
            <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.75, maxWidth: 600, marginTop: "0.5rem" }}>
              Dr. Neha Sood and her team at Pro Health Specialists provide comprehensive diagnosis and treatment across a full range of ENT conditions.
            </p>
          </div>
        </div>

        <section style={{ background: "var(--bg)" }}>
          <div className="section-inner">
            <div className="spec-list-grid">
              {SPECIALITIES.map(s => (
                <Link key={s.slug} to={`/speciality/${s.slug}`} className="spec-card">
                  <div className="spec-card-name">{s.name}</div>
                  <div className="spec-card-desc">{s.tagline}</div>
                  <span className="spec-card-cta">Learn more →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      <BookAppointmentCTA />
      <SiteFooter />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   SPECIALITY DETAIL PAGE  (/speciality/:slug)
═══════════════════════════════════════════════════════════ */
function SpecialityPage() {
  const { slug } = useParams<{ slug: string }>();
  const spec = SPECIALITIES.find(s => s.slug === slug);

  if (!spec) return <Navigate to="/services" replace />;

  return (
    <>
      <div style={{ paddingTop: 68 }}>
        <div className="page-hero-band">
          <div className="page-hero-inner">
            <Link to="/services" className="page-back">Back to Specialities</Link>
            <h1 className="section-title">{spec.name}</h1>
            <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 640, marginTop: "0.5rem" }}>
              {spec.tagline}
            </p>
          </div>
        </div>

        <section style={{ background: "var(--bg)" }}>
          <div className="section-inner">
            <div className="spec-detail-wrap">
              <div className="spec-overview">{spec.overview}</div>

              {spec.sections.map((sec, i) => (
                <div className="spec-section" key={i}>
                  <div className="spec-section-title">{sec.title}</div>
                  {sec.items && (
                    <ul className="spec-list">
                      {sec.items.map((item, j) => <li key={j}>{item}</li>)}
                    </ul>
                  )}
                  {sec.cards && (
                    <div className="spec-treatment-grid">
                      {sec.cards.map((card, j) => (
                        <div className="spec-treatment-card" key={j}>
                          <div className="spec-treatment-name">{card.name}</div>
                          <div className="spec-treatment-desc">{card.desc}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div style={{ marginTop: "2rem", display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>
                <a className="btn-primary" href="/book-appointment">Book a Consultation</a>
                <Link className="btn-ghost" to="/services">View All Specialities</Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <BookAppointmentCTA />
      <SiteFooter />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   GALLERY PAGE
═══════════════════════════════════════════════════════════ */
function GalleryPage() {
  const [tab, setTab] = useState<"gallery" | "video" | "news">("gallery");

  const CATEGORY_MAP: Record<string, string> = {
    gallery: "Gallery Photos",
    video:   "Videos",
    news:    "News Clippings",
  };

  const { data: mediaData } = useQuery({
    queryKey: ['public', 'media', tab],
    queryFn: () => publicApi.getMedia({
      category: CATEGORY_MAP[tab],
      limit: 100,
    }).then(r => r.data.data as any[]),
    staleTime: 1000 * 60 * 2,
  });

  // mediaData is used directly in the grid below (preserves .type for video detection)

  return (
    <>
      <div style={{ paddingTop: 68 }}>
        <div className="page-hero-band">
          <div className="page-hero-inner">
            <Link to="/" className="page-back">← Back to Home</Link>
            <span className="eyebrow" style={{ marginTop: "0.75rem" }}>Media</span>
            <h1 className="section-title">Gallery</h1>
          </div>
        </div>

        <section style={{ background: "#fff" }}>
          <div className="section-inner">
            <div className="gallery-tabs">
              {(["gallery", "video", "news"] as const).map((k) => (
                <button key={k} className={`gtab${tab === k ? " active" : ""}`} onClick={() => setTab(k)}>
                  {k === "gallery" ? "Gallery Photos" : k === "video" ? "Video Gallery" : "News Clippings"}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
              {(mediaData && mediaData.length > 0 ? mediaData : (tab === "video" ? VIDEO_GALLERY : CLINIC_PHOTOS).map((src: string) => ({ originalUrl: src, thumbnailUrl: src, type: tab === "video" ? "video" : "image", altText: "" }))).map((m: any, i: number) => {
                const src = m.originalUrl || m.thumbnailUrl || m;
                const isVideo = m.type === "video";
                return isVideo ? (
                  <a key={i} href={src} target="_blank" rel="noopener noreferrer"
                    style={{ borderRadius: 12, overflow: "hidden", background: "var(--green-light)", display: "block", aspectRatio: "16/9", position: "relative" }}>
                    <video src={src} muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "rgba(26,107,74,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>▶</div>
                    </div>
                  </a>
                ) : (
                  <a key={i} href={src} target="_blank" rel="noopener noreferrer"
                    className="gallery-thumb" style={{ flex: "none", width: "100%" }}>
                    <img src={src} alt={m.altText || "Gallery"} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <div className="gallery-overlay"><div className="gallery-overlay-icon">↗</div></div>
                  </a>
                );
              })}
              {/* PDF news clippings always shown in news tab */}
              {tab === "news" && STATIC_PDF_NEWS.map((pdf, i) => (
                <a key={`pdf-${i}`} href={pdf.href} target="_blank" rel="noopener noreferrer" className="pdf-card" download={false}>
                  <div className="pdf-card-icon" style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--green)" }}>PDF</div>
                  <div className="pdf-card-name">{pdf.name}</div>
                  <div className="pdf-card-action">Open</div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>

      <BookAppointmentCTA />
      <SiteFooter />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLES LISTING PAGE
═══════════════════════════════════════════════════════════ */
function tiptapToHtml(content: any): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  function nodeToHtml(node: any): string {
    const c = (node.content || []).map(nodeToHtml).join('')
    switch (node.type) {
      case 'doc': return c
      case 'paragraph': return `<p>${c}</p>`
      case 'heading': return `<h${node.attrs?.level ?? 2}>${c}</h${node.attrs?.level ?? 2}>`
      case 'bulletList': return `<ul>${c}</ul>`
      case 'orderedList': return `<ol>${c}</ol>`
      case 'listItem': return `<li>${c}</li>`
      case 'blockquote': return `<blockquote>${c}</blockquote>`
      case 'codeBlock': return `<pre><code>${c}</code></pre>`
      case 'horizontalRule': return '<hr/>'
      case 'hardBreak': return '<br/>'
      case 'text': {
        let t = (node.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        for (const m of (node.marks || [])) {
          if (m.type === 'bold') t = `<strong>${t}</strong>`
          else if (m.type === 'italic') t = `<em>${t}</em>`
          else if (m.type === 'underline') t = `<u>${t}</u>`
          else if (m.type === 'strike') t = `<s>${t}</s>`
          else if (m.type === 'link') t = `<a href="${m.attrs?.href ?? ''}">${t}</a>`
        }
        return t
      }
      default: return c
    }
  }
  return nodeToHtml(content)
}

function ArticlesPage() {
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['public', 'posts', 'articles-list'],
    queryFn: () => publicApi.getPosts({ status: 'published', limit: 50 }).then(r => r.data.data as any[]),
    staleTime: 1000 * 60 * 2,
  });

  // DB posts first; append static articles whose slug isn't already in DB
  const dbSlugs = new Set((postsData ?? []).map((p: any) => p.slug));
  const staticOnly = ARTICLES.filter(a => !dbSlugs.has(a.slug)).map(a => ({
    slug: a.slug, title: a.title, category: a.tag, excerpt: a.excerpt,
  }));
  const allArticles: any[] = [...(postsData ?? []), ...staticOnly];

  return (
    <>
      <div style={{ paddingTop: 68 }}>
        <div className="page-hero-band">
          <div className="page-hero-inner">
            <Link to="/" className="page-back">Back to Home</Link>
            <span className="eyebrow" style={{ marginTop: "0.75rem" }}>Education</span>
            <h1 className="section-title">Articles &amp; Resources</h1>
          </div>
        </div>

        <section style={{ background: "#fff" }}>
          <div className="section-inner">
            {isLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="article-card" style={{ background: "var(--bg)" }}>
                    <div className="skeleton" style={{ height: "20px", width: "80px", borderRadius: "20px", marginBottom: "0.75rem" }} />
                    <div className="skeleton" style={{ height: "24px", width: "100%", marginBottom: "0.5rem" }} />
                    <div className="skeleton" style={{ height: "16px", width: "100%", marginBottom: "0.25rem" }} />
                    <div className="skeleton" style={{ height: "16px", width: "85%" }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
                {allArticles.map((a: any, idx: number) => (
                  <Link 
                    className="article-card" 
                    key={a.id ?? a.slug ?? idx} 
                    to={a.slug ? `/articles/${a.slug}` : a.href} 
                    style={{ textDecoration: "none" }}
                    target={a.href ? "_blank" : undefined}
                    rel={a.href ? "noopener noreferrer" : undefined}
                  >
                    <span className="article-tag">{a.tag ?? a.category ?? "Article"}</span>
                    <div className="article-title">{a.title}</div>
                    <div className="article-excerpt">{a.excerpt}</div>
                    <div className="article-read">View full article</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <BookAppointmentCTA />
      <SiteFooter />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE DETAIL PAGE
═══════════════════════════════════════════════════════════ */
function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  // Always try DB first
  const { data: postData, isLoading: postLoading, isError: postError } = useQuery({
    queryKey: ['public-post', slug],
    queryFn: () => publicApi.getPost(slug!).then(r => r.data.data),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
    retry: 0,
  });

  // Fall back to static docx only if DB returns nothing
  const { data: docxData, isLoading: docxLoading } = useQuery({
    queryKey: ['article-docx', slug],
    queryFn: () => publicApi.getArticle(slug!).then(r => r.data.data),
    enabled: !!slug && !postLoading && !postData,
    staleTime: 1000 * 60 * 10,
    retry: 0,
  });

  const isLoading = postLoading || (!postData && docxLoading);

  // Resolve display content
  const dbPost = postData as any;
  const staticMeta = ARTICLES.find(a => a.slug === slug);

  const title = dbPost?.title ?? staticMeta?.title ?? docxData?.title ?? slug;
  const category = dbPost?.category ?? staticMeta?.tag ?? docxData?.category ?? '';
  const html = dbPost ? tiptapToHtml(dbPost.content) : (docxData as any)?.html ?? '';

  // 404: no DB record AND not a known static article
  if (!postLoading && !postData && !staticMeta && !docxData && !docxLoading) {
    return <Navigate to="/articles" replace />;
  }

  return (
    <>
      <div style={{ paddingTop: 68 }}>
        <div className="page-hero-band">
          <div className="page-hero-inner">
            <Link to="/articles" className="page-back">← Back to Articles</Link>
            <span className="eyebrow" style={{ marginTop: "0.75rem" }}>{category}</span>
            <h1 className="section-title" style={{ maxWidth: 680 }}>{title}</h1>
          </div>
        </div>

        <section style={{ background: "#fff" }}>
          <div className="section-inner">
            <div className="article-detail-wrap">
              {isLoading && (
                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "2rem 0" }}>
                  Loading article…
                </div>
              )}
              {!isLoading && !html && (
                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "2rem 0" }}>
                  Article content could not be loaded.
                </div>
              )}
              {html && (
                <div className="article-detail-body" dangerouslySetInnerHTML={{ __html: html }} />
              )}
              <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>
                <Link className="btn-primary" to="/book-appointment">Book a Consultation</Link>
                <Link className="btn-ghost" to="/articles">All Articles</Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <BookAppointmentCTA />
      <SiteFooter />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   BOOK APPOINTMENT PAGE
═══════════════════════════════════════════════════════════ */
function BookAppointmentPage() {
  const [form, setForm] = useState({ name: "", phone: "", sex: "", clinic: "", time: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const { data: contactData } = useQuery({
    queryKey: ['public', 'contact'],
    queryFn: () => publicApi.getContact().then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
  });
  const { data: clinicsData } = useQuery({
    queryKey: ['public', 'clinics'],
    queryFn: () => publicApi.getClinics().then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

  const phone = contactData?.primaryPhone ?? contactData?.phone ?? "9205407127";
  const email = contactData?.primaryEmail ?? contactData?.email ?? "prohealthspecialists114@gmail.com";
  const whatsapp = contactData?.whatsapp ?? "919205407127";
  const liveClinics = clinicsData?.items ?? clinicsData?.clinics ?? null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sending");
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientName: form.name, phone: form.phone, gender: form.sex, clinicLocation: form.clinic, preferredTime: form.time }),
      });
      if (res.ok) { setFormStatus("sent"); setForm({ name: "", phone: "", sex: "", clinic: "", time: "" }); }
      else setFormStatus("error");
    } catch { setFormStatus("error"); }
  };

  return (
    <>
      <div style={{ paddingTop: 68 }}>
        <div className="page-hero-band">
          <div className="page-hero-inner">
            <Link to="/" className="page-back">← Back to Home</Link>
            <span className="eyebrow" style={{ marginTop: "0.75rem" }}>Appointments</span>
            <h1 className="section-title">Book an <em>Appointment</em></h1>
          </div>
        </div>

        <section style={{ background: "#fff" }}>
          <div className="section-inner">
            <div className="book-page-wrap">
              {/* Left: info */}
              <div className="book-page-info">
                <h2>Get in Touch</h2>
                <p>Fill in the form and we will confirm your slot within a few hours. For urgent queries, reach us directly by phone or WhatsApp.</p>
                <div className="book-contact-list">
                  <a href={`tel:${phone}`}>{phone}</a>
                  <a href={`mailto:${email}`}>{email}</a>
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.5rem", color: "var(--text)" }}>Clinic Locations</div>
                  {(liveClinics ?? [
                    { name: "Pro Health Specialists", address: "First Floor, M3M Urbana, Sector 67, Gurugram" },
                    { name: "BLK-MAX Super Speciality Hospital", address: "Pusa Road, Rajendra Place, New Delhi" },
                  ]).map((c: any) => (
                    <div key={c.name} style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.5rem", lineHeight: 1.6 }}>
                      <strong style={{ color: "var(--text)", fontWeight: 600 }}>{c.name}</strong><br />
                      {(c.address ?? c.detail ?? "").split("\n")[0]}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: form */}
              <div className="form-wrap" style={{ borderRadius: "var(--radius)" }}>
                {formStatus === "sent" ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#fff" }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem", fontWeight: 700 }}>Done</div>
                    <div style={{ fontWeight: 500, marginBottom: "0.5rem" }}>Appointment request sent!</div>
                    <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>We will contact you shortly to confirm.</div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group"><label>Full Name</label><input required type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                      <div className="form-group"><label>Phone</label><input required type="tel" placeholder="+91 XXXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Gender</label>
                        <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
                          <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Clinic</label>
                        <select required value={form.clinic} onChange={(e) => setForm({ ...form, clinic: e.target.value })}>
                          <option value="">Select Clinic</option>
                          {(liveClinics ?? [
                            { name: "Pro Health Specialists, Gurugram" },
                            { name: "BLK-Max Hospital, Delhi" },
                          ]).map((c: any) => <option key={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Preferred Time</label>
                      <select required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
                        <option value="">Select Time Slot</option>
                        <option>10:00 AM – 11:00 AM</option><option>11:00 AM – 12:00 PM</option><option>12:00 PM – 1:00 PM</option>
                        <option>5:00 PM – 6:00 PM</option><option>6:00 PM – 7:00 PM</option>
                      </select>
                    </div>
                    {formStatus === "error" && <p style={{ color: "#ffcccc", fontSize: "0.82rem", marginTop: "0.5rem" }}>Something went wrong. Please call us directly.</p>}
                    <button className="btn-white" type="submit" disabled={formStatus === "sending"}>
                      {formStatus === "sending" ? "Sending…" : "Request Appointment"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <GlobalStyles />
      <Routes>

        {/* Admin login */}
        <Route path="/admin/login" element={
          <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Loading...</div>}>
            <LoginPage />
          </Suspense>
        } />

        {/* Protected admin routes */}
        <Route path="/admin/*" element={
          <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Loading...</div>}>
            <ProtectedRoute />
          </Suspense>
        } />

        {/* Public site */}
        <Route path="/*" element={
          <div className="public-site">
            <PublicNav />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/speciality/:slug" element={<SpecialityPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/articles" element={<ArticlesPage />} />
                <Route path="/articles/:slug" element={<ArticleDetailPage />} />
                <Route path="/book-appointment" element={<BookAppointmentPage />} />
                {/* Redirects from old routes */}
                <Route path="/conditions-treated" element={<Navigate to="/services" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        } />

      </Routes>
    </Router>
  );
}
