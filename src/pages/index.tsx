import React, { useState } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Filter, AlertTriangle, Info, ChevronDown, ChevronUp, Bell, Search, Download, Settings, HelpCircle, X } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

// Mock data for antibiogram
const antibiogramData = [
  { pathogen: 'E. coli', amoxicillin: 45, amoxClav: 82, cefuroxime: 88, ceftriaxone: 95, gentamicin: 92, tmp_smx: 68, ciprofloxacin: 91, nitrofurantoin: 96, n: 342 },
  { pathogen: 'Klebsiella pneumoniae', amoxicillin: 0, amoxClav: 78, cefuroxime: 82, ceftriaxone: 89, gentamicin: 88, tmp_smx: 72, ciprofloxacin: 87, nitrofurantoin: 45, n: 156 },
  { pathogen: 'Proteus mirabilis', amoxicillin: 72, amoxClav: 91, cefuroxime: 94, ceftriaxone: 98, gentamicin: 85, tmp_smx: 58, ciprofloxacin: 89, nitrofurantoin: 12, n: 89 },
  { pathogen: 'Enterococcus faecalis', amoxicillin: 98, amoxClav: 98, cefuroxime: 0, ceftriaxone: 0, gentamicin: 45, tmp_smx: 0, ciprofloxacin: 52, nitrofurantoin: 95, n: 78 },
  { pathogen: 'Pseudomonas aeruginosa', amoxicillin: 0, amoxClav: 0, cefuroxime: 0, ceftriaxone: 0, gentamicin: 82, tmp_smx: 0, ciprofloxacin: 78, nitrofurantoin: 0, n: 45 },
  { pathogen: 'S. aureus (MSSA)', amoxicillin: 15, amoxClav: 95, cefuroxime: 96, ceftriaxone: 96, gentamicin: 94, tmp_smx: 92, ciprofloxacin: 88, nitrofurantoin: 0, n: 234 },
  { pathogen: 'S. aureus (MRSA)', amoxicillin: 0, amoxClav: 0, cefuroxime: 0, ceftriaxone: 0, gentamicin: 72, tmp_smx: 85, ciprofloxacin: 45, nitrofurantoin: 0, n: 34 },
  { pathogen: 'Strep. pneumoniae', amoxicillin: 88, amoxClav: 92, cefuroxime: 85, ceftriaxone: 98, gentamicin: 0, tmp_smx: 75, ciprofloxacin: 0, nitrofurantoin: 0, n: 112 },
];

const antibioticNames = {
  amoxicillin: 'אמוקסיצילין',
  amoxClav: 'אמוקסי-קלבו׳',
  cefuroxime: 'צפורוקסים',
  ceftriaxone: 'צפטריאקסון',
  gentamicin: 'גנטאמיצין',
  tmp_smx: 'TMP-SMX',
  ciprofloxacin: 'ציפרו׳',
  nitrofurantoin: 'ניטרופורנטו׳'
};

const pathogenDistribution = [
  { name: 'E. coli', value: 342, color: '#0088FE' },
  { name: 'S. aureus', value: 268, color: '#00C49F' },
  { name: 'Klebsiella', value: 156, color: '#FFBB28' },
  { name: 'Strep. pneumoniae', value: 112, color: '#FF8042' },
  { name: 'Proteus', value: 89, color: '#8884d8' },
  { name: 'Enterococcus', value: 78, color: '#82ca9d' },
  { name: 'Pseudomonas', value: 45, color: '#ffc658' },
  { name: 'אחר', value: 67, color: '#999' },
];

const trendData = [
  { month: 'ינו׳', ecoli: 85, kleb: 80, staph: 92 },
  { month: 'פבר׳', ecoli: 83, kleb: 78, staph: 91 },
  { month: 'מרץ', ecoli: 82, kleb: 82, staph: 90 },
  { month: 'אפר׳', ecoli: 80, kleb: 79, staph: 88 },
  { month: 'מאי', ecoli: 82, kleb: 76, staph: 89 },
  { month: 'יוני', ecoli: 81, kleb: 75, staph: 87 },
];

const getSensitivityColor = (value) => {
  if (value === 0 || value === null) return 'bg-gray-200 text-gray-500';
  if (value >= 90) return 'bg-green-500 text-white';
  if (value >= 80) return 'bg-green-300 text-green-900';
  if (value >= 70) return 'bg-yellow-300 text-yellow-900';
  if (value >= 50) return 'bg-orange-400 text-white';
  return 'bg-red-500 text-white';
};

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-4 border-b border-gray-100 pb-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full font-medium text-gray-700 mb-2 hover:text-blue-600 transition-colors"
      >
        <span className="text-gray-400">{isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
        <span>{title}</span>
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
};

const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-800 mb-2 flex-row-reverse justify-end">
    <span>{label}</span>
    <input type="checkbox" checked={checked} onChange={onChange} className="rounded text-blue-600 w-4 h-4" />
  </label>
);

export default function AntibiogramDashboard() {
  const [filters, setFilters] = useState({
    diagnosis: 'UTI',
    site: 'urine',
    setting: 'all',
    ageMin: 0,
    ageMax: 18,
    dateRange: '2020-2025',
    showRecommendation: true,
  });
  
  const [activeTab, setActiveTab] = useState('antibiogram');
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <h1 className="text-2xl font-bold">אנטיביוגרם דיגיטלי</h1>
              <p className="text-blue-200 text-sm">מרכז רפואי שניידר לילדים</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-blue-700 rounded-lg transition-colors" title="הורדה">
                <Download size={20} />
              </button>
              <button className="p-2 hover:bg-blue-700 rounded-lg transition-colors relative" title="התראות">
                <Bell size={20} />
                <span className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-blue-700 rounded-lg transition-colors" title="הגדרות">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      {showAlert && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-amber-800">
              <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
              <span className="text-sm">
                <strong>התרעה:</strong> זוהתה עלייה של 15% בעמידות של E. coli ל-TMP-SMX בחודש האחרון בתבדידי שתן
              </span>
            </div>
            <button onClick={() => setShowAlert(false)} className="text-amber-600 hover:text-amber-800 p-1">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Right side for RTL */}
          <aside className="w-72 flex-shrink-0 order-first">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-4">
              <div className="flex items-center gap-2 mb-5 text-gray-800 border-b pb-3">
                <Filter size={20} className="text-blue-600" />
                <h2 className="font-bold text-lg">פילטרים</h2>
              </div>

              <FilterSection title="אבחנה / תסמונת">
                <select 
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                  value={filters.diagnosis}
                  onChange={(e) => setFilters({...filters, diagnosis: e.target.value})}
                >
                  <option value="UTI">דלקת בדרכי השתן (UTI)</option>
                  <option value="pneumonia">דלקת ריאות</option>
                  <option value="meningitis">מנינגיטיס</option>
                  <option value="bacteremia">בקטרמיה</option>
                  <option value="soft_tissue">זיהום רקמות רכות</option>
                  <option value="AOM">דלקת אוזן תיכונה (AOM)</option>
                  <option value="GE">גסטרואנטריטיס</option>
                  <option value="osteo">אוסטאומייליטיס</option>
                </select>
              </FilterSection>

              <FilterSection title="אתר לקיחה">
                <select 
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                  value={filters.site}
                  onChange={(e) => setFilters({...filters, site: e.target.value})}
                >
                  <option value="urine">שתן</option>
                  <option value="blood">דם</option>
                  <option value="csf">נוזל מוחי-שדרתי (CSF)</option>
                  <option value="throat">לוע</option>
                  <option value="wound">פצע / נגע</option>
                  <option value="joint">נוזל מפרקי</option>
                  <option value="sputum">כיח</option>
                </select>
              </FilterSection>

              <FilterSection title="סיווג זיהום">
                <Checkbox label="קהילתי (Community)" checked={true} onChange={() => {}} />
                <Checkbox label="נוזוקומיאלי (≥48 שעות)" checked={false} onChange={() => {}} />
                <Checkbox label="Healthcare-associated" checked={false} onChange={() => {}} />
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  כולל: אשפוז יום, מושתלים, אונקולוגיה
                </div>
              </FilterSection>

              <FilterSection title="טווח גילאים">
                <div className="flex items-center gap-2 justify-center">
                  <input 
                    type="number" 
                    className="w-16 border border-gray-200 rounded-lg p-2 text-center text-sm bg-gray-50 focus:bg-white focus:border-blue-400 outline-none" 
                    value={filters.ageMin}
                    onChange={(e) => setFilters({...filters, ageMin: e.target.value})}
                  />
                  <span className="text-gray-400">—</span>
                  <input 
                    type="number" 
                    className="w-16 border border-gray-200 rounded-lg p-2 text-center text-sm bg-gray-50 focus:bg-white focus:border-blue-400 outline-none" 
                    value={filters.ageMax}
                    onChange={(e) => setFilters({...filters, ageMax: e.target.value})}
                  />
                  <span className="text-sm text-gray-500">שנים</span>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {['0-1', '1-5', '5-12', '12-18'].map(range => (
                    <button key={range} className="text-xs px-3 py-1.5 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors">
                      {range}
                    </button>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="טווח תאריכים">
                <select className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all">
                  <option>5 שנים אחרונות (2020-2025)</option>
                  <option>3 שנים אחרונות (2022-2025)</option>
                  <option>שנה אחרונה (2024-2025)</option>
                  <option>בחירה מותאמת...</option>
                </select>
              </FilterSection>

              <FilterSection title="מאפיינים נוספים" defaultOpen={false}>
                <Checkbox label="מוחלש חיסון" checked={false} onChange={() => {}} />
                <Checkbox label="נשאות ESBL" checked={false} onChange={() => {}} />
                <Checkbox label="נשאות CRE" checked={false} onChange={() => {}} />
                <select className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 mt-2">
                  <option value="">מגדר - הכל</option>
                  <option value="M">זכר</option>
                  <option value="F">נקבה</option>
                </select>
              </FilterSection>

              <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg mt-2 hover:bg-blue-700 transition font-medium shadow-sm">
                החל פילטרים
              </button>
              <button className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 transition-colors">
                איפוס לברירת מחדל
              </button>
            </div>
          </aside>

          {/* Main Content - Left side for RTL */}
          <main className="flex-1">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm mb-6">
              <div className="flex border-b">
                {[
                  { id: 'antibiogram', label: 'אנטיביוגרם' },
                  { id: 'distribution', label: 'התפלגות מחוללים' },
                  { id: 'trends', label: 'מגמות' },
                  { id: 'recommendation', label: 'המלצת טיפול' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 font-medium transition ${
                      activeTab === tab.id 
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Context Info */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-blue-800 font-medium">
                      דלקת בדרכי השתן (UTI) | תבדידי שתן | קהילתי | גילאי 0-18 | 2020-2025
                    </p>
                    <p className="text-blue-600 text-sm mt-1">
                      סה״כ 1,157 תבדידים מ-943 מטופלים ייחודיים
                    </p>
                  </div>
                </div>

                {activeTab === 'antibiogram' && (
                  <div>
                    {/* Legend */}
                    <div className="flex items-center gap-4 mb-4 text-sm flex-wrap">
                      <span className="text-gray-500">אחוז רגישות:</span>
                      <div className="flex items-center gap-1">
                        <span className="w-6 h-4 bg-green-500 rounded"></span>
                        <span>≥90%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-6 h-4 bg-green-300 rounded"></span>
                        <span>80-89%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-6 h-4 bg-yellow-300 rounded"></span>
                        <span>70-79%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-6 h-4 bg-orange-400 rounded"></span>
                        <span>50-69%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-6 h-4 bg-red-500 rounded"></span>
                        <span>&lt;50%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-6 h-4 bg-gray-200 rounded"></span>
                        <span>N/A</span>
                      </div>
                    </div>

                    {/* Antibiogram Table */}
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-3 text-right font-semibold text-gray-700 border-l sticky right-0 bg-gray-100 min-w-40">מחולל</th>
                            {Object.entries(antibioticNames).map(([key, name]) => (
                              <th key={key} className="p-3 text-center font-medium text-gray-700 min-w-20 border-l">
                                <div className="whitespace-nowrap text-xs">
                                  {name}
                                </div>
                              </th>
                            ))}
                            <th className="p-3 text-center font-semibold text-gray-700 min-w-16">N</th>
                          </tr>
                        </thead>
                        <tbody>
                          {antibiogramData.map((row, idx) => (
                            <tr key={idx} className="border-t hover:bg-gray-50 transition-colors">
                              <td className="p-3 font-medium text-gray-800 border-l sticky right-0 bg-white">{row.pathogen}</td>
                              {Object.keys(antibioticNames).map(abx => (
                                <td key={abx} className="p-2 border-l">
                                  <div className={`rounded-lg p-2 text-center font-medium text-sm ${getSensitivityColor(row[abx])}`}>
                                    {row[abx] === 0 ? '—' : `${row[abx]}%`}
                                  </div>
                                </td>
                              ))}
                              <td className="p-3 text-center text-gray-500 text-sm font-medium">{row.n}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <p className="text-xs text-gray-500 mt-4">
                      * הנתונים מבוססים על תבדיד ראשון למטופל לתקופה, בהתאם להנחיות CLSI M39. מוצגים רק תאים עם ≥30 תבדידים.
                    </p>
                  </div>
                )}

                {activeTab === 'distribution' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-4">התפלגות מחוללים</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pathogenDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pathogenDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-4">מספר תבדידים לפי מחולל</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={pathogenDistribution} layout="vertical">
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {activeTab === 'trends' && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">
                      מגמת רגישות ל-TMP-SMX לאורך זמן (6 חודשים אחרונים)
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                          <XAxis dataKey="month" reversed={true} />
                          <YAxis domain={[60, 100]} orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="ecoli" stroke="#0088FE" name="E. coli" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="kleb" stroke="#00C49F" name="Klebsiella" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="staph" stroke="#FF8042" name="S. aureus" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4 flex items-start gap-3">
                      <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                      <p className="text-amber-800 text-sm">
                        <strong>ניתוח מגמה:</strong> ירידה מתמשכת ברגישות של Klebsiella ל-TMP-SMX (מ-80% ל-75% ב-6 חודשים).
                        מומלץ לשקול חלופות אמפיריות.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'recommendation' && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          1
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-green-800 text-lg">קו ראשון מומלץ</h4>
                          <p className="text-green-700 mt-2">
                            <strong>צפלקסין (Cephalexin)</strong> PO — כיסוי של ~88% למחוללים שכיחים
                          </p>
                          <p className="text-green-600 text-sm mt-1">
                            או ניטרופורנטואין (Nitrofurantoin) — כיסוי של ~96% (מועדף לציסטיטיס לא מסובכת)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          2
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-blue-800 text-lg">קו שני</h4>
                          <p className="text-blue-700 mt-2">
                            <strong>אמוקסיצילין-קלבולנית (Augmentin)</strong> PO — כיסוי של ~82%
                          </p>
                          <p className="text-blue-600 text-sm mt-1">
                            לשקול בחשד לזיהום מעורב או כישלון טיפול ראשוני
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <AlertTriangle className="text-amber-500 flex-shrink-0 mt-1" size={24} />
                        <div className="flex-1">
                          <h4 className="font-bold text-amber-800 text-lg">הערות קליניות</h4>
                          <ul className="text-amber-700 mt-2 space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-amber-400 mt-1">•</span>
                              <span>TMP-SMX אינו מומלץ כקו ראשון (כיסוי 68% בלבד)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-amber-400 mt-1">•</span>
                              <span>בפיילונפריטיס או מטופל HIGH-RISK — לשקול צפטריאקסון IV (כיסוי 95%)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-amber-400 mt-1">•</span>
                              <span>בנשאי ESBL ידוע — התייעצות עם זיהומולוג</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-4">
                      * ההמלצות מבוססות על Rule Book של צוות הזיהומולוגים במרכז הרפואי ועל נתוני האנטיביוגרם המקומי.
                      עדכון אחרון: ינואר 2025.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'סה״כ תבדידים', value: '1,157', sub: '+12% משנה שעברה', color: 'blue' },
                { label: 'מחוללים ייחודיים', value: '23', sub: 'בהתאם לפילטרים', color: 'green' },
                { label: 'כיסוי קו ראשון', value: '88%', sub: 'צפלקסין', color: 'emerald' },
                { label: 'התרעות פעילות', value: '2', sub: 'דורשות תשומת לב', color: 'amber' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm p-4 border-r-4 border-blue-500">
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          <p>מערכת אנטיביוגרם דיגיטלי | מרכז רפואי שניידר לילדים | גרסה 1.0-beta</p>
          <p className="text-xs mt-1">הנתונים מעודכנים יומית | לשאלות: צוות הזיהומולוגיה</p>
        </div>
      </footer>
    </div>
  );
}
