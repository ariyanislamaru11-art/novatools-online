import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  RotateCcw, 
  Calculator, 
  TrendingUp, 
  Clock, 
  Calendar, 
  DollarSign, 
  Percent, 
  Plus, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { ToolDef } from '../../types';
import { 
  calculatePercentageOf, 
  calculateIsWhatPercentage, 
  calculatePercentageChange, 
  calculateDiscount, 
  calculateTipAndSplit, 
  calculateAge, 
  calculateDateDifference, 
  convertUnits, 
  convertFileSize, 
  calculateLoanEMI, 
  calculateCompoundInterest, 
  calculateVAT, 
  convertNumeralBases, 
  calculateAspectRatio, 
  calculatePPI, 
  calculateGPA, 
  GPACourse,
  UNIT_FACTORS 
} from '../../utils/calcProcessing';

interface CalcViewerToolsProps {
  tool: ToolDef;
  lang: 'en' | 'bn';
}

export const CalcViewerTools: React.FC<CalcViewerToolsProps> = ({ tool, lang }) => {
  const [copied, setCopied] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // 1. Percentage
  const [pctMode, setPctMode] = useState<'of' | 'isWhat' | 'change'>('of');
  const [pctVal1, setPctVal1] = useState(20);
  const [pctVal2, setPctVal2] = useState(150);

  // 2. Discount
  const [origPrice, setOrigPrice] = useState(120);
  const [discountPct, setDiscountPct] = useState(25);
  const [couponPct, setCouponPct] = useState(5);
  const [taxPct, setTaxPct] = useState(8);

  // 3. Tip & Split
  const [tipBill, setTipBill] = useState(85);
  const [tipPct, setTipPct] = useState(18);
  const [tipPeople, setTipPeople] = useState(3);
  const [tipRoundUp, setTipRoundUp] = useState(false);

  // 4. Age
  const [birthDate, setBirthDate] = useState('1998-05-14');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().slice(0, 10));

  // 5. Date Diff
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));

  // 6. Time Zone
  const [tzTime, setTzTime] = useState('14:30');
  const [tzSource, setTzSource] = useState('UTC');
  const [tzTarget, setTzTarget] = useState('America/New_York');

  // 7. Unit Converter
  const [unitCategory, setUnitCategory] = useState('length');
  const [unitValue, setUnitValue] = useState(10);
  const [unitFrom, setUnitFrom] = useState('km');
  const [unitTo, setUnitTo] = useState('mile');

  // 8. File Size
  const [fileSizeVal, setFileSizeVal] = useState(500);
  const [fileSizeUnit, setFileSizeUnit] = useState<'B' | 'KB' | 'MB' | 'GB' | 'TB'>('MB');
  const [fileSizeStandard, setFileSizeStandard] = useState<'binary' | 'decimal'>('binary');

  // 9. Loan EMI
  const [loanPrincipal, setLoanPrincipal] = useState(25000);
  const [loanRate, setLoanRate] = useState(8.5);
  const [loanMonths, setLoanMonths] = useState(36);

  // 10. Compound Interest
  const [ciPrincipal, setCiPrincipal] = useState(10000);
  const [ciRate, setCiRate] = useState(7);
  const [ciFreq, setCiFreq] = useState<1 | 2 | 4 | 12>(12);
  const [ciYears, setCiYears] = useState(5);
  const [ciMonthlyDeposit, setCiMonthlyDeposit] = useState(200);

  // 11. VAT & Tax
  const [vatAmount, setVatAmount] = useState(100);
  const [vatRate, setVatRate] = useState(15);
  const [vatMode, setVatMode] = useState<'add' | 'extract'>('add');

  // 12. Numeral Bases
  const [baseVal, setBaseVal] = useState('255');
  const [baseFrom, setBaseFrom] = useState<2 | 8 | 10 | 16>(10);

  // 13. Aspect Ratio
  const [arWidth, setArWidth] = useState(1920);
  const [arHeight, setArHeight] = useState(1080);
  const [arNewWidth, setArNewWidth] = useState(1280);

  // 14. DPI & PPI
  const [ppiMode, setPpiMode] = useState<'screen' | 'print'>('screen');
  const [ppiWidthPx, setPpiWidthPx] = useState(2560);
  const [ppiHeightPx, setPpiHeightPx] = useState(1440);
  const [ppiDiagonal, setPpiDiagonal] = useState(27);

  // 15. GPA
  const [gpaCourses, setGpaCourses] = useState<GPACourse[]>([
    { name: 'Computer Science', gradePoint: 4.0, credits: 3 },
    { name: 'Mathematics', gradePoint: 3.7, credits: 4 },
    { name: 'Physics', gradePoint: 3.5, credits: 3 },
  ]);

  const handleCopy = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. PERCENTAGE CALCULATOR */}
      {tool.slug === 'percentage-calculator' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'of', label: 'What is X% of Y?' },
              { id: 'isWhat', label: 'X is what % of Y?' },
              { id: 'change', label: '% Increase / Decrease' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setPctMode(m.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  pctMode === m.id ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {pctMode === 'change' ? 'Initial Value (From)' : pctMode === 'of' ? 'Percentage (X %)' : 'Value (X)'}
              </label>
              <input
                type="number"
                value={pctVal1}
                onChange={e => setPctVal1(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {pctMode === 'change' ? 'Final Value (To)' : 'Total (Y)'}
              </label>
              <input
                type="number"
                value={pctVal2}
                onChange={e => setPctVal2(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold block uppercase">Result:</span>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">
                {pctMode === 'of' && `${calculatePercentageOf(pctVal1, pctVal2)}`}
                {pctMode === 'isWhat' && `${calculateIsWhatPercentage(pctVal1, pctVal2).toFixed(2)}%`}
                {pctMode === 'change' && (
                  <>
                    {calculatePercentageChange(pctVal1, pctVal2).change.toFixed(2)}%{' '}
                    <span className="text-sm font-normal text-slate-300">({calculatePercentageChange(pctVal1, pctVal2).type})</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => handleCopy(
                pctMode === 'of' ? calculatePercentageOf(pctVal1, pctVal2).toString() :
                pctMode === 'isWhat' ? `${calculateIsWhatPercentage(pctVal1, pctVal2).toFixed(2)}%` :
                `${calculatePercentageChange(pctVal1, pctVal2).change.toFixed(2)}%`
              )}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. DISCOUNT CALCULATOR */}
      {tool.slug === 'discount-calculator' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Original Price ($)</label>
              <input
                type="number"
                value={origPrice}
                onChange={e => setOrigPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Discount (%)</label>
              <input
                type="number"
                value={discountPct}
                onChange={e => setDiscountPct(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Coupon (%)</label>
              <input
                type="number"
                value={couponPct}
                onChange={e => setCouponPct(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tax (%)</label>
              <input
                type="number"
                value={taxPct}
                onChange={e => setTaxPct(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
          </div>

          {(() => {
            const res = calculateDiscount(origPrice, discountPct, couponPct, taxPct);
            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-slate-500 text-xs block">Final Price:</span>
                  <div className="text-2xl font-extrabold text-emerald-400">${res.finalPrice.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">You Save:</span>
                  <div className="text-2xl font-extrabold text-cyan-400">${res.totalSaved.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Sales Tax Added:</span>
                  <div className="text-2xl font-extrabold text-amber-400">${res.taxAmount.toFixed(2)}</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 3. TIP & BILL SPLIT */}
      {tool.slug === 'tip-bill-split-calculator' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bill Amount ($)</label>
              <input
                type="number"
                value={tipBill}
                onChange={e => setTipBill(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tip Percentage (%)</label>
              <input
                type="number"
                value={tipPct}
                onChange={e => setTipPct(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Number of People</label>
              <input
                type="number"
                min={1}
                value={tipPeople}
                onChange={e => setTipPeople(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={tipRoundUp}
              onChange={e => setTipRoundUp(e.target.checked)}
              className="rounded text-amber-500"
            />
            Round Up Total Amount
          </label>

          {(() => {
            const res = calculateTipAndSplit(tipBill, tipPct, tipPeople, tipRoundUp);
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-slate-500 text-xs block">Total Tip:</span>
                  <div className="text-xl font-bold text-cyan-400">${res.tipAmount.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Total With Tip:</span>
                  <div className="text-xl font-bold text-white">${res.totalWithTip.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Tip / Person:</span>
                  <div className="text-xl font-bold text-amber-400">${res.tipPerPerson.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Total / Person:</span>
                  <div className="text-2xl font-extrabold text-emerald-400">${res.totalPerPerson.toFixed(2)}</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 4. AGE CALCULATOR */}
      {tool.slug === 'age-calculator' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth</label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
          </div>

          {(() => {
            try {
              const res = calculateAge(birthDate, targetDate);
              return (
                <div className="space-y-4">
                  <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
                    <span className="text-xs text-slate-500 uppercase block mb-1">Exact Age</span>
                    <div className="text-3xl font-extrabold text-amber-400">
                      {res.years} years, {res.months} months, {res.days} days
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Total Days</span>
                      <strong className="text-white text-base">{res.totalDays.toLocaleString()}</strong>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Total Weeks</span>
                      <strong className="text-cyan-400 text-base">{res.totalWeeks.toLocaleString()}</strong>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Total Hours</span>
                      <strong className="text-emerald-400 text-base">{res.totalHours.toLocaleString()}</strong>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Next Birthday in</span>
                      <strong className="text-violet-400 text-base">{res.daysUntilNextBirthday} days ({res.nextBirthdayDayName})</strong>
                    </div>
                  </div>
                </div>
              );
            } catch (err: unknown) {
              return <div className="text-xs text-rose-400">{err instanceof Error ? err.message : 'Invalid dates'}</div>;
            }
          })()}
        </div>
      )}

      {/* 5. DATE DIFFERENCE */}
      {tool.slug === 'date-difference-calculator' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
          </div>

          {(() => {
            try {
              const res = calculateDateDifference(startDate, endDate);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
                  <div>
                    <span className="text-slate-500 text-xs block">Calendar Days:</span>
                    <div className="text-2xl font-extrabold text-cyan-400">{res.totalDays} days</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block">Weeks + Days:</span>
                    <div className="text-2xl font-extrabold text-white">{res.weeks} w, {res.remainingDays} d</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block">Business Days (Mon-Fri):</span>
                    <div className="text-2xl font-extrabold text-emerald-400">{res.businessDays} days</div>
                  </div>
                </div>
              );
            } catch {
              return <div className="text-xs text-rose-400">Invalid dates selected</div>;
            }
          })()}
        </div>
      )}

      {/* 6. UNIT CONVERTER */}
      {tool.slug === 'unit-converter' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {['length', 'weight', 'temperature', 'area', 'volume', 'speed'].map(c => (
              <button
                key={c}
                onClick={() => {
                  setUnitCategory(c);
                  if (c === 'length') { setUnitFrom('km'); setUnitTo('mile'); }
                  else if (c === 'weight') { setUnitFrom('kg'); setUnitTo('pound'); }
                  else if (c === 'temperature') { setUnitFrom('celsius'); setUnitTo('fahrenheit'); }
                  else if (c === 'area') { setUnitFrom('sqm'); setUnitTo('sqft'); }
                  else if (c === 'volume') { setUnitFrom('liter'); setUnitTo('gallon_us'); }
                  else if (c === 'speed') { setUnitFrom('kmh'); setUnitTo('mph'); }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                  unitCategory === c ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Value</label>
              <input
                type="number"
                value={unitValue}
                onChange={e => setUnitValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">From Unit</label>
              <select
                value={unitFrom}
                onChange={e => setUnitFrom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm capitalize"
              >
                {unitCategory === 'temperature' ? (
                  <>
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                    <option value="kelvin">Kelvin (K)</option>
                  </>
                ) : (
                  Object.keys(UNIT_FACTORS[unitCategory]?.units || {}).map(u => (
                    <option key={u} value={u}>{u.replace('_', ' ')}</option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">To Unit</label>
              <select
                value={unitTo}
                onChange={e => setUnitTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm capitalize"
              >
                {unitCategory === 'temperature' ? (
                  <>
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                    <option value="kelvin">Kelvin (K)</option>
                  </>
                ) : (
                  Object.keys(UNIT_FACTORS[unitCategory]?.units || {}).map(u => (
                    <option key={u} value={u}>{u.replace('_', ' ')}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
            <span className="text-slate-500 text-xs block mb-1">Conversion Result:</span>
            <div className="text-3xl font-extrabold text-amber-400">
              {convertUnits(unitCategory, unitValue, unitFrom, unitTo).toLocaleString('en-US', { maximumFractionDigits: 6 })} {unitTo.replace('_', ' ')}
            </div>
          </div>
        </div>
      )}

      {/* 7. FILE SIZE CONVERTER */}
      {tool.slug === 'file-size-converter' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={fileSizeVal}
                onChange={e => setFileSizeVal(parseFloat(e.target.value) || 0)}
                className="w-36 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
              <select
                value={fileSizeUnit}
                onChange={e => setFileSizeUnit(e.target.value as any)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              >
                {['B', 'KB', 'MB', 'GB', 'TB'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setFileSizeStandard('binary')}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  fileSizeStandard === 'binary' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Binary (1024 / IEC)
              </button>
              <button
                onClick={() => setFileSizeStandard('decimal')}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  fileSizeStandard === 'decimal' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Decimal (1000 / SI)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 font-mono text-center">
            {convertFileSize(fileSizeVal, fileSizeUnit, fileSizeStandard).map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-xs block">{item.unit}</span>
                <strong className="text-white text-sm break-all">{item.formatted}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. LOAN EMI CALCULATOR */}
      {tool.slug === 'loan-emi-calculator' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Principal Amount ($)</label>
              <input
                type="number"
                value={loanPrincipal}
                onChange={e => setLoanPrincipal(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Annual Interest Rate (%)</label>
              <input
                type="number"
                value={loanRate}
                onChange={e => setLoanRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tenure (Months)</label>
              <input
                type="number"
                value={loanMonths}
                onChange={e => setLoanMonths(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
          </div>

          {(() => {
            const emi = calculateLoanEMI(loanPrincipal, loanRate, loanMonths);
            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-slate-500 text-xs block">Monthly EMI:</span>
                  <div className="text-2xl font-extrabold text-amber-400">${emi.monthlyEMI.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Total Interest:</span>
                  <div className="text-2xl font-extrabold text-cyan-400">${emi.totalInterest.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Total Payment:</span>
                  <div className="text-2xl font-extrabold text-emerald-400">${emi.totalPayment.toFixed(2)}</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 9. COMPOUND INTEREST */}
      {tool.slug === 'compound-interest-calculator' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Principal ($)</label>
              <input type="number" value={ciPrincipal} onChange={e => setCiPrincipal(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Return Rate (%)</label>
              <input type="number" value={ciRate} onChange={e => setCiRate(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Years)</label>
              <input type="number" value={ciYears} onChange={e => setCiYears(parseInt(e.target.value, 10) || 1)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Compounding</label>
              <select value={ciFreq} onChange={e => setCiFreq(parseInt(e.target.value, 10) as any)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs">
                <option value={12}>Monthly</option>
                <option value={4}>Quarterly</option>
                <option value={1}>Annually</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Deposit</label>
              <input type="number" value={ciMonthlyDeposit} onChange={e => setCiMonthlyDeposit(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs" />
            </div>
          </div>

          {(() => {
            const res = calculateCompoundInterest(ciPrincipal, ciRate, ciFreq, ciYears, ciMonthlyDeposit);
            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-slate-500 text-xs block">Total Invested:</span>
                  <div className="text-xl font-bold text-slate-200">${res.totalDeposited.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Total Growth / Interest:</span>
                  <div className="text-xl font-bold text-cyan-400">${res.totalInterest.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Total Maturity Value:</span>
                  <div className="text-2xl font-extrabold text-emerald-400">${res.totalMaturity.toFixed(2)}</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 10. VAT & TAX */}
      {tool.slug === 'vat-tax-calculator' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setVatMode('add')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                vatMode === 'add' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Add VAT (Exclusive)
            </button>
            <button
              onClick={() => setVatMode('extract')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                vatMode === 'extract' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Extract VAT (Inclusive)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {vatMode === 'add' ? 'Net Amount ($)' : 'Gross Amount ($)'}
              </label>
              <input
                type="number"
                value={vatAmount}
                onChange={e => setVatAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tax / VAT Rate (%)</label>
              <input
                type="number"
                value={vatRate}
                onChange={e => setVatRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
          </div>

          {(() => {
            const res = calculateVAT(vatAmount, vatRate, vatMode);
            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-slate-500 text-xs block">Net Amount:</span>
                  <div className="text-xl font-bold text-slate-200">${res.netAmount.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">VAT Amount:</span>
                  <div className="text-xl font-bold text-amber-400">${res.vatAmount.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Gross Amount:</span>
                  <div className="text-2xl font-extrabold text-emerald-400">${res.grossAmount.toFixed(2)}</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 11. BASE NUMERAL CONVERTER */}
      {tool.slug === 'base-numeral-converter' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-400">Input Base:</span>
            {[
              { base: 10, label: 'Decimal (10)' },
              { base: 2, label: 'Binary (2)' },
              { base: 16, label: 'Hex (16)' },
              { base: 8, label: 'Octal (8)' },
            ].map(b => (
              <button
                key={b.base}
                onClick={() => setBaseFrom(b.base as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  baseFrom === b.base ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Enter Number</label>
            <input
              type="text"
              value={baseVal}
              onChange={e => setBaseVal(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono"
            />
          </div>

          {(() => {
            try {
              const res = convertNumeralBases(baseVal, baseFrom);
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-xs block">Decimal</span>
                    <strong className="text-white text-base break-all">{res.dec}</strong>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-xs block">Binary</span>
                    <strong className="text-cyan-400 text-base break-all">{res.bin}</strong>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-xs block">Hexadecimal</span>
                    <strong className="text-emerald-400 text-base break-all">{res.hex}</strong>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-xs block">Octal</span>
                    <strong className="text-amber-400 text-base break-all">{res.oct}</strong>
                  </div>
                </div>
              );
            } catch (err: unknown) {
              return <div className="text-xs text-rose-400">{err instanceof Error ? err.message : 'Invalid number'}</div>;
            }
          })()}
        </div>
      )}

      {/* 12. ASPECT RATIO CALCULATOR */}
      {tool.slug === 'aspect-ratio-calculator' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Original Width (px)</label>
              <input type="number" value={arWidth} onChange={e => setArWidth(parseInt(e.target.value, 10) || 1)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Original Height (px)</label>
              <input type="number" value={arHeight} onChange={e => setArHeight(parseInt(e.target.value, 10) || 1)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Target Width (px)</label>
              <input type="number" value={arNewWidth} onChange={e => setArNewWidth(parseInt(e.target.value, 10) || 1)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
            </div>
          </div>

          {(() => {
            const ratio = calculateAspectRatio(arWidth, arHeight);
            const calculatedHeight = Math.round(arNewWidth / ratio.ratioDecimal);
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-slate-500 text-xs block">Simplified Aspect Ratio:</span>
                  <div className="text-3xl font-extrabold text-cyan-400">{ratio.ratioStr}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Proportional Height at {arNewWidth}px Width:</span>
                  <div className="text-3xl font-extrabold text-emerald-400">{calculatedHeight} px</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 13. DPI & PPI CALCULATOR */}
      {tool.slug === 'dpi-ppi-calculator' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Resolution Width (px)</label>
              <input type="number" value={ppiWidthPx} onChange={e => setPpiWidthPx(parseInt(e.target.value, 10) || 1)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Resolution Height (px)</label>
              <input type="number" value={ppiHeightPx} onChange={e => setPpiHeightPx(parseInt(e.target.value, 10) || 1)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Screen Diagonal (inches)</label>
              <input type="number" value={ppiDiagonal} onChange={e => setPpiDiagonal(parseFloat(e.target.value) || 1)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
            <span className="text-slate-500 text-xs block mb-1">Pixel Density:</span>
            <div className="text-3xl font-extrabold text-amber-400">
              {calculatePPI(ppiWidthPx, ppiHeightPx, ppiDiagonal)} PPI
            </div>
          </div>
        </div>
      )}

      {/* 14. GPA CALCULATOR */}
      {tool.slug === 'gpa-calculator' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Courses list:</span>
              <button
                onClick={() => setGpaCourses([...gpaCourses, { name: `Course ${gpaCourses.length + 1}`, gradePoint: 4.0, credits: 3 }])}
                className="text-cyan-400 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Course</span>
              </button>
            </div>

            {gpaCourses.map((c, i) => (
              <div key={i} className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <input
                  type="text"
                  value={c.name}
                  onChange={e => {
                    const updated = [...gpaCourses];
                    updated[i].name = e.target.value;
                    setGpaCourses(updated);
                  }}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white flex-1"
                />
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Grade Point:</span>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    max={5}
                    value={c.gradePoint}
                    onChange={e => {
                      const updated = [...gpaCourses];
                      updated[i].gradePoint = parseFloat(e.target.value) || 0;
                      setGpaCourses(updated);
                    }}
                    className="w-16 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Credits:</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={c.credits}
                    onChange={e => {
                      const updated = [...gpaCourses];
                      updated[i].credits = parseInt(e.target.value, 10) || 1;
                      setGpaCourses(updated);
                    }}
                    className="w-16 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <button
                  onClick={() => setGpaCourses(gpaCourses.filter((_, idx) => idx !== i))}
                  className="p-1.5 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {(() => {
            const res = calculateGPA(gpaCourses);
            return (
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
                <span className="text-slate-500 text-xs block mb-1">Cumulative GPA:</span>
                <div className="text-4xl font-extrabold text-amber-400">{res.gpa.toFixed(2)}</div>
                <p className="text-xs text-slate-500 mt-1">Total Credits: {res.totalCredits}</p>
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
};
