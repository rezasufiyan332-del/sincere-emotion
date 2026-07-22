export interface Testimonial {
  id: number
  name: string
  role: string
  avatar: string
  rating: number
  story: string
  transformation: string
  verified: boolean
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah M.',
    role: 'Marketing Manager',
    avatar: '/avatar-1.png',
    rating: 5,
    story: 'I spent eight years chasing emotionally unavailable men. I\'d meet someone aloof and distant, and something in me would think "I can fix this, I can be enough." I\'d text constantly, plan dates they\'d cancel, and feel this panic in my chest whenever they withdrew. After every breakup, I\'d blame myself. This guide showed me it wasn\'t about them being wrong or me being broken—it was my nervous system stuck in anxious attachment, seeking reassurance from people incapable of giving it. Within three weeks of the exercises, I stopped obsessing. Two months in, I met someone secure and realized what healthy actually feels like. My relationships now are calm, not chaotic.',
    transformation: 'Ended 8-year cycle of chasing unavailable partners',
    verified: true
  },
  {
    id: 2,
    name: 'Marcus T.',
    role: 'Software Engineer',
    avatar: '/avatar-2.png',
    rating: 5,
    story: 'My ex told me I was "emotionally unavailable" and I got defensive. How was I unavailable? I provided for her, I was responsible, I was "there." But I also ghosted when things got intimate, I pushed her away when she tried to get close, and I used independence like armor. The avoidant guide was uncomfortable because it made me see how I weaponized autonomy to avoid vulnerability. It asked me questions I didn\'t want to answer. But I did the work. I realized my parents\' divorce taught me that needing people meant abandonment. Now I actually let my girlfriend in. She says it\'s like she finally has the real me, not the performance.',
    transformation: 'Transformed from defensive withdrawal to genuine presence',
    verified: true
  },
  {
    id: 3,
    name: 'Emma R.',
    role: 'Business Owner',
    avatar: '/avatar-3.png',
    rating: 5,
    story: 'I couldn\'t understand why I was anxious in a relationship with a genuinely good man. He was kind, consistent, emotionally open. But I felt this constant gnawing fear he\'d leave. So I\'d monitor his moods, adjust myself to please him, ignore my own needs to keep him happy. Then I\'d resent him for not knowing what I needed without telling him. The bundle helped me see my pattern: I abandoned myself first, so I felt perpetually abandoned. Once I learned self-loyalty—saying no, expressing my needs, honoring my boundaries—everything shifted. He felt closer to me. I felt secure. It turns out the relationship was fine; I was just abandoning myself within it.',
    transformation: 'Stopped self-abandonment, became securely attached',
    verified: true
  }
]
