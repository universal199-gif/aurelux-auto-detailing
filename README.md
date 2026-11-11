# AURELUX Auto Detailing (demo)

A multi-page, static, mobile-first website for a **fictional** premium car detailing studio in Costa Mesa, California. It was built as a portfolio demonstration and as a reusable starting point for real car-detailing clients.

> **Demo notice.** AURELUX is not a real business. Contact details are placeholders, prices are illustrative, the sample reviews are placeholders, and the photographs are stock images. Nothing here is a real quotation, testimonial, award or certification.

Live site: _to be added after the first Cloudflare Pages deployment_

## Pages

| Page | File | Purpose |
|---|---|---|
| Home | index.html | Gradient hero, value strip, featured services, before/after simulation, sample reviews, call to action |
| Services | services.html | Ceramic coating, paint correction, interior, exterior and package overviews |
| Pricing | pricing.html | Three illustrative packages with a comparison table |
| Gallery | gallery.html | Filterable photo grid with an accessible lightbox |
| About | about.html | Brand philosophy, standards, customer experience and process (typographic, no photographs) |
| Contact | contact.html | Quote form (Formspree placeholder), Calendly placeholder, contact detail placeholders |

## Tech stack

HTML5, CSS3 and vanilla JavaScript. Google Fonts (Cormorant Garamond and Inter). No framework, build step, backend or database. It deploys as a plain static site.

## Project structure
aurelux-auto-detailing/
├── index.html
├── services.html
├── pricing.html
├── gallery.html
├── about.html
├── contact.html
├── favicon.svg
├── css/
│   ├── style.css          Design tokens, base and component styles (mobile first)
│   └── responsive.css     Tablet and desktop enhancements (loads after style.css)
├── js/
│   ├── main.js            Shared: mobile menu, header, scroll reveal, before/after slider, image fallback
│   └── gallery.js         Gallery filters and lightbox (gallery page only)
├── assets/
│   ├── images/            Optimized WebP photographs (see credits)
│   ├── icons/             Empty placeholder folder
│   └── fonts/             Empty placeholder folder
├── .gitignore
└── README.md
