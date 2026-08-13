import { PrismaClient, Role, FeedbackStatus, Sentiment } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Acme Corp',
    },
  })
  console.log(`Created Workspace: ${workspace.name}`)

  // 2. Create Users
  // In a real app, passwords would be hashed (e.g. bcrypt). Here we use a dummy hash for demo.
  const dummyHash = 'dummy_hash_for_demo'

  const admin = await prisma.user.create({
    data: {
      name: 'Alice Admin',
      email: 'admin@acmecorp.com',
      passwordHash: dummyHash,
      role: Role.ADMIN,
      workspaceId: workspace.id,
    },
  })
  
  const analyst = await prisma.user.create({
    data: {
      name: 'Bob Analyst',
      email: 'analyst@acmecorp.com',
      passwordHash: dummyHash,
      role: Role.ANALYST,
      workspaceId: workspace.id,
    },
  })
  
  const viewer = await prisma.user.create({
    data: {
      name: 'Charlie Viewer',
      email: 'viewer@acmecorp.com',
      passwordHash: dummyHash,
      role: Role.VIEWER,
      workspaceId: workspace.id,
    },
  })
  console.log('Created Users: Admin, Analyst, Viewer')

  // 3. Create Themes
  const themes = [
    { name: 'Dashboard UI', description: 'Feedback about the dashboard look and feel', color: '#3b82f6' },
    { name: 'Export Feature', description: 'Feedback about data export functionality', color: '#10b981' },
    { name: 'Billing', description: 'Issues or questions regarding billing and invoices', color: '#ef4444' },
    { name: 'Onboarding', description: 'User experience during initial setup', color: '#f59e0b' },
    { name: 'Mobile App', description: 'Feedback specific to the mobile application', color: '#8b5cf6' },
  ]

  const createdThemes = await Promise.all(
    themes.map(t => prisma.theme.create({ data: { ...t, workspaceId: workspace.id } }))
  )
  console.log(`Created ${createdThemes.length} Themes`)

  // 4. Create Feedback (120 items)
  const channels = ['Support ticket', 'App store review', 'NPS survey', 'Sales call note', 'Community post']
  
  const templates = [
    { content: "Onboarding took forever — I couldn't figure out how to invite my team.", sentiment: Sentiment.NEG, label: "onboarding_issue" },
    { content: "The new dashboard is gorgeous and finally fast. Huge improvement.", sentiment: Sentiment.POS, label: "ui_praise" },
    { content: "It does the job, but the mobile experience needs work.", sentiment: Sentiment.NEU, label: "mobile_feedback" },
    { content: "Prospect wants SSO before they'll sign — third time this month.", sentiment: Sentiment.NEG, label: "sso_request" },
    { content: "Love the new export feature, saved me an hour today.", sentiment: Sentiment.POS, label: "export_praise" },
    { content: "Billing page keeps timing out when I try to download an invoice.", sentiment: Sentiment.NEG, label: "billing_bug" },
    { content: "Can we get a dark mode for the reports? It hurts my eyes at night.", sentiment: Sentiment.NEU, label: "feature_request" },
    { content: "Customer service was very helpful in resolving my login issue.", sentiment: Sentiment.POS, label: "support_praise" },
    { content: "I don't understand why the pricing changed without notice.", sentiment: Sentiment.NEG, label: "pricing_complaint" },
    { content: "App crashes every time I try to upload a CSV file.", sentiment: Sentiment.NEG, label: "upload_bug" },
    { content: "Really enjoying the latest update. The new charts are exactly what we needed.", sentiment: Sentiment.POS, label: "update_praise" },
    { content: "Is there a way to integrate this with Slack? Would be very useful.", sentiment: Sentiment.NEU, label: "integration_request" },
  ]

  const feedbackData = []
  const statuses = [FeedbackStatus.NEW, FeedbackStatus.REVIEWED, FeedbackStatus.ACTIONED]
  
  for (let i = 0; i < 120; i++) {
    const template = templates[i % templates.length]
    const channel = channels[i % channels.length]
    const status = statuses[i % statuses.length]
    
    // Distribute creation dates over the last 30 days
    const daysAgo = Math.floor(Math.random() * 30)
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - daysAgo)
    
    feedbackData.push({
      content: `${template.content} (ID: ${i})`,
      channel: channel,
      sourceRef: `REF-${1000 + i}`,
      customerLabel: template.label,
      sentiment: template.sentiment,
      sentimentScore: template.sentiment === Sentiment.POS ? 0.8 : (template.sentiment === Sentiment.NEG ? -0.7 : 0),
      status: status,
      createdAt: createdAt,
      workspaceId: workspace.id,
    })
  }

  await prisma.feedback.createMany({
    data: feedbackData
  })
  
  console.log(`Created 120 Feedback items`)
  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
