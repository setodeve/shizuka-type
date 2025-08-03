# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "shizuka-type" - a web application that objectively measures whether your typing is too loud. The app uses Web Audio API to analyze typing sounds and provides a 3-level assessment: "quiet", "normal", or "loud".

**Target Platform**: Desktop web browsers only (mobile not supported)
**Tech Stack**: Nuxt.js frontend with Web Audio API, Chart.js for visualizations, Vercel deployment

## Key Features & Logic

- **Measurement Duration**: Fixed 30 seconds
- **Sound Detection**: Considers sounds ≥60dB as typing noise
- **Judgment Criteria**: ≥10 occurrences of 60dB+ sounds in 30 seconds = "loud"
- **Privacy**: All audio processing is local (no server transmission)
- **Real-time UI**: Live audio level bar display with countdown timer

## Development Commands

Since this appears to be a Nuxt.js project, typical commands would be:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build
- `npm test` - Run tests (if configured)
- `npm run lint` - Lint code (if configured)

## Architecture Notes

The application centers around Web Audio API integration for:
1. Microphone access and audio stream processing
2. Real-time decibel level analysis
3. Sound event detection and counting
4. Chart.js integration for visual feedback

Core functionality should be organized around:
- Audio permission handling
- Real-time audio analysis
- Timer/countdown management
- Result calculation and display
- Local storage for optional result saving

## Testing Considerations

The README specifies testing with actual recorded typing sounds from different keyboard types (mechanical, silent, laptop) in both quiet and noisy environments to verify accuracy and prevent false positives.