export function iconSvg(paths) {
  return `<svg class="rb-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">${paths}</svg>`;
}

const lessonIconMap = {
  R1: iconSvg('<rect x="6" y="7" width="12" height="10" rx="3" stroke="currentColor" stroke-width="1.7"/><circle cx="10" cy="12" r="1" fill="currentColor"/><circle cx="14" cy="12" r="1" fill="currentColor"/><path d="M12 7V4M8 20h8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
  R2: iconSvg('<path d="M9.8 4.8 7 7.6l2.6 2.6 2.8-2.8-2.6-2.6Zm4.6 8.2-2.8 2.8 2.6 2.6 2.8-2.8-2.6-2.6ZM5.4 11.4 3 13.8l2.6 2.6 2.4-2.4-2.6-2.6Zm13.2-1.6-2.4 2.4 2.6 2.6 2.4-2.4-2.6-2.6Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'),
  R3: iconSvg('<circle cx="9" cy="12" r="2.2" stroke="currentColor" stroke-width="1.7"/><path d="M12.7 10a4.4 4.4 0 0 1 0 4M15.3 8a7.3 7.3 0 0 1 0 8M17.8 6a10.3 10.3 0 0 1 0 12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
  R4: iconSvg('<path d="M12 5.2v2.1M12 16.7v2.1M7.2 12h-2M18.8 12h-2M8.5 8.5 7 7M17 17l-1.5-1.5M15.5 8.5 17 7M7 17l1.5-1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="12" r="3.8" stroke="currentColor" stroke-width="1.7"/>'),
  R5: iconSvg('<path d="M13 3 6.5 13h4L9.8 21l7.7-11h-4.4L13 3Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'),
  R6: iconSvg('<rect x="4" y="5" width="16" height="14" rx="3" stroke="currentColor" stroke-width="1.7"/><path d="m9 9-2.5 3L9 15M15 9l2.5 3-2.5 3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'),
  R7: iconSvg('<rect x="5" y="9" width="14" height="7" rx="2.4" stroke="currentColor" stroke-width="1.7"/><circle cx="9" cy="17.2" r="1.5" fill="currentColor"/><circle cx="15" cy="17.2" r="1.5" fill="currentColor"/><path d="M7.5 9V7.4c0-1.3 1.2-2.4 2.7-2.4h3.6c1.5 0 2.7 1.1 2.7 2.4V9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
  R8: iconSvg('<path d="M12 4.2 18 6.4v5.2c0 3.7-2.4 6.8-6 8.2-3.6-1.4-6-4.5-6-8.2V6.4l6-2.2Z" stroke="currentColor" stroke-width="1.7"/><path d="m9.3 12.2 1.8 1.8 3.6-3.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'),
  R9: iconSvg('<path d="M4.8 5.5h6.3M12.9 5.5h6.3M17.2 5.5v3.2M17.2 8.7H11M11 8.7v3.2M11 11.9h-6M6 11.9v3.2M6 15.1h8.7M14.7 15.1v3.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'),
  R10: iconSvg('<path d="M14.8 4.3 8.4 10.7M14.8 4.3l1.8 3.8M14.8 4.3 11 6.1M8.4 10.7l-1.8 3.8M8.4 10.7l3.8 3.8M6.6 14.5l3.8 1.8M12.2 14.5l-1.8 5.2M12.2 14.5l5.2-1.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'),
  R11: iconSvg('<path d="M12 4.5 14 8.4l4.3.6-3.1 3 0.7 4.3L12 14.2l-3.9 2.1.7-4.3-3.1-3 4.3-.6L12 4.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'),
  R12: iconSvg('<circle cx="12" cy="9.5" r="4.5" stroke="currentColor" stroke-width="1.7"/><path d="M8.2 17.4h7.6M9.4 20h5.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="m10.8 9.7 1 1 1.8-2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>')
};

const uiIconMap = {
  robot: lessonIconMap.R1,
  rocket: lessonIconMap.R10,
  gear: lessonIconMap.R4,
  spark: lessonIconMap.R11,
  star: lessonIconMap.R12,
  badge: iconSvg('<path d="M12 4.6 14.6 9l4.8.8-3.4 3.3.8 4.9-4.8-2.6-4.8 2.6.8-4.9-3.4-3.3 4.8-.8L12 4.6Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9.8 14.8V20l2.2-1.5L14.2 20v-5.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'),
  play: iconSvg('<path d="m9 7 8 5-8 5V7Z" fill="currentColor"/>'),
  lock: iconSvg('<rect x="6" y="10" width="12" height="9" rx="2.2" stroke="currentColor" stroke-width="1.7"/><path d="M8.8 10V8.2A3.2 3.2 0 0 1 12 5a3.2 3.2 0 0 1 3.2 3.2V10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>')
};

export function getLessonIconSvg(key) {
  return lessonIconMap[String(key).toUpperCase()] || lessonIconMap.R1;
}

export function getUiIconSvg(key) {
  return uiIconMap[key] || uiIconMap.robot;
}
