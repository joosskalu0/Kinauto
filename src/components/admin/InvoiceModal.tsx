import React from 'react';
import { X, Printer, CheckCircle2, Building, FileText, Home, Wrench } from 'lucide-react';
import { Invoice, DealershipAccount, GarageProfile } from '../../types';

interface InvoiceModalProps {
  invoice: Invoice;
  dealershipAccount?: DealershipAccount;
  garageProfile?: GarageProfile;
  onClose: () => void;
  onMarkPaid?: (invoiceId: string) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoice,
  dealershipAccount,
  garageProfile,
  onClose,
  onMarkPaid
}) => {
  const handlePrint = () => {
    window.print();
  };

  const isGarageInvoice = invoice.typeEntite === 'garage' || !!invoice.garageId || !!garageProfile;
  const clientNom = invoice.garageNom || invoice.dealershipNom || (garageProfile ? garageProfile.nom : dealershipAccount?.info.nom) || 'Client Professionnel';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200 text-slate-900 max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Control */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">Facture Officielle #{invoice.id}</h3>
            {isGarageInvoice ? (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <Wrench className="w-3 h-3 text-amber-700" /> Atelier / Garage
              </span>
            ) : (
              <span className="bg-indigo-100 text-indigo-900 border border-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <Building className="w-3 h-3 text-indigo-700" /> Concession
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Imprimer / PDF
            </button>
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="Retourner à l'accueil"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Accueil</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Document Canvas */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs bg-white text-slate-800" id="printable-invoice">
          
          {/* Top Invoice Banner */}
          <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-xs">
                  ⚡
                </div>
                <span className="font-black text-xl text-slate-900 tracking-wider">AUTO-CONCESSION & GARAGES SaaS</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">Plateforme de Gestion & Multidiffusion Concessions & Ateliers Kinshasa</p>
              <p className="text-[10px] text-slate-500 font-mono">RCCM / ID.NAT : CD/KNG/RCCM/20-B-00892 • NIF : A2049182C</p>
            </div>

            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                invoice.statut === 'payee'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : invoice.statut === 'en_retard'
                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                {invoice.statut === 'payee' ? '✓ FACTURE PAYÉE' : invoice.statut === 'en_retard' ? '🔴 EN RETARD' : '🟠 EN ATTENTE DE RÈGLEMENT'}
              </span>
              <p className="text-slate-900 font-mono font-bold text-sm mt-2">N° Facture : {invoice.id}</p>
              <p className="text-slate-500 text-[11px]">Date d'émission : {invoice.dateEmission}</p>
              <p className="text-amber-800 font-bold text-[11px]">Échéance : {invoice.dateEcheance}</p>
            </div>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Émetteur (Prestataire Plateforme) :</p>
              <p className="font-bold text-slate-900">AutoConcession Cloud Services RDC</p>
              <p className="text-slate-600">Boulevard du 30 Juin, Immeuble Future Tower</p>
              <p className="text-slate-600">Gombe, Kinshasa, RDC</p>
              <p className="text-slate-600">Email : facturation@autoconcession-cloud.cd</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">
                {isGarageInvoice ? 'Client Facturé (Atelier / Garage Partenaire) :' : 'Client Facturé (Concessionnaire) :'}
              </p>
              <p className="font-extrabold text-amber-800 text-sm">{clientNom}</p>
              {garageProfile ? (
                <>
                  <p className="text-slate-700 font-medium">Attn : {garageProfile.responsable} ({garageProfile.titreResponsable || 'Chef d\'Atelier'})</p>
                  <p className="text-slate-600">📍 {garageProfile.commune}, Kinshasa</p>
                  <p className="text-slate-600">{garageProfile.adresse}</p>
                  <p className="text-slate-600 font-mono text-[10px]">Tél : {garageProfile.telephonePrincipal}</p>
                  {garageProfile.email && <p className="text-slate-600">Email : {garageProfile.email}</p>}
                </>
              ) : dealershipAccount ? (
                <>
                  <p className="text-slate-700 font-medium">Attn : {dealershipAccount.responsableNom}</p>
                  <p className="text-slate-600">{dealershipAccount.info.adresse}</p>
                  <p className="text-slate-600">{dealershipAccount.info.codePostal} {dealershipAccount.info.ville}</p>
                  <p className="text-slate-600 font-mono text-[10px]">SIRET : {dealershipAccount.info.siret}</p>
                  <p className="text-slate-600">Email : {dealershipAccount.emailLogin}</p>
                </>
              ) : null}
            </div>
          </div>

          {/* Details Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="p-3">Désignation des Prestations</th>
                  <th className="p-3 text-center">Période</th>
                  <th className="p-3 text-right">Montant HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3">
                    <p className="font-bold text-slate-900">{invoice.description}</p>
                    <p className="text-[11px] text-slate-500">
                      {isGarageInvoice
                        ? 'Référencement prioritaire Annuaire Kinshasa, module alertes SOS Dépannage 24/7 & support dédié.'
                        : 'Accès illimité plateforme SaaS, hébergement stock, API Gemini & support pro.'}
                    </p>
                  </td>
                  <td className="p-3 text-center font-medium text-slate-700">{invoice.periode}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">{invoice.montantHT.toLocaleString('fr-FR')} FC</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Summary Box */}
          <div className="flex justify-end pt-2">
            <div className="w-72 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total HT :</span>
                <span className="font-mono font-bold text-slate-900">{invoice.montantHT.toLocaleString('fr-FR')} FC</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>TVA (16%) :</span>
                <span className="font-mono font-bold text-slate-900">{invoice.tva.toLocaleString('fr-FR')} FC</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-amber-800 text-sm">
                <span>TOTAL TTC :</span>
                <span className="font-mono">{invoice.montantTTC.toLocaleString('fr-FR')} FC</span>
              </div>
            </div>
          </div>

          {/* Payment Terms & Instructions */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-[11px]">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              💳 Modalités de Réglement
            </p>
            <p className="text-slate-600">
              Paiement par Mobile Money (M-Pesa : 0829450112 / Airtel Money : 099000111) ou Virement Bancaire (Rawbank / Equity BCDC / Ecobank).
            </p>
            <div className="font-mono text-[10px] text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              IBAN / Compte : CD76 3000 4012 3456 7890 1234 567 • BIC : RAWBANKCDXXX
              <br />
              Libellé : Facture {invoice.id} - {clientNom}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Accueil</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                Fermer la facture
              </button>
            </div>

            {onMarkPaid && invoice.statut !== 'payee' && (
              <button
                onClick={() => {
                  onMarkPaid(invoice.id);
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Marquer cette Facture comme PAYÉE
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
