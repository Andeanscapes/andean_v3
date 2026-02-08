# Header Component - Accessibility & Modern Design Implementation

## 🎯 Overview
El header ha sido completamente rediseñado siguiendo las mejores prácticas de accesibilidad WCAG 2.1 AA y estándares de diseño moderno de 2026.

## ✅ Mejoras Implementadas

### 1. **Accesibilidad (WCAG 2.1 AA Compliant)**

#### Skip Link
- Link "Skip to main content" para usuarios de teclado y lectores de pantalla
- Oculto visualmente pero disponible cuando recibe foco
- Salta directamente al contenido principal (`#main-content`)

#### Estructura Semántica
```tsx
<header role="banner" aria-label="Site header">
  <nav role="navigation" aria-label="Main navigation">
    {/* ... */}
  </nav>
</header>
```

#### ARIA Labels y Roles
- Todos los botones interactivos tienen `aria-label` descriptivos
- `aria-expanded` en dropdowns y mobile menu
- `aria-current` para indicar item activo
- `aria-hidden` en iconos decorativos
- `role="menuitem"` en items de menú

#### Focus Indicators
- Indicadores de foco visibles y consistentes
- `focus-visible` para mejor UX
- Anillos de foco con offset para mejor visibilidad
- Color primario para máximo contraste

#### Reducción de Movimiento
- Respeta `prefers-reduced-motion`
- Desactiva animaciones para usuarios sensibles

#### Screen Reader Support
- Spans con clase `sr-only` para contexto adicional
- Labels descriptivos en todos los controles
- Anuncios de estado actualizados

### 2. **Diseño Moderno 2026**

#### Glassmorphism
- Backdrop blur en sticky state
- Transparencia adaptativa (70-85%)
- Soporte de fallback para navegadores antiguos

```css
.sticky {
  backdrop-filter: blur(12px);
  background-color: rgba(255, 255, 255, 0.7);
}
```

#### Iconos SVG
- Iconos personalizados y accesibles
- Banderas de países (US, ES, CO)
- Iconos de tema (Sun/Moon)
- Iconos de navegación (Menu, Close)

#### Componentes DaisyUI
- `btn-ghost` para botones sutiles
- `btn-circle` para botones redondos
- `dropdown` para selectores
- `menu` para navegación móvil

#### Transiciones Suaves
- Duraciones consistentes (200-300ms)
- Easing natural (`ease-in-out`)
- Transformaciones GPU-accelerated
- Hover states informativos

### 3. **Navegación Principal**

Estructura según wireframe:
- **Experiences** / Experiencias
- **Reviews** / Reseñas
- **Help** / Ayuda
- **Book** (botón primario)

#### Multiidioma
- Traducciones en `en.json` y `es.json`
- Selector con banderas de países
- Transiciones suaves entre idiomas

### 4. **Mobile First**

#### Hamburger Menu
- Drawer deslizante desde la derecha
- Backdrop con blur
- Previene scroll del body cuando está abierto
- Botón Book dentro del menú
- Controles de tema e idioma en footer del drawer

#### Responsive Breakpoints
- Mobile: < 1280px (xl)
- Desktop: ≥ 1280px

### 5. **Comportamiento de Scroll**

#### Sticky Header
- Se activa después de 50px de scroll
- Backdrop blur para efecto glassmorphism
- Shadow elevado para profundidad
- Transiciones suaves

#### Transparencia
- Header transparente en top de página
- Mantiene legibilidad con todos los fondos
- Colores adaptativos según tema

## 📁 Estructura de Archivos

```
src/components/
├── Header/
│   ├── Header.tsx              # Componente principal
│   ├── Header.module.css       # Estilos con glassmorphism
│   ├── Navigation.tsx          # Nav desktop
│   └── MobileMenu.tsx          # Drawer móvil
├── ThemeToggle/
│   └── ThemeToggle.tsx         # Toggle con iconos SVG
├── LanguageSelector/
│   └── LanguageSelector.tsx    # Selector con banderas
└── ui/
    └── icons.tsx               # Todos los iconos SVG
```

## 🎨 Personalización

### Colores
Los colores se adaptan automáticamente según:
- Tema actual (light/dark)
- Variante de header (transparent, black, etc.)
- Estado sticky

### Animaciones
Para desactivar animaciones:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🧪 Testing

### Keyboard Navigation
1. Tab through all interactive elements
2. Verificar que skip link aparezca primero
3. Dropdown se abre con Enter/Space
4. ESC cierra dropdowns y menu móvil

### Screen Readers
1. Verificar que todos los controles tengan labels
2. Anuncios de estado cuando cambia idioma/tema
3. Navegación entre regiones con landmarks

### Visual Testing
1. Verificar foco visible en todos los elementos
2. Contraste de colores ≥ 4.5:1
3. Glassmorphism en sticky state
4. Transiciones suaves

## 🚀 Próximas Mejoras (Opcional)

- [ ] Scroll progress indicator
- [ ] Breadcrumbs en sticky state
- [ ] Search bar integrada
- [ ] Animaciones con Framer Motion
- [ ] Mega menu para Experiences
- [ ] User account dropdown
- [ ] Shopping cart indicator

## 📚 Referencias

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [DaisyUI Components](https://daisyui.com/components/)
- [Web.dev Accessibility](https://web.dev/accessibility/)
- [MDN ARIA Best Practices](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
