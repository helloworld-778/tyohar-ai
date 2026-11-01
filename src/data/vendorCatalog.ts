/**
 * @file vendorCatalog.ts
 * @description Default benchmark vendor quotes and operational checklist items for Tyohar AI.
 */

import { FileText, Zap, VolumeX, HeartHandshake, CalendarCheck } from 'lucide-react';
import type { EventType, VendorQuoteItem } from '../types/tyohar';
import type { VendorChecklistItem } from '../components/vendor/ExecutionChecklistPanel';

export function getDefaultVendorQuotes(eventType: EventType, guestCount: number): VendorQuoteItem[] {
  return [
    {
      id: 'quote-1',
      vendorName: 'Royal Rasoi Banquets & Caterers',
      category: 'Food & Catering',
      quotedTotalINR: eventType === 'wedding' ? 320000 : 35000,
      guestsCovered: guestCount,
      inclusions: [
        'Welcome mocktail bar (3 varieties)',
        '3 Live Counters (Chaat, Pasta, Tandoor)',
        'Multi-cuisine buffet with 12 dishes',
        'Traditional brassware & chafing dishes',
        '20 uniformed service staff',
      ],
      hiddenChargesFlagged: [
        '18% GST not included in quote (adds ₹57,600 extra)',
        'Waiter overtime ₹1,500/hr charged after 11:00 PM',
        'Transport & loading fee of ₹8,000 extra outside city limits',
        'Crockery breakage deposit of ₹15,000 refundable after 7 days',
      ],
      missingClarifications: [
        'Is kitchen deep-cleaning & garbage disposal included?',
        'What is the rate per plate for last-minute walk-in guests exceeding guarantee?',
        'Is there a separate dedicated Jain / Satvik preparation counter?',
      ],
      valueScore: 78,
    },
    {
      id: 'quote-2',
      vendorName: 'Annapurna Satvik Hospitality',
      category: 'Food & Catering',
      quotedTotalINR: eventType === 'wedding' ? 275000 : 28000,
      guestsCovered: guestCount,
      inclusions: [
        'Pure vegetarian & Satvik options clearly labelled',
        '2 Live Counters (Chaat & Dosa)',
        'Stainless steel thali service & buffet',
        '14 service staff + 2 supervisory captains',
        'Zero-waste composting handover packaging',
      ],
      hiddenChargesFlagged: [
        'Generator diesel backup extra at ₹3,500 if power trips',
        'Live stall gas cylinder rental ₹1,200 per burner',
      ],
      missingClarifications: [
        'Do they provide extra takeaway containers for surplus food redistribution?',
        'Does the price include paper napkins and bottled water dispensers?',
      ],
      valueScore: 89,
    },
  ];
}

export const DEFAULT_CHECKLIST_ITEMS: VendorChecklistItem[] = [
  {
    id: 'chk-1',
    title: 'Advance Token & Official GST Receipt Archived',
    description: 'Ensure token advance does not exceed 25% of total quote prior to final menu tasting.',
    category: 'Contract & Payments',
    icon: FileText,
    completed: true,
  },
  {
    id: 'chk-2',
    title: 'Dedicated Generator Diesel Backup & Fuel Policy Locked',
    description: 'Verify written contract states fuel cost is vendor liability during power cuts.',
    category: 'Operations',
    icon: Zap,
    completed: true,
  },
  {
    id: 'chk-3',
    title: 'Police NOC & Late-Night Sound Clearance Verified',
    description: 'Confirm 10:00 PM decibel zoning permit is active with local municipal authority.',
    category: 'Compliance',
    icon: VolumeX,
    completed: false,
  },
  {
    id: 'chk-4',
    title: 'Zero-Waste NGO Food Redistribution Contact Confirmed',
    description: 'Pre-schedule pickup with Robin Hood Army / Feeding India for surplus buffer trays.',
    category: 'Surplus Protocol',
    icon: HeartHandshake,
    completed: true,
  },
  {
    id: 'chk-5',
    title: 'Final Headcount Plate Lock-in Date Signed',
    description: 'Agree on deadline (48 hours prior) for final plate count adjustment without penalties.',
    category: 'Catering Lock',
    icon: CalendarCheck,
    completed: false,
  },
];

