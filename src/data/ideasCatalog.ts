/**
 * @file ideasCatalog.ts
 * @description Curated celebration concepts and regional sub-theme definitions
 * for Tyohar AI's Interactive Vibe Remixer.
 */

import {
  Palette,
  Flower2,
  Coffee,
  Users2,
} from 'lucide-react';
import type { EventType } from '../types/tyohar';
import type { IdeaCardItem } from '../components/overview/OverviewIdeasMixer';

export interface SubThemeOption {
  id: string;
  label: string;
  badge: string;
}

export function getSubThemes(eventType: EventType): SubThemeOption[] {
  if (eventType === 'wedding') {
    return [
      { id: 'default', label: 'Royal Marwar', badge: 'Heritage Palatial' },
      { id: 'dakshin', label: 'Temple Dakshin', badge: 'Kanjeevaram & Vetiver' },
      { id: 'sangeet', label: 'Modern Sangeet', badge: 'Neon Velvet & Starlight' },
    ];
  }
  if (eventType === 'birthday') {
    return [
      { id: 'default', label: 'Bollywood Retro', badge: 'Vintage 80s Disco' },
      { id: 'garden', label: 'Garden Soirée', badge: 'Pastel Floral Pergola' },
      { id: 'arcade', label: 'Arcade & Carnival', badge: 'Neon Sliders & Games' },
    ];
  }
  return [
    { id: 'default', label: 'Eco Sarvajanik Utsav', badge: 'Zero-Waste Bamboo' },
    { id: 'garba', label: 'Garba Raas Night', badge: 'Mirrorwork & Dhol' },
    { id: 'annakut', label: 'Grand Annakut Mela', badge: '56 Bhog Mahaprasad' },
  ];
}

export function getCuratedIdeas(eventType: EventType, activeSubTheme: string): IdeaCardItem[] {
  if (eventType === 'wedding') {
    if (activeSubTheme === 'dakshin') {
      return [
        {
          id: 'wed-dak-theme',
          category: 'Venue',
          title: 'Kanjeevaram Temple Sanctuary',
          desc: 'Raw brass kuthuvillaku oil lamps, natural vetiver fragrance curtains, and deep forest green silk accents.',
          costINR: 20000,
          icon: Palette,
        },
        {
          id: 'wed-dak-decor',
          category: 'Décor & Flowers',
          title: 'Banana-Leaf & Jasmine Mandap',
          desc: 'Carved natural wood pillars intertwined with fresh Madurai malli jasmine strands and hand-tied lotus buds.',
          costINR: 28000,
          icon: Flower2,
        },
        {
          id: 'wed-dak-food',
          category: 'Food & Catering',
          title: 'Filter Coffee & Payasam Bar',
          desc: 'Live brass tumbler degree coffee counter, traditional Elaneer Payasam, and hot mini-idli podi counters.',
          costINR: 18000,
          icon: Coffee,
        },
        {
          id: 'wed-dak-exp',
          category: 'Entertainment & Music',
          title: 'Classical Nadaswaram & Carnatic Lounge',
          desc: 'Live acoustic Carnatic flute and nadaswaram welcome troupe with low-decibel diwan seating for elders.',
          costINR: 15000,
          icon: Users2,
        },
      ];
    }
    if (activeSubTheme === 'sangeet') {
      return [
        {
          id: 'wed-san-theme',
          category: 'Venue',
          title: 'Starlight Glasshouse Vibe',
          desc: 'Midnight indigo walls, fairy light ceiling canopies, and polished mirrorwork floor runners.',
          costINR: 25000,
          icon: Palette,
        },
        {
          id: 'wed-san-decor',
          category: 'Décor & Flowers',
          title: 'Geometric Floral Tunnel & Photobooth',
          desc: 'Hexagonal brass flower arches with personalized family monograms and warm tungsten bulb chandeliers.',
          costINR: 32000,
          icon: Flower2,
        },
        {
          id: 'wed-san-food',
          category: 'Food & Catering',
          title: 'Gourmet Slider & Craft Chaat Galli',
          desc: 'Tandoori bao sliders, smoking dry-ice chaat bowls, and hand-spun Kesari Rabdi jalebi counters.',
          costINR: 24000,
          icon: Coffee,
        },
        {
          id: 'wed-san-exp',
          category: 'Entertainment & Music',
          title: 'Interactive Sangeet Flashmob Ring',
          desc: 'Acoustically isolated elder chill lounge with acoustic curtains, plus a dynamic central sangeet dance stage.',
          costINR: 18000,
          icon: Users2,
        },
      ];
    }
    // default: Royal Marwar
    return [
      {
        id: 'wed-mar-theme',
        category: 'Venue',
        title: 'Royal Marwar Heritage',
        desc: 'Sindoor vermilion accents, raw silk draping, brass samai floor lamps, and cascading scented mogra garlands.',
        costINR: 22000,
        icon: Palette,
      },
      {
        id: 'wed-mar-decor',
        category: 'Décor & Flowers',
        title: 'Artisanal Carved Mandap & Baithak',
        desc: 'Carved wooden arches with marigold chandeliers, low-rise floor diwans with velvet bolster cushions for family.',
        costINR: 30000,
        icon: Flower2,
      },
      {
        id: 'wed-mar-food',
        category: 'Food & Catering',
        title: 'Live Chaat Galli & Kulhad Chai',
        desc: 'Artisanal live chaat counter, slow-simmered Dal Baati Churma, hand-pulled jalebi station, and clay-cup masala chai.',
        costINR: 20000,
        icon: Coffee,
      },
      {
        id: 'wed-mar-exp',
        category: 'Entertainment & Music',
        title: 'Multi-Gen Spatial Acoustic Zoning',
        desc: 'Decibel-buffered elder retreat zone with acoustic fabric baffles, high-energy sangeet dance ring, and supervised kid crafts.',
        costINR: 16000,
        icon: Users2,
      },
    ];
  }

  if (eventType === 'birthday') {
    if (activeSubTheme === 'garden') {
      return [
        {
          id: 'bday-gar-theme',
          category: 'Venue',
          title: 'Pastel Garden Pergola',
          desc: 'Eucalyptus greens, blush peach ribbons, and rustic oak farm tables with wrought-iron lantern accents.',
          costINR: 12000,
          icon: Palette,
        },
        {
          id: 'bday-gar-decor',
          category: 'Décor & Flowers',
          title: 'Floral Photo Pergola Arch',
          desc: 'Cascading baby breath and pastel roses surrounding an interactive polaroid guestbook memory wall.',
          costINR: 14000,
          icon: Flower2,
        },
        {
          id: 'bday-gar-food',
          category: 'Food & Catering',
          title: 'Artisanal Grazing & Mocktail Bar',
          desc: 'Cold-pressed botanical mocktail spritzers, wood-fired flatbreads, and Belgian chocolate fondue.',
          costINR: 11000,
          icon: Coffee,
        },
        {
          id: 'bday-gar-exp',
          category: 'Entertainment & Music',
          title: 'Acoustic Guitarist & Lawn Games',
          desc: 'Live fingerstyle acoustic performance, giant wooden jenga, and cozy beanbag seating circles.',
          costINR: 8000,
          icon: Users2,
        },
      ];
    }
    if (activeSubTheme === 'arcade') {
      return [
        {
          id: 'bday-arc-theme',
          category: 'Venue',
          title: 'Neon Arcade Carnival',
          desc: 'Electric berry purple accents, retro marquee signboards, and glow-in-the-dark celebration wristbands.',
          costINR: 10000,
          icon: Palette,
        },
        {
          id: 'bday-arc-decor',
          category: 'Décor & Flowers',
          title: 'Balloons Tunnel & Holographic Wall',
          desc: 'Organic balloon garland arch with retro pixel art cutouts and neon LED photo monograms.',
          costINR: 12000,
          icon: Flower2,
        },
        {
          id: 'bday-arc-food',
          category: 'Food & Catering',
          title: 'Live Popcorn & Slider Truck',
          desc: 'Mini brioche sliders, seasoned popcorn station (truffle & caramel), and craft soda fountains.',
          costINR: 9000,
          icon: Coffee,
        },
        {
          id: 'bday-arc-exp',
          category: 'Entertainment & Music',
          title: 'Retro Arcade & Toddler Play Ring',
          desc: 'Pop-a-shot basketball, pinball machine rentals, and safe padded foam play zone for infants.',
          costINR: 11000,
          icon: Users2,
        },
      ];
    }
    // default: Bollywood Retro
    return [
      {
        id: 'bday-ret-theme',
        category: 'Venue',
        title: 'Bollywood Retro Jubilee',
        desc: 'Vintage hand-painted cinema poster cutouts, gilded brass starbursts, and disco gold shimmer backdrops.',
        costINR: 11000,
        icon: Palette,
      },
      {
        id: 'bday-ret-decor',
        category: 'Décor & Flowers',
        title: 'Memory Gallery Tunnel',
        desc: 'Interactive photo timeline tunnel leading guests through the milestone years, velvet poufs, and marigold strings.',
        costINR: 13000,
        icon: Flower2,
      },
      {
        id: 'bday-ret-food',
        category: 'Food & Catering',
        title: 'Street Chaat & Vintage Soda Station',
        desc: 'Live Pani Puri shooter station, spicy bhel counters, and marble-stopper Goti Soda bottles.',
        costINR: 10000,
        icon: Coffee,
      },
      {
        id: 'bday-ret-exp',
        category: 'Entertainment & Music',
        title: 'Retro 80s Live DJ & Elder Baithak',
        desc: 'Classic vinyl Bollywood playlist with acoustic buffer zone and plush armchair seating for seniors.',
        costINR: 9000,
        icon: Users2,
      },
    ];
  }

  // Community Event
  if (activeSubTheme === 'garba') {
    return [
      {
        id: 'com-gar-theme',
        category: 'Venue',
        title: 'Peacock Teal Garba Arena',
        desc: 'Vibrant bandhani canopies, mirrorwork tapestries, and circular concentric floor chalk outlines.',
        costINR: 15000,
        icon: Palette,
      },
      {
        id: 'com-gar-decor',
        category: 'Décor & Flowers',
        title: 'Central Amba Matha Altar & Diya Wall',
        desc: 'Tiered brass brassiere diyas, marigold flower towers, and colorful wooden dandiya display stands.',
        costINR: 18000,
        icon: Flower2,
      },
      {
        id: 'com-gar-food',
        category: 'Food & Catering',
        title: 'Midnight Jalebi & Fafda Counter',
        desc: 'Freshly fried crispy fafda with papaya sambharo, piping hot kesar jalebi, and spiced masala tea.',
        costINR: 14000,
        icon: Coffee,
      },
      {
        id: 'com-gar-exp',
        category: 'Entertainment & Music',
        title: 'Live Dhol Troupe & Senior Sabha Seating',
        desc: 'Traditional high-energy acoustic dhol players with elevated, shaded grandstand seating for community elders.',
        costINR: 12000,
        icon: Users2,
      },
    ];
  }
  if (activeSubTheme === 'annakut') {
    return [
      {
        id: 'com-ann-theme',
        category: 'Venue',
        title: 'Grand Annakut Temple Pavilion',
        desc: 'Turmeric yellow shamianas, sacred kalash entrance arches, and ceremonial brass bell pillars.',
        costINR: 16000,
        icon: Palette,
      },
      {
        id: 'com-ann-decor',
        category: 'Décor & Flowers',
        title: '56 Bhog Tiered Mahaprasad Altar',
        desc: 'Stepped velvet altar with fragrant rose petals, fresh fruit pyramids, and holy tulsi garlands.',
        costINR: 20000,
        icon: Flower2,
      },
      {
        id: 'com-ann-food',
        category: 'Food & Catering',
        title: 'Sattvik Maha-Bhandara Kitchen',
        desc: 'Zero-onion-garlic pure ghee khichdi, seasonal vegetable curries, and clay-pot churned buttermilk.',
        costINR: 22000,
        icon: Coffee,
      },
      {
        id: 'com-ann-exp',
        category: 'Entertainment & Music',
        title: 'Community Volunteer & Darshan Queue',
        desc: 'Ramp-accessible senior queue, volunteer water stations, and devotional bhajan mandali performance.',
        costINR: 9000,
        icon: Users2,
      },
    ];
  }
  // default: Eco Sarvajanik
  return [
    {
      id: 'com-eco-theme',
      category: 'Venue',
      title: 'Eco Sarvajanik Utsav Pavilion',
      desc: 'Earth-toned terracotta urns, turmeric yellow shamianas, natural bamboo arches, and floral petal rangoli floor mosaics.',
      costINR: 14000,
      icon: Palette,
    },
    {
      id: 'com-eco-decor',
      category: 'Décor & Flowers',
      title: 'Open-Air Shamiana & Sabha',
      desc: 'Weather-shielded fabric pavilion canopy, elevated community stage for cultural performances, and wide wheelchair pathways.',
      costINR: 17000,
      icon: Flower2,
    },
    {
      id: 'com-eco-food',
      category: 'Food & Catering',
      title: 'Sattvik Annakut & Prasadam Feast',
      desc: 'Zero-onion-garlic pure ghee feast, seasonal vegetable thali, earthen matka buttermilk counter, and eco-friendly leaf plates.',
      costINR: 16000,
      icon: Coffee,
    },
    {
      id: 'com-eco-exp',
      category: 'Entertainment & Music',
      title: 'Inclusive Civic Experience',
      desc: 'Dedicated ramp-accessible front seating for neighborhood elders, youth folk dance circle, and volunteer water stations.',
      costINR: 10000,
      icon: Users2,
    },
  ];
}

