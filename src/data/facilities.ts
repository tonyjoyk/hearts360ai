// Facility data ported from district_summary_mobile_v2.html (source of truth).
// All 25 facilities, with names, patient counts, indicator values, deltas,
// insights, detail summaries, insight blocks, verify lists, drug stock, etc.

export type FacilityStatus =
  | "action"
  | "risk"
  | "target"
  | "stagnating"
  | "improving"
  | "top";

export type DrugStock = "low" | "partial" | "full";

export interface InsightBlock {
  title: string;
  text: string;
}

export interface Facility {
  id: string;
  name: string;
  patients: number;
  // Current values (percentages)
  bpControl: number;
  bpControlT: number; // delta vs last month, in pp
  bpUncontrolled: number;
  bpUncontrolledT?: number;
  missed3m: number;
  missed3mT?: number;
  missed12m: number;
  titration: number;
  titrationT?: number;
  statins: number;
  statinsT?: number;
  fudging: number;
  fudgingT?: number;
  drugStock: DrugStock;
  daysStock: number;
  status: FacilityStatus;
  monthsFlagged: number;
  isNew: boolean;

  cardInsights: string[];
  detailSummary: string[];
  insightBlocks: InsightBlock[];
  verify: string[];
  savedContext?: string;
}

// District-level current numbers from the HTML
export const DISTRICT = {
  month: "April 2026",
  facilityCount: 47,
  totalPatients: 42937,
  bpGoal: 63,
  // Stat tiles in the order shown in the HTML
  stats: [
    { key: "bpControl", label: "BP control", value: 54, delta: -2, goodDir: "up" as const },
    { key: "bpUncontrolled", label: "BP uncontrolled", value: 17, delta: 1, goodDir: "down" as const },
    { key: "missed", label: "Missed visit", value: 31, delta: 1, goodDir: "down" as const },
    { key: "titration", label: "Titration rate", value: 36, delta: -1, goodDir: "up" as const },
    { key: "statins", label: "Statin prescription", value: 48, delta: 1, goodDir: "up" as const },
    { key: "fudging", label: "BP fudging", value: 8, delta: 0, goodDir: "down" as const },
  ],
};

export const DISTRICT_INSIGHTS: { tone: "bad" | "good"; text: string }[] = [
  { tone: "bad", text: "BP control has dropped for 3 months in a row. The main reasons look like low titration (36%) and missed visits (31%)." },
  { tone: "bad", text: "6 facilities need action this month. 2 of them are new problems." },
  { tone: "bad", text: "Drug stock is low at 3 facilities. Kacuya Bohor has been low for 4 months." },
  { tone: "good", text: "Overdue patient calls have doubled. About 1,000 patients came back to care last month." },
  { tone: "good", text: "5 facilities improved by 2 points or more. Gungadiya and Paton gained 6 points each." },
];

// Drug-stock days lookup matching the HTML's pool logic
const stockDays: Record<DrugStock, number[]> = {
  low: [8, 12, 5, 14],
  partial: [22, 35, 28, 42, 30, 25],
  full: [60, 75, 90, 110, 55, 80, 95, 70, 65, 100, 85, 72, 68, 88, 78, 58, 92, 120],
};
const stockIdx: Record<DrugStock, number> = { low: 0, partial: 0, full: 0 };
function nextDays(s: DrugStock) {
  const pool = stockDays[s];
  const v = pool[stockIdx[s] % pool.length];
  stockIdx[s]++;
  return v;
}

// Helper: slugify name to id
const idOf = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Seed = Omit<Facility, "id" | "daysStock">;

const seeds: Seed[] = [
  { name: "CC Osmaninagar", patients: 1442, bpControl: 37, bpControlT: -4, bpUncontrolled: 42, missed3m: 38, missed12m: 14, titration: 22, titrationT: -3, statins: 35, fudging: 18, drugStock: "partial", status: "action", monthsFlagged: 3, isNew: false,
    cardInsights: ["BP control is the lowest in the district at 37%.", "Fudging is very high (18%). The real BP control number may be even lower.", "Medicines are not being adjusted for patients with high BP."],
    detailSummary: ["Treatment inertia is getting worse.", "Titration dropped from 25% to 22%. Medicines are being adjusted for fewer than 1 in 4 patients with high BP."],
    insightBlocks: [
      { title: "High fudging. BP control number is not reliable.", text: "Fudging has risen from 16% to 18% over 3 months. The reported 37% BP control likely overstates the real number. Until the measurement is checked, treat the BP figure as unreliable." },
      { title: "Flagged for 3 months. No change in the pattern.", text: "This facility was flagged for the same problems in February and March. If any steps were taken, they have not moved the numbers. A different approach is needed." },
    ],
    verify: ["Audit 20 BP readings from the past week. Look for clustering around 130/80.", "Sample 10–15 patients with high BP. Check if their medicines were changed at the last visit.", "Decide on a different type of support — on-site mentoring or a supervisory visit."],
  },
  { name: "UHC Fenchuganj", patients: 1313, bpControl: 38, bpControlT: -3, bpUncontrolled: 40, missed3m: 35, missed12m: 12, titration: 25, titrationT: -2, statins: 38, fudging: 15, drugStock: "partial", status: "action", monthsFlagged: 2, isNew: false,
    cardInsights: ["BP control is 38%. Many patients are not returning — 35% missed their last visit.", "Medicines are only being adjusted for 1 in 4 patients with high BP.", "Drug stock is partial. Fudging is high at 15%."],
    detailSummary: ["Patients are cycling in and out without treatment changes.", "Drug stock is partial. Medicines are being adjusted for only 1 in 4 patients with high BP."],
    insightBlocks: [
      { title: "Many patients are missing visits.", text: "35% of patients did not come to the facility in the last 3 months. When patients stop coming, BP control cannot improve. Follow-up calls may not be reaching enough of them." },
      { title: "Flagged for 2 months.", text: "This is the second month this facility has been flagged. The same issues have been present. Drug stock needs to be resolved first." },
    ],
    verify: ["Check the drug stock register. Which specific medicines are out?", "Check the call log. What percent of overdue patients received a call?", "Sample 10–15 patients with high BP. Were their medicines adjusted?"],
  },
  { name: "CC Kacuya Bohor", patients: 153, bpControl: 39, bpControlT: -2, bpUncontrolled: 38, missed3m: 34, missed12m: 11, titration: 28, statins: 30, fudging: 12, drugStock: "low", status: "stagnating", monthsFlagged: 4, isNew: false,
    cardInsights: ["Drug stock has been low for 4 months.", "Patients are not coming because there are no medicines to collect.", "Previous flags have not led to a fix."],
    detailSummary: ["Drug stock has been low or partial since January.", "Patients are not coming because there are no medicines to collect. BP control has stayed below 45% for 4 months."],
    insightBlocks: [
      { title: "Drug stock is the main problem.", text: "Stock has been low or partial for 4 months. Without medicines, patients stop coming and their BP cannot be controlled. This is blocking everything else." },
      { title: "Flagged for 4 months. Nothing has changed.", text: "The same issue has been raised for 4 months. Earlier steps have not fixed the supply. Escalate to district supply chain management directly." },
    ],
    verify: ["Confirm the next drug delivery date in writing.", "Find out if patients are being referred to other facilities in the meantime.", "Make a list of eligible patients who should be on statins but are not."],
    savedContext: "Known supply chain issue — district warehouse has been delayed since January.",
  },
  { name: "CC Chhatrish", patients: 263, bpControl: 40, bpControlT: -5, bpUncontrolled: 36, missed3m: 32, missed12m: 10, titration: 30, titrationT: -2, statins: 42, fudging: 8, drugStock: "full", status: "action", monthsFlagged: 1, isNew: true,
    cardInsights: ["BP control dropped sharply — 5 points in one month.", "Drug stock is full, so medicines are not the problem.", "Something changed this month. Needs a visit to find out what.", "This is a new problem — first time being flagged."],
    detailSummary: ["BP control fell by 5 points this month. This is a sudden change from a stable facility.", "Drug stock is full. The problem is likely clinical or related to staffing."],
    insightBlocks: [
      { title: "Biggest single-month drop in the district.", text: "This facility was stable around 50% BP control for 6 months. Then it fell to 40% this month. That is a big change and needs urgent attention." },
      { title: "Full drug stock rules out supply.", text: "Medicines are available. The problem is either that medicines are not being adjusted, or something changed — new staff, a problem with equipment, or a data issue." },
    ],
    verify: ["Visit the facility this week. Find out what changed — new medical officer, equipment, staff.", "Sample 15 patients with high BP. Were their medicines adjusted?", "Check if a big group of new patients was registered this month."],
  },
  { name: "CC Baraigram", patients: 123, bpControl: 41, bpControlT: -1, bpUncontrolled: 37, missed3m: 30, missed12m: 9, titration: 32, statins: 40, fudging: 6, drugStock: "partial", status: "action", monthsFlagged: 2, isNew: false,
    cardInsights: ["BP control is 41%. The main problem is partial drug stock.", "Fudging is low (6%), so the numbers are real.", "This could improve quickly if drug supply is steady for 2 months."],
    detailSummary: ["Drug supply is not steady. When stock is partial, BP control goes down.", "The other indicators are fine, so a steady supply of medicines should fix this."],
    insightBlocks: [
      { title: "Drug stock is the main issue.", text: "Stock has been partial for the past 2 months. The other indicators — titration, fudging, missed visits — are all in an acceptable range. This is a supply problem, not a clinical one." },
    ],
    verify: ["Confirm the next drug delivery and how long the supply will last.", "Track stock weekly for the next 2 months. If supply is steady, BP control should rise."],
  },
  { name: "CC Lamagangapur", patients: 179, bpControl: 41, bpControlT: -3, bpUncontrolled: 35, missed3m: 33, missed12m: 11, titration: 26, titrationT: -1, statins: 36, fudging: 10, drugStock: "partial", status: "action", monthsFlagged: 2, isNew: false,
    cardInsights: ["Medicines are only being adjusted for 1 in 4 patients.", "Drug stock is partial. Patients are not coming back.", "33% missed their last visit — that is high for a facility this size."],
    detailSummary: ["Medicines are only being adjusted for 1 in 4 patients with high BP.", "Drug stock is partial. Missed visits are at 33%."],
    insightBlocks: [
      { title: "Low titration and partial stock reinforce each other.", text: "When drug stock is not steady, doctors often do not change prescriptions. Fixing stock is likely to lift titration as well." },
    ],
    verify: ["Find out which specific medicines are out of stock.", "Check whether overdue patients are being called.", "Ask medical officers if they are changing prescriptions when patients have symptoms."],
  },
  { name: "CC Danaram", patients: 167, bpControl: 43, bpControlT: 0, bpUncontrolled: 34, missed3m: 25, missed12m: 8, titration: 35, statins: 44, fudging: 5, drugStock: "full", status: "risk", monthsFlagged: 0, isNew: false,
    cardInsights: ["BP control is 43%, but patients are coming to the facility.", "Drug stock is full and fudging is low.", "Medicines are not being adjusted. This is a clinical practice issue."],
    detailSummary: ["Patients are showing up but their BP is not improving.", "Drug stock is full and the data is reliable. The issue is treatment inertia."],
    insightBlocks: [
      { title: "Patients come, but medicines do not change.", text: "Retention is in the top 10 for the district at 25% missed visits. But BP control is stuck at 43%. Patients are coming to the facility without getting treatment changes." },
    ],
    verify: ["Sample 10 patients with BP above 140/90 at the last 2 visits. Were their medicines changed?", "Talk to the medical officer about when they adjust medicines."],
  },
  { name: "CC Shah Arpin", patients: 106, bpControl: 43, bpControlT: -2, bpUncontrolled: 35, missed3m: 29, missed12m: 10, titration: 30, statins: 38, fudging: 7, drugStock: "full", status: "risk", monthsFlagged: 0, isNew: false,
    cardInsights: ["BP control is 43% even though drug stock is full.", "This is a small facility (106 patients). A full chart review is possible.", "Medicines may not be getting adjusted enough."],
    detailSummary: ["Drug stock is full but BP control is low.", "With only 106 patients, a full chart review is practical."],
    insightBlocks: [
      { title: "Likely a clinical practice issue.", text: "Full drug stock and low fudging rule out supply and data issues. The most likely cause is that medicines are not being adjusted for patients with high BP." },
    ],
    verify: ["Review the charts of all patients with uncontrolled BP — this is possible at this size.", "Check if the medical officer feels confident adjusting medicines. They may need support."],
  },
  { name: "Sylhet Sadar", patients: 5252, bpControl: 45, bpControlT: -2, bpUncontrolled: 33, missed3m: 30, missed12m: 11, titration: 34, statins: 45, fudging: 12, drugStock: "full", status: "risk", monthsFlagged: 0, isNew: false,
    cardInsights: ["This is the largest facility, with 5,252 patients.", "A 5-point improvement here means 260 more patients controlled.", "Fudging at 12% means about 630 readings may not be accurate."],
    detailSummary: ["Largest facility in the district — 5,252 patients.", "A 5-point improvement here would mean 260 more patients controlled."],
    insightBlocks: [
      { title: "Scale makes this a high-impact target.", text: "With 5,252 patients, any change in this facility moves the district average. Drug stock is full, but 12% fudging at this scale means around 630 readings may not be accurate." },
      { title: "Fudging is the top concern at this size.", text: "At a small facility, 12% fudging is a minor issue. At this facility, it affects the data for hundreds of patients. Review measurement practice first." },
    ],
    verify: ["Observe BP measurement during a normal clinic session. Is the method correct?", "Check staffing. Is the workload causing shortcuts?", "Sample 30 recent BP readings and look for clustering around 130/80."],
  },
  { name: "UHC Bishwanath", patients: 3195, bpControl: 46, bpControlT: -1, bpUncontrolled: 32, missed3m: 28, missed12m: 10, titration: 36, statins: 48, fudging: 10, drugStock: "full", status: "risk", monthsFlagged: 0, isNew: false,
    cardInsights: ["Second largest facility, with 3,195 patients.", "Drug stock is full, but titration has been flat at 36% for 4 months.", "Fudging at 10% should be watched."],
    detailSummary: ["Second largest facility — 3,195 patients.", "Titration has been flat at 36% for 4 months."],
    insightBlocks: [
      { title: "Titration is not improving.", text: "Titration has been at 36% for 4 months. Drug stock is not the issue. The most likely cause is that medicines are not being adjusted enough for patients with high BP." },
    ],
    verify: ["Sample 15 patients with high BP over the last 3 months. Were their medicines changed?", "Talk to medical officers about their approach to adjusting medicines."],
  },
  { name: "CC Gopkanu", patients: 127, bpControl: 60, bpControlT: -1, bpUncontrolled: 23, missed3m: 22, missed12m: 6, titration: 40, statins: 48, fudging: 5, drugStock: "full", status: "risk", monthsFlagged: 0, isNew: false,
    cardInsights: ["BP control is 60%, just 2 points below the facility's own average.", "Patients are coming regularly (22% missed visits).", "Slight dip from baseline. Not urgent but worth watching."],
    detailSummary: ["BP control dropped from a 6-month average of 62% to 60%.", "Patients are coming regularly. The small dip is likely clinical."],
    insightBlocks: [
      { title: "Small deviation from baseline.", text: "This facility was stable around 62% for 6 months. A 2-point drop is small but it is the wrong direction. Worth a brief check before it grows." },
    ],
    verify: ["Review the last 10 patients whose BP became uncontrolled. Were their medicines adjusted?"],
  },
  { name: "CC Gungadiya", patients: 180, bpControl: 56, bpControlT: 6, bpUncontrolled: 26, missed3m: 27, missed12m: 8, titration: 42, titrationT: 3, statins: 50, fudging: 4, drugStock: "full", status: "improving", monthsFlagged: 0, isNew: false,
    cardInsights: ["Biggest improvement this month — up 6 points to 56%.", "Calling overdue patients before their visit is working.", "Data is reliable (4% fudging) and drug stock is full."],
    detailSummary: ["Biggest improvement in the district this month — up 6 points.", "The team called overdue patients and reminded them to take medicines before visiting. This worked."],
    insightBlocks: [
      { title: "Reminder calls are working.", text: "Before patient visits, the team now calls to remind them to take their medicines. Missed visits dropped and BP control rose by 6 points. Titration also improved." },
    ],
    verify: ["Ask the team to write down the exact script they use for reminder calls.", "Share the approach with CC Jamalpur and CC Hossainpur, which also show improvement."],
  },
  { name: "CC Jamalpur", patients: 145, bpControl: 58, bpControlT: 5, bpUncontrolled: 24, missed3m: 26, missed12m: 7, titration: 40, statins: 48, fudging: 5, drugStock: "full", status: "improving", monthsFlagged: 0, isNew: false,
    cardInsights: ["Up 5 points to 58%. Improving for 2 months in a row.", "Drug stock is full and titration is improving.", "Something changed. Ask the team what."],
    detailSummary: ["Up 5 points this month, 58% BP control. Improving for 2 months.", "Drug stock is full. Titration is improving."],
    insightBlocks: [
      { title: "Keep doing what is working.", text: "This facility has improved for 2 months in a row. Whatever changed should be reinforced and documented." },
    ],
    verify: ["Ask the team what they changed over the last 2 months.", "Make sure drug supply stays steady."],
  },
  { name: "CC Hossainpur", patients: 121, bpControl: 64, bpControlT: 2, bpUncontrolled: 20, missed3m: 19, missed12m: 5, titration: 44, statins: 52, fudging: 4, drugStock: "full", status: "improving", monthsFlagged: 0, isNew: false,
    cardInsights: ["BP control is 64% — very close to the 63% target.", "Missed visits are low at 19%.", "Up 2 points, improving steadily for 3 months."],
    detailSummary: ["64% BP control. Improving steadily for 3 months.", "Missed visits are low at 19% — patients are engaged."],
    insightBlocks: [
      { title: "Close to target.", text: "Patients are coming to the facility and BP control is climbing. A small push on titration could get this facility above the district target." },
    ],
    verify: ["Review the remaining patients with uncontrolled BP. Make sure their medicines are being adjusted."],
  },
  { name: "CC Paton", patients: 155, bpControl: 66, bpControlT: 6, bpUncontrolled: 18, missed3m: 22, missed12m: 6, titration: 48, titrationT: 3, statins: 55, fudging: 3, drugStock: "full", status: "improving", monthsFlagged: 0, isNew: false,
    cardInsights: ["Up 6 points to 66%. Above the district target.", "Titration is at 48% — doctors are actively adjusting medicines.", "Fudging is low (3%). The numbers are real."],
    detailSummary: ["Up 6 points to 66%. Above the district target.", "Titration is excellent at 48%. Doctors are adjusting medicines for patients with high BP."],
    insightBlocks: [
      { title: "Strong clinical practice.", text: "Titration at 48% is among the best in the district. Fudging is low, so the improvement is real. Ask this team how they approach titration." },
    ],
    verify: ["Ask the medical officer at this facility to share their approach to adjusting medicines.", "Consider arranging a visit for staff from nearby facilities to learn from them."],
  },
  { name: "CC Tirasigoan", patients: 123, bpControl: 67, bpControlT: -1, bpUncontrolled: 19, missed3m: 24, missed12m: 6, titration: 42, statins: 50, fudging: 4, drugStock: "full", status: "target", monthsFlagged: 0, isNew: false,
    cardInsights: ["BP control is 67% — above target and steady.", "Small dip of 1 point is normal variation.", "All indicators look healthy."],
    detailSummary: ["67% BP control — above target and stable."],
    insightBlocks: [{ title: "Stable, on target.", text: "Small month-to-month changes are normal. Nothing to act on." }],
    verify: ["No action needed this month."],
  },
  { name: "CC Hakurbazar", patients: 122, bpControl: 69, bpControlT: 0, bpUncontrolled: 18, missed3m: 24, missed12m: 6, titration: 42, statins: 50, fudging: 4, drugStock: "full", status: "target", monthsFlagged: 0, isNew: false,
    cardInsights: ["BP control is 69% — above target.", "No change from last month.", "Clean data, full stock, balanced indicators."],
    detailSummary: ["69% BP control — above target and stable."],
    insightBlocks: [{ title: "Stable, on target.", text: "All indicators are healthy. No intervention needed." }],
    verify: ["No action needed this month."],
  },
  { name: "CC Niyagul", patients: 146, bpControl: 69, bpControlT: -1, bpUncontrolled: 18, missed3m: 23, missed12m: 5, titration: 44, statins: 53, fudging: 4, drugStock: "full", status: "target", monthsFlagged: 0, isNew: false,
    cardInsights: ["BP control is 69% — above target.", "All indicators stable.", "Low fudging and good retention."],
    detailSummary: ["69% BP control — above target and stable."],
    insightBlocks: [{ title: "Stable, on target.", text: "No action needed." }],
    verify: ["No action needed this month."],
  },
  { name: "CC Choto Desh", patients: 176, bpControl: 71, bpControlT: 0, bpUncontrolled: 17, missed3m: 24, missed12m: 6, titration: 45, statins: 54, fudging: 3, drugStock: "full", status: "target", monthsFlagged: 0, isNew: false,
    cardInsights: ["71% BP control. Well above the district average of 54%.", "Clean data (3% fudging) and full drug stock.", "No change from last month."],
    detailSummary: ["71% BP control. Stable and well above district average."],
    insightBlocks: [{ title: "Stable, on target.", text: "Solid performer with clean data." }],
    verify: ["No action needed this month."],
  },
  { name: "CC Nandisri", patients: 139, bpControl: 71, bpControlT: -1, bpUncontrolled: 16, missed3m: 25, missed12m: 6, titration: 43, statins: 52, fudging: 4, drugStock: "full", status: "target", monthsFlagged: 0, isNew: false,
    cardInsights: ["71% BP control. Small 1-point dip is normal.", "All other indicators unchanged."],
    detailSummary: ["71% BP control. Stable."],
    insightBlocks: [{ title: "Stable, on target.", text: "Small variation is expected." }],
    verify: ["No action needed this month."],
  },
  { name: "CC Rajnagor", patients: 115, bpControl: 72, bpControlT: 4, bpUncontrolled: 16, missed3m: 23, missed12m: 5, titration: 46, titrationT: 2, statins: 55, fudging: 3, drugStock: "full", status: "improving", monthsFlagged: 0, isNew: false,
    cardInsights: ["Up 4 points to 72%. Already above target.", "Local radio message about drug availability brought patients back.", "Titration is also improving."],
    detailSummary: ["Up 4 points to 72%. Already above the district target.", "A local radio broadcast told patients drugs were in stock and brought them back to care."],
    insightBlocks: [{ title: "Creative community outreach is working.", text: "The radio broadcast approach could be shared with other facilities. Ask how the team arranged it and what they said." }],
    verify: ["Ask the team to describe the radio outreach step by step.", "Share the approach with facilities that have low visit rates."],
  },
  { name: "CC Lalarchak", patients: 109, bpControl: 73, bpControlT: 0, bpUncontrolled: 15, missed3m: 24, missed12m: 6, titration: 44, statins: 52, fudging: 4, drugStock: "full", status: "target", monthsFlagged: 0, isNew: false,
    cardInsights: ["73% BP control. Solid and stable.", "Missed visits slightly higher than top performers.", "Room to grow with better retention."],
    detailSummary: ["73% BP control. Stable and above target."],
    insightBlocks: [{ title: "Stable, on target.", text: "Retention could be a little better." }],
    verify: ["No urgent action. Monitor monthly."],
  },
  { name: "CC Nij Chaura", patients: 216, bpControl: 75, bpControlT: 1, bpUncontrolled: 14, missed3m: 22, missed12m: 5, titration: 50, statins: 58, fudging: 3, drugStock: "full", status: "top", monthsFlagged: 0, isNew: false,
    cardInsights: ["75% BP control. Balanced indicators.", "Titration is strong at 50%. Fudging is very low at 3%.", "Consistent top performer."],
    detailSummary: ["75% BP control. One of the top facilities in the district."],
    insightBlocks: [{ title: "Role model facility.", text: "Titration at 50% and fudging at 3% are both very good. Could mentor nearby facilities that are struggling." }],
    verify: ["Could be paired as a mentor for nearby underperforming facilities."],
  },
  { name: "CC Kargram", patients: 213, bpControl: 78, bpControlT: 0, bpUncontrolled: 12, missed3m: 16, missed12m: 3, titration: 52, statins: 60, fudging: 2, drugStock: "full", status: "top", monthsFlagged: 0, isNew: false,
    cardInsights: ["78% BP control. Second highest in the district.", "Lowest missed visits at 16% — the gold standard.", "Strong clinical practice across the board."],
    detailSummary: ["78% BP control. Second highest in the district.", "Lowest missed visit rate at 16%."],
    insightBlocks: [{ title: "Benchmark facility.", text: "Top titration, lowest fudging, lowest missed visits. This facility represents what good looks like." }],
    verify: ["Use as a benchmark for other facilities.", "Document the specific practices used here."],
  },
  { name: "CC Kayasthagram", patients: 142, bpControl: 80, bpControlT: 1, bpUncontrolled: 10, missed3m: 19, missed12m: 4, titration: 55, statins: 62, fudging: 2, drugStock: "full", status: "top", monthsFlagged: 0, isNew: false,
    cardInsights: ["Highest BP control in the district at 80%.", "Close follow-up with new patients in the first 3 months is working.", "Excellent on every indicator."],
    detailSummary: ["Highest BP control in the district at 80%.", "Close follow-up with new patients for their first 3 months built trust and adherence."],
    insightBlocks: [{ title: "Star of the month.", text: "Monthly visits for new patients during the first 3 months are the key practice. This should be standard across the district." }],
    verify: ["Document the new patient follow-up protocol in detail.", "Roll out the practice to other facilities."],
  },
];

export const FACILITIES: Facility[] = seeds.map((s) => ({
  ...s,
  id: idOf(s.name),
  daysStock: nextDays(s.drugStock),
}));

// Composite priority score (lower = more urgent). Used in backend ranking only.
export function priorityScore(f: Facility): number {
  // Outcomes 35: lower BP control = higher priority
  const outcomes = (100 - f.bpControl) * 0.35;
  // Retention 25: missed visits
  const retention = f.missed3m * 0.25;
  // Clinical 25: low titration
  const clinical = (100 - f.titration) * 0.25;
  // Data quality penalty 15: high fudging
  const dataPenalty = f.fudging * 0.15;
  let score = -(outcomes + retention + clinical + dataPenalty);
  // Boost newly flagged and stagnating
  if (f.isNew) score -= 10;
  if (f.status === "stagnating") score -= 8;
  if (f.monthsFlagged >= 2) score -= 5;
  return score;
}

// Top 3 for "needs attention" (action + stagnating, then new first, then BP)
export function getNeedsAttention(facilities: Facility[]): Facility[] {
  return [...facilities]
    .filter((f) => f.status === "action" || f.status === "stagnating")
    .sort((a, b) => {
      if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
      return a.bpControl - b.bpControl;
    })
    .slice(0, 3);
}
