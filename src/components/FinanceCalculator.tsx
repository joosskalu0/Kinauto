import React, { useState } from 'react';
import { Calculator, Coins, Calendar, Percent, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { FinancingParams } from '../types';

interface FinanceCalculatorProps {
  vehiclePrice: number;
  onApplyFinancing?: (params: FinancingParams) => void;
  className?: string;
}

export const FinanceCalculator: React.FC<FinanceCalculatorProps> = ({
  vehiclePrice,
  onApplyFinancing,
  className = ''
}) => {
  // Initial default values: 15% apport, 48 months, 4.9% annual interest
  const defaultApport = Math.round(vehiclePrice * 0.15);
  const [apport, setApport] = useState<number>(defaultApport);
  const [dureeMois, setDureeMois] = useState<number>(48);
  const [tauxAnnuel, setTauxAnnuel] = useState<number>(4.9);

  // Financial calculations
  const montantEmprunte = Math.max(0, vehiclePrice - apport);
  const tauxMensuel = (tauxAnnuel / 100) / 12;

  let mensualite = 0;
  if (tauxMensuel > 0 && dureeMois > 0) {
    mensualite = (montantEmprunte * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -dureeMois));
  } else if (dureeMois > 0) {
    mensualite = montantEmprunte / dureeMois;
  }

  const totalInterets = Math.max(0, (mensualite * dureeMois) - montantEmprunte);
  const montantTotalDu = mensualite * dureeMois;

  const dureeOptions = [12, 24, 36, 48, 60, 72, 84];

  const handleReset = () => {
    setApport(defaultApport);
    setDureeMois(48);
    setTauxAnnuel(4.9);
  };

  return (
    <div className={`bg-slate-950 text-slate-100 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-amber-500/30 shadow-2xl space-y-5 ${className}`}>
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Calculator className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
              <span>Calculateur de Financement</span>
            </h3>
            <p className="text-xs text-slate-400">
              Estimez vos mensualités sur mesure pour ce véhicule
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <span className="bg-emerald-500/15 text-emerald-400 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>TAEG {tauxAnnuel}% Fixe</span>
          </span>
          <button
            onClick={handleReset}
            title="Réinitialiser la simulation"
            className="text-xs text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Mobile 1 column, Desktop 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Price & Apport Input Card */}
          <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Apport Personnel</span>
              </span>
              <span className="text-amber-400 font-extrabold text-sm sm:text-base">
                {apport.toLocaleString('fr-FR')} € <span className="text-xs text-slate-400 font-normal">({((apport / vehiclePrice) * 100).toFixed(0)}%)</span>
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={Math.round(vehiclePrice * 0.7)}
                step="250"
                value={apport}
                onChange={(e) => setApport(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              
              {/* Quick Apport Preset Buttons for Mobile Ease */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[0, 10, 20, 30, 40].map((pct) => {
                  const val = Math.round((vehiclePrice * pct) / 100);
                  const isSelected = Math.abs(apport - val) < 100;
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setApport(val)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition border cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                      }`}
                    >
                      {pct}% ({val.toLocaleString('fr-FR')}€)
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Durée du Crédit Card */}
          <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>Durée du Crédit</span>
              </span>
              <span className="text-sky-400 font-extrabold text-sm sm:text-base">
                {dureeMois} Mois <span className="text-xs text-slate-400 font-normal">({(dureeMois / 12).toFixed(dureeMois % 12 === 0 ? 0 : 1)} ans)</span>
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {dureeOptions.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDureeMois(m)}
                  className={`py-2 text-xs font-black rounded-xl transition cursor-pointer border ${
                    dureeMois === m
                      ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Taux d'intérêt annuel Slider */}
          <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-emerald-400" />
                <span>Taux d'Intérêt Annuel (TAEG)</span>
              </span>
              <span className="text-emerald-400 font-extrabold text-sm sm:text-base">
                {tauxAnnuel.toFixed(1)} %
              </span>
            </div>

            <input
              type="range"
              min="1.0"
              max="12.0"
              step="0.1"
              value={tauxAnnuel}
              onChange={(e) => setTauxAnnuel(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1.0% (Taux promotionnel)</span>
              <span>4.9% (Taux standard)</span>
              <span>12.0%</span>
            </div>
          </div>

        </div>

        {/* Output Results Card (5 cols on lg) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-4 sm:p-6 rounded-2xl border border-amber-500/40 flex flex-col justify-between space-y-5 shadow-2xl relative overflow-hidden">
          
          <div className="text-center space-y-2 py-2 border-b border-slate-800">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Mensualité Estimée
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight pt-1 flex items-baseline justify-center gap-1">
              <span className="text-amber-400">{Math.round(mensualite).toLocaleString('fr-FR')}</span>
              <span className="text-lg text-slate-400 font-bold">€ / mois</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Hors assurance facultative • Sans engagement
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Prix véhicule :</span>
              <span className="font-bold text-white">{vehiclePrice.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Apport déduit :</span>
              <span className="font-bold text-amber-400">-{apport.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Montant emprunté :</span>
              <span className="font-bold text-white">{montantEmprunte.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Coût total des intérêts :</span>
              <span className="font-bold text-emerald-400">+{Math.round(totalInterets).toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex justify-between items-center py-1 font-bold">
              <span className="text-slate-300">Montant total dû :</span>
              <span className="text-white text-sm font-black">{Math.round(montantTotalDu).toLocaleString('fr-FR')} €</span>
            </div>
          </div>

          {onApplyFinancing && (
            <button
              type="button"
              onClick={() => onApplyFinancing({ prixVehicule: vehiclePrice, apport, dureeMois, tauxAnnuel })}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer text-xs shadow-lg shadow-amber-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Demander ce Financement sur Mesure</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>
    </div>
  );
};

// Backwards compatibility export
export const FinancingCalculator = FinanceCalculator;
