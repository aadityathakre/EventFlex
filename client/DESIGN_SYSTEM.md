# EventFlex Design System & UI/UX Guidelines

## 🎨 Design Philosophy

**EventFlex** follows a modern, elegant, and soft UI/UX approach with smooth transitions and professional aesthetics. The design emphasizes user experience, visual hierarchy, and seamless interactions.

---

## 🌈 Color Palette

### Primary Colors
- **Purple Gradient**: `from-purple-600 to-indigo-600`
  - Primary actions, buttons, links
  - Brand identity
  - Active states

- **Purple Shades**:
  - `purple-50` - Light backgrounds
  - `purple-100` - Borders, subtle highlights
  - `purple-200` - Hover states
  - `purple-400` - Icons, accents
  - `purple-600` - Primary color
  - `purple-700` - Hover states on buttons

- **Indigo Shades**:
  - `indigo-50` - Light backgrounds
  - `indigo-600` - Secondary color
  - `indigo-700` - Hover states

- **Pink Accent**: `pink-600` (for gradient variations)

### Neutral Colors
- **Gray Scale**:
  - `gray-50` - Very light backgrounds
  - `gray-100` - Light backgrounds
  - `gray-300` - Borders, dividers
  - `gray-400` - Disabled states
  - `gray-500` - Secondary text
  - `gray-600` - Body text
  - `gray-700` - Headings
  - `gray-900` - Dark text

- **White/Black**:
  - `white` - Cards, modals
  - `white/95` - Semi-transparent cards (backdrop blur)
  - `black` - Text (sparingly)
  - `black/30` - Backdrop overlays

### Status Colors
- **Success**: `green-500` (checkmarks, success states)
- **Error**: `red-600` (error messages, validation)
- **Warning**: `orange-400` (alerts)
- **Info**: `blue-400` (information)

---

## 🎯 Typography

### Headings
- **H1 (Hero)**: 
  - Size: `text-4xl` to `text-7xl` (responsive)
  - Weight: `font-extrabold`
  - Style: Gradient text (`bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600`)
  - Usage: Main titles, hero sections

- **H2 (Section Titles)**:
  - Size: `text-4xl` to `text-5xl` (responsive)
  - Weight: `font-bold`
  - Color: `text-gray-900`
  - Usage: Section headings

- **H3**:
  - Size: `text-2xl` to `text-3xl`
  - Weight: `font-bold`
  - Color: `text-gray-900`
  - Usage: Subsection titles

- **H4**:
  - Size: `text-xl`
  - Weight: `font-semibold`
  - Color: `text-gray-900`
  - Usage: Card titles, labels

### Body Text
- **Large**: `text-lg` to `text-xl` (descriptions, lead text)
- **Regular**: `text-base` (default body text)
- **Small**: `text-sm` (captions, footers)
- **Color**: `text-gray-600` or `text-gray-700`

### Special Text
- **Gradient Text**: Use `text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600`
- **Links**: `text-purple-600 hover:text-indigo-600 hover:underline font-semibold`

---

## 🧩 Component Patterns

### Buttons

#### Primary Button
```jsx
className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
```
- Use for main actions (Register, Login, Submit)
- Always include hover effects
- Include transform scale on hover

#### Secondary Button
```jsx
className="bg-white text-purple-600 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-purple-600"
```
- Use for secondary actions
- White background with purple border

#### Text Button
```jsx
className="text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all duration-300"
```
- Use for less prominent actions
- No background, just text with hover state

#### Disabled Button
```jsx
className="bg-gray-400 cursor-not-allowed text-white"
```
- Use when action is not available
- Remove hover effects

### Input Fields

#### Standard Input
```jsx
className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
```
- Always include focus states
- Use `focus:ring-2 focus:ring-purple-600` for consistency
- Include `transition-all` for smooth interactions

#### Input with Icon
```jsx
<div className="relative">
  <input className="... pr-10" />
  <span className="absolute inset-y-0 right-3 flex items-center">
    {/* Icon */}
  </span>
</div>
```

### Cards

#### Standard Card
```jsx
className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
```
- Use `rounded-2xl` for modern look
- Include hover elevation effect
- Smooth transitions

#### Modal Card
```jsx
className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative border border-purple-100"
```
- Semi-transparent with backdrop blur
- Always include border for definition
- Use for overlays/modals

### Navigation

#### Navbar
- Fixed position with backdrop blur on scroll
- Transparent when at top, solid when scrolled
- Smooth transitions between states

#### Nav Links
```jsx
className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
  active 
    ? "text-purple-600 bg-purple-50" 
    : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
}`}
```

---

## ✨ Effects & Animations

### Hover Effects
- **Scale**: `transform hover:scale-105` (buttons, cards)
- **Translate**: `transform hover:-translate-y-2` (cards)
- **Shadow**: `hover:shadow-xl` (elevation)
- **Color**: Smooth color transitions on all interactive elements

### Transitions
- **Duration**: Always use `transition-all duration-300`
- **Easing**: Default (ease-in-out)

### Animations
- **Fade In**: `animate-fade-in` (modals, new content)
- **Bounce**: `animate-bounce` (scroll indicators)
- **Smooth Scroll**: `scroll-behavior: smooth` (navigation)

### Blur Effects
- **Backdrop Blur**: `backdrop-blur-md` (modals, overlays)
- **Background Blur**: `blur-sm` (4px blur for background content)

---

## 📐 Spacing & Layout

### Container
- Max width: `max-w-7xl` (main content)
- Padding: `px-4 sm:px-6 lg:px-8` (responsive)
- Centering: `mx-auto`

### Section Spacing
- Vertical padding: `py-20` (sections)
- Gap between elements: `gap-4` to `gap-8` (grids)
- Margin bottom: `mb-6` to `mb-16` (headings)

### Card Padding
- Standard: `p-6` to `p-8`
- Compact: `p-4`

### Grid Layouts
- **2 Columns**: `grid-cols-1 md:grid-cols-2`
- **3 Columns**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Always responsive, mobile-first

---

## 🎭 Modal & Overlay Patterns

### Modal Structure
```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-black/30" onClick={close}></div>
  <div className="relative z-10 w-full max-w-lg">
    {/* Modal Content */}
  </div>
</div>
```

### Background Blur
- Home page blurred when modal opens: `blur-sm pointer-events-none select-none`
- Backdrop: `bg-black/30` (semi-transparent overlay)

### Close Button
- Position: `absolute top-4 right-4`
- Style: `text-gray-400 hover:text-purple-600 transition-colors`
- Icon: `FaTimes` from react-icons

---

## 🔤 Form Patterns

### Form Structure
- Always use `onSubmit` handler
- Include `required` attributes
- Add proper `autoComplete` attributes
- Clear forms on component mount with `useEffect`

### Form Validation
- Error messages: `text-red-600 font-medium bg-red-50 p-3 rounded-lg`
- Success states: `text-green-500`
- Real-time validation feedback

### Password Fields
- Always include show/hide toggle
- Use eye icons: `AiOutlineEye` / `AiOutlineEyeInvisible`
- Position icon: `absolute inset-y-0 right-3`

---

## 🖼️ Image & Media

### Image Containers
- Rounded corners: `rounded-2xl` or `rounded-lg`
- Overflow: `overflow-hidden` for rounded images
- Hover effects: `group-hover:scale-110 transition-transform duration-500`

### Image Overlays
- Gradient overlays for text readability
- Use `bg-gradient-to-t` with color opacity

---

## 📱 Responsive Design

### Breakpoints
- Mobile: Default (no prefix)
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)
- Large: `xl:` (1280px+)

### Mobile-First Approach
- Always design for mobile first
- Add larger screen styles with breakpoints
- Test on multiple screen sizes

### Touch Targets
- Minimum size: `44x44px` for buttons
- Adequate spacing between interactive elements

---

## 🎪 Special Components

### Hero Section
- Full viewport height: `min-h-screen`
- Centered content: `flex items-center justify-center`
- Gradient background: `bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50`
- Animated elements: Fade-in animations

### Footer
- Dark gradient: `bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900`
- White text with opacity variations
- Social icons with hover effects
- Scroll-to-top button: Fixed position, bottom-right

### Service Cards
- Image at top with gradient overlay
- Icon badge in corner
- Hover effects: Scale image, elevate card
- Color-coded by service type

---

## 🎨 Gradient Patterns

### Text Gradients
```jsx
className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600"
```

### Background Gradients
- Light: `bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50`
- Dark: `bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900`
- Button: `bg-gradient-to-r from-purple-600 to-indigo-600`

---

## 🔍 Accessibility

### Focus States
- Always visible: `focus:ring-2 focus:ring-purple-600`
- Remove default outline: `focus:outline-none`
- High contrast for visibility

### ARIA Labels
- Add `aria-label` to icon-only buttons
- Use semantic HTML elements
- Proper form labels

### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- Escape key closes modals

---

## 🚀 Performance

### Image Optimization
- Use appropriate image sizes
- Lazy loading for below-fold images
- Optimize formats (WebP when possible)

### Animation Performance
- Use `transform` and `opacity` for animations (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly

### Code Splitting
- Lazy load routes
- Code split large components
- Optimize bundle size

---

## 📋 Component Checklist

When creating new components, ensure:
- [ ] Consistent color scheme (purple/indigo gradients)
- [ ] Smooth transitions on all interactions
- [ ] Hover effects on interactive elements
- [ ] Responsive design (mobile-first)
- [ ] Proper spacing and padding
- [ ] Focus states for accessibility
- [ ] Error handling and validation
- [ ] Loading states where applicable
- [ ] Consistent typography
- [ ] Shadow and elevation effects
- [ ] Rounded corners (`rounded-lg` or `rounded-2xl`)
- [ ] Backdrop blur for modals/overlays

---

## 🎯 Design Principles

1. **Consistency**: Use the same patterns throughout
2. **Clarity**: Clear visual hierarchy and information architecture
3. **Feedback**: Always provide visual feedback for user actions
4. **Smoothness**: All transitions should be smooth and purposeful
5. **Elegance**: Clean, modern, professional appearance
6. **Accessibility**: Usable by everyone
7. **Responsiveness**: Works on all devices
8. **Performance**: Fast and efficient

---

## 📝 Notes

- Always maintain the purple/indigo gradient theme
- Use backdrop blur for modern glassmorphism effects
- Include smooth transitions on all interactive elements
- Keep forms clean and well-organized
- Ensure proper error handling and user feedback
- Maintain consistent spacing and typography
- Test on multiple devices and browsers

---

**Remember**: This design system should be the foundation for all future components and pages in the EventFlex project. Consistency is key to a great user experience!
