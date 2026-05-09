import { DOMAIN, type DomainId } from "@/lib/schemas";

export type DomainDefinition = {
  id: DomainId;
  label: string;
  shortLabel: string;
  subtitle: string;
  contributionPrompt: string;
  rubricTitle: string;
  heroLine: string;
};

export const DOMAIN_DEFINITIONS: DomainDefinition[] = [
  {
    id: "first-credit-card",
    label: "First Credit Card",
    shortLabel: "Credit",
    subtitle: "How people got their first US card, built credit, and avoided early mistakes.",
    contributionPrompt: "What worked? What didn’t? What was the move that finally clicked with your first credit card?",
    rubricTitle: "Getting Your First US Credit Card",
    heroLine: "Starting with: first credit card, for immigrants building financial footing in the US."
  },
  {
    id: "healthcare",
    label: "Healthcare",
    shortLabel: "Healthcare",
    subtitle: "Finding coverage, urgent care, clinics, and how people learned to navigate the system.",
    contributionPrompt: "What do you wish someone had told you about getting care, insurance, or finding a doctor?",
    rubricTitle: "Navigating US Healthcare as a New Immigrant",
    heroLine: "A community set of learnings for finding care, understanding coverage, and avoiding expensive surprises."
  },
  {
    id: "housing",
    label: "Housing",
    shortLabel: "Housing",
    subtitle: "Renting your first place, dealing with deposits, paperwork, guarantors, and brokers.",
    contributionPrompt: "What actually mattered when you found housing, and what trap would you help the next person avoid?",
    rubricTitle: "Finding Housing as a New Immigrant",
    heroLine: "A practical guide built from stories about leases, deposits, paperwork, and first apartments."
  },
  {
    id: "jobs",
    label: "Jobs",
    shortLabel: "Jobs",
    subtitle: "Getting the first role, reframing experience, and learning what US employers actually responded to.",
    contributionPrompt: "What helped you get traction in the job market, and what do you wish you had known earlier?",
    rubricTitle: "Finding Your First US Job",
    heroLine: "What people learned about resumes, referrals, timing, and getting that first real yes."
  },
  {
    id: "banking",
    label: "Banking",
    shortLabel: "Banking",
    subtitle: "Opening accounts, avoiding fees, sending money, and choosing the right first bank.",
    contributionPrompt: "What would you tell the next person about opening accounts, bank fees, or setting up payments?",
    rubricTitle: "Setting Up Banking in the US",
    heroLine: "How people opened accounts, avoided friction, and figured out the banking basics quickly."
  },
  {
    id: "legal-paperwork",
    label: "Legal Paperwork",
    shortLabel: "Paperwork",
    subtitle: "ID documents, SSN or ITIN, forms, appointments, and the bureaucratic steps people actually got stuck on.",
    contributionPrompt: "Which paperwork or appointment was confusing, and what would have saved you time?",
    rubricTitle: "Handling Essential Legal Paperwork",
    heroLine: "Real stories about forms, identity documents, and navigating the early bureaucratic maze."
  }
];

export const domainMap = new Map(DOMAIN_DEFINITIONS.map((domain) => [domain.id, domain]));

export function getDomainDefinition(domainId: string) {
  return domainMap.get(domainId as DomainId) ?? domainMap.get(DOMAIN)!;
}

export const domainQueries: Record<DomainId, string[]> = {
  "first-credit-card": [
    "\"first credit card\" immigrant USA reddit no credit history",
    "\"I wish I had known\" credit card new immigrant America",
    "secured credit card immigrant story experience reddit",
    "Nova Credit immigrant first credit card review",
    "building credit from scratch immigrant USA personal story",
    "ITIN credit card application experience immigrant",
    "authorized user immigrant build credit story",
    "\"moved to the US\" first credit card reddit startup immigrant",
    "\"new to America\" secured card personal story immigrant",
    "\"first credit score\" immigrant credit card forum story"
  ],
  healthcare: [
    "\"new immigrant\" healthcare experience USA reddit",
    "\"I wish I knew\" health insurance immigrant USA story",
    "immigrant first doctor visit America reddit story",
    "urgent care immigrant no insurance USA personal story",
    "marketplace insurance immigrant USA experience",
    "\"new to the US\" healthcare cost surprise story",
    "immigrant Medicaid ACA experience reddit",
    "new immigrant ER bill USA story",
    "clinic without insurance immigrant USA personal story",
    "\"first time using US healthcare\" immigrant reddit"
  ],
  housing: [
    "\"new immigrant\" renting first apartment USA reddit",
    "immigrant apartment application guarantor story USA",
    "\"I wish I knew\" renting in America immigrant story",
    "broker fee immigrant NYC apartment personal story",
    "no credit history apartment immigrant USA experience",
    "first lease immigrant USA reddit story",
    "immigrant security deposit apartment story USA",
    "newcomer roommate search USA immigrant story",
    "renting with no credit immigrant reddit",
    "landlord asked for guarantor immigrant USA story"
  ],
  jobs: [
    "\"new immigrant\" first job USA reddit story",
    "\"I wish I knew\" job search immigrant America story",
    "immigrant resume US format personal story reddit",
    "first US interview immigrant experience story",
    "getting referrals immigrant USA reddit personal story",
    "newcomer first job America forum story",
    "international experience not recognized US job immigrant story",
    "immigrant LinkedIn job search USA reddit",
    "first offer in America immigrant story",
    "new immigrant networking job search personal story"
  ],
  banking: [
    "\"new immigrant\" opening bank account USA reddit story",
    "immigrant bank fees USA personal story",
    "\"I wish I knew\" first US bank account immigrant",
    "wire transfer immigrant banking experience USA",
    "best first bank immigrant USA personal story",
    "debit card bank account immigrant reddit story",
    "newcomer checking account USA immigrant story",
    "immigrant Zelle banking issue USA story",
    "bank account without credit history immigrant reddit",
    "sending money home immigrant bank story USA"
  ],
  "legal-paperwork": [
    "\"new immigrant\" SSN appointment story reddit",
    "ITIN application immigrant experience USA personal story",
    "\"I wish I knew\" DMV immigrant paperwork story",
    "state ID immigrant USA experience reddit",
    "immigrant paperwork appointment story America forum",
    "SSN ITIN legal paperwork immigrant personal story",
    "new immigrant driver license paperwork story USA",
    "SSA office immigrant experience reddit",
    "DMV proof of address immigrant story",
    "first state ID appointment immigrant USA story"
  ]
};
