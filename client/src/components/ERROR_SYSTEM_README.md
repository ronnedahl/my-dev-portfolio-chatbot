# Error System Documentation

## Översikt
Ett modulärt och återanvändbart felsystem för React-applikationen som ger enhetlig användarupplevelse vid fel.

## Komponenter

### ErrorDisplay (Huvudkomponent)
**Fil:** `components/ErrorDisplay.tsx`

Återanvändbar komponent som renderar felsidor med enhetlig design.

#### Props:
- `code: string` - Felkod (t.ex. "404", "500")
- `title: string` - Huvudrubrik för felet
- `description: string` - Beskrivning av felet
- `reasons?: string[]` - Lista med möjliga orsaker (valfritt)
- `actions?: ErrorAction[]` - Anpassade åtgärder (valfritt, använder standardåtgärder annars)
- `footerMessage?: string` - Meddelande i sidfot (valfritt)

#### ErrorAction Interface:
```typescript
interface ErrorAction {
    label: string;
    href?: string;           // För navigering med React Router
    onClick?: () => void;    // För JavaScript-funktioner
    icon: IconType;         // React Icons ikon
    variant: 'primary' | 'secondary' | 'tertiary';
}
```

### Befintliga felsidor

#### NotFoundPage (404)
**Fil:** `pages/NotFoundPage.tsx`
- Hanterar sidor som inte hittas
- Visar vanliga orsaker till 404-fel
- Standardknappar för navigering

#### ServerErrorPage (500)
**Fil:** `pages/ServerErrorPage.tsx`
- Hanterar serverfel
- Anpassade åtgärder (uppdatera, rapportera problem)
- Specifik feedback för serverrelaterade problem

### useErrorHandler Hook
**Fil:** `hooks/useErrorHandler.ts`

Centraliserad felhantering för hela applikationen.

#### Funktioner:
- `handleError(error)` - Hanterar olika typer av fel automatiskt
- `navigateToError(errorType)` - Navigerar till specifik felsida

#### Stödda feltyper:
- APIError med HTTP-statuskoder
- Nätverksfel (fetch-fel)
- Generiska JavaScript-fel

## Användning

### Skapa en ny felsida:

```typescript
import React from 'react';
import ErrorDisplay from '../components/ErrorDisplay';

const MyErrorPage: React.FC = () => {
    return (
        <ErrorDisplay
            code="403"
            title="Åtkomst nekad"
            description="Du har inte behörighet att se denna sida."
            reasons={['Du är inte inloggad', 'Saknar rätt behörigheter']}
        />
    );
};
```

### Använda useErrorHandler:

```typescript
import { useErrorHandler } from '../hooks/useErrorHandler';

const MyComponent: React.FC = () => {
    const { handleError } = useErrorHandler();
    
    const fetchData = async () => {
        try {
            // API-anrop här
        } catch (error) {
            handleError(error); // Automatisk felhantering
        }
    };
};
```

### Anpassade åtgärder:

```typescript
const customActions = [
    {
        label: 'Försök igen',
        onClick: () => window.location.reload(),
        icon: IoRefreshOutline,
        variant: 'primary' as const
    },
    {
        label: 'Kontakta support',
        href: '/support',
        icon: IoMailOutline,
        variant: 'secondary' as const
    }
];

<ErrorDisplay
    code="500"
    title="Serverfel"
    description="Något gick fel."
    actions={customActions}
/>
```

## Stilsystem

### Button Variants:
- **Primary:** Blå bakgrund, vit text (huvudåtgärd)
- **Secondary:** Grå bakgrund, ljus text (sekundär åtgärd)
- **Tertiary:** Mörkgrå bakgrund med border (tertiär åtgärd)

### Designprinciper:
- Konsistent med appens mörka tema
- Använder samma färgschema och typografi
- Responsiv design för olika skärmstorlekar
- Tillgängliga ikoner och tydlig hierarki

## Routing

### Definierade rutter i App.tsx:
```typescript
<Route path="/404" element={<NotFoundPage />} />
<Route path="/500" element={<ServerErrorPage />} />
<Route path="*" element={<NotFoundPage />} />  // Catch-all
```

## Framtida utvidgningar

### Förslag på ytterligare felsidor:
- **403 Forbidden:** Åtkomst nekad
- **429 Too Many Requests:** Rate limit
- **Offline:** Ingen internetanslutning
- **Maintenance:** Underhållsläge

### Funktioner att lägga till:
- Error boundary för React-komponentfel
- Automatisk felrapportering
- Lokalisering för fler språk
- Animationer och övergångar
- Toast-notifikationer för mindre fel

## Felsökning

### Vanliga problem:
1. **Fel renderas inte:** Kontrollera att routen är definierad i App.tsx
2. **Ikoner visas inte:** Verifiera att react-icons är installerat
3. **Stilar fungerar inte:** Kontrollera att Tailwind CSS är konfigurerat

### Debug-tips:
- Använd React DevTools för att inspektera komponentprops
- Kontrollera nätverksfliken för API-fel
- Verifiera att useErrorHandler anropas korrekt